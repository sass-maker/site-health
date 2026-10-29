import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { isCurrentPortfolioProject } from './domain-scope.mjs';

const ORIGIN = 'https://health.sassmaker.com';
const execFileAsync = promisify(execFile);
const number = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
const eventCount = events => {
  if (!Array.isArray(events) || events.some(event => number(event?.count) === null)) return null;
  return number(events.reduce((sum, event) => sum + event.count, 0));
};
const usageUnit = value => ['sessions', 'browsers'].includes(value) ? value : null;
const iso = (value) => ['number', 'string'].includes(typeof value) && Number.isFinite(new Date(value).getTime()) ? new Date(value).toISOString() : null;
export const defaultUsageEvidencePath = () => join(process.env.HOME, 'Library/Application Support/Fleet Ops/founder-control/app-health-usage.json');

export function readUsageEvidence(path = defaultUsageEvidencePath()) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

// Persist aggregates only. No provider response, token, actor ID or URL query
// is written to disk. Daily history makes comparisons reproducible.
export function writeUsageEvidence(snapshot, path = defaultUsageEvidencePath()) {
  const previous = readUsageEvidence(path);
  const records = Object.fromEntries(Object.entries(snapshot.records).map(([id, row]) => {
    const old = previous?.records?.[id];
    const failed = row.status === 'failed';
    const legacyUnknown = row.status === undefined && row.count === null;
    return [id, (failed || legacyUnknown) && number(old?.count) !== null
      ? { ...old, status: 'retained', lastAttemptAt: snapshot.observedAt,
        gap: `${failed ? 'Refresh failed' : 'Incoming row had no numeric count'}; retained last-known ${old.count} ${old.unit === 'sessions' ? 'sessions' : 'browsers'} observed ${old.observedAt}. ${row.gap ?? ''}`.slice(0, 1600) }
      : row];
  }));
  snapshot = { ...snapshot, records };
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  const data = `${JSON.stringify(snapshot, null, 2)}\n`;
  writeFileSync(temporary, data, { mode: 0o600, flag: 'wx' });
  renameSync(temporary, path);
  const day = iso(snapshot.observedAt)?.slice(0, 10);
  if (day) {
    const history = join(dirname(path), 'usage-history');
    mkdirSync(history, { recursive: true, mode: 0o700 });
    const historic = join(history, `${day}.json`);
    const tempHistory = `${historic}.${randomUUID()}.tmp`;
    writeFileSync(tempHistory, data, { mode: 0o600, flag: 'wx' });
    renameSync(tempHistory, historic);
  }
}

export function usageObservations(projects, snapshot) {
  return projects.filter(isCurrentPortfolioProject).flatMap((project) => {
    const row = snapshot?.records?.[project.id];
    const retained = row?.status === 'retained';
    const bounds = String(row?.window ?? '').split(' to ').map(value => Date.parse(value));
    const validWindow = bounds.length === 2 && bounds.every(Number.isFinite) && Math.abs(bounds[1] - bounds[0] - 30 * 86_400_000) <= 60_000 && bounds[1] <= Date.parse(row.observedAt) + 300_000 && Date.parse(row.observedAt) - bounds[1] <= 86_400_000;
    const status = retained ? 'retained' : row && !validWindow ? 'invalid' : row?.status;
    return [
      { id: 'monthly-browser-proxy', label: '30-day browser / session proxy', value: retained || !usageUnit(row?.unit) ? null : number(row?.count),
        unit: usageUnit(row?.unit) ?? 'unknown unit', observedAt: row?.observedAt ?? null,
        window: row?.window ?? 'rolling 30 days', qualification: retained || !usageUnit(row?.unit) || number(row?.count) === null ? 'unknown' : 'proxy',
        status: status ?? (number(row?.count) === null ? 'unknown' : 'available'),
        gap: [row && !validWindow ? 'Missing or invalid 30-day evaluation window.' : null, row?.gap ?? 'Browser identifiers are not people; QA and automation may remain. No qualified core-action or churn cohort.'].filter(Boolean).join(' ') },
      { id: 'high-intent-events', metricId: 'high-intent', label: 'Named action events (unqualified)', value: retained ? null : number(row?.actionEvents),
        unit: 'events', observedAt: row?.observedAt ?? null, window: row?.window ?? 'rolling 30 days',
        qualification: retained || number(row?.actionEvents) === null ? 'unknown' : 'proxy',
        status: status ?? (number(row?.actionEvents) === null ? 'unknown' : 'available'),
        gap: [retained
          ? number(row?.actionEvents) === null
            ? `No last-known action-event count; this row remains unknown after the usage refresh at ${row.lastAttemptAt ?? 'an unknown date'}.`
            : `Last-known ${row.actionEvents} events observed ${row.observedAt}; retained historical value, current refresh unavailable.`
          : row?.gap,
        'Event occurrences are not completed core workflows or distinct active people.'].filter(Boolean).join(' ') },
    ].map((observation) => ({ ...observation, projectId: project.id, source: 'app-health.browser-report', context: { method: '30-day aggregate proxy; QA/background activity not excluded', scope: 'production environment', sampled: row?.sampled ?? null, detail: row?.providerSource ? `Provider source: ${row.providerSource}` : 'Sampling status unavailable in retained source' } }));
  });
}

export function usageFailureSnapshot(projects, now = () => new Date().toISOString()) {
  const observedAt = now();
  return {
    schemaVersion: 1, observedAt,
    records: Object.fromEntries(projects.filter(isCurrentPortfolioProject).map((project) => [project.id, {
      status: 'failed', count: null, actionEvents: null, observedAt: null, lastAttemptAt: observedAt,
      gap: 'App Health usage refresh failed; source remains unknown unless a last-good observation exists.',
    }])),
  };
}

