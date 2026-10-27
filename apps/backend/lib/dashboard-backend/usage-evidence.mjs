import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { isCurrentPortfolioProject } from './domain-scope.mjs';

const ORIGIN = 'https://health.sassmaker.com';
const number = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
const iso = (value) => ['number', 'string'].includes(typeof value) && Number.isFinite(new Date(value).getTime()) ? new Date(value).toISOString() : null;
export const defaultUsageEvidencePath = () => join(process.env.HOME, 'Library/Application Support/Fleet Ops/founder-control/app-health-usage.json');

export function readUsageEvidence(path = defaultUsageEvidencePath()) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

// Persist aggregates only. No provider response, token, actor ID or URL query
// is written to disk. Daily history makes comparisons reproducible.
export function writeUsageEvidence(snapshot, path = defaultUsageEvidencePath()) {
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
    return [
      { id: 'monthly-browser-proxy', label: '30-day browser / session proxy', value: number(row?.count),
        unit: row?.unit === 'sessions' ? 'sessions' : 'browsers', observedAt: row?.observedAt ?? null,
        window: row?.window ?? 'rolling 30 days', qualification: number(row?.count) === null ? 'unknown' : 'proxy',
        gap: row?.gap ?? 'Browser identifiers are not people; QA and automation may remain. No qualified core-action or churn cohort.' },
      { id: 'high-intent-events', metricId: 'high-intent', label: 'Named action events (unqualified)', value: number(row?.actionEvents),
        unit: 'events', observedAt: row?.observedAt ?? null, window: row?.window ?? 'rolling 30 days',
        qualification: number(row?.actionEvents) === null ? 'unknown' : 'proxy',
        gap: 'Event occurrences are not completed core workflows or distinct active people.' },
    ].map((observation) => ({ ...observation, projectId: project.id, source: 'app-health.browser-report' }));
  });
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
      count: number(row.proxy?.count), unit: row.proxy?.unit === 'sessions' ? 'sessions' : 'browsers',
      actionEvents: Array.isArray(row.events) ? row.events.reduce((sum, event) => sum + (number(event.count) ?? 0), 0) : null,
      observedAt, window: `${iso(row.windowStart) ?? '?'} to ${iso(row.windowEnd) ?? '?'}`,
      gap: String(row.limitations ?? 'Unqualified aggregate proxy.').slice(0, 1600),
    };
  }
  return { schemaVersion: 1, observedAt: iso(bundle.usage.updatedAt), records };
}

// Reuse the normal owner-managed credential resolver; never provision, rotate,
// persist or print credentials. All outbound requests are fixed-origin GETs.
export function appHealthCredential({ env = process.env, readSecret = execFileSync } = {}) {
  if (env.APP_HEALTH_READ_TOKEN) return env.APP_HEALTH_READ_TOKEN;
  if (env.APP_HEALTH_OWNER_TOKEN) return env.APP_HEALTH_OWNER_TOKEN;
  try {
    const repository = env.SITE_HEALTH_OWNER_REPOSITORY ?? resolve(import.meta.dirname, '../../../..');
    return String(readSecret('infisical', ['secrets', 'get', 'APP_HEALTH_OWNER_TOKEN', '--plain', '--env', 'prod', '--path', '/', '--silent'], {
      cwd: resolve(repository, '..'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000,
    })).trim();
  } catch { return null; }
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
        records[project.id] = { count: null, actionEvents: null, observedAt: now(), gap: 'No unique exact product and production-environment mapping; source remains unknown.' };
        continue;
      }
      try {
        const params = new URLSearchParams({ range: '30d', app_id: matches[0].app.id, environment_id: environments[0].id });
        const report = await get(`/v1/analytics/report?${params}`);
        const start = iso(report.from); const end = iso(report.to);
        if (!start || !end || report.from >= report.to || typeof report.sampled !== 'boolean' || !['local', 'analytics-engine'].includes(report.source) || number(report.sessions) === null || !Array.isArray(report.events)) throw new Error('Invalid aggregate report');
        const browsers = number(report.audience?.visitors);
        records[project.id] = {
          count: browsers ?? number(report.sessions), unit: browsers === null ? 'sessions' : 'browsers',
          actionEvents: report.events.reduce((sum, event) => sum + (number(event.count) ?? 0), 0),
          observedAt: now(), window: `${start} to ${end}`,
          gap: `${report.sampled ? 'Sampled lower-bound/estimated aggregates. ' : ''}Browser/session proxy only; named event counts do not qualify completed core use or human adoption.`,
        };
      } catch { records[project.id] = { count: null, actionEvents: null, observedAt: now(), gap: 'Aggregate report unavailable or invalid; source remains unknown.' }; }
    }
  }));
  return { schemaVersion: 1, observedAt: now(), records };
}
