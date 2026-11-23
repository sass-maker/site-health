import { INTERNAL_USAGE_SOURCES as INTERNAL_SOURCES } from './measurement-contract.mjs';
import { isCurrentPortfolioProject } from './domain-scope.mjs';

const ORIGIN = 'https://health.sassmaker.com';
// App Health emits only these fixed Server-Timing labels. Persist aggregates,
// never headers, request filters, app/environment IDs, or individual samples.
const REPORT_TIMING_STAGES = Object.freeze([
  'auth_setup',
  'session_lookup',
  'session_db_read',
  'user_db_read',
  'workspace_scope',
  'apps_projection',
  'workspace_capability_setup_read',
  'capability_setup_read',
  'analytics_cache_lookup',
  'analytics_query_wait',
  'analytics_summary',
  'analytics_summary_provider',
  'analytics_presence',
  'analytics_trend',
  'analytics_pages',
  'analytics_sources',
  'analytics_events',
  'analytics_audience_previous',
  'analytics_dimension_max',
  'analytics_engagement',
  'analytics_exits',
  'analytics_report_assembly',
  'route_read',
  'owner_handler_total',
]);
const REPORT_TIMING_STAGE_SET = new Set(REPORT_TIMING_STAGES);
const MAX_REPORT_TIMING_HEADER_LENGTH = 4096;
const MAX_REPORT_TIMING_STAGES = 64;
const number = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
const eventCount = events => {
  if (!Array.isArray(events) || events.some(event => number(event?.count) === null)) return null;
  return number(events.reduce((sum, event) => sum + event.count, 0));
};
const usageUnit = value => ['sessions', 'browsers', 'devices', 'users'].includes(value) ? value : null;
const internalRow = (id, row) => row?.source === INTERNAL_SOURCES[id] && Boolean(INTERNAL_SOURCES[id]);
const iso = (value) => ['number', 'string'].includes(typeof value) && Number.isFinite(new Date(value).getTime()) ? new Date(value).toISOString() : null;

function recordReportTiming(header, samples) {
  if (typeof header !== 'string' || header.length > MAX_REPORT_TIMING_HEADER_LENGTH) return false;
  let recorded = false;
  const seen = new Set();
  for (const rawEntry of header.split(',').slice(0, MAX_REPORT_TIMING_STAGES)) {
    const match = rawEntry.trim().match(/^([a-z_]+);dur=(\d{1,6}(?:\.\d{1,3})?)$/);
    if (!match || !REPORT_TIMING_STAGE_SET.has(match[1])) continue;
    const durationMs = Number(match[2]);
    if (!Number.isFinite(durationMs) || durationMs > 60_000) continue;
    if (seen.has(match[1])) continue;
    seen.add(match[1]);
    const stageSamples = samples[match[1]] ?? (samples[match[1]] = []);
    stageSamples.push(durationMs);
    recorded = true;
  }
  return recorded;
}

function timingPercentile(sorted, percentile) {
  // Use nearest-rank so the persisted p50/p95 stay actual observed timings.
  return sorted[Math.max(0, Math.ceil(sorted.length * percentile) - 1)];
}

function reportTimingDiagnostics(samples, counts, failedReports) {
  const stages = {};
  for (const stage of REPORT_TIMING_STAGES) {
    const values = [...(samples[stage] ?? [])].sort((left, right) => left - right);
    stages[stage] = values.length
      ? {
          sampleCount: values.length,
          meanMs: values.reduce((sum, value) => sum + value, 0) / values.length,
          p50Ms: timingPercentile(values, 0.5),
          p95Ms: timingPercentile(values, 0.95),
          maxMs: values.at(-1),
        }
      : { sampleCount: 0, meanMs: null, p50Ms: null, p95Ms: null, maxMs: null };
  }
  return {
    schemaVersion: 1,
    reportAttempts: counts.attempts,
    reportResponses: counts.responses,
    reportHttpSuccesses: counts.httpSuccesses,
    reportHttpFailures: counts.httpFailures,
    reportNoResponse: counts.attempts - counts.responses,
    reportResultFailures: failedReports,
    responsesWithStageTimings: counts.timedResponses,
    responsesWithoutStageTimings: counts.responses - counts.timedResponses,
    stages,
  };
}

export function mergeUsageSnapshots(snapshot, previous) {
  const records = Object.fromEntries(Object.entries(snapshot.records).map(([id, row]) => {
    const old = previous?.records?.[id];
    // A daily browser refresh cannot erase a tool's explicit local/workflow counter.
    if (internalRow(id, old) && (!internalRow(id, row) || Date.parse(row.observedAt) < Date.parse(old.observedAt))) return [id, old];
    if (internalRow(id, row) && !internalRow(id, old)) return [id, row];
    const failed = row.status === 'failed';
    const legacyUnknown = row.status === undefined && row.count === null;
    return [id, (failed || legacyUnknown) && number(old?.count) !== null
      ? { ...old, status: 'retained', lastAttemptAt: snapshot.observedAt,
        gap: `${failed ? 'Refresh failed' : 'Incoming row had no numeric count'}; retained last-known ${old.count} ${usageUnit(old.unit) ?? 'units'} observed ${old.observedAt}. ${row.gap ?? ''}`.slice(0, 1600) }
      : row];
  }));
  return { ...snapshot, records: { ...(previous?.records ?? {}), ...records } };
}
export { iso as usageTimestamp };

