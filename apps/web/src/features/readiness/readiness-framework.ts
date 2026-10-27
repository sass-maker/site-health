export const READINESS_AREAS = [
  { id: 'product', label: 'Product & design', description: 'Build a useful, understandable, polished and dependable product.' },
  { id: 'growth', label: 'SEO & growth', description: 'Build useful coverage, earn discovery and measure how people find us.' },
] as const;
export type ReadinessArea = typeof READINESS_AREAS[number]['id'];
export type FrameworkView = 'effort' | 'results' | 'benchmarks';

export const EFFORT_REQUIREMENTS: Record<ReadinessArea, { title: string; detail: string }[]> = {
  product: [
    { title: 'A complete value-adding loop', detail: 'Clear audience and core value; onboarding, authentication where needed, first useful output, save and return.' },
    { title: 'Core and bonus features work', detail: 'Verify every promised feature end to end. Record intentional exclusions and relevant feature-parity gaps.' },
    { title: 'Everything is understandable', detail: 'Clear labels, navigation and defaults; useful loading, empty, error, success, interruption and recovery states.' },
    { title: 'Exceptional design and motion', detail: 'Aim for 9+/10 through a consistent rendered-product review: typography, hierarchy, accessibility, responsive layouts and purposeful animations with reduced-motion support.' },
    { title: 'AI-executable workflows', detail: 'Most important jobs work through appropriate CLI, API and/or MCP interfaces, with discoverable contracts, structured outputs, scoped authorization and safe replayable actions.' },
    { title: 'Technical delivery and recovery', detail: 'Meaningful tests, CI/CD, deployment and installed-version verification, security/privacy, dependency care, logs, backup, restore and rollback.' },
    { title: 'Top-tier speed', detail: 'Use PSI Swarm to verify the landing page on mobile and desktop. Check core interactions against stated performance budgets and catch regressions.' },
    { title: 'Measurement and maintenance', detail: 'Verify instrumentation and ongoing regression checks as part of the delivered product.' },
  ],
  growth: [
    { title: 'Technical foundations and footer', detail: 'Metadata, canonicals, robots, sitemaps, redirects, appropriate structured data, internal links and the shared footer.' },
    { title: 'Keyword and competitor research', detail: 'Research real audience needs and competing pages, then maintain a keyword/intent-to-page map.' },
    { title: '100+ useful indexed pages', detail: 'Publish substantive intent-matched pages and verify live content and indexing status. Generated URL volume alone does not pass.' },
    { title: '1,000+ useful pages where applicable', detail: 'Expand comparisons, alternatives, guides, problems, use cases and long-tail coverage with distinct value and explicit scope decisions.' },
    { title: 'AI-readable product coverage', detail: 'Provide clear product facts, crawlable content, useful sources and consistent identity. Actual recommendations and citations belong to Results.' },
    { title: 'Backlinks and distribution', detail: 'Build relevant backlinks, profiles, directories and original third-party content; retain a dated distribution and link register.' },
    { title: 'Passive and active action measurement', detail: 'Verify relevant events, acquisition attribution and product identity. Exclude bots, QA and background work.' },
    { title: 'Keep coverage current', detail: 'Refresh content and check broken links, orphan pages, duplicate intent, indexing problems and measurement/performance regressions.' },
  ],
};

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
  gate: 'Pass conditions not defined',
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

export function frameworkHref(area: ReadinessArea, view: FrameworkView, project = '') {
  const params = new URLSearchParams({ pillar: area, tab: view });
  if (project) params.set('project', project);
  return `/readiness?${params}`;
}
