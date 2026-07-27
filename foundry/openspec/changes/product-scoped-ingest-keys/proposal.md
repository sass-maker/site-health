## Why

App Health currently scopes each ingest key to one product environment, which forces operators to issue and wire a different key for local, staging, and production. A product should instead have one revocable ingest identity while each client explicitly declares the environment whose telemetry it is sending.

## What Changes

- Issue one ingest key per product rather than per product/environment pair.
- Require product-key traffic to declare a bounded environment:
  - App Health SDK batches carry an explicit environment field.
  - OTLP uses the standard `deployment.environment.name` resource attribute.
- Resolve telemetry into a durable environment under the authenticated product and keep all storage, queries, installation state, and dashboard data isolated by that resolved environment.
- Show a product-level environment selector in the dashboard.
- Keep existing environment-scoped keys working during migration; they remain pinned to their original environment and cannot override it.
- Configure the Polaris App Health SDK installer with the product key and derive its batch environment from the existing `APP_ENV`.
- Verify Polaris using an existing application route and normal server startup; no demo-only route or dummy endpoint is added.

## Capabilities

### New Capabilities

- `product-scoped-telemetry-routing`: Product-level ingest-key lifecycle, explicit client environment selection, compatibility behavior for existing environment keys, isolated environment routing, and dashboard switching.

### Modified Capabilities

None in the Fleet store. App Health's repository-local setup, ingestion, OTLP, SDK, and dashboard specifications will be synchronized during implementation.

## Impact

- App Health contracts, control-plane repositories, D1 schema, SDK payloads, OTLP projection, setup UI, dashboard selection, tests, and deployment migration.
- Polaris App Health SDK configuration in PR #282 or its successor.
- One App Health SDK dependency and no Collector, sidecar, port, or Polaris infrastructure configuration.
- Production D1 migration and App Health deployment remain separate approval-gated actions.
