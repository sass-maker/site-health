## 1. Baseline and boundaries

- [x] 1.1 Capture current Fleet Console desktop/mobile screenshots and record the MissionControl parity baseline against the six parity journeys in `design.md`.
- [x] 1.2 Inventory every current console data source and classify it as canonical provider evidence, derived projection, local private state, or removable UI-only state.
- [x] 1.3 Add a machine-checked ownership map proving GitHub, Cloudflare, Postiz, CodeVetter, App Health, Drank, PSI Swarm, High Signal, and Foundry do not duplicate authoritative data.
- [x] 1.4 Remove or rewrite remaining docs and tests that name the retired SaaS Maker queue as Foundry's task or approval system.
- [x] 1.5 Add lifecycle-registry consistency checks so README/project-tier counts and ignored membership cannot drift from `automation-registry.json`.

## 2. Mission and event foundation

- [x] 2.1 Define typed contracts for project references, objectives, missions, actors, events, evidence pointers, deliverables, decisions, recommendations, and outcomes under `foundry/ops/lib/founder-control/`.
- [x] 2.2 Define event schemas, allowed transitions, visibility classes, idempotency behavior, and safe payload limits with unit tests.
- [x] 2.3 Add versioned SQLite migrations for the append-only event ledger, idempotency keys, projection checkpoints, and local metadata without storing the database in Git.
- [x] 2.4 Implement ledger append/read transactions and reject duplicate or malformed events with dependency-free tests.
- [x] 2.5 Implement deterministic projection rebuilds for mission, decision, activity, project, and owner-home views.
- [x] 2.6 Add correction, reversal, cancellation, stale-evidence, and awaiting-verification transitions as append-only events.
- [x] 2.7 Add redacted export, backup verification, and restore/replay commands; document the still-unselected private backup destination.

## 3. Local control service and evidence adapters

- [x] 3.1 Implement a small same-machine control API for mission reads, draft creation, decisions, activity, projects, marketing, and projection rebuilds.
- [x] 3.2 Reuse the existing private-host authentication boundary and reject unauthenticated mutations; add request/response contract tests.
- [x] 3.3 Add a GitHub adapter for commit, pull request, release, and workflow-run evidence pointers without copying logs.
- [x] 3.4 Add a Cloudflare adapter for deployment and domain evidence pointers without copying provider configuration or secrets.
- [x] 3.5 Add Postiz, Drank, PSI Swarm, CodeVetter, and App Health adapter contracts that normalize only safe summaries and links.
- [x] 3.6 Add adapter idempotency, freshness, unavailable-provider, and retry tests.
- [x] 3.7 Backfill only current safe evidence needed for the first owner view; do not import historical raw logs or traces.

## 4. Owner-first Console

- [x] 4.1 Initialize/update the Fleet Impeccable product design context and define the nontechnical owner information hierarchy.
- [x] 4.2 Replace the current home hierarchy with Needs me, Working now, What shipped, What changed, and Recommended next using honest fixture/empty states.
- [x] 4.3 Build a mission detail page with outcome, actor state, timeline, deliverables, evidence, decisions, and measured outcome.
- [x] 4.4 Build a Decisions view for open, stale, resolved, rejected, and reversed owner decisions.
- [x] 4.5 Reshape Projects around current objective, latest verified outcome, attention class, freshness, and next owner decision.
- [x] 4.6 Reshape Activity into a concise mission/event timeline and remove raw operational noise from the primary product.
- [x] 4.7 Remove Tasks, Speed, Traces, and Observability from Foundry navigation and link provider evidence only from progressive detail.
- [x] 4.8 Connect the console to the local control API and remove fixture fallbacks that could be mistaken for real state.
- [x] 4.9 Verify keyboard navigation, empty/loading/error/stale states, desktop/mobile layout, and reduced-motion behavior.

## 5. Extract `@saas-maker/ai-visibility`

- [x] 5.1 Freeze representative High Signal Mention fixtures covering mentions, negation, recommendation, rank, sentiment, citations, competitors, personas, provider failures, and judge fallback.
- [x] 5.2 Create `foundry/packages/ai-visibility` with package metadata, strict TypeScript configuration, exports, and no runtime framework/database dependency.
- [x] 5.3 Move prompt/persona/provider contracts and matrix expansion behind stable package interfaces.
- [x] 5.4 Move deterministic analysis, citation normalization, competitor analysis, and report aggregation with fixture parity tests.
- [x] 5.5 Move optional judge integration behind a caller-supplied adapter and label deterministic fallback provenance.
- [x] 5.6 Implement bounded concurrency, timeout/retry classification, maximum-call enforcement, cache fingerprints, and cost receipt hooks.
- [x] 5.7 Add package README examples for High Signal and Foundry adapters, privacy/storage responsibilities, and free-first execution.
- [x] 5.8 Pack the package locally and prove it can be consumed from a clean temporary TypeScript project without workspace-only imports.

## 6. Migrate High Signal without product regression

