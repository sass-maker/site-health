# Closure Report: Complete Fleet Automation

**Date:** 2026-07-25
**Change:** `complete-fleet-automation`
**Status:** Closed; remaining activation and publication boundaries are tracked
in the root project status.

## Summary

Established one machine-readable automation coverage registry for 25 in-scope
Fleet entries (4 My Work, 16 Toolbox, 5 Foundry + Helpers) with 12 Ignored
entries excluded from routine automation. Built the central coverage and
evidence layer, made Foundry automation safe and observable, closed all
Toolbox contracts via archived sibling changes, completed quiet marketing
experiments with durable receipts, and reconciled existing fleet initiatives.

## What Shipped

### Registry and coverage layer
- `foundry/ops/config/automation-registry.json` — 37 entries, 25 in-scope, 12
  excluded. Validated by `foundry/ops/lib/fleet-automation/registry.mjs`.
- `foundry/ops/lib/fleet-automation/evidence.mjs` — normalized sanitized
  evidence envelope with freshness handling and last-known-good snapshots.
- `foundry/ops/lib/fleet-automation/adapters.mjs` — per-source evidence
  adapters: GitHub Actions, Cloudflare/deploy, live smoke, site-health,
  cron/job receipts, marketing receipts, performance, local checks.
- `foundry/ops/scripts/fleet-automation-collect-evidence.mjs` — collects
  evidence from existing artifacts into the normalized inbox.
- `foundry/ops/scripts/fleet-automation-coverage.mjs` — read-only coverage
  command emitting JSON + Markdown, exits non-zero on actionable gaps.
- `foundry/ops/lib/fleet-automation/policy.mjs` — observe/propose/execute-safe/
  approve-required action policy with negative tests.

### Safe and observable automation
- `foundry/ops/automation/job-policies.json` — all 6 recurring Foundry jobs
  inventoried with bounds, timeout, lock, retry, idempotency, budget, dry-run,
  receipt, and failure path.
- `foundry/ops/scripts/fleet-automation-action.mjs` — action receipts with
  post-action verification via `--verify-command` (exit 4 on verification
  failure, exit 3 on blocked action).
- `foundry/ops/scripts/fleet-notify` + `notification.test.mjs` — notification
  outbox with dedup, quiet-hours, retry, and delivery receipts.
- `foundry/ops/scripts/fleet-automation-health.mjs` — scheduler health JSON.
- Coverage remains a machine-readable operational report rather than a primary
  Foundry screen. The owner-facing console stays focused on projects,
  marketing, decisions, and outcomes.

### Marketing experiments
- `foundry/ops/config/marketing-program.json` + `marketing-program.mjs` —
  canonical marketing registry with destination, CTA, indexing, channels,
  mode, and no-marketing exceptions.
- `foundry/ops/lib/toolbox-automation/experiments.mjs` — experiment validation
  with auto-expiry, review-debt backpressure, quiet failure, no auto-replacement,
  and evidence-backed promotion recommendations (`noAutomaticPromotion: true`).
- `persistExperimentReceipt` — durable per-project/asset/channel/time-window
  receipt persistence.

### Product contracts closed via archived sibling changes
- CodeVetter: `2026-07-19-automate-codevetter`
- PostTrainLLM: `2026-07-25-automate-posttrainllm`
- Personal website, RolePatch, Karte: `2026-07-25-automate-portfolio-identity-toolbox`
- Significant Hobbies, Reader, Anime List, SWE Interview Prep, LoopTV, Chess:
  `2026-07-25-automate-significant-hobbies-toolbox`
- Email Manager, Motion: `2026-07-19-automate-private-local-toolbox`
- Research Papers, Starboard: `2026-07-25-automate-data-research-toolbox`
- Free AI, Knowledge Base: `2026-07-25-automate-ai-infrastructure-toolbox`
- Cloudflare resilience: `2026-07-25-cloudflare-resilience-control-plane`
  (29/29 domains healthy)

## Verification

- `npm run check:registry` — clean (37 entries; 25 in scope; 12 excluded;
  26 marketing projects, 4 focus; retired boundaries clean; 18 public
  products).
- `npm run test:fleet` — 88 tests pass, 0 fail.
- `npx astro build` (ops-console) — owner-first console build passes.
- `fleet-automation-action.mjs --verify-command` — exit 0 (verified), 4
  (failed), 3 (blocked) confirmed.
- `fleet-automation-collect-evidence.mjs --dry-run` — 25 marketing receipt
  records collected from existing program.

## Accepted Exceptions

None. All in-scope entries have explicit statuses or are marked not-applicable
by contract.

## External Boundaries (carried forward)

The earlier HeyPace and High Signal checkout blockers are resolved: their
repository work is merged, verified, and the matching Fleet readiness changes
are archived.

1. **GEO Observatory trend acceptance** — the versioned weekly job is ready
   without a Claude/GitHub-App dependency, but one more real weekly observation
   is required before the trend change can be archived.
2. **retire-saas-maker 5.8** — npm publish blocked on npm auth (`E401`).
   Separate change; not blocking this closure.

## Deferred Non-Critical Enhancements

- Full per-source evidence adapter wiring for GitHub Actions API (requires
  GitHub token at collection time; adapter is ready, just not scheduled).
- Mobile Dev Cockpit as a full Foundry control client (deferred to
  `foundry-founder-control-loop`).
- Physical repository merges (deferred per consolidation boundary in
  `PROJECT_STATUS.md`).

## Safety Attestation

No implementation in this change:
- Added a production dependency.
- Exposed private data (evidence sanitizer tested; no raw provider data in
  ops-console).
- Enabled auto-deploy (production deploys remain manual).
- Broadened publishing authority (marketing experiments cannot auto-promote
  or auto-replace).
- Changed DNS, credentials, or rate limits.
- Migrated data.
- Touched Ignored entries without explicit approval.

All work is local/CI only. Deploys, DNS, credentials, and migrations require
separate explicit approval per fleet rules.

## Source Revisions

This closure report was produced at the current `main` branch HEAD. All
referenced files are in the working tree at the time of archiving.
