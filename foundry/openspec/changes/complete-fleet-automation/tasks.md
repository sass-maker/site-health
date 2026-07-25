## 1. Freeze scope and establish the baseline

- [ ] 1.1 Register this Store as the single cross-repo plan from the Fleet
  workspace and link it from the canonical fleet attention notes without
  duplicating the PRD.
- [ ] 1.2 Reconcile the 37-entry attention model into a machine-readable
  automation registry with exactly 4 My Work, 15 Toolbox, 6 Foundry + Helpers,
  9 Ignored, and 3 Removed entries; fail validation on missing or duplicate
  identities.
- [ ] 1.3 Record runtime types, owners, surfaces, dependencies, evidence
  sources, action policy, alert policy, and explicit exceptions for all 25
  in-scope entries.
- [ ] 1.4 Run and preserve a dated baseline from git/CI health, deployment
  health, production smoke, Cloudflare resilience, site-health, GEO,
  notifications, cron installation, and marketing control-plane evidence.
- [ ] 1.5 Correct versioned automation definitions that contain non-portable or
  stale checkout paths, then verify installer/dry-run behavior from the current
  Fleet checkout.

## 2. Build the central coverage and evidence layer

- [ ] 2.1 Add schema validation for automation registry attention classes,
  runtimes, evidence contracts, freshness windows, action levels, notification
  policy, and exceptions.
- [ ] 2.2 Implement the normalized sanitized evidence envelope and adapters for
  GitHub Actions, Cloudflare/deploy evidence, live smoke, site-health, cron/job
  receipts, marketing receipts, and available product analytics.
- [ ] 2.3 Add one read-only coverage command that emits matching JSON and
  Markdown reports for all required contracts and exits non-zero only for
  actionable unaccepted gaps.
- [ ] 2.4 Add freshness handling and last-known-good snapshots so unavailable
  providers become stale or blocked without erasing prior evidence or claiming
  pass.
- [ ] 2.5 Add secret/private-data redaction tests covering credential-shaped
  output, authorization headers, user content, unpublished marketing content,
  and provider errors.
- [ ] 2.6 Add fixtures/tests for duplicate identity/domain ownership, missing
  runtime evidence, accepted exceptions, not-applicable contracts, stale
  evidence, and report-total parity.

## 3. Make Foundry automation safe and observable

- [ ] 3.1 Inventory every versioned recurring Foundry job and record its owner,
  trigger, bounds, timeout, lock/concurrency policy, retry maximum,
  idempotency/deduplication, budget, dry-run, receipt, and unresolved-failure
  path.
- [ ] 3.2 Patch critical missing controls found in 3.1 without changing product
  behavior, production credentials, rate limits, or deployment policy.
- [ ] 3.3 Implement action receipts for task/PR creation, safe retries, indexing
  refreshes, snapshot refreshes, and approved experiment actions, including
  post-action verification.
- [ ] 3.4 Enforce observe/propose/execute-safe/approve-required policy and add
  negative tests proving deploys, migrations, DNS, credentials, deletion,
  rate-limit changes, and new public claims cannot execute without approval.
- [ ] 3.5 Verify the notification outbox, deduplication, quiet-hours, retry, and
  delivery receipt path; routine success remains history/digest and bounded
  repeated failures produce one actionable notification.
- [ ] 3.6 Expose scheduler installation, heartbeat, last/next run, exit status,
  receipt/log location, and notification state in one Foundry health surface.

## 4. Verify and close My Work product contracts

- [ ] 4.1 CodeVetter: inventory web, desktop/release, API/background paths and
  product funnel; patch only missing critical build, crash/error, activation,
  deployment, or job-freshness evidence and attach verification.
- [ ] 4.2 HeyPace: inventory landing, macOS build/release, local-first privacy,
  activation, crash/error, and distribution evidence; patch only critical gaps
  and attach verification.
- [ ] 4.3 PostTrainLLM: inventory landing/playground, local training/runtime,
  release/download, activation, error, and any scheduled/data paths; patch only
  critical gaps and attach verification.
- [ ] 4.4 High Signal: inventory web/API/annotation/background ingestion and
  product funnel; verify job lifecycle, freshness, idempotency, latency/error,
  data durability, and conversion evidence; patch only critical gaps.
- [ ] 4.5 Re-run each product's smallest relevant lint/typecheck/test/build plus
  its live/deploy checks, then attach source revision and unresolved accepted
  exceptions to the coverage report.

## 5. Verify and close Toolbox contracts

- [ ] 5.1 Personal website: verify build/live/indexing, canonical portfolio
  links, acquisition/CTA evidence, and quiet-marketing attribution.
- [ ] 5.2 RolePatch and Karte: verify build/live, primary activation, API/job
  evidence where present, privacy/error signals, and canonical discoverability;
  patch only critical gaps.
