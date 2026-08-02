## Purpose

Defines the minimal change, wait, and measure lifecycle used when Fleet owns a
remediation but the final outcome is controlled by an external system.

## ADDED Requirements

### Requirement: Outcome views remain measurement surfaces

The Console SHALL show measured outcomes and their observation boundary without
adding a row-level change or action ledger.

#### Scenario: Automatic work completed
- **WHEN** Fleet completes every allowed automatic input change
- **THEN** the completed work is retained only in the bounded run receipt
- **AND** the outcome table continues to show provider evidence and its last
  observation date

#### Scenario: Evidence is due
- **WHEN** the waiting period has elapsed
- **THEN** the existing update control can refresh the provider measurement
- **AND** no manual task must be cleared from the outcome table

### Requirement: Missing evidence is not an outcome

The system MUST attempt its configured measurement before presenting an
outcome as unknown, and MUST expose a bounded failure when the measurement
cannot run.

#### Scenario: Provider access is available
- **WHEN** a supported provider-backed outcome has no current evidence
- **THEN** the portfolio update measures it rather than recommending that the
  operator gather data manually
