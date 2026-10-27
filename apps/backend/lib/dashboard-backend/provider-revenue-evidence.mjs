import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { isCurrentPortfolioProject } from './domain-scope.mjs';

const ORIGIN = 'https://health.sassmaker.com';
const DAY_MS = 24 * 60 * 60_000;
const FIELDS = ['gross_minor', 'refunds_minor', 'net_minor', 'payments', 'refunds', 'attributed_payments', 'pending_refunds', 'pending_refunds_minor'];
const count = (value) => Number.isSafeInteger(value) && value >= 0;
const iso = (value) => Number.isFinite(value) ? new Date(value).toISOString() : null;
const normalize = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');

export const defaultProviderRevenueEvidencePath = () => join(process.env.HOME, 'Library/Application Support/Fleet Ops/founder-control/app-health-provider-revenue.json');

export function readProviderRevenueEvidence(path = defaultProviderRevenueEvidencePath()) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

// Only normalized report aggregates are retained. Each namespace remains a
// separate row, and daily snapshots make observations reproducible.
export function writeProviderRevenueEvidence(snapshot, path = defaultProviderRevenueEvidencePath()) {
  const previous = readProviderRevenueEvidence(path);
  const records = Object.fromEntries(Object.entries(snapshot.records).map(([id, row]) => {
    const old = previous?.records?.[id];
    return [id, row.totals === null && Array.isArray(old?.totals)
      ? { ...old, lastAttemptAt: snapshot.observedAt, gap: `Refresh unavailable; retained observation from ${old.observedAt}. ${row.gap ?? ''}`.slice(0, 1600) }
      : row];
  }));
  snapshot = { ...snapshot, records };
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const data = `${JSON.stringify(snapshot, null, 2)}\n`;
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, data, { mode: 0o600, flag: 'wx' });
  renameSync(temporary, path);
  const day = iso(Date.parse(snapshot.observedAt))?.slice(0, 10);
  if (day) {
    const history = join(dirname(path), 'provider-revenue-history');
    mkdirSync(history, { recursive: true, mode: 0o700 });
    const historic = join(history, `${day}.json`);
    const tempHistory = `${historic}.${randomUUID()}.tmp`;
    writeFileSync(tempHistory, data, { mode: 0o600, flag: 'wx' });
    renameSync(tempHistory, historic);
  }
}

export function providerRevenueObservations(projects, snapshot) {
  return projects.filter(isCurrentPortfolioProject).flatMap((project) => {
    const row = snapshot?.records?.[project.id];
    if (!Array.isArray(row?.totals) || row.totals.length === 0) return [{
      projectId: project.id, id: 'provider-revenue', label: 'Connected provider revenue (unqualified)',
      value: null, unit: 'currency minor units', observedAt: row?.observedAt ?? null,
      qualification: 'unknown', source: 'app-health.provider-revenue',
      window: row?.window ?? 'rolling 30 days',
      gap: row?.gap ?? 'No provider totals returned; this does not establish that no sources or revenue exist.',
    }];
    return row.totals.map((total, index) => ({
      projectId: project.id, id: `provider-revenue:${index}`,
      label: `Connected provider net revenue · ${total.provider} · ${total.account_id} · ${total.mode}`,
      value: total.net_minor, unit: `${total.currency} minor units`, observedAt: row.observedAt,
      qualification: 'proxy', source: 'app-health.provider-revenue', window: row.window,
      provider: total.provider, accountId: total.account_id, mode: total.mode, currency: total.currency,
      grossMinor: total.gross_minor, refundsMinor: total.refunds_minor,
      payments: total.payments, refunds: total.refunds,
      attributedPayments: total.attributed_payments, pendingRefunds: total.pending_refunds,
      pendingRefundsMinor: total.pending_refunds_minor,
      gap: [row.gap, 'Provider-object-created aggregate; namespaces and currencies are separate. Minor units are not converted; no qualified financial score.'].filter(Boolean).join(' '),
    }));
  });
}

