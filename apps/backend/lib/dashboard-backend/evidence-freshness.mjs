const DAY_MS = 24 * 60 * 60 * 1000;

export const EVIDENCE_POLICIES = Object.freeze({
  drank: { maximumAgeMs: 7 * DAY_MS, cadence: 'weekly', provenance: 'provider' },
  psi: { maximumAgeMs: 7 * DAY_MS, cadence: 'explicit', provenance: 'provider' },
  search: { maximumAgeMs: DAY_MS, cadence: 'daily', provenance: 'provider' },
  ai: { maximumAgeMs: 7 * DAY_MS, cadence: 'weekly', provenance: 'provider' },
  campaigns: { maximumAgeMs: DAY_MS, cadence: 'on-start', provenance: 'public-probe' },
  skills: { maximumAgeMs: DAY_MS, cadence: 'on-start', provenance: 'provider' },
});

function timestamp(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
}

function latestTimestamp(values) {
  return values
    .map(timestamp)
    .filter(Boolean)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

export function refreshMetadataKey(family, { scope = 'portfolio', projectId = null } = {}) {
  const target = scope === 'project' ? projectId : 'portfolio';
  return `evidence-refresh:${family}:${target}`;
}

export function sanitizeRefreshReceipt(run) {
  const state = ['running', 'succeeded', 'failed', 'unavailable'].includes(run?.state)
    ? run.state
    : 'failed';
  const summary = String(run?.summary ?? '')
    .replace(/(?:\/Users|\/home|\/private|\/tmp)\/[^\s"'`<>]+/g, '[private path]')
    .slice(0, 800);
  return {
    schemaVersion: 'site-health.refresh-receipt.v1',
    source: String(run?.family ?? ''),
    scope: run?.scope === 'project' ? 'project' : 'portfolio',
    projectId: run?.scope === 'project' ? String(run?.projectId ?? '') : null,
    runId: String(run?.runId ?? ''),
    label: String(run?.label ?? '').slice(0, 120),
    state,
    lastAttemptAt: timestamp(run?.startedAt),
    lastSuccessAt: state === 'succeeded' ? timestamp(run?.finishedAt) : null,
    finishedAt: timestamp(run?.finishedAt),
    resultCount: Number.isInteger(run?.resultCount) ? run.resultCount : null,
    failure: ['failed', 'unavailable'].includes(state)
      ? { code: String(run?.code ?? (state === 'unavailable' ? 'SOURCE_UNAVAILABLE' : 'REFRESH_FAILED')), message: summary }
      : null,
  };
}

export function recordRefreshReceipt(store, run) {
  const key = refreshMetadataKey(run.family, run);
  const previous = store.getMetadata(key)?.value ?? null;
  const receipt = sanitizeRefreshReceipt(run);
  if (!receipt.lastSuccessAt) receipt.lastSuccessAt = timestamp(previous?.lastSuccessAt);
  return store.setMetadata(key, receipt, { now: receipt.finishedAt ?? receipt.lastAttemptAt });
}

export function readRefreshReceipt(store, family, target = {}) {
  return store.getMetadata(refreshMetadataKey(family, target))?.value ?? null;
}

export function buildEvidenceEnvelope({ family, rows = [], receipt = null, now = new Date().toISOString() }) {
  const policy = EVIDENCE_POLICIES[family];
  if (!policy) throw new Error(`unknown evidence family: ${family}`);
  const observedAt = latestTimestamp(rows.map((row) => row?.observedAt));
  const lastSuccessAt = latestTimestamp([receipt?.lastSuccessAt, observedAt]);
  const lastAttemptAt = timestamp(receipt?.lastAttemptAt);
  const freshUntil = lastSuccessAt
    ? new Date(Date.parse(lastSuccessAt) + policy.maximumAgeMs).toISOString()
    : null;
  const expired = !freshUntil || Date.parse(now) > Date.parse(freshUntil);
  let state = expired ? 'stale' : 'fresh';
  if (receipt?.state === 'running') state = 'refreshing';
  else if (
    ['failed', 'unavailable'].includes(receipt?.state)
    && lastAttemptAt
    && (!lastSuccessAt || Date.parse(lastAttemptAt) >= Date.parse(lastSuccessAt))
  ) state = receipt.state;
  else if (!lastSuccessAt) state = receipt?.state === 'unavailable' ? 'unavailable' : 'stale';
  return {
    source: family,
    state,
    cadence: policy.cadence,
    provenance: rows.find((row) => row?.provenance)?.provenance ?? policy.provenance,
    observedAt,
    period: rows.find((row) => row?.period)?.period ?? null,
    lastAttemptAt,
    lastSuccessAt,
    freshUntil,
    resultCount: rows.filter((row) => row?.observedAt).length,
    failure: ['failed', 'unavailable'].includes(state) ? receipt?.failure ?? null : null,
  };
}

export function evidenceRefreshDue(envelope) {
  return ['stale', 'failed'].includes(envelope?.state);
}
