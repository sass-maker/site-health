## Why

Fleet Console's current Metrics catch-all mixes four different owner decisions:
domain strength, technical agent readiness, performance, and project-level
diagnostics. The portfolio now has enough provider-specific evidence and
explicit missing states to separate those decisions without inventing a blended
score or presenting readiness proxies as AI outcomes.

## What Changes

- Replace the primary Metrics destination with dedicated Domains, AI Awareness,
  and Performance views while retaining project-detail diagnostics.
- Refocus Marketing as a coverage directory across every maintained product,
  including positioning, latest publishing evidence, outstanding
  recommendations, and an honest never-marketed state.
- Define AI Awareness from maintained P1 products and provider-backed model
  answer outcomes only; crawler, fixture, and readiness evidence remains
  supporting project detail.
- Group shared registrable domain roots once and show native D-Rank, history
  state, observation time, and affected products.
- Classify maintained public products against explicit PSI/LCP guardrails as
  Fast enough, Needs work, or Not measured without ranking the portfolio.
- Preserve URL project scope, project-detail links, responsive navigation, and
  fail-soft evidence states.
- Remove Metrics from primary navigation. Existing `/metrics` links remain a
  compatibility redirect to Domains.
- Do not add provider authorization, schedules, credentials, deployment, or
  production configuration.

## Capabilities

### New Capabilities

- `portfolio-strength-console`: Defines the four owner-facing portfolio views,
  their evidence boundaries, state semantics, navigation, project scope, and
  responsive behavior.

### Modified Capabilities

None.

## Impact

- Fleet Console Astro routes, navigation, client rendering, projection types,
  and styles under `foundry/apps/dashboard/fleet-console/`.
- Fleet Console server projection and focused tests under `foundry/ops/`.
- `foundry/apps/dashboard/fleet-console/PRODUCT.md`, `DESIGN.md`, the root
  `PROJECT_STATUS.md`, and the Fleet OpenSpec store.
- No new dependency, external API, credential, database, provider call,
  deployment, release, or production configuration.
