## Why

Fleet's AI Visibility matrix has complete fixture baselines but no honest,
credential-free route for recording provider-backed answers. A strict offline
ingestion boundary lets an operator capture answers with an approved provider,
then normalize them through the existing private ledger without enabling live
execution or retaining raw response text.

## What Changes

- Add a versioned provider-observation bundle contract for one or more canonical
  Fleet projects.
- Validate project identity, canonical prompt ids, provider/model provenance,
  capture timestamps, request identifiers, response status, and explicit cost.
- Replay accepted observations through the existing AI Visibility engine under
  a distinct `provider-observation` evidence mode.
- Add an optional all-project coverage gate for the canonical 27.
- Keep direct provider calls, credentials, schedules, deployments, and
  production configuration unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `ai-visibility`: Add credential-free ingestion of explicit provider
  observations while preserving fixture and live-provider distinctions.

## Impact

The change touches the Foundry AI Visibility adapter, adds a local CLI, focused
tests and a non-secret example bundle, and updates the operations runbook. It
adds no dependency, network call, schedule, deployment, or production
configuration.
