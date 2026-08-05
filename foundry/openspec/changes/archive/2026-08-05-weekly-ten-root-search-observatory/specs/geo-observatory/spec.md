## MODIFIED Requirements

### Requirement: Scheduled execution

The protocol SHALL run on a weekly schedule through the designated operations host's versioned agent runner. The scheduled query scope SHALL be exactly the active ten-root search query contract, while a fresh clone remains inert until explicit host activation. The recorder SHALL accept one complete same-date contracted batch or leave the ledger unchanged.

#### Scenario: Complete weekly root run succeeds

- **GIVEN** the ten-root contract contains four active intent queries for each canonical root
- **WHEN** the weekly observatory routine records a run
- **THEN** the submitted batch contains exactly those 40 product/query/text tuples on one date
- **AND** the recorder appends the complete batch before regenerating the report

#### Scenario: Scheduled run is incomplete or inconsistent

- **GIVEN** the weekly root observatory routine has started
- **WHEN** a contracted query is missing, duplicated, extra, historical, text-rewritten, or dated differently from the rest
- **THEN** the recorder exits non-zero with a precise validation error
- **AND** the observation ledger remains unchanged

#### Scenario: scheduled run fails before completion

- **GIVEN** the weekly observatory routine starts
- **WHEN** any contracted query fails before the run can be recorded atomically
- **THEN** the routine reports the failure and leaves the observation ledger unchanged

#### Scenario: Legacy observatory history is read

- **GIVEN** the ledger contains prior broad-project and superseded-query observations
- **WHEN** a focused weekly root batch is validated or the report is regenerated
- **THEN** the prior records remain readable and unchanged
- **AND** they are not required in the new weekly submission
