## 1. Baseline both services

- [x] 1.1 Read Free AI and Knowledge Base AGENTS/status/security/operations docs.
- [x] 1.2 Inventory APIs/Workers, auth, providers/models, routing, health,
  ingestion/indexing/queues/schedules, storage, bindings and deploy paths.
- [x] 1.3 Build job/provider/storage tables with bounds, timeouts, concurrency,
  idempotency, retries, freshness, cost/quota, failure state and recovery owner.
- [x] 1.4 Record current CI/build/live/API, structured errors/latency,
  deployment revision and storage/reconstruction evidence.

## 2. Free AI closure

- [x] 2.1 Verify or add an auth-safe metadata/analytics health probe that spends
  no provider tokens where possible.
- [x] 2.2 Add/fix sanitized request/provider outcome, latency/error and
  degradation evidence without prompts/completions/headers.
- [x] 2.3 Add/fix bounded provider retry/quota/cost visibility according to
  existing routing policy; do not change rate limits or spend.
- [x] 2.4 Verify storage/state ownership and recovery plus Foundry snapshots.

## 3. Knowledge Base closure

- [x] 3.1 Verify or add auth-safe app/API/search health without private corpus
  queries in durable evidence.
- [x] 3.2 Add/fix bounded ingestion/index lifecycle, deduplication, retries,
  freshness and durable failure evidence.
- [x] 3.3 Verify D1/KV/R2/vector/corpus ownership and bounded backup/export or
  reconstruction path.
- [x] 3.4 Add/fix sanitized errors/latency and Foundry snapshots without prompts,
  retrieved chunks or corpus content.

## 4. Verification and handoff

- [x] 4.1 Run focused lint/typecheck/test/build, auth, job and recovery fixtures
  for both services.
- [x] 4.2 Run bounded live/API checks that avoid provider spend/private data.
- [x] 4.3 Open separate scoped PRs and return provider/job/storage/evidence tables.
- [x] 4.4 Leave credentials, providers/spend, rate limits, migrations and
  production deploys pending explicit approval.

## PRs

- free-ai: https://github.com/sass-maker/free-ai/pull/22 — `docs/operations/automation-inventory.md`
- knowledge-base: https://github.com/sass-maker/knowledge-base/pull/12 — `docs/operations/automation-inventory.md`
- saas-maker: https://github.com/sass-maker/saas-maker/pull/41 — `FLEET_HEALTH_CONTRACTS` extension + `pnpm fleet:ai-infra-audit` + tests
