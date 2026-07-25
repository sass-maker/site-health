# Foundry AI Visibility

Foundry's AI Visibility slice is manual, private, and local-only. It uses the
canonical configuration in `config/marketing-program.json`, the existing
`@saas-maker/ai-visibility` package, and the Founder control ledger. It does not
own provider credentials, raw provider responses, schedules, or publishing.

## Current operating boundary

- The configured projects are Pace, CodeVetter, PostTrainLLM, and High Signal.
- Each project declares aliases, competitors, prompt sets, personas, allowed
  provider IDs, a cache window, and call/concurrency/timeout/cost limits.
- Only fixture providers are allowed. Live providers remain disabled pending
  OpenSpec task 7.8 and a separate configuration review.
- Ignored projects are filtered against `automation-registry.json` before
  selection. A caller must name an ignored project through the explicit
  `--reactivate` option for that one manual run.
- Recurring schedule intent is disabled. Designated-host, host-verification,
  and approved-canary evidence are all required even after intent is enabled.

## Manual fixture canary

The command prefers a built package and otherwise executes the tracked package
source through Node's local TypeScript transformer. It never installs a package
or contacts a provider.

```bash
node foundry/ops/scripts/ai-visibility-canary.mjs \
  --project pace \
  --fixture foundry/ops/test/fixtures/ai-visibility/providers-v1.json
```

Use `--db` and `--cache` to point a rehearsal at temporary local files. The
default private files live under the Fleet Ops application-support directory,
outside Git.

The receipt reports configured/completed/cached/unavailable calls, normalized
visibility, recommendation, rank, citations, competitor share, coverage,
freshness, observed cost, and comparison with the previous local run.

## Persistence and privacy

The ledger stores normalized aggregates, status-only attempt receipts, cost
receipts, citation hosts, and evidence pointers. It does not store response
text, provider request IDs, arbitrary provider errors, credentials, prompts, or
raw telemetry. The local cache strips response text and retains only normalized
analysis needed for a zero-call cache hit.

Visibility and citation findings create evidence-backed recommendations only.
They do not create missions, tasks, drafts, publications, or schedules. An
owner must review and accept a recommendation before the existing
recommendation-to-mission handoff can draft work.

## Remaining task 7.8 gate

Do not add a live provider adapter or recurring cadence yet. Task 7.8 requires
one separately approved local project canary followed by a human review of data
quality, retained storage, and observed cost. Schedule activation remains a
later guarded decision even if that review passes.