- [x] 6.1 Add the package to High Signal through a local packed-artifact integration and preserve its existing D1, API, auth, schedule, UI, and Daily Brief ownership.
- [x] 6.2 Replace High Signal's execution/analysis imports incrementally while keeping the previous implementation available for comparison.
- [x] 6.3 Run frozen fixture parity, Mention suites, API product-contract tests, shared/API/web typechecks, docs checks, and the smallest relevant build.
- [x] 6.4 Verify the connected-brand Daily Brief sections and Mentions route locally with seeded data.
- [x] 6.5 Remove duplicated High Signal engine code only after parity passes and update its architecture, direction, status, and migration-source rules.
- [x] 6.6 Prepare the package release and High Signal consumer changes as independently reviewable commits; do not publish or deploy without their guarded approvals.

## 7. Foundry AI visibility and Marketing

- [x] 7.1 Extend the canonical Foundry marketing registry with per-project aliases, competitors, prompt sets, personas, provider policy, cache window, and run budget.
- [x] 7.2 Exclude ignored projects by construction and test explicit reactivation behavior.
- [x] 7.3 Implement a manual local AI-visibility canary that records call coverage, normalized aggregates, evidence, failures, cache use, and observed cost in the ledger.
- [x] 7.4 Add local normalized history and comparison projections without persisting credentials or unnecessary raw provider responses.
- [x] 7.5 Add Marketing → AI Visibility with visibility, recommendation, rank, citations, competitor share, coverage, trend, freshness, and cost.
- [x] 7.6 Convert citation/visibility changes into evidence-backed recommendations rather than automatic marketing work.
- [x] 7.7 Add disabled schedule intent and activation gates; prove a fresh clone and unverified host cannot run checks.
- [x] 7.8 Run one approved local project canary and review data
      quality/storage/cost before proposing recurring cadence. Accepted
      2026-07-25 for Pace: 8 bounded fixture attempts, 4 completed and 4
      correctly unavailable, 0 raw response text retained, 68 KB total
      rehearsal storage, $0.004 observed fixture cost, and a repeat served from
      normalized cache at $0 observed cost. Live-provider cadence remains
      disabled pending designated-host activation.

## 8. Portfolio learning and marketing decisions

- [x] 8.1 Replace the retired SaaS Maker approval link with Foundry Needs me items across marketing snapshots, notifications, mobile summaries, and docs.
- [x] 8.2 Attach source package, approval, render, Postiz, publication, and measurement receipts to canonical missions.
- [x] 8.3 Implement recommendation scoring across impact, confidence, effort, reversibility, attention class, and freshness.
- [x] 8.4 Add post-ship attribution gates requiring merge, green CI, deployment, and production-smoke evidence before outcome learning.
- [x] 8.5 Add recommendation accept/reject/snooze/refine actions that create mission drafts rather than implementation tasks.
- [x] 8.6 Implement outcome-window evaluation with supported, unsupported, mixed, and not-yet-measurable verdicts.
- [x] 8.7 Verify ignored work is suppressed except for security, cost, data-loss, or explicit reactivation risk.

## 9. Mission intake, daily control, and notifications

- [x] 9.1 Implement deterministic structured mission drafting and optional caller-supplied AI enhancement without requiring a paid provider.
- [x] 9.2 Require owner acceptance before executable work starts except for explicitly read-only missions.
- [x] 9.3 Add factual actor/current-work projections for Codex, OpenClaw, registered cron jobs, and external providers.
- [x] 9.4 Generate a concise daily brief covering decisions, current work, verified outcomes, material changes, stale/failed schedules, and recommended next actions.
- [x] 9.5 Send deduplicated owner notifications only for actionable decisions, prolonged blockers, failed critical work, security/cost/data risk, or requested completion.
- [x] 9.6 Add schedule view and receipts without presenting inert intent as enabled work.

## 10. Over-parity acceptance and rollout

- [x] 10.1 Pass the six MissionControl parity journeys: intake, current work, owner request, mission timeline, scheduled work, and daily summary.
- [x] 10.2 Pass the six Foundry over-parity journeys: canonical portfolio resolution, repository/deploy proof, post-ship marketing/visibility/feedback loop, approval receipts, ranked recommendations, and local-first operation.
- [x] 10.3 Run Impeccable critique, polish, and audit; perform browser verification at desktop and mobile widths with no fake operational data.
- [x] 10.4 Run privacy/redaction, idempotency, projection rebuild, backup/restore, cost-boundary, stale-evidence, and unavailable-provider tests.
- [x] 10.5 Run `npm run test:fleet`, component-native checks, registry validation, High Signal checks, `git diff --check`, and OpenSpec strict validation.
- [x] 10.6 Rehearse a fresh-clone designated-host setup with schedules disabled and verify the console remains useful without external AI providers.
- [x] 10.7 Update root and High Signal `PROJECT_STATUS.md`, recommendation context, runbooks, and package documentation with actual shipped state.
- [x] 10.8 Obtain separate approval before package publication, High Signal
      deployment, Fleet Console cutover, backup activation, or recurring
      AI-visibility schedules. The owner approved finishing the specs and
      machine activation on 2026-07-25; each external action still uses its
      guarded execution and credential checks.
- [x] 10.9 Archive the OpenSpec change only after every accepted capability is
      shipped, verified, and reflected in durable status.
