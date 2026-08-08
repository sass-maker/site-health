## MODIFIED Requirements

### Requirement: Fleet Workspace is the canonical shared infrastructure repository
The `sass-maker/fleet-workspace` repository SHALL remain the authoritative
version-controlled home for private Fleet operations, skills, schedules,
registries, host tooling, the marketing pipeline, Reel Pipeline, Drank, PSI
Swarm, and Mobile Dev Cockpit. It MAY depend on the explicitly bounded public
`sass-maker/workflows` automation module for credential-free workflows and
sanitized public evidence, pinned as a git submodule at
`foundry/ops/workflows`.

#### Scenario: Agent changes shared infrastructure
- **WHEN** an agent changes a private Fleet script, skill, schedule, registry, marketing pipeline, Drank, PSI Swarm, Reel Pipeline, or Mobile Dev Cockpit source
- **THEN** the canonical edit occurs in Fleet Workspace rather than the public automation module

#### Scenario: Agent changes standalone public automation
- **WHEN** an agent changes credential-free automation that owns only allowlisted public inputs and outputs
- **THEN** the canonical edit occurs in `sass-maker/workflows` and Fleet Workspace adopts an exact verified submodule commit

#### Scenario: Public automation requires private context
- **WHEN** a proposed public workflow requires private source, registries, credentials, machine state, or unpublished operational data
- **THEN** the workflow remains private and the public module receives no access to that context
