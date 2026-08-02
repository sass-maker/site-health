## ADDED Requirements

### Requirement: Persistence dependency records follow verified cutover state
Fleet and project dependency records SHALL continue to identify Turso as active until a project's verified D1 cutover completes, and SHALL identify D1 as authoritative only after that cutover.

#### Scenario: Project is prepared but not cut over
- **WHEN** D1 code, migrations, or bindings exist but production still reads or writes Turso
- **THEN** durable status and registry records continue to list Turso as an active dependency and may label D1 as migration-pending

#### Scenario: Project completes D1 cutover
- **WHEN** production acceptance confirms D1 as authoritative
- **THEN** the project's status and Fleet registry are updated together to identify the D1 database and remove Turso from current dependency truth

