## Why

Foundry's current `apps/`, `services/`, and `tools/` layout describes implementation
types but obscures the product model the operator actually uses. Reel Pipeline
also appears equivalent to small focused internal applications even though it is
the orchestration core of a much larger marketing system.

## What Changes

- Introduce six explicit Foundry product buckets: packages, skills, public apps,
  internal apps, marketing, and the final dashboard.
- **BREAKING** Move current component roots into category paths:
  - public apps under `foundry/apps/public/`;
  - Drank and PSI Swarm under `foundry/apps/internal/`;
  - Fleet Console under `foundry/apps/dashboard/`;
  - Reel Pipeline and Content Factory under `foundry/marketing/`.
- Keep AI Visibility and Feedback as directly tracked shared packages.
- Keep Fleet-owned skills canonical under `foundry/ops/skills/`, with Ops
  remaining the non-product substrate for registries, automation, evidence,
  scripts, host support, and public workflows.
- Preserve each component's native package manager, checks, deploy target, data
  boundary, and Git history while repairing all path-based contracts.
- Publish one durable architecture and connection overview that distinguishes
  implemented connections from intended or missing connections.
- Do not deploy, migrate data, change credentials, or implement missing product
  capabilities as part of the structural move.

## Capabilities

### New Capabilities

- `foundry-product-buckets`: Defines the six operator-facing Foundry buckets,
  their membership, substrate boundary, and connection-status documentation.

### Modified Capabilities

- `fleet-workspace-boundary`: Replace implementation-type component paths with
  category-owned canonical paths while retaining native runtime boundaries.
- `marketing-control-plane`: Establish Marketing as the product family that owns
  Reel Pipeline, Editorial, Content Factory, rendering engines, distribution
  handoff, campaign state, and outcome evidence.

## Impact

This changes tracked paths across Fleet workflows, registries, scripts, tests,
documentation, submodule declarations, agent instructions, component-local
relative commands, and generated public projections. GitHub repository identity,
Cloudflare targets, package names, runtime behavior, public routes, and
production state remain unchanged.
