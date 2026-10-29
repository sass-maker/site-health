import type { Requirement } from '../../../../backend/lib/dashboard-backend/readiness-model.mjs';
import { GATES, CHECKLIST_ITEMS } from '../../../../backend/lib/dashboard-backend/readiness-model.mjs';
export { GATES, CHECKLIST_ITEMS, READINESS_VERSION, emptyReadinessState, effortSummary, hasRequirementAssessment, requirementCompletion, benchmarkFreshness, metricScore, resultSummary, validateReadinessState } from '../../../../backend/lib/dashboard-backend/readiness-model.mjs';
export type { ReadinessState, ReadinessProduct, ReadinessProjection, Requirement, Benchmark, ProofRef, Observation } from '../../../../backend/lib/dashboard-backend/readiness-model.mjs';
export const READINESS_AREAS = [
  { id: 'product', label: 'Product & design', description: 'Build a useful, understandable, polished and dependable product.' },
  { id: 'growth', label: 'SEO & growth', description: 'Build useful coverage, earn discovery and measure how people find us.' },
] as const;
export type ReadinessArea = typeof READINESS_AREAS[number]['id'];
export type FrameworkView = 'effort' | 'results' | 'benchmarks';

export const EFFORT_REQUIREMENTS = CHECKLIST_ITEMS;

export type ResultMetric = { id: string; name: string; definition: string; needs: string };
export const RESULT_METRICS: Record<ReadinessArea, ResultMetric[]> = {
  product: [
    { id: 'dau', name: 'DAU', definition: 'Distinct users performing meaningful product activity that day. Bots, QA and background jobs are excluded.', needs: 'Actor unit, meaningful activity definition, source and day/timezone.' },
    { id: 'high-intent', name: 'High-intent actions', definition: 'Completed actions that deliver the product’s value. Show both action count and distinct actors completing them.', needs: 'Per-product qualifying actions, completion events and attribution.' },
    { id: 'revenue', name: 'Revenue', definition: 'Actual revenue on a consistent basis, currency and window; identify recurring revenue separately where applicable.', needs: 'Applicability, provider, accounting basis/window and refund/test-payment treatment.' },
    { id: 'churn', name: 'Churn', definition: 'Previously active users stopping meaningful use at the product’s natural cadence. Paying-customer churn is separate where applicable.', needs: 'Eligible cohort, inactivity rule, time window and denominator.' },
  ],
  growth: [
    { id: 'discoverability', name: 'Discoverability', definition: 'Coverage of a fixed relevant keyword/question set: where the correct product appears, separated by intent and surface.', needs: 'Frozen panel, brand/non-brand split, surface and coverage definition.' },
    { id: 'visits', name: 'Visits', definition: 'Relevant visits from organic search and AI referrals, separated by source over comparable windows.', needs: 'Visit/session definition, attribution, source and evaluation window.' },
    { id: 'answer-strength', name: 'AI & Google answers', definition: 'Google positions and top-three/top-ten coverage; AI mentions, recommendations, citations and factual accuracy as separate readings.', needs: 'Prompt/query, engine/surface, date, completed samples, positions and accuracy evidence.' },
  ],
};

export const VISIBILITY_LEVELS = [
  { name: 'Brand', question: 'What is CodeVetter?' },
  { name: 'Category', question: 'What are the best code verification tools?' },
  { name: 'Problem', question: 'How do I verify changes made by coding agents?' },
  { name: 'Alternatives & comparisons', question: 'What are the alternatives to a competing verification tool?' },
  { name: 'Specific buying intent', question: 'Which local verification tool suits coding agents working across several languages?' },
] as const;

export const LEVEL_STRUCTURE = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1), name: `Level ${i + 1}`, possiblePoints: 2,
  gate: `${GATES.product[i].title} / ${GATES.growth[i].title}`,
  unlock: i === 4 ? 'Category complete' : `Level ${i + 2} after a verified pass`,
}));

export function frameworkRoute(params: URLSearchParams) {
  const page = params.get('page');
  const historical = page === 'legacy' || page === 'category' || params.has('product') || params.has('category') || params.has('domain') || params.has('q') || params.get('mode') === 'levers' || params.get('mode') === 'history';
  const pillar = params.get('pillar');
  const area: ReadinessArea | null = pillar === 'product' || pillar === 'growth' ? pillar : null;
  const tab = params.get('tab');
  const view: FrameworkView = tab === 'results' || tab === 'benchmarks' ? tab : 'effort';
  return { historical, area, view };
}

export function usesPortfolioScoreboard(params: URLSearchParams) {
  return !params.has('item') || params.get('item') === 'summary';
}

export function frameworkHref(area: ReadinessArea, view: FrameworkView, project = '') {
  const params = new URLSearchParams({ pillar: area, tab: view });
  if (project) params.set('project', project);
  return `/readiness?${params}`;
}

// Status is verification state, not a substitute for an explicit work estimate.
export function requirementStatusChange(entry: Requirement, status: Requirement['status']): Requirement {
  if (['verified', 'not-started', 'exempt'].includes(status)) return { ...entry, status, completion: null };
  return { ...entry, status };
}

// Date inputs are local calendar dates. Preserve that date when UTC is still
// yesterday, without weakening future-time checks for actual source captures.
export function localMeasurementDate(observedAt: string) {
  if (!Number.isFinite(Date.parse(observedAt))) return '';
  const date = new Date(observedAt);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function measurementDateInstant(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : '';
}
