// Shared, versioned rules for the current two-category owner workspace.
export const READINESS_VERSION = 'readiness.two-category.v1';
export const AREAS = ['product', 'growth'];
export const METRICS = { product: ['dau', 'high-intent', 'revenue', 'churn'], growth: ['discoverability', 'visits', 'answer-strength'] };
export const GATES = {
  product: [
    { id: 'product-core', level: 1, title: 'A useful, deployed core loop', detail: 'Verify the audience, core value loop, appropriate authentication, basic instrumentation, privacy and deployed or installed behavior.' },
    { id: 'product-features', level: 2, title: 'Promised features and recovery', detail: 'Exercise every promised feature and understandable loading, empty, error, success, interruption and recovery states.' },
    { id: 'product-design', level: 3, title: 'Rendered design quality', detail: 'Review consistent typography, hierarchy, accessibility, responsive layouts, purposeful motion and reduced motion on the rendered product. Technical checks do not establish design quality.' },
    { id: 'product-agent', level: 4, title: 'Fit-for-purpose AI and agent workflows', detail: 'Prove meaningful workflows through applicable AI, CLI, API or MCP interfaces, with discoverable contracts, scoped authorization and safe replay. Explain interface exemptions.' },
    { id: 'product-delivery', level: 5, title: 'Dependable delivery and speed', detail: 'Prove meaningful regression tests, CI, delivery, backup/restore and rollback. Verify mobile and desktop landing performance plus core interaction budgets, as applicable.' },
  ],
  growth: [
    { id: 'growth-foundations', level: 1, title: 'Crawlable identity and measurement', detail: 'Verify technical SEO, metadata, canonicals, robots, sitemap, shared footer, clear crawlable identity and acquisition instrumentation.' },
    { id: 'growth-hundred', level: 2, title: 'Research and useful indexed coverage', detail: 'Maintain a researched keyword/intent map and verify 100 useful indexed pages where applicable. URL counts alone do not pass; document a justified scope exemption.' },
    { id: 'growth-thousand', level: 3, title: 'Broad, distinct intent coverage', detail: 'Verify 1,000 useful pages across relevant intents where applicable, including comparisons, problems and use cases. Preserve explicit scope exemptions.' },
    { id: 'growth-distribution', level: 4, title: 'Relevant links and distribution', detail: 'Maintain a dated register of relevant backlinks, profiles and original distribution, with evidence of relevance and live placement.' },
    { id: 'growth-maintenance', level: 5, title: 'Recurring growth and learning', detail: 'Prove recurring content, links, indexing and regression checks, and record what measured outcomes changed the next action.' },
  ],
};
export function emptyReadinessState() {
  return { version: READINESS_VERSION, applicability: { product: { state: 'unknown', reason: '' }, growth: { state: 'unknown', reason: '' } }, requirements: {}, nextLevers: { product: '', growth: '' }, benchmarks: {} };
}
export function currentProjects(projects) {
  return projects.filter(p => ['active', 'primary'].includes(p.lifecycle?.status)).sort((a, b) => a.name.localeCompare(b.name));
}
function fail(message) { throw Object.assign(new Error(message), { code: 'INVALID_READINESS_STATE', statusCode: 422 }); }
function record(value, label, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be an object`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) fail(`${label}.${key} is not supported`);
}
function text(value, label, maximum = 1000) { if (typeof value !== 'string' || value.length > maximum) fail(`${label} must be text of at most ${maximum} characters`); }
function choice(value, choices, label) { if (!choices.includes(value)) fail(`${label} must be ${choices.join(', ')}`); }
function proof(refs, label) {
  if (!Array.isArray(refs) || refs.length > 5) fail(`${label} must contain at most five dated proof references`);
  for (const ref of refs) {
    record(ref, label, ['ref', 'observedAt']); text(ref.ref, 'Proof reference', 500);
    if (!ref.ref.trim() || typeof ref.observedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(ref.observedAt) || !Number.isFinite(Date.parse(ref.observedAt))) fail('Proof needs a reference and ISO date');
    if (/^(?:javascript|data):/i.test(ref.ref) || /(?:[?&]|\b)(?:token|secret|password|authorization|api[_-]?key)=/i.test(ref.ref)) fail('Proof reference must not contain credentials');
    if (/^https?:/i.test(ref.ref)) {
      let url; try { url = new URL(ref.ref); } catch { fail('Proof URL is invalid'); }
      if (url.username || url.password || [...url.searchParams.keys()].some(key => /(?:^|_)(?:secret|token|password|authorization|cookie|api[_-]?key|private[_-]?key)(?:$|_)/i.test(key))) fail('Proof URL must not contain credentials');
    }
  }
}
export function validateReadinessState(state) {
  record(state, 'state', ['version', 'applicability', 'requirements', 'nextLevers', 'benchmarks']);
  if (state.version !== READINESS_VERSION) fail('Unsupported readiness framework version');
  record(state.applicability, 'applicability', AREAS); record(state.nextLevers, 'nextLevers', AREAS);
  for (const area of AREAS) {
    const applicability = state.applicability[area]; record(applicability, area, ['state', 'reason']);
    choice(applicability.state, ['applicable', 'exempt', 'unknown'], 'Applicability'); text(applicability.reason, 'Applicability reason');
    if (applicability.state === 'exempt' && !applicability.reason.trim()) fail('Exemption needs an explicit reason');
    text(state.nextLevers[area], 'Next lever');
  }
  record(state.requirements, 'requirements', AREAS.flatMap(a => GATES[a].map(g => g.id)));
  for (const entry of Object.values(state.requirements)) {
    record(entry, 'requirement', ['status', 'note', 'evidenceRefs']);
    choice(entry.status, ['not-started', 'in-progress', 'awaiting-evidence', 'verified', 'exempt'], 'Work status');
    text(entry.note, 'Requirement note'); proof(entry.evidenceRefs, 'Requirement evidence');
    if (entry.status === 'verified' && !entry.evidenceRefs.length) fail('Verified work needs dated proof');
    if (entry.status === 'exempt' && (!entry.note.trim() || !entry.evidenceRefs.length)) fail('Exempt work needs a reason and dated scope proof');
  }
  record(state.benchmarks, 'benchmarks', Object.values(METRICS).flat());
  for (const entry of Object.values(state.benchmarks)) {
    record(entry, 'benchmark', ['applicability', 'reason', 'definition', 'baseline', 'target', 'unit', 'window', 'source', 'direction', 'thresholds', 'value', 'qualification', 'observedAt', 'evidenceRefs']);
    choice(entry.applicability, ['applicable', 'exempt', 'unknown'], 'Metric applicability');
    for (const key of ['reason', 'definition', 'unit', 'window', 'source', 'observedAt']) text(entry[key], key);
    if (entry.applicability === 'exempt' && !entry.reason.trim()) fail('Metric exemption needs a reason');
    choice(entry.direction, ['higher', 'lower'], 'Direction'); choice(entry.qualification, ['qualified', 'proxy', 'unknown'], 'Qualification');
    for (const key of ['baseline', 'target', 'value']) if (entry[key] !== null && (typeof entry[key] !== 'number' || !Number.isFinite(entry[key]))) fail(`${key} must be a finite number or unknown`);
    if (!Array.isArray(entry.thresholds) || ![0, 5].includes(entry.thresholds.length) || entry.thresholds.some(n => typeof n !== 'number' || !Number.isFinite(n))) fail('Supply five numeric thresholds, or leave thresholds unset');
    if (entry.thresholds.some((n, i, all) => i > 0 && (entry.direction === 'higher' ? n <= all[i - 1] : n >= all[i - 1]))) fail('Thresholds must strictly improve from level 1 to 5');
    proof(entry.evidenceRefs, 'Metric evidence');
    if (entry.observedAt && !Number.isFinite(Date.parse(entry.observedAt))) fail('Measurement date is invalid');
    if (entry.qualification === 'qualified' && (entry.value === null || !entry.observedAt || !entry.evidenceRefs.length)) fail('Qualified measurement needs a value, date and proof');
  }
  return state;
}
function hasProof(refs) { return refs?.length > 0 && refs.every(ref => ref.ref?.trim() && Number.isFinite(Date.parse(ref.observedAt))); }
export function effortSummary(state, area) {
  const applicability = state.applicability[area];
  if (applicability.state !== 'applicable') return { score: null, level: null, status: applicability.state, verified: 0, total: 5 };
  const entries = GATES[area].map(g => state.requirements[g.id]);
  let level = 0;
  for (const entry of entries) { if (!entry || !['verified', 'exempt'].includes(entry.status) || !hasProof(entry.evidenceRefs)) break; level++; }
  return { score: entries.some(Boolean) ? level * 2 : null, level: entries.some(Boolean) ? level : null, status: entries.some(Boolean) ? 'assessed' : 'not-assessed', verified: entries.filter(e => e?.status === 'verified' && hasProof(e.evidenceRefs)).length, total: 5 };
}
export function metricScore(benchmark) {
  if (!benchmark || benchmark.applicability !== 'applicable' || benchmark.qualification !== 'qualified' || !Number.isFinite(benchmark.value) || !Number.isFinite(Date.parse(benchmark.observedAt)) || !hasProof(benchmark.evidenceRefs) || !Number.isFinite(benchmark.baseline) || !Number.isFinite(benchmark.target) || benchmark.thresholds.length !== 5 || benchmark.thresholds.some((n, i, all) => !Number.isFinite(n) || (i > 0 && (benchmark.direction === 'higher' ? n <= all[i - 1] : n >= all[i - 1]))) || !['definition', 'unit', 'window', 'source'].every(k => benchmark[k]?.trim())) return null;
  return benchmark.thresholds.filter(t => benchmark.direction === 'higher' ? benchmark.value >= t : benchmark.value <= t).length * 2;
}
export function resultSummary(state, area) {
  if (state.applicability[area].state !== 'applicable') return { score: null, qualified: 0, total: METRICS[area].length };
  const applicable = METRICS[area].filter(id => state.benchmarks[id]?.applicability !== 'exempt');
  const scores = applicable.map(id => metricScore(state.benchmarks[id]));
  return { score: scores.length && scores.every(s => s !== null) ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length * 10) / 10 : null, qualified: scores.filter(s => s !== null).length, total: applicable.length };
}
export function replayReadiness(events) {
  const states = {};
  for (const event of events) if (event.type === 'readiness.state-updated') {
    const previous = states[event.projectId]?.revision ?? 0;
    if (event.payload.expectedRevision !== previous) throw Object.assign(new Error('Readiness event revision chain is invalid'), { code: 'READINESS_REVISION_CONFLICT', statusCode: 409 });
    states[event.projectId] = { revision: previous + 1, updatedAt: event.recordedAt, state: structuredClone(event.payload.state) };
  }
  return states;
}