export function usageObservations(projects, snapshot) {
  return projects.filter(isCurrentPortfolioProject).flatMap((project) => {
    const row = snapshot?.records?.[project.id];
    const retained = row?.status === 'retained';
    const bounds = String(row?.window ?? '').split(' to ').map(value => Date.parse(value));
    const validWindow = bounds.length === 2 && bounds.every(Number.isFinite) && Math.abs(bounds[1] - bounds[0] - 30 * 86_400_000) <= 60_000 && bounds[1] <= Date.parse(row.observedAt) + 300_000 && Date.parse(row.observedAt) - bounds[1] <= 86_400_000;
    const invalidWindow = row && !['failed', 'unmapped', 'retained'].includes(row.status) && !validWindow;
    const status = invalidWindow ? 'invalid' : row?.status;
    const local = internalRow(project.id, row);
    return [
      { id: local ? 'monthly-local-proxy' : 'monthly-browser-proxy', label: local ? '30-day local / workflow activity proxy' : '30-day browser / session proxy', value: retained || !usageUnit(row?.unit) ? null : number(row?.count),
        unit: usageUnit(row?.unit) ?? '', observedAt: row?.observedAt ?? null,
        window: row?.window ?? 'rolling 30 days', qualification: retained || !usageUnit(row?.unit) || number(row?.count) === null ? 'unknown' : 'proxy',
        status: status ?? (number(row?.count) === null ? 'unknown' : 'available'),
        gap: [invalidWindow ? 'Missing or invalid 30-day evaluation window.' : null, row?.gap ?? 'Browser identifiers are not people; QA and automation may remain. No qualified core-action or churn cohort.'].filter(Boolean).join(' ') },
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
    ].map((observation) => ({ ...observation, projectId: project.id, source: local ? row.source : 'app-health.browser-report', context: { method: local ? 'Automatic local/workflow aggregate; not qualified human adoption' : '30-day browser aggregate; does not cover all local/native usage', scope: local ? 'Local counter / retained workflow metadata' : 'Production browser tracking', sampled: row?.sampled ?? null, detail: row?.providerSource ? `Provider source: ${row.providerSource}` : 'Sampling status unavailable in retained source' } }));
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
      source: INTERNAL_SOURCES[project.id] && row.evidence?.some(e => e.source === INTERNAL_SOURCES[project.id]) ? INTERNAL_SOURCES[project.id] : 'app-health.browser-report',
      count: row.tracking !== 'missing' && usageUnit(row.proxy?.unit) ? number(row.proxy?.count) : null, unit: usageUnit(row.proxy?.unit),
      actionEvents: row.tracking === 'missing' ? null : eventCount(row.events),
      observedAt, window: `${iso(row.windowStart) ?? '?'} to ${iso(row.windowEnd) ?? '?'}`,
      sampled: typeof row.sampled === 'boolean' ? row.sampled : null,
      gap: [row.tracking === 'missing' ? 'Tracking is missing; audience and event counts are unknown.' : null, !usageUnit(row.proxy?.unit) ? 'Unsupported or missing proxy unit; count is unknown.' : null, eventCount(row.events) === null ? 'Missing or invalid event counts; action total is unknown.' : null, String(row.limitations ?? 'Unqualified aggregate proxy.')].filter(Boolean).join(' ').slice(0, 1600),
    };
  }
  return { schemaVersion: 1, observedAt: iso(bundle.usage.updatedAt), records };
}

export async function collectUsageEvidence({ projects, credential, fetcher = fetch, now = () => new Date().toISOString() }) {
  if (!credential) throw Object.assign(new Error('App Health read connection is unavailable; retained observations remain visible.'), { code: 'APP_HEALTH_CONNECTION_UNAVAILABLE' });
  const request = (path) => fetcher(`${ORIGIN}${path}`, { method: 'GET', redirect: 'error',
    headers: { authorization: `Bearer ${credential}` }, signal: AbortSignal.timeout(15_000) });
  const get = async (path) => {
    const response = await request(path);
    if (!response.ok) throw Object.assign(new Error(`App Health aggregate returned HTTP ${response.status}`), { code: 'APP_HEALTH_READ_FAILED' });
    return response.json();
  };
  const stageSamples = {};
  const reportCounts = { attempts: 0, responses: 0, httpSuccesses: 0, httpFailures: 0, timedResponses: 0 };
  const getReport = async (path) => {
    reportCounts.attempts += 1;
    const response = await request(path);
    reportCounts.responses += 1;
    if (response.ok) reportCounts.httpSuccesses += 1;
    else reportCounts.httpFailures += 1;
    let header;
    try { header = response.headers?.get?.('server-timing'); } catch { /* Invalid headers do not affect the report. */ }
    if (recordReportTiming(header, stageSamples)) reportCounts.timedResponses += 1;
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
        const report = await getReport(`/v1/analytics/report?${params}`);
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
  const reportResultFailures = Object.values(records).filter((row) => row.status === 'failed').length;
  return {
    schemaVersion: 1,
    observedAt: now(),
    records,
    reportTimingDiagnostics: reportTimingDiagnostics(stageSamples, reportCounts, reportResultFailures),
  };
}
