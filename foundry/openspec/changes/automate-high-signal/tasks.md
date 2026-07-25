## 1. Runtime and data baseline

- [ ] 1.1 Read High Signal AGENTS/status/operations docs and inventory every web,
  API, annotation, ingestion, scheduled, queue/workflow, AI/provider, storage and
  deploy path.
- [ ] 1.2 Build a machine-readable job table with trigger, owner, bounds,
  timeout, concurrency, key/watermark, deduplication, retries, freshness, output
  expectations and failure destination.
- [ ] 1.3 Map authoritative, reconstructable and irreplaceable data plus
  backup/export/rebuild/migration evidence.
- [ ] 1.4 Record current product funnel, API errors/latency, content freshness,
  provider/cost, CI, deployment revision and live health.

## 2. Critical pipeline gap closure

- [ ] 2.1 Add/fix stable run/job identity and lifecycle receipts for every
  recurring stage lacking observable start/success/failure/retry/freshness.
- [ ] 2.2 Add/fix idempotency/deduplication and watermark advancement tests for
  retrying paths with duplicate/data-loss risk.
- [ ] 2.3 Add/fix bounded batch/runtime/concurrency/retry controls where the
  baseline proves a critical unbounded path.
- [ ] 2.4 Add output-count/quality/freshness verification so zero/bad output
  cannot advance a green pipeline state.
- [ ] 2.5 Add/fix sanitized API/background correlation, latency/error and
  unresolved failure evidence without content/prompt leakage.
- [ ] 2.6 Add/fix provider quota/cost/degradation visibility using existing
  provider policy and no spend/rate-limit changes.
- [ ] 2.7 Verify recovery/reconstruction paths with bounded fixtures or preserve
  an explicit blocker when a real restore needs separate approval.

## 3. Product and Foundry integration

- [ ] 3.1 Define/test acquisition, meaningful reading/engagement, primary
  conversion and meaningful return evidence.
- [ ] 3.2 Connect web/API/pipeline/data/provider evidence to sanitized Foundry
  snapshots with stage-level statuses.
- [ ] 3.3 Permit only registry-approved idempotent retry and task/PR preparation;
  add negative tests for editorial/ranking/source/schema/deploy actions.

## 4. Verification and handoff

- [ ] 4.1 Run affected lint/typecheck/test/build and deterministic job fixtures.
- [ ] 4.2 Run API/live/deploy-readiness and freshness checks without production
  mutation.
- [ ] 4.3 Open a scoped PR with complete job/data/evidence tables and leave
  migration, rate limits, provider spend, editorial changes and deploy pending.