- [ ] 5.3 Significant Hobbies, Reader, Anime List, SWE Interview Prep, LoopTV,
  and Chess: verify build/live, minimum meaningful activation, scheduled job
  freshness where present, and indexing; explicitly mark irrelevant conversion
  contracts not-applicable.
- [ ] 5.4 Email Manager: verify build/live, authenticated-path health without
  exposing email content, background synchronization lifecycle, bounded work,
  and privacy-safe error evidence.
- [ ] 5.5 Motion: verify the iOS build/release contract and privacy-safe
  crash/activation evidence appropriate to its undeployed personal utility
  state; do not introduce a backend.
- [ ] 5.6 Research Papers and Starboard: verify build/live, search/activation,
  data-refresh lifecycle and durability/reconstruction evidence, errors, and
  indexing.
- [ ] 5.7 Free AI and Knowledge Base: verify API/Worker health, structured
  errors, latency/cost visibility, auth-safe live probes, background job
  lifecycle, storage ownership, and restore/reconstruction evidence.
- [ ] 5.8 Run the smallest relevant checks for every touched Toolbox repository
  and record untouched projects as centrally satisfied, accepted exception, or
  blocked rather than fabricating instrumentation.

## 6. Consolidate Foundry + Helpers as one factory workstream

- [ ] 6.1 SaaS Maker and Fleet Dashboard: expose the registry, coverage
  snapshot, failures, stale evidence, action receipts, approval queue, and
  concise next decisions without fetching raw private provider data in the
  browser.
- [ ] 6.2 PSI Swarm: connect performance/site-health evidence to the normalized
  coverage model and verify bounded sampling, timeout, and failure receipts.
- [ ] 6.3 Mobile Dev Cockpit: define it as a Foundry control client, verify its
  build and private control boundaries, and avoid creating a separate product
  roadmap.
- [ ] 6.4 Drank: connect domain intelligence freshness and receipts to Foundry,
  preserve its independently useful data boundary, and eliminate duplicate
  scheduling/reporting ownership.
- [ ] 6.5 Reel Pipeline: connect approved-package input, render/quality receipts,
  failure state, bounds, and publication handoff to Foundry without granting it
  topic selection, approval, or direct publishing authority.
- [ ] 6.6 Document the consolidation boundary: one ownership/registry/dashboard/
  workflow system now, physical repository merges only as later explicit work
  when release and runtime boundaries genuinely align.

## 7. Complete quiet Toolbox marketing experiments

- [ ] 7.1 Extend the canonical marketing registry so every public Toolbox entry
  has a destination, CTA/activation signal, indexing posture, allowed channels,
  experiment mode, and explicit no-marketing exception where appropriate.
- [ ] 7.2 Add experiment validation for hypothesis, approved source/asset,
  attribution key, start/expiry, budget, success metric, stop rule, and mapped
  brand account.
- [ ] 7.3 Connect experiment outcomes to exact project/asset/channel/time-window
  receipts; mark missing attribution inconclusive and prevent automatic credit.
- [ ] 7.4 Enforce automatic expiry, review-debt backpressure, quiet failure, and
  no automatic replacement campaign after a failed or inconclusive experiment.
- [ ] 7.5 Add an evidence-backed promotion recommendation when a Toolbox project
  exceeds its threshold, while proving the system cannot reclassify it or create
  a feature roadmap without Sarthak's decision.

## 8. Reconcile existing fleet initiatives

- [ ] 8.1 Finish the remaining documentation/re-run/archive tasks in
  `cloudflare-resilience-control-plane`, consuming its audit output as the
  Cloudflare/deployment evidence source rather than rebuilding it.
- [ ] 8.2 Complete the missing GEO Observatory design artifact, record the
  weekly-schedule external blocker or verified installation state, and keep
  phase-two crawler telemetry deferred unless required by the minimum contract.
- [ ] 8.3 Verify the existing site-health and marketing-control-plane specs still
  pass their targeted tests after integration; change requirements only through
  their own OpenSpec deltas if a real conflict appears.

## 9. Final closure gate

- [ ] 9.1 Run registry validation, unit/fixture tests, fleet git/CI health,
  deployment health, resilience audit, production smoke, site-health,
  scheduler/notification health, and marketing dry-run; preserve dated
  machine-readable evidence.
- [ ] 9.2 Confirm all 25 in-scope entries have explicit statuses for every
  required runtime contract and all 12 Ignored/Removed entries are excluded
  from routine automation.
- [ ] 9.3 Confirm no implementation added a production dependency, exposed
  private data, enabled auto-deploy, broadened publishing authority, changed
  DNS/credentials/rate limits, migrated data, or touched Ignored/Removed
  projects without explicit approval.
- [ ] 9.4 Produce the dated closure report with fixed gaps, accepted exceptions,
  external blockers, deferred non-critical enhancements, source revisions, and
  any separately approved production deploys still pending.
- [ ] 9.5 Update canonical Fleet/Foundry documentation and project status, then
  archive this change only after the closure report is internally consistent
  and all required checks pass.
