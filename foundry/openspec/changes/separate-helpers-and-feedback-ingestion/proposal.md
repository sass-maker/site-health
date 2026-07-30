## Why

Foundry's current folders and product documentation blur reusable helpers with
packages and classify Mobile Cockpit as public even though it is an undecided
mobile client for Fleet Console. Feedback also requires every consumer to write
an `onSubmit` adapter even when the consumer already has a compatible ingestion
endpoint.

## What Changes

- Introduce a first-class Helpers category for Drank, PSI Swarm, and AI
  Visibility, separate from Fleet skills.
- Define skills as thin discovery and invocation adapters; a helper may own a
  skill entrypoint, but its runtime and domain implementation must have one
  canonical home.
- Move the three helper roots to `foundry/helpers/` and update tracked
  consumers, registries, scripts, checks, documentation, and skill pointers.
- Reclassify Mobile Cockpit as an experimental Fleet Console client under the
  dashboard boundary, with no claim that it is a public product or committed
  future interface.
- Keep Feedback as the sole shared public package under `foundry/packages/`.
- Add an optional caller-supplied `ingestionUrl` destination to
  `@saas-maker/feedback` while preserving the existing `onSubmit` integration.
  The package will not provide a default endpoint, credentials, storage,
  authentication, inbox, or Fleet-hosted runtime.
- **BREAKING**: canonical internal source paths for Drank, PSI Swarm, AI
  Visibility, and Mobile Cockpit change; tracked path consumers must migrate in
  the same change.

## Capabilities

### New Capabilities

- `feedback-ingestion-destination`: Defines backend-agnostic direct submission
  to a caller-selected endpoint and its transport, error, privacy, and
  compatibility contract.

### Modified Capabilities

- `foundry-product-buckets`: Replaces the old package/internal/public
  classification with explicit Helpers, Skills, Public Apps, Marketing,
  Packages, and Fleet Console boundaries.
- `fleet-workspace-boundary`: Adds canonical helper roots and places Mobile
  Cockpit inside the dashboard boundary.
- `ai-visibility`: Reclassifies the framework-independent engine as a helper
  while preserving its consumer-independent API and runtime boundaries.

## Impact

- Paths and references under `foundry/README.md`, `foundry/ops/`, Fleet Console,
  component metadata, native docs, checks, and deploy helpers.
- Canonical roots for Drank, PSI Swarm, AI Visibility, and Mobile Cockpit.
- Public TypeScript props and submission behavior in
  `foundry/packages/feedback`.
- No new production dependency, external service, secret, deployment, or
  recurring automation.
