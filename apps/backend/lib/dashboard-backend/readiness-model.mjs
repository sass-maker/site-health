import { observationFreshness } from './measurement-contract.mjs';
// Shared, versioned rules for the current two-category owner workspace.
export const READINESS_VERSION = 'readiness.two-category.v1';
export const AREAS = ['product', 'growth'];
export const METRICS = { product: ['dau', 'high-intent', 'revenue', 'churn'], growth: ['discoverability', 'visits', 'answer-strength'] };
export const CHECKLIST_ITEMS = {
  "product": [
    {
      "id": "product-core",
      "title": "Core value loop",
      "detail": "Audience, onboarding/auth where needed, useful output, save and return."
    },
    {
      "id": "product-features",
      "title": "Core and bonus features",
      "detail": "Every promised feature works; scoped parity and exclusions explicit."
    },
    {
      "id": "product-understandable",
      "title": "Understandable and dependable journeys",
      "detail": "Labels, navigation, defaults, loading, empty, error, success and recovery."
    },
    {
      "id": "product-design",
      "title": "Design and motion",
      "detail": "Rendered readability, hierarchy, responsive/a11y and purposeful/reduced motion; target quality9+/10 needs actual review."
    },
    {
      "id": "product-agent",
      "title": "AI / CLI / MCP readiness",
      "detail": "Appropriate meaningful executable agent workflow, discovery, scoped auth, structured errors, safe replay."
    },
    {
      "id": "product-delivery",
      "title": "Technical delivery and recovery",
      "detail": "Tests, CI/CD, deployment or install parity, security/privacy, backup/restore/rollback."
    },
    {
      "id": "product-speed",
      "title": "Speed and performance",
      "detail": "Mobile/desktop PSI Swarm plus actual core-interaction budgets or applicable native performance."
    },
    {
      "id": "product-measurement",
      "title": "Product measurement and maintenance",
      "detail": "Instrumentation verified, core events and actor scope, recurring regression checks."
    }
  ],
  "growth": [
    {
      "id": "growth-foundations",
      "title": "Basic SEO and footer",
      "detail": "Metadata, canonicals, sitemap/robots, redirects, schema, links, shared footer."
    },
    {
      "id": "growth-research",
      "title": "Keyword and competitor research",
      "detail": "Relevant keyword/intent-to-page mapping grounded in research; exact matching alone insufficient."
    },
    {
      "id": "growth-hundred",
      "title": "100+ useful published pages",
      "detail": "Distinct useful intent-matched published crawlable pages; count alone insufficient; indexing is a result."
    },
    {
      "id": "growth-thousand",
      "title": "1,000+ useful pages where applicable",
      "detail": "Useful distinct comparisons, guides, alternatives, problems and use cases; explicit scope exemptions."
    },
    {
      "id": "growth-ai",
      "title": "AI-readable coverage",
      "detail": "Consistent identity, verifiable facts, sources and crawlable AI discovery surfaces; not AI mentions."
    },
    {
      "id": "growth-distribution",
      "title": "Backlinks and distribution",
      "detail": "Actual relevant external profile, link or publication work; original third-party distribution, dated register. Owned-site publication is content coverage, not external distribution."
    },
    {
      "id": "growth-measurement",
      "title": "Passive and active acquisition measurement",
      "detail": "Relevant acquisition/action events, attribution and project identity; excludeQA/bots."
    },
    {
      "id": "growth-maintenance",
      "title": "Keep content current",
      "detail": "Proportionate recurring refresh, link/orphan/duplicate and indexing/measurement regression checks."
    }
  ]
};
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
    { id: 'growth-hundred', level: 2, title: 'Research and useful published coverage', detail: 'Maintain a researched keyword/intent map and publish 100 useful, crawlable pages where applicable. URL counts alone do not pass; document a justified scope exemption. Indexing and rankings are separate results.' },
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
export function hasRequirementAssessment(entry) {
  return Boolean(entry && (entry.status !== 'not-started' || entry.note?.trim() || entry.evidenceRefs?.length || entry.completion != null));
}
export function validateReadinessState(state, { enforceSize = true } = {}) {
  const maximumKB = Object.values(state?.checklist ?? {}).some(hasRequirementAssessment) ? 24 : 12;
  if (enforceSize && new TextEncoder().encode(JSON.stringify(state)).byteLength > maximumKB * 1024) fail(`Assessment exceeds ${maximumKB} KB. Shorten notes/proof or clear unused individual draft assessments before saving.`);
  record(state, 'state', ['version', 'applicability', 'requirements', 'checklist', 'nextLevers', 'benchmarks']);
  if (state.version !== READINESS_VERSION) fail('Unsupported readiness framework version');
  record(state.applicability, 'applicability', AREAS); record(state.nextLevers, 'nextLevers', AREAS);
  for (const area of AREAS) {
    const applicability = state.applicability[area]; record(applicability, area, ['state', 'reason']);
    choice(applicability.state, ['applicable', 'exempt', 'unknown'], 'Applicability'); text(applicability.reason, 'Applicability reason');
    if (applicability.state === 'exempt' && !applicability.reason.trim()) fail('Exemption needs an explicit reason');
    text(state.nextLevers[area], 'Next lever');
  }
  record(state.requirements, 'requirements', AREAS.flatMap(a => GATES[a].map(g => g.id)));
  if (state.checklist !== undefined) record(state.checklist, 'checklist', Object.values(CHECKLIST_ITEMS).flat().map(item => item.id));
  for (const entry of [...Object.values(state.requirements), ...Object.values(state.checklist ?? {})]) {
    record(entry, 'requirement', ['status', 'note', 'evidenceRefs', 'completion', 'confidence']);
    choice(entry.status, ['not-started', 'in-progress', 'awaiting-evidence', 'verified', 'exempt'], 'Work status');
    text(entry.note, 'Requirement note'); proof(entry.evidenceRefs, 'Requirement evidence');
    if (entry.status === 'verified' && !entry.evidenceRefs.length) fail('Verified work needs dated proof');
    if (entry.status === 'exempt' && (!entry.note.trim() || !entry.evidenceRefs.length)) fail('Exempt work needs a reason and dated scope proof');
    if (entry.confidence !== undefined) choice(entry.confidence, ['low', 'medium', 'high'], 'Effort estimate confidence');
    if (entry.completion !== undefined && entry.completion !== null) {
      if (!Number.isInteger(entry.completion) || entry.completion < 0 || entry.completion > 100) fail('Work completion must be an integer from 0 to 100, or unknown');
      if (!entry.note.trim() || !entry.evidenceRefs.length || !entry.confidence) fail('Work completion needs a reason, dated proof and estimate confidence');
      if (entry.status === 'verified' && entry.completion !== 100) fail('Verified work must be 100% complete');
      if (entry.status === 'not-started' && entry.completion !== 0) fail('Work not started must have 0% completion');
      if (entry.status === 'exempt') fail('Exempt work has no completion estimate');
    }
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
export function requirementCompletion(entry) {
  if (!entry || !hasProof(entry.evidenceRefs) || entry.status === 'exempt') return null;
  if (entry.completion !== undefined && entry.completion !== null) {
    return Number.isInteger(entry.completion) && entry.completion >= 0 && entry.completion <= 100
      && entry.note?.trim() && ['low', 'medium', 'high'].includes(entry.confidence) ? entry.completion : null;
  }
  // Older verified records remain usable; partial work never gets a made-up estimate.
  return entry.status === 'verified' ? 100 : null;
}
export function effortSummary(state, area) {
  const applicability = state.applicability[area];
  const useItems = CHECKLIST_ITEMS[area].some(item => hasRequirementAssessment(state.checklist?.[item.id]));
  const definitions = useItems ? CHECKLIST_ITEMS[area] : GATES[area];
  const basis = useItems ? 'checklist-items' : 'legacy-gates';
  if (applicability.state !== 'applicable') return { basis, score: null, level: null, status: applicability.state, verified: 0, total: definitions.length, assessed: 0, applicable: 0, confidence: 'unknown', minimumScore: null, maximumScore: null };
  const entries = definitions.map(item => (useItems ? state.checklist : state.requirements)[item.id]);
  const applicable = entries.filter(entry => !(entry?.status === 'exempt' && entry.note?.trim() && hasProof(entry.evidenceRefs)));
  const completions = applicable.map(requirementCompletion);
  const assessed = completions.filter(value => value !== null).length;
  let level = 0;
  for (const gate of GATES[area]) { const entry = state.requirements[gate.id]; if (!entry || !['verified', 'exempt'].includes(entry.status) || !hasProof(entry.evidenceRefs)) break; level++; }
  const complete = applicable.length > 0 && assessed === applicable.length;
  const knownTotal = completions.reduce((sum, value) => sum + (value ?? 0), 0);
  const minimumScore = assessed ? Math.floor(knownTotal / applicable.length) / 10 : null;
  const maximumScore = assessed ? Math.ceil((knownTotal + (applicable.length - assessed) * 100) / applicable.length) / 10 : null;
  const confidence = complete ? ['low', 'medium', 'high'].find(value => applicable.some(entry => (entry.confidence ?? 'high') === value)) : 'unknown';
  return { basis, score: complete ? Math.round(knownTotal / applicable.length) / 10 : null,
    level: GATES[area].some(gate => state.requirements[gate.id]) ? level : null, status: entries.some(Boolean) ? 'assessed' : 'not-assessed',
    verified: entries.filter(e => e?.status === 'verified' && hasProof(e.evidenceRefs)).length, total: definitions.length,
    assessed, applicable: applicable.length, confidence, minimumScore, maximumScore };
}
export function benchmarkFreshness(benchmark, now = new Date().toISOString()) {
  return observationFreshness(benchmark?.observedAt, now, 7 * 86_400_000);
}
export function metricScore(benchmark, now = new Date().toISOString()) {
  if (benchmarkFreshness(benchmark, now) !== 'current') return null;
  if (!benchmark || benchmark.applicability !== 'applicable' || benchmark.qualification !== 'qualified' || !Number.isFinite(benchmark.value) || !Number.isFinite(Date.parse(benchmark.observedAt)) || !hasProof(benchmark.evidenceRefs) || !Number.isFinite(benchmark.baseline) || !Number.isFinite(benchmark.target) || benchmark.thresholds.length !== 5 || benchmark.thresholds.some((n, i, all) => !Number.isFinite(n) || (i > 0 && (benchmark.direction === 'higher' ? n <= all[i - 1] : n >= all[i - 1]))) || !['definition', 'unit', 'window', 'source'].every(k => benchmark[k]?.trim())) return null;
  return benchmark.thresholds.filter(t => benchmark.direction === 'higher' ? benchmark.value >= t : benchmark.value <= t).length * 2;
}
export function resultSummary(state, area, now = new Date().toISOString()) {
  if (state.applicability[area].state !== 'applicable') return { score: null, qualified: 0, total: METRICS[area].length };
  const applicable = METRICS[area].filter(id => state.benchmarks[id]?.applicability !== 'exempt');
  const scores = applicable.map(id => metricScore(state.benchmarks[id], now));
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
