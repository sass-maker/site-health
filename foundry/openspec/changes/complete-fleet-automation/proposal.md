## Why

Most fleet products are entering a low-attention state after 2026-07-19, but
their automation is fragmented across repository CI, Cloudflare, local cron,
product analytics, marketing routines, and one-off audits. This change creates
the minimum closed-loop operating contract required for the fleet to stay
usable, observable, and quietly marketed without recurring manual inspection.

The deadline changes the standard: the goal is not a universal observability
platform or feature-complete autonomous company. The goal is a complete,
evidence-backed baseline that can detect meaningful failure, preserve product
signals, perform only bounded safe actions, and route the remaining decisions
to Sarthak.

## What Changes

- Establish one machine-readable automation coverage registry for the 25
  in-scope entries: 4 My Work products, 15 Toolbox projects, and 6 Foundry
  components. Ignored and Removed entries are excluded from routine automation.
- Define minimum telemetry contracts by runtime type instead of forcing one
  analytics stack everywhere: public surface, API/Worker, background job, and
  desktop/mobile app.
- Reuse existing CI, Cloudflare logs, smoke checks, notifications, marketing
  control plane, resilience audit, GEO observatory, and Foundry dashboard before
  adding any new service or production dependency.
- Add one coverage audit that can answer whether each in-scope entry has the
  required build, live, analytics, logging, job-safety, indexing, and ownership
  evidence for its attention class and runtime.
- Standardize safe automation execution: bounded runtime and inputs, locks,
  idempotency, retries, durable failure state, cost limits, dry-run support,
  evidence receipts, and approval gates.
- Give My Work products full product/reliability evidence while preserving
  Sarthak's control over product direction and production release.
- Keep Toolbox projects usable and discoverable with lightweight health checks,
  minimum activation signals, indexing, directory links, and expiring quiet
  marketing experiments.
- Treat Foundry and its helpers as one factory workstream with the deepest
  operational telemetry and one control surface for planning, building,
  marketing, failures, actions, and verification.
- Deduplicate alerts into one operator inbox and digest; page only failures that
  require action or risk data, security, cost, or a My Work product.
- Preserve manual approval for production deploys, migrations, DNS changes,
  deletion, credentials, rate-limit changes, and public claims.
- Produce a dated closure report that records complete coverage, accepted
  exceptions, blocked external setup, and deliberately deferred enhancements.

## Capabilities

### New Capabilities

- `automation-coverage-registry`: Canonical per-entry attention class, runtime,
  owner, surfaces, dependencies, minimum contracts, automation mode, and
  evidence status.
- `minimum-fleet-telemetry`: Runtime-specific product analytics, structured
  operational logging, job lifecycle signals, reliability metrics, and data
  protection evidence without requiring one vendor everywhere.
- `safe-automation-control-loop`: Observe, diagnose, propose, approve, act,
  verify, record, and notify with bounded execution and an auditable receipt.
- `toolbox-experiment-automation`: Ambient discoverability and bounded,
  measurable, automatically expiring marketing experiments for Toolbox
  projects.

### Modified Capabilities

None. Existing fleet-local `cloudflare-resilience`, `site-health`,
`geo-observatory`, and `marketing-control-plane` capabilities remain source
systems consumed by this umbrella contract; their unfinished tasks are closed
or explicitly accepted rather than duplicated here.

## Impact

- Primary planning and shared implementation: `fleet-workspace/fleet-ops`,
  SaaS Maker/Foundry, and `fleet.sassmaker.com`.
- In-scope consumers: CodeVetter, HeyPace, PostTrainLLM, High Signal, the 15
  Toolbox entries, and the six Foundry components recorded in the fleet
  attention model.
- Existing systems reused: `fleet-ops/config/projects.json`, project attention
  notes, fleet health/deploy/resilience scripts, production smoke checks,
  Codex cron, notifications, site-health, GEO Observatory, marketing control
  plane, GitHub Actions, and Cloudflare observability.
- No new production dependency is assumed. Product repositories change only
  where the coverage audit proves a missing critical contract that cannot be
  supplied centrally.
- Production deploys and external-account setup remain separately approved
  actions. The PRD can be implemented and verified locally/through CI without
  silently publishing changes.
