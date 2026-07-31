## Why

Fleet Console currently proves how Foundry's six buckets connect, but topology
alone says little about what those connections produced. The first outcome
revision then put every useful signal on one Outputs page while the remaining
primary routes stayed empty. The operator needs the same six-bucket mental
model in the Console, with each page answering one clear question.

## What Changes

- Replace the overloaded Outputs route and empty primary routes with four
  focused views: Projects, Feedback, Metrics, and Marketing.
- Add a collapsible left sidebar that mirrors the six repository buckets:
  Fleet Console, Public apps, Helpers, Skills, Marketing, and Packages.
- Make Projects the default destination and remove the redundant Overview page.
- Put search and AI visibility outcomes, site-health readiness, and improvement
  actions on Metrics; registry and produced direct website, changelog, and
  source destinations on Projects; campaign and publishing evidence on
  Marketing; and the package/ingestion/inbox boundary on Feedback. Retain
  generic skill-run envelopes only as operational/debug evidence rather than a
  longitudinal Console product.
- Add one URL-persisted project scope used by Projects, Metrics, Marketing, and
  Feedback.
- Project every comparable numeric series and graph its historical movement,
  with first-class Search Visibility, AI Visibility, D-Rank, AI Agent
  Readiness, AI Crawlability, Content Coverage, and PSI Swarm histories.
- Make AI Agent Readiness measure the published corpus rather than only its
  entrypoints: retain the percentage and count of public sitemap routes with a
  working Markdown representation, plus the integrity of `/api/ai` catalog
  surfaces. Keep AI Crawlability limited to whether agents can enter.
- Summarize those reports in one 27-project Metrics matrix with SEO, GEO,
  Performance, and Design cells, without blending their native scores. Link
  every row and cell to the matching section of a dedicated project page.
  Missing measurements, configuration, public domains, or receipts remain
  explicit rather than removing the project from a family or presenting zero.
- Distinguish earned outcomes, technical readiness, and fixture canaries in the
  projection and UI. Fixture AI results are operational evidence, never AI
  visibility scores; Search Console and provider outcomes remain `not measured`
  until real evidence exists. Every displayed measure names its evidence source
  and observation time, and shared domain-level D-Rank values disclose their
  domain scope.
- Preserve the six-bucket topology, component states, gaps, and complete
  transport ledger as an inspectable left-side System Map sheet.
- Add one normalized private API projection for project catalog, AI visibility,
  Drank, PSI Swarm, skill-run history, public workflow reports, Feedback,
  Marketing, and Mobile Cockpit integration evidence.
- Distinguish `connected`, `partial`, `missing`, `stale`, and `unavailable`
  states without treating source presence as proof of a working connection.
- Preserve source-system authority: Fleet Console reads sanitized summaries and
  links to owners rather than copying private outputs or domain logic.
- Add responsive, accessible evidence rows and honest empty states while
  retaining the existing Foundry visual language.
- Keep output claims bounded to recorded runs, artifacts, observations,
  project checks, and histories; never infer productivity or improvement from
  source presence.
- Keep the skill owners storage-neutral. The central runner records normalized
  local envelopes; any future hosted D1 history goes through one authenticated
  Fleet ingestion boundary rather than direct per-skill writes.
- Do not deploy, activate recurring schedules, modify credentials, or fabricate
  missing Feedback submissions, Marketing outcomes, or mobile consumers.

## Capabilities

### New Capabilities

- `fleet-console-connections`: Defines the normalized connection and output
  projection, outcome-first owner surface, System Map sheet,
  evidence/freshness states, and privacy boundary for the integrated Fleet
  Console.

### Modified Capabilities

- `founder-mission-control`: Extend the final owner dashboard with integration
  health and cross-bucket evidence without turning it into an infrastructure
  cockpit.
- `foundry-product-buckets`: Require the implemented connection status for all
  six buckets to be visible in Fleet Console, not only documented.

## Impact

The change affects Fleet Console navigation and shell, the
`/project-statuses`, `/metrics`, and `/feedback` routes, the retired
`/skill-uses` redirect,
existing Marketing route, the System Map sheet, client rendering and styles,
Founder Control API routing, the read-only connection/output adapter, Ops
Console runtime packaging, tests, OpenSpec, and root project status. Legacy
empty routes redirect to the nearest focused view. It reads existing
machine-local and checked-in sanitized evidence only and adds no production
dependency or provider mutation.
