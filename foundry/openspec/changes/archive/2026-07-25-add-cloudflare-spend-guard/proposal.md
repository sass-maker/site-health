## Why

Fleet has good Cloudflare deployment and resilience evidence, but no repeatable
way to answer the owner's financial questions: whether the account is already
incurring charges, which projects are likely to create spend next, whether that
usage serves an active product need, and what can be optimized safely. Static
configuration alone cannot answer those questions, while billing and pricing
surfaces change often enough that a durable skill must retrieve current
provider evidence rather than bake in assumptions.

## What Changes

- Add a Fleet-owned `cloudflare-spend-guard` skill that composes the official
  Cloudflare skill, documentation, authenticated read-only APIs, and Fleet's
  canonical project inventory.
- Define an evidence hierarchy that separates fixed subscriptions, usage-based
  charges, metered-but-free usage, projected risk, configured capacity, and
  missing permissions.
- Add dependency-free helpers to inventory project-level Cloudflare cost
  drivers and normalize Cloudflare billable-usage records without reading
  credentials or changing provider state.
- Produce an evidence-backed decision table for each project or product family:
  keep, optimize, pause candidate, or insufficient evidence.
- Require current pricing, billing-cycle, and changelog retrieval before
  estimating thresholds or savings; never treat unavailable cost fields as
  zero.
- Keep all Cloudflare mutations, resource deletion, subscription changes,
  alert creation, and production configuration changes out of scope.

## Capabilities

### New Capabilities

- `cloudflare-spend-governance`: Read-only Cloudflare spend detection,
  threshold-risk assessment, project-necessity review, optimization guidance,
  and evidence-safe reporting for Fleet.

### Modified Capabilities

None.

## Impact

- Adds one skill under `foundry/ops/skills/`, focused standard-library scripts,
  fixtures/tests, and Fleet skill routing/documentation updates.
- Reuses `foundry/ops/config/projects.json` and the existing Cloudflare
  resilience audit as inventory inputs without changing either authority.
- Adds no production dependency, deployed surface, schedule, provider
  mutation, credential handling, or automatic cost-control action.
