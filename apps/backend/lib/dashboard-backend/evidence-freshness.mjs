const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A refresh still `running` this long after it started did not stall, it died:
 * the process that would have written the terminal receipt is gone. Without an
 * upper bound a dead run renders as `refreshing` forever, which reads healthier
 * than the `stale` it replaced. Matches the reporting-loop preflight budget.
 */
export const ABANDONED_RUN_MS = 6 * 60 * 60 * 1000;

export const ABANDONED_RUN_FAILURE = Object.freeze({
  code: 'REFRESH_ABANDONED',
  message: 'The refresh started and never reported a result; the run that owned it is gone.',
});

export const EVIDENCE_POLICIES = Object.freeze({
  drank: { maximumAgeMs: 7 * DAY_MS, cadence: 'weekly', provenance: 'provider' },
  psi: { maximumAgeMs: 7 * DAY_MS, cadence: 'explicit', provenance: 'provider' },
  search: { maximumAgeMs: DAY_MS, cadence: 'daily', provenance: 'provider' },
  // seo-audit and geo-observatory both probe public surfaces on a weekly cadence rather than
  // reading a provider API, so their provenance is the probe, not a vendor of record.
  seo: { maximumAgeMs: 7 * DAY_MS, cadence: 'weekly', provenance: 'public-probe' },
  geo: { maximumAgeMs: 7 * DAY_MS, cadence: 'weekly', provenance: 'search-probe' },
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

export function isAbandonedRefreshReceipt(
  receipt,
  now = new Date().toISOString(),
  timeoutMs = ABANDONED_RUN_MS,
) {
  if (receipt?.state !== 'running' || receipt?.finishedAt) return false;
  const startedAt = Date.parse(receipt?.lastAttemptAt ?? '');
  return Number.isFinite(startedAt) && Date.parse(now) - startedAt > timeoutMs;
}

/**
 * Rewrite receipts that a dead run left behind as `failed`, so the store — not
 * only the rendered envelope — stops claiming a refresh is in flight.
 */
export function reconcileAbandonedRefreshReceipts(store, {
  now = new Date().toISOString(),
  timeoutMs = ABANDONED_RUN_MS,
  failure = ABANDONED_RUN_FAILURE,
} = {}) {
  const reconciled = [];
  for (const entry of store.listMetadata({ prefix: 'evidence-refresh:' })) {
    if (!isAbandonedRefreshReceipt(entry.value, now, timeoutMs)) continue;
    store.setMetadata(
      entry.key,
      { ...entry.value, state: 'failed', finishedAt: now, failure: { ...failure } },
      { now },
    );
    reconciled.push({
      key: entry.key,
      runId: entry.value.runId ?? null,
      startedAt: entry.value.lastAttemptAt ?? null,
    });
  }
  return reconciled;
}

export function buildEvidenceEnvelope({
  family,
  rows = [],
  receipt = null,
  now = new Date().toISOString(),
  abandonedRunMs = ABANDONED_RUN_MS,
}) {
  const policy = EVIDENCE_POLICIES[family];
  if (!policy) throw new Error(`unknown evidence family: ${family}`);
  const observedAt = latestTimestamp(rows.map((row) => row?.observedAt));
  const lastSuccessAt = latestTimestamp([receipt?.lastSuccessAt, observedAt]);
  const lastAttemptAt = timestamp(receipt?.lastAttemptAt);
  const freshUntil = lastSuccessAt
    ? new Date(Date.parse(lastSuccessAt) + policy.maximumAgeMs).toISOString()
    : null;
  const expired = !freshUntil || Date.parse(now) > Date.parse(freshUntil);
  const abandoned = isAbandonedRefreshReceipt(receipt, now, abandonedRunMs);
  let state = expired ? 'stale' : 'fresh';
  if (receipt?.state === 'running' && !abandoned) state = 'refreshing';
  else if (
    (abandoned || ['failed', 'unavailable'].includes(receipt?.state))
    && lastAttemptAt
    && (!lastSuccessAt || Date.parse(lastAttemptAt) >= Date.parse(lastSuccessAt))
  ) state = abandoned ? 'failed' : receipt.state;
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
    failure: ['failed', 'unavailable'].includes(state)
      ? (abandoned ? { ...ABANDONED_RUN_FAILURE } : receipt?.failure ?? null)
      : null,
  };
}

/**
 * Run `task` under a refresh receipt that always reaches a terminal state. A
 * collector that owns its own receipt records `failed` when it throws, instead
 * of leaving `running` behind for whichever process started it to clean up.
 */
export async function withRefreshReceipt(store, run, task, {
  now = () => new Date().toISOString(),
  signals = ['SIGINT', 'SIGTERM', 'SIGHUP'],
  onInterrupt = (signal) => process.exit(signal === 'SIGINT' ? 130 : 143),
  // How many surfaces the run actually landed. A portfolio receipt says nothing
  // about coverage on its own, so a six-target invocation would otherwise read
  // exactly like the full sweep the backend launches.
  summarize = () => ({}),
} = {}) {
  const base = { ...run, startedAt: run.startedAt ?? now(), finishedAt: null };
  let settled = false;
  const settle = (state, extra = {}) => {
    if (settled) return;
    settled = true;
    recordRefreshReceipt(store, { ...base, state, finishedAt: now(), ...extra });
  };
  // A collector that is signalled mid-run is the common way a receipt gets
  // stranded: the work stops and nothing writes the terminal state. Catchable
  // signals are handled here; SIGKILL is what the abandonment bound is for.
  const handlers = signals.map((signal) => {
    const handler = () => {
      settle('failed', {
        code: 'REFRESH_INTERRUPTED',
        summary: `${base.label} was stopped by ${signal} before it reported a result.`,
      });
      onInterrupt(signal);
    };
    process.once(signal, handler);
    return [signal, handler];
  });
  recordRefreshReceipt(store, { ...base, state: 'running', summary: `${base.label} is running.` });
  try {
    const result = await task();
    settle('succeeded', { summary: `${base.label} completed.`, ...summarize(result) });
    return result;
  } catch (error) {
    settle('failed', {
      code: error?.code ?? 'REFRESH_FAILED',
      summary: error?.message ?? `${base.label} failed.`,
    });
    throw error;
  } finally {
    for (const [signal, handler] of handlers) process.off(signal, handler);
  }
}

export function evidenceRefreshDue(envelope) {
  return ['stale', 'failed'].includes(envelope?.state);
}
