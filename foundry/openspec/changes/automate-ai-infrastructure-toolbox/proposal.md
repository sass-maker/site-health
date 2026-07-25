## Why

Free AI and Knowledge Base are stable Toolbox infrastructure that other fleet
products may depend on. They are mostly complete and should remain quiet, but
their API health, authentication, provider/storage behavior, cost, and
background work must fail visibly and safely.

## What Changes

- Inventory gateways, APIs, Workers, provider routing, authentication,
  ingestion/indexing, storage, scheduled/queued work, health routes, and deploy
  paths.
- Define auth-safe probes, structured errors, latency/error/cost signals,
  provider degradation, job lifecycle, freshness, idempotency, and durable
  failure evidence.
- Record storage ownership and backup/export/reconstruction paths without
  copying private prompts or corpora into fleet reports.
- Add only critical missing controls and connect sanitized snapshots to
  Foundry.
- Keep both services independently deployable and maintenance-only; do not
  merge them into Foundry or expand their product scope.

## Capabilities

### New Capabilities

- `ai-infrastructure-toolbox-automation`: Auth-safe API, provider, cost,
  storage, background-job, privacy, and Foundry evidence for Free AI and
  Knowledge Base.

### Modified Capabilities

None.

## Impact

- Repositories: `free-ai` and `knowledge-base`.
- No credential rotation, provider spend change, rate-limit change, private
  payload logging, data migration, product expansion, or production deploy.
