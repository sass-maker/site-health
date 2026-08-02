# database-cutover-safety Specification

## Purpose

Define a repeatable, auditable cutover and rollback process that moves each project's relational data without an unverified fleet-wide migration or silent data loss.

## Requirements

### Requirement: Independent project cutovers
The migration MUST cut over one project at a time and MUST NOT make the remaining projects depend on the success of the current project.

#### Scenario: Canary project fails acceptance
- **WHEN** a project fails migration verification or post-cutover acceptance
- **THEN** that project rolls back or remains on Turso while every other project remains unchanged

### Requirement: Deterministic schema and transfer artifacts
Each project MUST have version-controlled D1 schema migrations and a repeatable transfer procedure that preserves identifiers, relationships, nullability, uniqueness, timestamps, and required indexes.

#### Scenario: Empty D1 database is prepared
- **WHEN** the project's migrations are applied to an empty local D1 database
- **THEN** the resulting schema matches the accepted production schema contract without requiring application startup side effects

#### Scenario: Source data is imported
- **WHEN** a sanitized or production-approved Turso export is transferred into the prepared D1 database
- **THEN** the import is deterministic, restartable or safely repeatable, and reports failures without silently skipping records

### Requirement: Verification gate before traffic switch
No project SHALL switch production traffic to D1 until its schema, data, and representative behavior checks pass and a migration receipt records the evidence.

#### Scenario: Data parity is complete
- **WHEN** schema objects, table row counts, critical aggregates, relationship integrity, and representative user-owned records match the approved source snapshot
- **THEN** the project becomes eligible for an explicitly approved production cutover

#### Scenario: Verification differs
- **WHEN** any required parity check differs outside a documented acceptable transformation
- **THEN** the cutover stops, production remains on Turso, and the discrepancy is reported

### Requirement: Bounded write handoff
The final cutover MUST prevent acknowledged writes from being stranded in Turso after the final source snapshot and before the D1 traffic switch.

#### Scenario: Final snapshot begins
- **WHEN** the final production export starts
- **THEN** the project enters a documented bounded write freeze or another proven write-handoff mechanism until D1 becomes authoritative

#### Scenario: Cutover cannot complete
- **WHEN** the D1 import, verification, or deployment fails during the write handoff
- **THEN** the project restores Turso write authority and reports whether any request needs reconciliation

### Requirement: Rollback and retirement are separate decisions
Each project MUST retain a tested rollback path and MUST keep its Turso source unchanged for a bounded observation window after D1 cutover; Turso retirement requires separate explicit approval.

#### Scenario: Acceptance fails during observation
- **WHEN** critical reads, writes, auth behavior, scheduled work, or integrity checks fail during the observation window
- **THEN** the project can restore the Turso-backed release using the documented rollback procedure

#### Scenario: Observation succeeds
- **WHEN** the observation window and acceptance checks complete successfully
- **THEN** Turso credentials and database resources remain untouched until their separate retirement task is approved
