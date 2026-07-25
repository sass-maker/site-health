## Why

Email Manager and Motion are personal Toolbox applications with unusually
sensitive or local-only data. They should remain buildable and usable with
privacy-safe failure evidence, without creating a hosted data plane or ongoing
product obligation.

## What Changes

- For Email Manager, verify authenticated surface health, local/private email
  storage, sync lifecycle, bounds, freshness, retry/idempotency, and sanitized
  errors without exposing message content or credentials.
- For Motion, verify iOS build/release readiness, local motion/speech/game
  runtime, privacy-safe crash evidence, and explicit undeployed state without
  inventing server telemetry.
- Connect build/live/job status to Foundry using aggregate evidence only.
- Add only critical missing controls and record device/signing/external blockers
  honestly.

## Capabilities

### New Capabilities

- `private-local-toolbox-automation`: Privacy-safe build, sync/job, crash,
  freshness, blocker, and Foundry evidence for Email Manager and Motion.

### Modified Capabilities

None.

## Impact

- Repositories: `email-manager` and `motion`.
- No email-body collection, hosted Motion backend, automatic device signing,
  migration, credential work, production deploy, or feature expansion.
