## Context

High Signal has the fleet's deepest always-on product path: web/API surfaces,
annotation, source ingestion, scheduled processing, AI/provider work and stored
content. Automation must detect stale or corrupt pipelines independently from
homepage availability.

## Goals / Non-Goals

**Goals:** complete job inventory, freshness/data integrity, API/error/cost
evidence, product funnel, recovery/rollback and Foundry integration.

**Non-Goals:** editorial redesign, ranking changes, new sources, data migration,
rate-limit changes, provider-spend expansion or automatic deploy.

## Decisions

- Model each pipeline stage with a stable job/run key, input watermark, bounds,
  start/success/failure/retry, output count, freshness and unresolved state.
- Correlate API and background errors without persisting private payloads.
- Distinguish content freshness, pipeline success, data quality and public
  availability.
- Record provider/model cost and degradation where available; fail over only
  according to existing product policy.
- Let Foundry propose tasks/PRs and retry explicitly safe idempotent jobs;
  editorial and deployment decisions remain human-controlled.

## Risks / Trade-offs

- **Retries duplicate or corrupt work** → Require stable keys/watermarks and
  deduplication evidence.
- **Pipeline is green with bad output** → Add output count/quality/freshness
  evidence distinct from exit status.
- **Observability leaks source content** → Persist metadata and references, not
  article bodies/prompts.
- **Alert storm** → Deduplicate by job/stage/watermark and notify on actionable
  unresolved state.
