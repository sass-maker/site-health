// Deterministic all-project accounting for the Microsoft Clarity collector.
//
// The collector produces one detailed per-project state. This module folds that
// state into the six fleet classes an operator reports on, and renders one
// bounded summary. It never touches tokens, provider payloads, recordings,
// heatmaps, URLs, or visitor identifiers.

export const FLEET_COLLECTION_SCHEMA = 'site-health.clarity-fleet-collection.v2';

export const CLARITY_FLEET_CLASSES = Object.freeze([
  'measured',
  'cached',
  'unavailable',
  'unwired',
  'inactive',
  'failed',
]);

export const CLARITY_FLEET_MODES = Object.freeze({
  'status-all': 'cached-health',
  'fetch-all': 'provider-refresh',
});

const CAPABILITY_TOTALS = Object.freeze([
  'desired',
  'conditional',
  'blocked',
  'notApplicable',
  'providerVerified',
  'providerAccounted',
]);

// Detailed collector state -> reported fleet class.
const CLASS_BY_STATE = new Map([
  ['measured', 'measured'],
  ['fresh', 'cached'],
  ['stale', 'cached'],
  ['not-measured', 'unavailable'],
  ['unavailable', 'unavailable'],
  ['unwired', 'unwired'],
  ['inactive', 'inactive'],
  ['failed', 'failed'],
  // Receipt/catalog drift is a contract failure, not a quiet exclusion.
  ['not-cataloged', 'failed'],
]);

/**
 * Fold one detailed collector state into a reported fleet class.
 * `refreshing` is transient: it is only cached evidence when a snapshot exists.
 */
export function classifyClarityProject(state, { hasSnapshot = false } = {}) {
  if (state === 'refreshing') return hasSnapshot ? 'cached' : 'unavailable';
  return CLASS_BY_STATE.get(state) ?? 'failed';
}

export function classifyClarityResult(result) {
  return classifyClarityProject(result?.state, {
    hasSnapshot: Boolean(result?.snapshot ?? result?.metrics),
  });
}

function emptyCapabilityTotals() {
  return Object.fromEntries(CAPABILITY_TOTALS.map((key) => [key, 0]));
}

export function clarityCapabilityTotals(results) {
  return results.reduce((totals, result) => {
    for (const key of CAPABILITY_TOTALS) {
      totals[key] += Number(result.capabilities?.summary?.[key] ?? 0);
    }
    return totals;
  }, emptyCapabilityTotals());
}

function countBy(results, pick) {
  const counts = {};
  for (const result of results) {
    const key = pick(result);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function zeroedClassCounts() {
  return Object.fromEntries(CLARITY_FLEET_CLASSES.map((name) => [name, 0]));
}

/**
 * One bounded JSON summary for an all-project run.
 * Schema: docs/clarity-fleet-health.md.
 */
export function clarityFleetSummary(results, { command, observedAt = null } = {}) {
  const classified = results.map((result) => ({
    ...result,
    classification: classifyClarityResult(result),
  }));
  const activeEligible = classified.filter(
    (result) => !['inactive', 'not-cataloged', 'unwired'].includes(result.state),
  );
  return {
    schemaVersion: FLEET_COLLECTION_SCHEMA,
    mode: CLARITY_FLEET_MODES[command] ?? 'cached-health',
    ...(observedAt ? { observedAt } : {}),
    projects: classified.length,
    counts: countBy(classified, (result) => result.state),
    classificationCounts: {
      ...zeroedClassCounts(),
      ...countBy(classified, (result) => result.classification),
    },
    capabilityCounts: clarityCapabilityTotals(classified),
    activeEligibleCapabilityCounts: clarityCapabilityTotals(activeEligible),
    results: classified,
  };
}

export function clarityFleetExitFailure(summary) {
  const counts = summary?.classificationCounts ?? {};
  return (counts.failed ?? 0) > 0 || (counts.unavailable ?? 0) > 0;
}

function metricsOf(result) {
  return result?.metrics ?? result?.snapshot?.metrics ?? {};
}

function cell(value) {
  return value === null || value === undefined ? '—' : String(value);
}

const NOTE_BY_STATE = Object.freeze({
  'not-cataloged': 'Receipt entry has no catalog project; repair the drift.',
  'not-measured': 'Eligible, but no stored snapshot yet.',
  unavailable: 'No private Data Export token could be resolved.',
});

function exclusionNote(result) {
  if (!['unwired', 'inactive'].includes(result?.classification)) return null;
  if (result.classification === 'inactive' && result.eligibility?.eligible) {
    return 'Retained identity excluded from live refresh.';
  }
  return result.eligibility?.reason ?? null;
}

function noteOf(result) {
  const note = result?.failure?.message
    ?? exclusionNote(result)
    ?? NOTE_BY_STATE[result?.state]
    ?? null;
  if (!note) return '';
  const collapsed = String(note).replace(/\s+/g, ' ').trim();
  return collapsed.length > 96 ? `${collapsed.slice(0, 95)}…` : collapsed;
}

function markdownRow(result) {
  const metrics = metricsOf(result);
  return [
    result.projectId,
    result.classification,
    result.state,
    cell(metrics.sessions),
    cell(metrics.uniqueBrowsers),
    cell(metrics.botSessions),
    cell(metrics.pagesPerSession),
    cell(result.observedAt ?? result.snapshot?.observedAt ?? null),
    noteOf(result),
  ].join(' | ');
}

const MARKDOWN_HEADER = [
  '| Project | Class | State | Sessions | Unique browsers | Bot sessions | Pages/session | Observed | Note |',
  '| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |',
];

function totalsLine(summary) {
  return CLARITY_FLEET_CLASSES
    .map((name) => `${name} ${summary.classificationCounts[name] ?? 0}`)
    .join(' · ');
}

/**
 * Render the same bounded summary as a markdown table.
 * Only aggregate counts reach this surface — never tokens, URLs, recordings,
 * heatmaps, or visitor identifiers.
 */
export function formatClarityFleetMarkdown(summary, { title = 'Clarity fleet health' } = {}) {
  const rows = [...summary.results]
    .sort((left, right) => left.projectId.localeCompare(right.projectId))
    .map((result) => `| ${markdownRow(result)} |`);
  return [
    `# ${title}`,
    '',
    `Mode: \`${summary.mode}\` · schema \`${summary.schemaVersion}\``,
    `Projects: ${summary.projects} — ${totalsLine(summary)}`,
    ...(summary.observedAt ? [`Observed at: ${summary.observedAt}`] : []),
    '',
    ...MARKDOWN_HEADER,
    ...rows,
    '',
  ].join('\n');
}
