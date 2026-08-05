## MODIFIED Requirements

### Requirement: Marketing is a maintained-product coverage directory

Marketing SHALL list every maintained public project and its bounded normalized post receipts. It SHALL NOT show traffic, positioning, recommendation counts, or a derived marketing-coverage state on the primary Marketing page. Missing receipt evidence SHALL NOT be inferred from configuration, a draft, a fixture, or a public domain.

#### Scenario: Project has post receipts

- **WHEN** a maintained public project has one or more normalized post receipts
- **THEN** Marketing shows those receipts newest-first beneath that project with their title or stable identifier, platform or provider, state, and observation time

#### Scenario: Project has no post receipts

- **WHEN** no normalized post receipt exists for a maintained public project
- **THEN** Marketing shows the project and an explicit No posts yet state without inventing coverage or distribution evidence

#### Scenario: Marketing page remains focused

- **WHEN** the operator opens `/marketing`
- **THEN** the project ledger omits views, visits, positioning, recommendation, coverage, and analytics-refresh controls
