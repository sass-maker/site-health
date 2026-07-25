---
title: Provider Boundaries, Fan-Out, and Runtime Cost Safety
owner: Devin 2
status: ready-for-implementation
---

# Provider Boundaries, Fan-Out, and Runtime Cost Safety

## Objective

Prevent AI-heavy, ingestion-heavy, and provider-integrated Workers from
turning traffic spikes, slow upstreams, or larger-than-expected inputs into
CPU overruns, subrequest explosions, retry storms, or uncontrolled spend.

## Repositories and likely surfaces

- `high-signal`: API Worker, scheduled ingest/scoring, delivery windows, Modal
  or other provider fan-out.
- `everythingrated`: Worker/API and catalog/rating ingestion paths.
- `protein-index`: official-brand discovery, publication preparation/import,
  external source fetches, and scheduled data workflows.
- `free-ai`: AI gateway Worker and provider/model discovery workflows.

## In scope

1. Inventory every external provider call and classify it as user-request,
   scheduled, queued, or publication work.
2. Add bounded per-call timeouts, bounded retries with jitter where needed,
   explicit handling for 429/5xx/timeouts, and a terminal state.
3. Cap input size, page size, provider fan-out, concurrent promises, and total
   work per invocation. Prefer chunking or durable Queue/Workflow work over a
   single large request.
4. Add per-run cost/volume budgets where the provider or job can multiply work;
   fail with an inspectable reason when the budget is exceeded.
5. Preserve or add idempotent publication keys, source-set accounting, and
   atomicity around data imports. A partial upstream result must not be
   presented as a complete publication.
6. Make degraded behavior explicit: stale-but-labelled data, skipped provider,
   retryable job, or terminal failure. Never silently substitute fabricated
   content.
7. Add structured bounded telemetry for provider, route/job, status class,
   latency, attempt, item count, and budget usage.
8. Add focused tests for slow provider, 429, repeated 5xx, oversized input,
   empty/incomplete cohort, duplicate publication, and partial fan-out.

Use the existing High Signal CPU incident documentation as a design input.
Optimize expensive work and identify the costly endpoint before proposing any
traffic control. Do not add blanket rate limits.

## Out of scope

- Fleet-wide WAF/rate-limit rules or Cloudflare account configuration.
- Provider credential changes, secret rotation, billing-plan changes, or
  production deploys.
- Replacing provider SDKs or adding production dependencies without approval.
- Changes to the shared resilience audit, deployment workflows, or dashboard.

## Acceptance criteria

- [ ] Every external provider path has an owner, timeout, retry/terminal
      policy, input/fan-out bound, and failure classification.
- [ ] No scheduled or user-triggered path can create unbounded `Promise.all`
      or equivalent provider work from input size.
- [ ] Provider 429/5xx/timeout behavior is tested and does not amplify into an
      infinite retry loop.
- [ ] Publication/import paths reject incomplete or inconsistently accounted
      source sets before durable import.
- [ ] Existing persisted deduplication/retry behavior remains intact and is
      covered by tests.
- [ ] Runtime telemetry is bounded and secret-free.
- [ ] Existing repository checks pass and the residual risk list names any
      provider behavior that could not be verified locally.

## Validation and handoff

Use each repository’s own test/build scripts and inspect the relevant GitHub
workflow without triggering it. Then run:

```bash
node foundry/ops/scripts/cloudflare-resilience-audit.mjs --no-live --json
```

Return a provider matrix: provider, call sites, timeout, retry rule,
fan-out/budget, degraded mode, idempotency/publication rule, telemetry, tests,
and unresolved risk. Do not modify the root audit merely to lower its count.
