## ADDED Requirements

### Requirement: Migrated relational storage attribution
The Fleet cost-surface inventory SHALL attribute a project's relational persistence to D1 after verified cutover and SHALL preserve pre-cutover or rollback-held Turso resources as separate evidence until retirement.

#### Scenario: D1 binding is configured before cutover
- **WHEN** a project declares a D1 binding while Turso remains authoritative
- **THEN** the inventory reports both configured surfaces and does not infer that Turso is retired or that D1 has production usage

#### Scenario: D1 cutover is recorded
- **WHEN** project and Fleet status record D1 as authoritative
- **THEN** spend governance treats D1 as the active relational surface and labels any retained Turso database as rollback-held rather than active production persistence

