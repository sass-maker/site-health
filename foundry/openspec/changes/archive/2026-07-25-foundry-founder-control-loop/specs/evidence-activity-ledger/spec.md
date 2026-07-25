## ADDED Requirements

### Requirement: Typed append-only events

Foundry SHALL record mission, work, evidence, decision, deliverable, and outcome
changes as immutable typed events.

#### Scenario: Correct an event-derived state

- **WHEN** a prior event is found to be wrong
- **THEN** Foundry appends a correction or superseding event and preserves the
  original event in the audit history

### Requirement: Idempotent evidence ingestion

Every event and provider receipt SHALL carry an idempotency key sufficient to
reject duplicate ingestion.

#### Scenario: Provider receipt is retried

- **WHEN** the same provider receipt is delivered more than once
- **THEN** exactly one event affects current projections and the duplicate is
  reported without creating another activity item

### Requirement: Provider-owned evidence pointers

Foundry SHALL normalize safe evidence metadata while leaving raw provider data
with its authoritative owner.

#### Scenario: GitHub workflow evidence is attached

- **WHEN** a mission references a GitHub Actions run
- **THEN** the receipt stores its repository, run identifier, conclusion,
  observed time, and URL without copying logs into the ledger

#### Scenario: App Health finding is attached

- **WHEN** a mission references an App Health finding
- **THEN** the receipt stores a safe aggregate summary and link without copying
  request parameters, traces, or private payloads

### Requirement: Rebuildable projections

Mission, decision, activity, project, and home views SHALL be reproducible from
the append-only ledger and versioned projection rules.

#### Scenario: Projection tables are recreated

- **WHEN** derived projection state is deleted in a test or recovery workflow
- **THEN** replaying valid events reconstructs equivalent current state

### Requirement: Private-by-default event visibility

Events SHALL default to private and SHALL require an explicit aggregate-safe
classification before contributing to public output.

#### Scenario: Event contains unpublished marketing work

- **WHEN** an event references draft copy, private feedback, or an owner note
- **THEN** no event payload is exposed through the public SaaS Maker projection

### Requirement: Honest freshness and confidence

Every external evidence receipt SHALL include observation time, freshness
expectation, and confidence or verification state.

#### Scenario: Evidence is stale

- **WHEN** evidence exceeds its configured freshness window
- **THEN** projections show it as stale and do not present the previous state as
  current proof
