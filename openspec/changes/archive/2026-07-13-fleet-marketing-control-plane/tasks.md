## 1. Canonical program registry

- [x] 1.1 Add the versioned marketing program registry for every active Fleet project
- [x] 1.2 Add schema validation, canonical slug/alias uniqueness checks, and focus-set invariants
- [x] 1.3 Align the domain marketing plan and queue-builder priorities with the registry
- [x] 1.4 Register High Signal, Significant Hobbies, and SWE Interview Prep content-base/channel programs with extensible adapters

## 2. Sanitized pipeline snapshot

- [x] 2.1 Add an authenticated local snapshot command that reads SaaS Maker and emits aggregate-only state
- [x] 2.2 Canonicalize historical project aliases without mutating production rows
- [x] 2.3 Add freshness, oldest-review-age, failure, stage, and next-action calculations
- [x] 2.4 Add fixture tests proving unpublished content and identifiers cannot leak

## 3. Backpressure and mobile review

- [x] 3.1 Gate idea generation on queue availability and configurable review-debt ceilings
- [x] 3.2 Generate only for eligible focus projects lacking a recent experiment
- [x] 3.3 Send concise review/failure/staleness briefs through the existing notification service
- [x] 3.4 Add dry-run coverage proving high review debt produces no queue writes
- [x] 3.5 Add one OpenClaw dry-run job with durable task status and Telegram completion/failure evidence

## 4. Media and distribution boundaries

- [x] 4.1 Remove or permanently disable Reel Pipeline's aged-intake auto-accept behavior
- [x] 4.2 Add source/package revision and brand identity to the approved media handoff and render receipt
- [x] 4.3 Add a provider-neutral publisher adapter contract with brand/account isolation and schedule/publication/metrics receipts
- [x] 4.4 Add Postiz fixture/contract evaluation without installing it or connecting accounts
- [x] 4.5 Add readiness reporting that distinguishes local media tests from target-host and channel-account readiness

## 5. Marketing control plane UI

- [x] 5.1 Add a read-only `/marketing` Fleet Ops page with funnel totals and per-project state
- [x] 5.2 Link the five-lane Marketing entry to `/marketing` and provide authenticated SaaS Maker review actions
- [x] 5.3 Distinguish focus, evergreen, infrastructure, private, and source-backed channel programs visibly
- [x] 5.4 Show OpenClaw orchestration, Reel Pipeline target-host readiness, publisher readiness, and last receipt without overstating status
- [x] 5.5 Verify responsive layout, accessibility, empty/stale/error states, and public-data safety

## 6. Verification and rollout

- [x] 6.1 Run focused tests, Fleet Ops build, Reel Pipeline tests, and desktop/mobile browser QA
- [x] 6.2 Run the queue builder and OpenClaw orchestration in dry-run mode against the current backlog
- [x] 6.3 Update Fleet Ops and Reel Pipeline status/runbooks and document the operator loop
- [x] 6.4 Commit and push verified changes without mutating queue rows, posting, deploying, installing Postiz, or changing DNS
- [x] 6.5 Request explicit approval before enabling any schedule, publisher installation, social connection, or production queue cleanup
