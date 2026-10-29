import { EVIDENCE_POLICIES } from './evidence-freshness.mjs';

const DAY = 86_400_000;
export const CLOCK_TOLERANCE_MS = 5 * 60_000;
const families = { domains: 'drank', performance: 'psi', 'psi-swarm.mobile': 'psi', seoAudit: 'seo', indexCoverage: 'seo', geoAwareness: 'geo', aiAwareness: 'ai', 'free-ai.api-model': 'ai', 'app-health.browser-report': 'usage', 'app-health.provider-revenue': 'usage' };

export function observationFreshness(observedAt, now, maximumAgeMs) {
  const time = Date.parse(observedAt ?? '');
  const current = typeof now === 'number' ? now : Date.parse(now);
  if (!Number.isFinite(time) || !Number.isFinite(current) || time > current + CLOCK_TOLERANCE_MS) return 'invalid';
  return current - time > maximumAgeMs ? 'stale' : 'current';
}

// A valid source reading and a qualified business outcome are independent.
// Retain historical numbers, but never rank them as current measurements.
export function qualifyObservation(row, now = new Date().toISOString()) {
  const policy = EVIDENCE_POLICIES[families[row.source] ?? row.source] ?? EVIDENCE_POLICIES.ai;
  const numeric = typeof row.value === 'number' && Number.isFinite(row.value);
  const negativeAllowed = row.source === 'app-health.provider-revenue';
  const invalidValue = row.value != null && (!numeric || (!negativeAllowed && row.value < 0) || (['%', '/100', 'DR /100'].includes(row.unit) && row.value > 100));
  let state = row.qualification === 'exempt' ? 'exempt'
    : row.status === 'retained' ? 'retained'
    : row.status === 'invalid' || invalidValue ? 'invalid'
    : !numeric ? 'missing'
    : observationFreshness(row.observedAt, now, policy.maximumAgeMs);
  if (['failed', 'unavailable', 'unmapped'].includes(row.status) && numeric) state = 'retained';
  if (row.status === 'stale' && state === 'current') state = 'stale';
  const reason = state === 'invalid' ? 'Invalid value, missing/invalid observation date, or future timestamp; excluded from current measurement.'
    : state === 'stale' ? `Past the ${policy.cadence} evidence limit; historical reading only.`
    : state === 'retained' ? 'Latest refresh unavailable; historical evidence only.' : null;
  return { ...row, value: invalidValue ? null : row.value ?? null,
    qualification: ['current', 'exempt'].includes(state) ? row.qualification : 'unknown',
    measurement: { state, cadence: policy.cadence, maximumAgeDays: policy.maximumAgeMs / DAY,
      freshUntil: numeric && Number.isFinite(Date.parse(row.observedAt ?? '')) ? new Date(Date.parse(row.observedAt) + policy.maximumAgeMs).toISOString() : null },
    gap: [reason, row.gap].filter(Boolean).join(' ') };
}

export function measurementCoverage(observations) {
  return Object.fromEntries(['current', 'stale', 'missing', 'invalid', 'retained', 'exempt'].map(state => [state, observations.filter(row => row.measurement?.state === state).length]));
}

export function measurementContextText(row) {
  const c = row.context ?? {};
  return [row.measurement?.state, c.scope, c.method, c.preset,
    c.samples != null ? `n=${c.samples}` : null,
    c.completed != null ? `${c.completed}/${c.configured ?? '?'} completed` : null,
    c.unavailable != null ? `${c.unavailable} unavailable/failed` : null,
    c.numerator != null && c.denominator != null ? `${c.numerator}/${c.denominator} ${c.cohort ?? ''}`.trim() : null,
    c.sampled === true ? 'Sampled estimate; zero is not verified inactivity' : null,
    c.intent, c.models, c.detail].filter(Boolean).join(' · ');
}