export function summarizeUsageSnapshot(snapshot) {
  const rows = Object.values(snapshot.records);
  const counts = Object.fromEntries(['available', 'unmapped', 'failed'].map((status) => [status, rows.filter((row) => row.status === status).length]));
  return {
    resultCount: rows.filter((row) => row.count !== null).length,
    summary: `App Health usage refresh: ${counts.available} available, ${counts.unmapped} unmapped, ${counts.failed} failed.`,
  };
}

export function importUsageExport(bundle, projects) {
  if (bundle?.kind !== 'portfolio-usage' || bundle?.schemaVersion !== 1 || !bundle.usage?.records) throw new Error('Expected App Health portfolio-usage v1 export');
  const records = {};
  for (const project of projects.filter(isCurrentPortfolioProject)) {
    const row = bundle.usage.records[project.id];
    if (!row) continue;
    const observedAt = iso(row.checkedAt);
    if (!observedAt) continue;
    records[project.id] = {
      count: usageUnit(row.proxy?.unit) ? number(row.proxy?.count) : null, unit: usageUnit(row.proxy?.unit),
      actionEvents: eventCount(row.events),
      observedAt, window: `${iso(row.windowStart) ?? '?'} to ${iso(row.windowEnd) ?? '?'}`,
      sampled: typeof row.sampled === 'boolean' ? row.sampled : null,
      gap: [!usageUnit(row.proxy?.unit) ? 'Unsupported or missing proxy unit; count is unknown.' : null, eventCount(row.events) === null ? 'Missing or invalid event counts; action total is unknown.' : null, String(row.limitations ?? 'Unqualified aggregate proxy.')].filter(Boolean).join(' ').slice(0, 1600),
    };
  }
  return { schemaVersion: 1, observedAt: iso(bundle.usage.updatedAt), records };
}

// Resolve the approved read-only Keychain connection asynchronously. This code
// never provisions, persists or prints credentials. Requests are fixed-origin GETs.
export async function appHealthCredential({ env = process.env, readSecret = execFileAsync } = {}) {
  if (env.APP_HEALTH_READ_TOKEN) return env.APP_HEALTH_READ_TOKEN;
  try {
    const result = await readSecret('/usr/bin/security', ['find-generic-password', '-s', 'com.sassmaker.site-health.app-health-read', '-a', 'owner', '-w'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000,
    });
    const token = String(result.stdout ?? '').trim();
    if (token) return token;
  } catch { /* The scoped connection is optional; unavailable stays unknown. */ }
  return null;
}

export async function collectUsageEvidence({ projects, credential, fetcher = fetch, now = () => new Date().toISOString() }) {
  if (!credential) throw Object.assign(new Error('App Health read connection is unavailable; retained observations remain visible.'), { code: 'APP_HEALTH_CONNECTION_UNAVAILABLE' });
  const get = async (path) => {
    const response = await fetcher(`${ORIGIN}${path}`, { method: 'GET', redirect: 'error',
      headers: { authorization: `Bearer ${credential}` }, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw Object.assign(new Error(`App Health aggregate returned HTTP ${response.status}`), { code: 'APP_HEALTH_READ_FAILED' });
    return response.json();
  };
  const apps = (await get('/v1/apps'))?.apps;
  if (!Array.isArray(apps)) throw new Error('Invalid App Health app list');
  const normalize = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  const current = projects.filter(isCurrentPortfolioProject);
  const records = {}; let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(4, current.length) }, async () => {
    while (cursor < current.length) {
      const project = current[cursor++];
      const matches = apps.filter((row) => row.app?.id === project.id || normalize(row.app?.name) === normalize(project.name));
      const environments = matches.length === 1 ? matches[0].environments?.filter((entry) => entry.name === 'production') ?? [] : [];
      if (environments.length !== 1) {
        records[project.id] = { status: 'unmapped', count: null, actionEvents: null, observedAt: null, lastAttemptAt: now(), gap: 'No unique exact product and production-environment mapping; source remains unknown.' };
        continue;
      }
      try {
        const params = new URLSearchParams({ range: '30d', app_id: matches[0].app.id, environment_id: environments[0].id });
        const report = await get(`/v1/analytics/report?${params}`);
        const start = iso(report.from); const end = iso(report.to);
        if (!start || !end || Date.parse(start) >= Date.parse(end) || Math.abs(Date.parse(end) - Date.parse(start) - 30 * 86_400_000) > 60_000 || Date.parse(end) > Date.parse(now()) + 300_000 || Date.parse(now()) - Date.parse(end) > 300_000 || typeof report.sampled !== 'boolean' || !['local', 'analytics-engine'].includes(report.source) || number(report.sessions) === null || !Array.isArray(report.events)) throw new Error('Invalid aggregate report');
        const browsers = number(report.audience?.visitors);
        records[project.id] = {
          status: 'available',
          count: browsers ?? number(report.sessions), unit: browsers === null ? 'sessions' : 'browsers',
          actionEvents: eventCount(report.events), sampled: report.sampled, providerSource: report.source,
          observedAt: now(), window: `${start} to ${end}`,
          gap: `${eventCount(report.events) === null ? 'Invalid event count; action total unknown. ' : ''}${report.sampled ? 'Sampled lower-bound/estimated aggregates. ' : ''}Browser/session proxy only; named event counts do not qualify completed core use or human adoption.`,
        };
      } catch { records[project.id] = { status: 'failed', count: null, actionEvents: null, observedAt: null, lastAttemptAt: now(), gap: 'Aggregate report unavailable or invalid; source remains unknown unless a last-good observation exists.' }; }
    }
  }));
  return { schemaVersion: 1, observedAt: now(), records };
}
