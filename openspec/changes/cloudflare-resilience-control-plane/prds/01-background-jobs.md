---
title: Background Jobs, Replay, and Duplicate-Work Safety
owner: Devin 1
status: ready-for-implementation
---

# Background Jobs, Replay, and Duplicate-Work Safety

## Objective

Make every asynchronous path in Knowledge Base, Reader, and Email Manager
bounded, replay-safe, observable, and explicit about terminal failure. The
desired result is that a Queue, Workflow, cron, or background promise can be
retried without silently duplicating writes or losing work.

## Repositories and likely surfaces

- `knowledge-base`: Cloudflare Worker, Queue consumer, Workflow, D1 metadata,
  replay/import paths.
- `reader`: Worker/API background paths and scheduled ingestion or enrichment.
- `email-manager`: Worker/API background paths, scheduled sync, and provider
  delivery or indexing work.

Start in each repository by reading its nearest `AGENTS.md`, root
`PROJECT_STATUS.md`, package scripts, Wrangler config, workflows, and existing
operations docs. Do not assume the audit’s static evidence is complete.

## In scope

For every discovered async path:

1. Document the job name, trigger, input shape, maximum batch/page size,
   timeout, retry policy, terminal failure state, and replay entry point.
2. Ensure writes have a stable idempotency key or durable deduplication rule.
3. Ensure retries are finite and distinguish transient failure from poison
   input; preserve the failed payload or a safe reference for replay.
4. Add single-flight, lease, unique constraint, or equivalent overlap control
   where two invocations can touch the same records.
5. Bound external calls and post-response work; no unbounded `waitUntil`, loop,
   or provider fan-out.
6. Emit structured success/failure evidence with job ID, source ID, attempt,
   and duration while avoiding secrets or message contents.
7. Add the smallest useful tests for duplicate delivery, partial batch
   failure, retry exhaustion, and replay.

Preserve existing Knowledge Base content hashing, Workflow retry behavior,
Queue batch settings, and replay semantics unless a test demonstrates a defect.
Prefer tightening a missing boundary over redesigning the pipeline.

## Out of scope

- Cloudflare dashboard changes, DNS, WAF, rate limits, credentials, or secrets.
- Production deploys, migrations, destructive cleanup, or schema rewrites.
- Changes to the shared fleet audit or Fleet Ops dashboard.
- Reworking product UI or changing public API semantics.

## Acceptance criteria

- [ ] An inventory table covers every async path in all three repositories.
- [ ] Each path has bounded work, finite retries, terminal failure handling,
      idempotency/deduplication, overlap control, and a replay story, or a
      named documented exception.
- [ ] Duplicate delivery cannot create a second durable write in the tested
      path.
- [ ] A partial batch leaves an inspectable failure and allows safe replay of
      only the failed work.
- [ ] External calls have a bounded timeout and do not retry indefinitely.
- [ ] Logs identify the job/attempt without printing tokens, email bodies, or
      private document contents.
- [ ] Existing repo tests/build/typechecks pass, plus focused new tests.

## Validation and handoff

Run the repository’s smallest relevant checks first, then its documented CI
commands. Also run from the fleet root:

```bash
node fleet-ops/scripts/cloudflare-resilience-audit.mjs --no-live --json
```

Do not edit the root audit to make findings disappear. Return a matrix with
one row per job: trigger, bound, retry, idempotency, overlap control,
observability, replay path, validation command, and residual risk.
