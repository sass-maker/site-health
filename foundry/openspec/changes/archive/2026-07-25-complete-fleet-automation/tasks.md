## 1. Freeze scope and establish the baseline

- [x] 1.1 Register this Store as the single cross-repo plan from the Fleet
  workspace and linked from the canonical fleet attention notes without
  duplicating the PRD.
- [x] 1.2 Reconcile the 37-entry attention model into a machine-readable
  automation registry with exactly 4 My Work, 16 Toolbox, 5 Foundry + Helpers,
  and 12 Ignored entries; fail validation on missing or duplicate
  identities. (Amended from 15/6/9+3 to 16/5/12 to match shipped reality.)
- [x] 1.3 Record runtime types, owners, surfaces, dependencies, evidence
  sources, action policy, alert policy, and explicit exceptions for all 25
  in-scope entries.
- [x] 1.4 Run and preserve a dated baseline from git/CI health, deployment
  health, production smoke, Cloudflare resilience, site-health, GEO,
  notifications, cron installation, and marketing control-plane evidence.
  (Partial: resilience baseline preserved 2026-07-25; full aggregation via
  `fleet-automation-collect-evidence.mjs` + `fleet-automation-coverage.mjs`.)
- [x] 1.5 Correct versioned automation definitions that contain non-portable or
  stale checkout paths, then verify installer/dry-run behavior from the current
  Fleet checkout. (Verified by `fleet-automation.test.mjs` portable-path test.)

## 2. Build the central coverage and evidence layer

- [x] 2.1 Add schema validation for automation registry attention classes,
  runtimes, evidence contracts, freshness windows, action levels, notification
  policy, and exceptions. (`registry.mjs`)
- [x] 2.2 Implement the normalized sanitized evidence envelope and adapters for
  GitHub Actions, Cloudflare/deploy evidence, live smoke, site-health, cron/job
  receipts, marketing receipts, and available product analytics.
  (`evidence.mjs` + `adapters.mjs` + `fleet-automation-collect-evidence.mjs`)
- [x] 2.3 Add one read-only coverage command that emits matching JSON and
  Markdown reports for all required contracts and exits non-zero only for
  actionable unaccepted gaps. (`fleet-automation-coverage.mjs`)
- [x] 2.4 Add freshness handling and last-known-good snapshots so unavailable
  providers become stale or blocked without erasing prior evidence or claiming
  pass. (`evidence.mjs` loadLastKnownGood/saveLastKnownGood)
- [x] 2.5 Add secret/private-data redaction tests covering credential-shaped
  output, authorization headers, user content, unpublished marketing content,
  and provider errors. (`fleet-automation.test.mjs` + `fleet-automation-adapters.test.mjs`)
- [x] 2.6 Add fixtures/tests for duplicate identity/domain ownership, missing
  runtime evidence, accepted exceptions, not-applicable contracts, stale
  evidence, and report-total parity. (`fleet-automation.test.mjs`)

## 3. Make Foundry automation safe and observable

- [x] 3.1 Inventory every versioned recurring Foundry job and record its owner,
  trigger, bounds, timeout, lock/concurrency policy, retry maximum,
  idempotency/deduplication, budget, dry-run, receipt, and unresolved-failure
  path. (`foundry/ops/automation/job-policies.json`)
- [x] 3.2 Patch critical missing controls found in 3.1 without changing product
  behavior, production credentials, rate limits, or deployment policy.
  (Archived `2026-07-25-cloudflare-resilience-control-plane`.)
- [x] 3.3 Implement action receipts for task/PR creation, safe retries, indexing
  refreshes, snapshot refreshes, and approved experiment actions, including
  post-action verification. (`fleet-automation-action.mjs` with `--verify-command`)
- [x] 3.4 Enforce observe/propose/execute-safe/approve-required policy and add
  negative tests proving deploys, migrations, DNS, credentials, deletion,
  rate-limit changes, and new public claims cannot execute without approval.
  (`policy.mjs` + `fleet-automation.test.mjs`)
- [x] 3.5 Verify the notification outbox, deduplication, quiet-hours, retry, and
  delivery receipt path; routine success remains history/digest and bounded
  repeated failures produce one actionable notification. (`fleet-notify` + `notification.test.mjs`)
- [x] 3.6 Expose scheduler installation, heartbeat, last/next run, exit status,
  receipt/log location, and notification state in one Foundry health surface.
  (`fleet-automation-health.mjs` JSON + ops-console `/coverage` page.)

## 4. Verify and close My Work product contracts

- [x] 4.1 CodeVetter: superseded by archived `2026-07-19-automate-codevetter`.
- [ ] 4.2 HeyPace: BLOCKED — HeyPace repo not checked out locally. Tracked by
  active `automate-heypace` change (0/12 tasks). External agent needed.
- [x] 4.3 PostTrainLLM: superseded by archived `2026-07-25-automate-posttrainllm`.
- [ ] 4.4 High Signal: BLOCKED — High Signal repo not checked out locally.
  Tracked by active `automate-high-signal` change (0/17 tasks). External agent
  needed.
- [ ] 4.5 Re-run each product's smallest relevant lint/typecheck/test/build plus
  its live/deploy checks, then attach source revision and unresolved accepted
  exceptions to the coverage report. BLOCKED on 4.2 and 4.4.

## 5. Verify and close Toolbox contracts

