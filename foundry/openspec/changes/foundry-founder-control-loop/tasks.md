## 1. Baseline and boundaries

- [ ] 1.1 Capture current Fleet Console desktop/mobile screenshots and record the MissionControl parity baseline against the six parity journeys in `design.md`.
- [ ] 1.2 Inventory every current console data source and classify it as canonical provider evidence, derived projection, local private state, or removable UI-only state.
- [ ] 1.3 Add a machine-checked ownership map proving GitHub, Cloudflare, Postiz, CodeVetter, App Health, Drank, PSI Swarm, High Signal, and Foundry do not duplicate authoritative data.
- [ ] 1.4 Remove or rewrite remaining docs and tests that name the retired SaaS Maker queue as Foundry's task or approval system.
- [ ] 1.5 Add lifecycle-registry consistency checks so README/project-tier counts and ignored/removed membership cannot drift from `automation-registry.json`.

## 2. Mission and event foundation

- [ ] 2.1 Define typed contracts for project references, objectives, missions, actors, events, evidence pointers, deliverables, decisions, recommendations, and outcomes under `foundry/ops/lib/founder-control/`.
- [ ] 2.2 Define event schemas, allowed transitions, visibility classes, idempotency behavior, and safe payload limits with unit tests.
- [ ] 2.3 Add versioned SQLite migrations for the append-only event ledger, idempotency keys, projection checkpoints, and local metadata without storing the database in Git.
- [ ] 2.4 Implement ledger append/read transactions and reject duplicate or malformed events with dependency-free tests.
- [ ] 2.5 Implement deterministic projection rebuilds for mission, decision, activity, project, and owner-home views.
- [ ] 2.6 Add correction, reversal, cancellation, stale-evidence, and awaiting-verification transitions as append-only events.
- [ ] 2.7 Add redacted export, backup verification, and restore/replay commands; document the still-unselected private backup destination.

## 3. Local control service and evidence adapters

- [ ] 3.1 Implement a small same-machine control API for mission reads, draft creation, decisions, activity, projects, marketing, and projection rebuilds.
- [ ] 3.2 Reuse the existing private-host authentication boundary and reject unauthenticated mutations; add request/response contract tests.
- [ ] 3.3 Add a GitHub adapter for commit, pull request, release, and workflow-run evidence pointers without copying logs.
- [ ] 3.4 Add a Cloudflare adapter for deployment and domain evidence pointers without copying provider configuration or secrets.
- [ ] 3.5 Add Postiz, Drank, PSI Swarm, CodeVetter, and App Health adapter contracts that normalize only safe summaries and links.
- [ ] 3.6 Add adapter idempotency, freshness, unavailable-provider, and retry tests.
- [ ] 3.7 Backfill only current safe evidence needed for the first owner view; do not import historical raw logs or traces.

## 4. Owner-first Console

- [ ] 4.1 Initialize/update the Fleet Impeccable product design context and define the nontechnical owner information hierarchy.
- [ ] 4.2 Replace the current home hierarchy with Needs me, Working now, What shipped, What changed, and Recommended next using honest fixture/empty states.
- [ ] 4.3 Build a mission detail page with outcome, actor state, timeline, deliverables, evidence, decisions, and measured outcome.
- [ ] 4.4 Build a Decisions view for open, stale, resolved, rejected, and reversed owner decisions.
- [ ] 4.5 Reshape Projects around current objective, latest verified outcome, attention class, freshness, and next owner decision.
- [ ] 4.6 Reshape Activity into a concise mission/event timeline and remove raw operational noise from the primary product.
- [ ] 4.7 Remove Tasks, Speed, Traces, and Observability from Foundry navigation and link provider evidence only from progressive detail.
- [ ] 4.8 Connect the console to the local control API and remove fixture fallbacks that could be mistaken for real state.
- [ ] 4.9 Verify keyboard navigation, empty/loading/error/stale states, desktop/mobile layout, and reduced-motion behavior.

## 5. Extract `@saas-maker/ai-visibility`

- [ ] 5.1 Freeze representative High Signal Mention fixtures covering mentions, negation, recommendation, rank, sentiment, citations, competitors, personas, provider failures, and judge fallback.
- [ ] 5.2 Create `foundry/packages/ai-visibility` with package metadata, strict TypeScript configuration, exports, and no runtime framework/database dependency.
- [ ] 5.3 Move prompt/persona/provider contracts and matrix expansion behind stable package interfaces.
- [ ] 5.4 Move deterministic analysis, citation normalization, competitor analysis, and report aggregation with fixture parity tests.
- [ ] 5.5 Move optional judge integration behind a caller-supplied adapter and label deterministic fallback provenance.
- [ ] 5.6 Implement bounded concurrency, timeout/retry classification, maximum-call enforcement, cache fingerprints, and cost receipt hooks.
- [ ] 5.7 Add package README examples for High Signal and Foundry adapters, privacy/storage responsibilities, and free-first execution.
- [ ] 5.8 Pack the package locally and prove it can be consumed from a clean temporary TypeScript project without workspace-only imports.

