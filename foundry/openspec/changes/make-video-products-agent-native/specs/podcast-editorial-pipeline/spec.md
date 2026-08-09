## ADDED Requirements

### Requirement: Mashup exposes resumable editorial stages to agents
Mashup SHALL expose source inspection, ingestion, candidate discovery,
transcription, enrichment, planning, scoring, approval inspection, contract
export, render validation, rendering, and receipt inspection through a
non-interactive JSON interface while retaining its resumable stage identities.

#### Scenario: Agent resumes expensive work
- **WHEN** an agent repeats an operation with unchanged sources, models, recipe, and idempotency identity
- **THEN** Mashup reports reused stages and continues without recomputing valid persisted work

#### Scenario: Approval is missing
- **WHEN** an agent requests rendering for an unapproved editorial document
- **THEN** Mashup returns a stable approval-required result without producing media

### Requirement: Mashup progress and failures are machine-readable
Long-running Mashup operations SHALL expose current stage, completed stages,
reused stages, blockers, retryability, and produced artifacts without requiring
an agent to parse prose logs.

#### Scenario: A stage fails
- **WHEN** transcription, enrichment, planning, or rendering fails
- **THEN** the operation result identifies the failed stage, stable error code, retryability, retained state, and safe next action
