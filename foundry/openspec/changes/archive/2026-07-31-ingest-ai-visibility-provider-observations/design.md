## Context

`@saas-maker/ai-visibility` already accepts provider adapters and the Founder
Control adapter already records normalized attempts, aggregates, cost receipts,
and history. Fleet intentionally exposes only fixture adapters because the
portfolio registry disables direct live providers. Consequently, provider
answers gathered through an approved external client cannot enter the same
history without being mislabeled as fixtures.

## Goals / Non-Goals

**Goals:**

- Ingest explicit provider output without reading credentials or contacting a
  provider.
- Fail closed when bundle identity, prompts, provenance, timestamps, status, or
  all-27 coverage is invalid.
- Record normalized evidence with a distinct `provider-observation` mode while
  retaining no raw answers in the ledger or cache.
- Reuse the current analyzer, aggregation, budgets, project registry, and
  private storage boundary.

**Non-Goals:**

- Add provider SDKs, API clients, credentials, or direct live execution.
- Enable a recurring schedule or change provider policy in
  `marketing-program.json`.
- Verify cryptographically that a provider issued an answer.
- Manufacture missing answers, costs, scores, or history.

## Decisions

### Use a versioned offline bundle

The local command accepts `fleet.ai-visibility-provider-observations.v1`.
Each run names a canonical project and prompt set. Each provider declares an
id and model, and each observation names an exact expanded prompt id plus
capture time, provider request id, status, and explicit response/cost fields.

This is preferable to adding an API-key-aware adapter because credentials,
provider SDK churn, and production configuration remain outside Fleet. It is
preferable to relabeling the fixture schema because fixture output and
provider-backed evidence remain visibly different.

### Adapt observations through the existing engine

Validated observations become in-memory provider adapters. The adapter performs
no I/O: it returns the captured answer for the exact canonical prompt or raises
the existing bounded unavailable/failed errors. The current engine therefore
continues to own analysis, call ceilings, coverage, aggregation, cache
sanitization, and cost receipts.

### Treat provenance as explicit evidence, not proof

Completed observations require an ISO timestamp and provider request id. The
command validates shape and consistency but does not claim cryptographic
attestation. The normalized ledger stores only a provenance summary; raw
answers remain in the operator-owned input file and memory for the duration of
the command.

### Support partial runs and an explicit all-27 gate

Single-project canaries remain useful and cheap. `--require-all` rejects bundles
unless their project ids exactly match the 27 eligible registry projects. It
does not fill missing projects or prompts.

## Risks / Trade-offs

- [An operator can supply inaccurate provenance] -> Label evidence as
  `provider-observation`, document that it is operator-supplied, and never call
  it direct live execution.
- [Raw answers exist in an input file] -> Do not write or copy the bundle;
  document secure temporary-file handling and prove the ledger/cache omit text.
- [Provider ids are not in the live allowlist] -> Observation ingestion does
  not execute providers; direct provider execution remains guarded by the
  existing policy.
- [A partial bundle could look portfolio-complete] -> Return explicit project
  coverage and provide `--require-all` for the canonical-27 acceptance gate.

## Migration Plan

This is additive. Existing fixture commands, events, projections, and schedule
gates remain unchanged. Removing the new command and adapter restores the
previous behavior without a data migration.

## Open Questions

- Which provider capture clients should later emit this bundle format?
- Whether request ids should gain provider-specific format validation after a
  first real canary establishes stable formats.