function validTotal(total) {
  return total && ['custom', 'stripe', 'polar', 'dodo'].includes(total.provider)
    && typeof total.account_id === 'string' && /^[a-zA-Z0-9_.:-]{1,128}$/.test(total.account_id)
    && ['live', 'test'].includes(total.mode)
    && typeof total.currency === 'string' && /^[A-Z]{3}$/.test(total.currency)
    && FIELDS.every((field) => field === 'net_minor'
      ? Number.isSafeInteger(total[field])
      : count(total[field]));
}

export async function collectProviderRevenueEvidence({ projects, credential, fetcher = fetch, now = () => Date.now() }) {
  if (!credential) throw Object.assign(new Error('App Health read connection is unavailable; retained observations remain visible.'), { code: 'APP_HEALTH_CONNECTION_UNAVAILABLE' });
  const get = async (path) => {
    const response = await fetcher(`${ORIGIN}${path}`, { method: 'GET', redirect: 'error',
      headers: { authorization: `Bearer ${credential}` }, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw Object.assign(new Error(`App Health aggregate returned HTTP ${response.status}`), { code: 'APP_HEALTH_READ_FAILED' });
    return response.json();
  };
  const apps = (await get('/v1/apps'))?.apps;
  if (!Array.isArray(apps)) throw new Error('Invalid App Health app list');
  const current = projects.filter(isCurrentPortfolioProject);
  const records = {}; let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(4, current.length) }, async () => {
    while (cursor < current.length) {
      const project = current[cursor++];
      const matches = apps.filter((row) => row.app?.id === project.id || normalize(row.app?.name) === normalize(project.name));
      const environments = matches.length === 1 ? matches[0].environments?.filter((entry) => entry.name === 'production') ?? [] : [];
      if (environments.length !== 1) {
        records[project.id] = { totals: null, observedAt: null, lastAttemptAt: iso(now()), gap: 'No unique exact product and production-environment mapping; source remains unknown.' };
        continue;
      }
      try {
        const end = now();
        const from = end - 30 * DAY_MS;
        const params = new URLSearchParams({ app_id: matches[0].app.id, environment_id: environments[0].id, from: String(from), to: String(end) });
        const report = await get(`/v1/analytics/provider-revenue?${params}`);
        if (report?.schema_version !== 1 || report.basis !== 'provider_object_created'
          || !['local', 'd1'].includes(report.source)
          || !Number.isSafeInteger(report.from) || !Number.isSafeInteger(report.to) || report.from !== from || report.to !== end
          || !['source', 'page', 'country', 'campaign'].includes(report.breakdown)
          || !Array.isArray(report.totals) || report.totals.length > 200 || !report.totals.every(validTotal)
          || !Array.isArray(report.dimensions) || report.dimensions.length > 500
          || !report.dimensions.every((row) => validTotal(row) && (row.value === null || typeof row.value === 'string' && row.value.length <= 256))
          || typeof report.coverage_note !== 'string' || report.coverage_note.length > 600
          || !Array.isArray(report.unresolved) || report.unresolved.length > 50
          || !report.unresolved.every((row) => typeof row.reason === 'string' && row.reason.length <= 100 && count(row.count))
          || typeof report.diagnostics_truncated !== 'boolean') throw new Error('Invalid provider revenue report');
        records[project.id] = {
          totals: report.totals.length === 0 ? null : report.totals.map((total) => Object.fromEntries(['provider', 'account_id', 'mode', 'currency', ...FIELDS].map((key) => [key, total[key]]))),
          observedAt: iso(now()), window: `${iso(report.from)} to ${iso(report.to)}`,
          gap: report.totals.length === 0
            ? 'Provider returned no totals; this does not establish that no connected sources or revenue exist.'
            : `Provider-object-created basis. ${report.coverage_note}`.slice(0, 1600),
        };
      } catch {
        records[project.id] = { totals: null, observedAt: null, lastAttemptAt: iso(now()), gap: 'Provider aggregate unavailable or invalid; last good observation is retained.' };
      }
    }
  }));
  return { schemaVersion: 1, observedAt: iso(now()), records };
}