## 6. Migrate High Signal without product regression

- [ ] 6.1 Add the package to High Signal through a local packed-artifact integration and preserve its existing D1, API, auth, schedule, UI, and Daily Brief ownership.
- [ ] 6.2 Replace High Signal's execution/analysis imports incrementally while keeping the previous implementation available for comparison.
- [ ] 6.3 Run frozen fixture parity, Mention suites, API product-contract tests, shared/API/web typechecks, docs checks, and the smallest relevant build.
- [ ] 6.4 Verify the connected-brand Daily Brief sections and Mentions route locally with seeded data.
- [ ] 6.5 Remove duplicated High Signal engine code only after parity passes and update its architecture, direction, status, and migration-source rules.
- [ ] 6.6 Prepare the package release and High Signal consumer changes as independently reviewable commits; do not publish or deploy without their guarded approvals.

## 7. Foundry AI visibility and Marketing

- [ ] 7.1 Extend the canonical Foundry marketing registry with per-project aliases, competitors, prompt sets, personas, provider policy, cache window, and run budget.
- [ ] 7.2 Exclude ignored and removed projects by construction and test explicit reactivation behavior.
- [ ] 7.3 Implement a manual local AI-visibility canary that records call coverage, normalized aggregates, evidence, failures, cache use, and observed cost in the ledger.
- [ ] 7.4 Add local normalized history and comparison projections without persisting credentials or unnecessary raw provider responses.
- [ ] 7.5 Add Marketing → AI Visibility with visibility, recommendation, rank, citations, competitor share, coverage, trend, freshness, and cost.
- [ ] 7.6 Convert citation/visibility changes into evidence-backed recommendations rather than automatic marketing work.
- [ ] 7.7 Add disabled schedule intent and activation gates; prove a fresh clone and unverified host cannot run checks.
- [ ] 7.8 Run one approved local project canary and review data quality/storage/cost before proposing recurring cadence.

## 8. Portfolio learning and marketing decisions

- [ ] 8.1 Replace the retired SaaS Maker approval link with Foundry Needs me items across marketing snapshots, notifications, mobile summaries, and docs.
- [ ] 8.2 Attach source package, approval, render, Postiz, publication, and measurement receipts to canonical missions.
- [ ] 8.3 Implement recommendation scoring across impact, confidence, effort, reversibility, attention class, and freshness.
- [ ] 8.4 Add post-ship attribution gates requiring merge, green CI, deployment, and production-smoke evidence before outcome learning.
- [ ] 8.5 Add recommendation accept/reject/snooze/refine actions that create mission drafts rather than implementation tasks.
- [ ] 8.6 Implement outcome-window evaluation with supported, unsupported, mixed, and not-yet-measurable verdicts.
- [ ] 8.7 Verify ignored/removed work is suppressed except for security, cost, data-loss, or explicit reactivation risk.

## 9. Mission intake, daily control, and notifications

- [ ] 9.1 Implement deterministic structured mission drafting and optional caller-supplied AI enhancement without requiring a paid provider.
- [ ] 9.2 Require owner acceptance before executable work starts except for explicitly read-only missions.
- [ ] 9.3 Add factual actor/current-work projections for Codex, OpenClaw, registered cron jobs, and external providers.
- [ ] 9.4 Generate a concise daily brief covering decisions, current work, verified outcomes, material changes, stale/failed schedules, and recommended next actions.
- [ ] 9.5 Send deduplicated owner notifications only for actionable decisions, prolonged blockers, failed critical work, security/cost/data risk, or requested completion.
- [ ] 9.6 Add schedule view and receipts without presenting inert intent as enabled work.

## 10. Over-parity acceptance and rollout

- [ ] 10.1 Pass the six MissionControl parity journeys: intake, current work, owner request, mission timeline, scheduled work, and daily summary.
- [ ] 10.2 Pass the six Foundry over-parity journeys: canonical portfolio resolution, repository/deploy proof, post-ship marketing/visibility/feedback loop, approval receipts, ranked recommendations, and local-first operation.
- [ ] 10.3 Run Impeccable critique, polish, and audit; perform browser verification at desktop and mobile widths with no fake operational data.
- [ ] 10.4 Run privacy/redaction, idempotency, projection rebuild, backup/restore, cost-boundary, stale-evidence, and unavailable-provider tests.
- [ ] 10.5 Run `npm run test:fleet`, component-native checks, registry validation, High Signal checks, `git diff --check`, and OpenSpec strict validation.
- [ ] 10.6 Rehearse a fresh-clone designated-host setup with schedules disabled and verify the console remains useful without external AI providers.
- [ ] 10.7 Update root and High Signal `PROJECT_STATUS.md`, recommendation context, runbooks, and package documentation with actual shipped state.
- [ ] 10.8 Obtain separate approval before package publication, High Signal deployment, Fleet Console cutover, backup activation, or recurring AI-visibility schedules.
- [ ] 10.9 Archive the OpenSpec change only after every accepted capability is shipped, verified, and reflected in durable status.
