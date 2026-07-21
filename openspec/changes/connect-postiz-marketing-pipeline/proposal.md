## Why

Fleet's marketing generation code is consolidated, but its review and posting path still references SaaS Maker endpoints that were intentionally removed. The live boundary must move to Postiz so Fleet can own source packages and rendering without rebuilding a social scheduler or keeping a dead queue alive.

## What Changes

- **BREAKING:** remove SaaS Maker, Symphony, and `fnd` as marketing queue, approval, readiness, and receipt dependencies.
- Keep canonical source packages, rendered media, and generation receipts in Fleet Workspace.
- Add a provider-neutral live Postiz adapter for integration discovery, media upload, draft creation, scheduling, publication receipts, and analytics reads.
- Make Postiz the only review, approval, calendar, scheduling, and social-publication surface.
- Keep all credentials and account connections on the designated operations machine; repository tests use injected clients and fixtures only.
- Expose only aggregate readiness, publishing receipts, and marketing outcomes in the Fleet console.
- Keep all posting disabled until the approved self-hosted Postiz instance is
  running on the designated machine, exact brand accounts are connected, and a
  draft-only canary is explicitly accepted.

## Capabilities

### New Capabilities

- `postiz-distribution`: Live Postiz API boundary, account mapping, draft/schedule behavior, media handoff, idempotency, receipts, analytics, and failure handling.

### Modified Capabilities

- `marketing-control-plane`: Replace SaaS Maker queue/review state with Fleet-owned source evidence and sanitized Postiz outcomes.
- `reel-content-handoff`: Hand approved rendered packages to Postiz without direct social posting or a second internal review queue.

## Impact

- Affects Fleet marketing configuration, Reel Pipeline clients and commands, the machine marketing service, Fleet console marketing summaries, tests, docs, and project status.
- Removes runtime coupling to the SaaS Maker repository and API.
- Adds no production package dependency; the adapter uses the documented Postiz Public API through injected `fetch`.
- Does not install Postiz, connect accounts, read secrets, publish content, deploy services, or change DNS in this change without separate explicit approval.
