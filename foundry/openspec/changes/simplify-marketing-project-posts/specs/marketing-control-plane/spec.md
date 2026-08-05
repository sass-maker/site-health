## MODIFIED Requirements

### Requirement: End-to-end stage visibility

The Marketing page SHALL show maintained public projects and their bounded normalized post receipts. Pipeline-stage diagnostics, queue pressure, measured outcomes, blockers, and recommendations SHALL remain available to their authoritative services or deeper evidence surfaces rather than appearing in the primary Marketing ledger.

#### Scenario: Inspect a project

- **WHEN** the operator opens or filters `/marketing`
- **THEN** the matching project shows its post receipts newest-first and an explicit empty state when none exist

#### Scenario: Post receipt contains private provider data

- **WHEN** a normalized receipt contains provider-private or error payload fields
- **THEN** the Marketing projection exposes only the allowlisted post summary fields required by the project ledger
