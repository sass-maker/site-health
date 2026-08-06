## Why

Fleet's 27 maintained products are technically readable by agents, but public
identity, source/documentation links, provider-backed answer evidence, and
prompt-owned content can still drift independently. The latest audit found one
live homepage identification failure, several naming conflicts, inaccessible
public source links, incomplete provider coverage, and no completed
evidence-backed content-coverage verdicts.

## What Changes

- Establish one validated public identity contract per maintained product,
  including canonical public name, aliases, origin, repository/source posture,
  documentation, publisher profiles, availability, and pricing posture.
- Fail shared validation when human metadata, agent catalogs, public directory
  records, source links, or documentation links disagree with that contract.
- Keep technical agent-readiness distinct from provider-observed AI awareness;
  fixture or web-search evidence cannot satisfy provider visibility.
- Add a complete, reviewable prompt-ownership projection that maps every
  configured buyer prompt to a canonical page, product proof, sources,
  limitations, and provider-observation state without inventing missing pages.
- Correct the dated GEO audit to reflect the four existing provider-observed
  core products and separately identify the remaining 23 products.
- Prepare content-coverage manifests for missing prompt pages. Repository
  writes and publishing continue to require the existing exact manifest-hash
  approval gate.
- Preserve production deployment as a separate explicit action; source fixes
  are not reported as live until deployment and a new observation prove them.

## Capabilities

### New Capabilities

- `portfolio-geo-integrity`: Defines canonical public product identity,
  external-link integrity, prompt ownership, and source-versus-live evidence
  requirements for all maintained products.

### Modified Capabilities

- `fleet-visibility-remediation`: Extends honest remediation reporting to
  distinguish source-complete, deployment-pending, provider-unobserved, and
  content-approval-pending states.
- `ai-visibility`: Requires portfolio reporting to disclose exact
  provider-observation project coverage rather than treating fixtures,
  subscription-backed observations, or web-search results as interchangeable.

## Impact

- Fleet catalog and agent-surface registries, their validators and tests.
- Public SaaS Maker directory projections and link integrity checks.
- AI visibility projections, audit/report generation, and prompt coverage
  artifacts.
- Independent product repositories only through separately reviewed fixes or
  approved content manifests; no cross-repository source mutation is hidden in
  Fleet generation.
- No new production dependency, credential, schedule, migration, or automatic
  deployment.
