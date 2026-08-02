## ADDED Requirements

### Requirement: Core AI awareness is measurement-first

AI Awareness SHALL show the latest bounded provider-labelled Codex and Claude
observation for every maintained P1 product, including mention, recommendation,
citation, coverage, provider, and time evidence, without a row-level action.

#### Scenario: Core product has no provider evidence
- **WHEN** provider evidence is absent
- **THEN** the row reports Not measured
- **AND** does not invent an awareness result or a manual data-gathering task

### Requirement: Domain strength remains measured evidence

Every measured root domain SHALL expose the latest D-Rank, dated trend evidence,
associated active projects, and last observation without a change/action column.

#### Scenario: Domain action is still external
- **WHEN** D-Rank is low and Fleet has no new backlink observation
- **THEN** the row continues to show the measured score and history
- **AND** the explicit Re-run control remains the measurement boundary
