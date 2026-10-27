import type { ScoreCategory } from './scoreboard';

export type ReadinessLevel = { title: string; checks: string[]; proof: string };
export type CategoryGuide = { goal: string; boundary: string; sources: { label: string; href: string }[]; levels: ReadinessLevel[] };
const level = (title: string, checks: string[], proof: string): ReadinessLevel => ({ title, checks, proof });

/** Review guidance, never inferred attainment or a second progress tracker. */
export const CATEGORY_GUIDANCE: Record<ScoreCategory, CategoryGuide> = {
  product: {
    goal: 'Help the intended person complete the core job, then prove why they would choose it again.',
    boundary: 'Judge the promised audience, platform and workflow. Internal and native tools need useful core completion too; a public landing page is not a substitute.',
    sources: [{ label: 'Product inventory and capabilities', href: '/projects' }],
    levels: [
      level('A useful first outcome', ['Name the audience, core job and success condition.', 'Start from a fresh account or installation and reach the first useful output.'], 'A dated shipped-runtime walkthrough shows the input, output and audience-specific success condition.'),
      level('Complete and recoverable', ['Complete the core workflow end to end, including save, reopen and export where relevant.', 'Exercise interruption, invalid input and recovery without losing work.'], 'Replay the full workflow and a failure/recovery case in the released product; retain the output.'),
      level('Credible alternative', ['Compare the relevant alternatives against the same job.', 'Verify the expected features on every promised platform; explain intentional exclusions.'], 'A current comparison and real task runs establish meaningful parity, with gaps stated plainly.'),
      level('Agent-executable core', ['Choose fit-for-purpose CLI, API, MCP or agent entry points; justify exemptions.', 'Document discoverable contracts and scoped authorization; test retries, safe mutations and a negative case.'], 'An agent completes and replays the core workflow against the shipped interface, with structured output and observed use.'),
      level('A reason to return', ['Identify the specific advantage over alternatives.', 'Observe repeated core use or preference from the intended audience.'], 'Dated repeat-use or comparison evidence demonstrates the advantage; shipping alone does not prove preference.'),
    ],
  },
  design: {
    goal: 'Make the job obvious, the workflow efficient and the result worth returning for.',
    boundary: 'Assess actual workflows across relevant devices, including internal tools. Visual polish alone does not establish comprehension or delight.',
    sources: [{ label: 'Product surfaces and scope', href: '/projects' }],
    levels: [
      level('Clear purpose and next step', ['Show what the product does, who it serves and what to do next.', 'Use concrete labels, useful defaults and a clear first result.'], 'An uncoached first-use observation confirms that the intended person understands the job and starts correctly.'),
      level('Efficient task completion', ['Remove unnecessary decisions and repeated entry from the core task.', 'Provide useful feedback, navigation and a clear completion state.'], 'Observed users complete the representative task without coaching; record friction and completion evidence.'),
      level('Works in real conditions', ['Check responsive layout, keyboard use, focus and accessible names.', 'Exercise loading, empty, error, interruption and recovery states.'], 'Dated device/keyboard checks and failure-state walkthroughs show that the same task remains usable.'),
      level('A noticeable quality advantage', ['Identify the moment that creates understanding, relief or delight.', 'Compare that moment with a relevant alternative.'], 'Observed reactions or preference explain the advantage; decoration and self-reported polish are insufficient.'),
      level('Quality that lasts', ['Recheck important tasks after releases and across repeated use.', 'Resolve recurring friction without sacrificing clarity or accessibility.'], 'Comparable observations over time show sustained task success and preference, with remaining issues retained.'),
    ],
  },
  seo: {
    goal: 'Help relevant people discover useful pages in web search and reach meaningful product actions.',
    boundary: 'Brand lookup is a baseline, not non-brand discovery. Use recorded not-applicable decisions and owner intent for private products; never assume that every internal product needs public growth.',
    sources: [{ label: 'Search Console and page audits', href: '/search' }, { label: 'Domain evidence', href: '/domains' }, { label: 'App Store search research', href: '/search/app-store' }],
    levels: [
      level('Crawlable and findable by name', ['Verify robots, canonical URLs, sitemap and indexing for intended public pages.', 'Check branded lookup and distinguish indexing gaps from rank gaps.'], 'Dated crawler/index evidence and branded search observations identify the correct product and canonical pages.'),
      level('Real buyer intent', ['Research actual category, problem and alternative queries.', 'Inspect competitors and separate brand from non-brand demand.'], 'A sourced query/intent set names the audience, competing pages, date and research limitations.'),
      level('Useful intent-matched pages', ['Map queries to useful category, problem and alternative pages.', 'Refresh substantive content, internal links and metadata without creating filler.'], 'Published pages answer the intended question and have an explicit query-to-page mapping and review date.'),
      level('Observed non-brand discovery', ['Track non-brand query positions, impressions and clicks separately from brand.', 'Review coverage and changes over comparable windows.'], 'Source-dated search evidence shows non-brand discovery; bounded extracts and missing query coverage stay explicit.'),
      level('Qualified organic outcomes', ['Connect organic arrivals to meaningful core actions.', 'Compare qualified growth over time and investigate weak intent matches.'], 'Comparable attribution/funnel evidence demonstrates useful organic actions and growth, with uncertainty preserved.'),
    ],
  },
  geo: {
    goal: 'Be accurately recognized, then recommended for relevant problems and comparisons in AI answers.',
    boundary: 'Brand recognition is only the first gate. Closed-book model knowledge, retrieval-assisted answers and web SERP ranks are different evidence classes. Raw web ranks do not prove AI recommendations.',
    sources: [{ label: 'AI brand and answer evidence', href: '/ai-awareness#brand-evidence-title' }, { label: 'Core AI awareness observations', href: '/ai-awareness#ai-awareness-title' }, { label: 'Supporting web search ranks (not AI answers)', href: '/ai-awareness#geo-awareness-title' }],
    levels: [
      level('Brand recognition · minimum gate', ['Ask whether the engine knows the product by name.', 'Separate closed-book knowledge from retrieval-assisted answers and keep negative observations.'], 'Retain engine, surface, prompt ID/text, date, sample count and answer; recognition is not neutral discovery.'),
      level('Factual accuracy', ['Check product identity, audience, capabilities and canonical source.', 'Record hallucinations, outdated claims and attribution errors.'], 'A dated answer review checks claims against authoritative product facts and records accuracy limits.'),
      level('Neutral problem and category discovery', ['Ask realistic category and problem questions without naming the product.', 'Measure whether it is mentioned, recommended or cited, keeping those outcomes separate.'], 'A replayable neutral prompt set and sampled answers demonstrate discovery beyond branded lookup.'),
      level('Alternatives and shortlists', ['Test competitor alternatives, comparisons and purchase/workflow shortlists.', 'Review relevance, position, recommendation rationale and source citations.'], 'Dated comparison answers show when the product earns a relevant place, including competitors and absent cases.'),
      level('Sustained useful visibility', ['Repeat comparable prompts across relevant engines and surfaces over time.', 'Connect referrals to useful product actions where attribution permits.'], 'Comparable cross-engine samples and qualified referral evidence show sustained benefit; missing attribution stays unknown.'),
    ],
  },
  measurement: {
    goal: 'Know what happened, distinguish useful activity from noise and use the evidence to choose the next change.',
    boundary: 'Use a labelled proxy and meaningful core-use evidence for each product. Missing tracking is unknown, not zero; QA and background work are not owner use.',
    sources: [{ label: 'Product usage and tracking coverage', href: '/readiness' }, { label: 'Product evidence inventory', href: '/projects' }],
    levels: [
      level('Scoped working collection', ['Choose appropriate first-party/local or provider collection for the product.', 'Verify project attribution, privacy scope and live delivery.'], 'A controlled event appears in the correct product ledger with its time, source and collection boundary.'),
      level('Meaningful funnel', ['Define the core action and steps leading to it.', 'Test delivery and separate QA, background work and interactive use.'], 'A real end-to-end event trace confirms the funnel and its exclusion rules; definitions are documented.'),
      level('A truthful rolling baseline', ['Review rolling 30-day meaningful use, proxy unit and precision.', 'State tracking coverage, freshness and limitations; retain unknowns.'], 'A dated usage export separates audience proxies from core actions and explains incomplete or stale collection.'),
      level('Evidence changes a decision', ['Connect a signal to one bounded lever, release and follow-up.', 'Keep work performed separate from the observed outcome.'], 'The existing lever history links a dated observation, decision, shipped change and follow-up result.'),
      level('Repeated comparable learning', ['Repeat comparable windows and assess whether decisions helped.', 'Adjust instrumentation or priorities when the evidence contradicts expectations.'], 'Several comparable review cycles show useful learning, including unchanged or worse outcomes.'),
    ],
  },
  engineering: {
    goal: 'Ship correct, dependable products that can be operated and recovered safely.',
    boundary: 'Use the actual platform and risk boundary. A passing build is evidence of a build, not proof of runtime correctness, security or recovery.',
    sources: [{ label: 'Performance measurements', href: '/performance' }, { label: 'Deployment and capability evidence', href: '/projects' }],
    levels: [
      level('Correct core behavior', ['Verify representative core workflows and meaningful negative cases.', 'Test the boundaries where incorrect state or data loss could occur.'], 'Focused checks and real-runtime reproduction show correct outputs and safe failure behavior.'),
      level('Verified shipping', ['Build, sign/package and release through the supported workflow.', 'Verify installed/live source parity and core behavior after release.'], 'Exact source, checks and installed/live runtime evidence identify the version actually exercised.'),
      level('Reliable within budgets', ['Set representative performance and reliability budgets.', 'Measure the shipped runtime under realistic devices, data and failures.'], 'Dated runtime measurements and failure evidence meet stated budgets, with unsupported workloads disclosed.'),
      level('Safe data and actions', ['Verify privacy, authorization, credential handling and least privilege.', 'Exercise scoped agent mutations, idempotent retries and denied actions where relevant.'], 'Boundary tests demonstrate isolation and safe authorization/retry behavior in the actual supported interfaces.'),
      level('Recovery that works', ['Exercise backup, restore, rollback and incident recovery.', 'Confirm recovered data and runtime behavior against the original state.'], 'A dated recovery drill verifies data integrity and restored core behavior, with a usable recovery path retained.'),
    ],
  },
};