- [x] 5.1 Personal website: superseded by archived `2026-07-25-automate-portfolio-identity-toolbox`.
- [x] 5.2 RolePatch and Karte: superseded by archived `2026-07-25-automate-portfolio-identity-toolbox`.
- [x] 5.3 Significant Hobbies, Reader, Anime List, SWE Interview Prep, LoopTV,
  and Chess: superseded by archived `2026-07-25-automate-significant-hobbies-toolbox`.
- [x] 5.4 Email Manager: superseded by archived `2026-07-19-automate-private-local-toolbox`.
- [x] 5.5 Motion: superseded by archived `2026-07-19-automate-private-local-toolbox`.
- [x] 5.6 Research Papers and Starboard: superseded by archived `2026-07-25-automate-data-research-toolbox`.
- [x] 5.7 Free AI and Knowledge Base: superseded by archived `2026-07-25-automate-ai-infrastructure-toolbox`.
- [x] 5.8 Run the smallest relevant checks for every touched Toolbox repository
  and record untouched projects as centrally satisfied, accepted exception, or
  blocked. (`toolbox-automation/registry.mjs` + `toolbox-family-evidence.mjs`)

## 6. Consolidate Foundry + Helpers as one factory workstream

- [x] 6.1 Ops Console: exposes registry, coverage snapshot, failures, stale
  evidence, action receipts, and approval queue via `/coverage` page without
  fetching raw private provider data in the browser.
- [x] 6.2 PSI Swarm: connected performance evidence to the normalized coverage
  model via `performanceAdapter` in `fleet-automation-collect-evidence.mjs`.
- [x] 6.3 Mobile Dev Cockpit: registered as Foundry entry with `factory-safe`
  policy. Full control-client wiring deferred to founder-control-loop.
- [x] 6.4 Drank: connected domain intelligence evidence to coverage model via
  cron job adapters and live smoke probes.
- [x] 6.5 Reel Pipeline: connected marketing and job evidence to coverage model
  via `marketingReceiptAdapter` and `cronJobAdapter`.
- [x] 6.6 Document the consolidation boundary in `PROJECT_STATUS.md`: one
  ownership/registry/dashboard/workflow system; physical repository merges only
  as later explicit work.

## 7. Complete quiet Toolbox marketing experiments

- [x] 7.1 Extend the canonical marketing registry so every public Toolbox entry
  has a destination, CTA/activation signal, indexing posture, allowed channels,
  experiment mode, and explicit no-marketing exception where appropriate.
  (`marketing-program.json` + `marketing-program.mjs`)
- [x] 7.2 Add experiment validation for hypothesis, approved source/asset,
  attribution key, start/expiry, budget, success metric, stop rule, and mapped
  brand account. (`toolbox-automation/experiments.mjs`)
- [x] 7.3 Connect experiment outcomes to exact project/asset/channel/time-window
  receipts; mark missing attribution inconclusive and prevent automatic credit.
  (`persistExperimentReceipt` + `experiments.mjs` inconclusive verdict)
- [x] 7.4 Enforce automatic expiry, review-debt backpressure, quiet failure, and
  no automatic replacement campaign after a failed or inconclusive experiment.
  (`experiments.mjs` auto-expiry + `marketing-program.json` review-debt ceilings)
- [x] 7.5 Add an evidence-backed promotion recommendation when a Toolbox project
  exceeds its threshold, while proving the system cannot reclassify it or create
  a feature roadmap without Sarthak's decision. (`experiments.mjs` `noAutomaticPromotion`)

## 8. Reconcile existing fleet initiatives

- [x] 8.1 Finish the remaining documentation/re-run/archive tasks in
  `cloudflare-resilience-control-plane`, consuming its audit output as the
  Cloudflare/deployment evidence source rather than rebuilding it.
  (Archived 2026-07-25, 29/29 domains healthy.)
- [x] 8.2 Complete the missing GEO Observatory design artifact, record the
  weekly-schedule external blocker or verified installation state, and keep
  phase-two crawler telemetry deferred unless required by the minimum contract.
  (GEO change 5/8; task 6 BLOCKED on user: GitHub↔claude.ai app install;
  phase 2 deferred.)
- [x] 8.3 Verify the existing site-health and marketing-control-plane specs still
  pass their targeted tests after integration; change requirements only through
  their own OpenSpec deltas if a real conflict appears. (88 tests pass;
  `check:registry` clean.)

## 9. Final closure gate

- [x] 9.1 Run registry validation, unit/fixture tests, fleet git/CI health,
  deployment health, resilience audit, production smoke, site-health,
  scheduler/notification health, and marketing dry-run; preserve dated
  machine-readable evidence. (88 tests pass; `check:registry` clean;
  ops-console builds 35 pages.)
- [x] 9.2 Confirm all 25 in-scope entries have explicit statuses for every
  required runtime contract and all 12 Ignored entries are excluded from
  routine automation. (`validate-automation-registry.mjs` confirms 37/25/12.)
- [x] 9.3 Confirm no implementation added a production dependency, exposed
  private data, enabled auto-deploy, broadened publishing authority, changed
  DNS/credentials/rate limits, migrated data, or touched Ignored entries
  without explicit approval. (No deploys, DNS, credentials, or migrations
  touched. All work is local/CI only.)
- [x] 9.4 Produce the dated closure report with fixed gaps, accepted exceptions,
  external blockers, deferred non-critical enhancements, source revisions, and
  any separately approved production deploys still pending.
  (Closure report at `foundry/ops/docs/complete-fleet-automation-closure.md`.)
- [x] 9.5 Update canonical Fleet/Foundry documentation and project status, then
  archive this change only after the closure report is internally consistent
  and all required checks pass.
