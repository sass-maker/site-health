## ADDED Requirements

### Requirement: Complete attention-scoped inventory
The automation registry SHALL represent every named fleet entry exactly once
and SHALL mark My Work, Toolbox, and Foundry + Helpers as in scope while marking
Ignored and Removed entries as excluded from routine automation.

#### Scenario: Ignored project is encountered
- **WHEN** an audit encounters an entry classified as Ignored
- **THEN** it records the classification without scheduling checks, marketing,
  maintenance, or remediation work

#### Scenario: In-scope entry is missing
- **WHEN** one of the 25 agreed in-scope entries has no automation registry row
- **THEN** validation fails and names the missing entry

### Requirement: Required automation metadata
Every in-scope registry row MUST identify its canonical project/family, attention
class, runtime types, repository or owning system, public and private surfaces,
dependencies, evidence sources, minimum contracts, action policy, notification
policy, and accepted exceptions.

#### Scenario: Background job lacks an evidence source
- **WHEN** a registered background-job runtime declares no lifecycle evidence
  source and no accepted exception
- **THEN** the coverage audit reports a blocking gap

### Requirement: Canonical identity and ownership
Registry validation MUST reject duplicate canonical identities, conflicting
domain ownership, unknown parent families, and helper surfaces without a named
owning workstream.

#### Scenario: Foundry helper is standalone in attention reporting
- **WHEN** a helper such as PSI Swarm or Drank has no Foundry parent ownership
- **THEN** validation fails and requires assignment to Foundry + Helpers

### Requirement: Evidence freshness and status
Each required contract SHALL resolve to pass, fail, stale, blocked,
accepted-exception, or not-applicable with an observation time, freshness
window, concise evidence reference, and next action.

#### Scenario: Last successful probe is too old
- **WHEN** evidence is older than its declared freshness window
- **THEN** the contract is stale rather than pass

### Requirement: Deterministic coverage report
One versioned command SHALL validate the registry and generate machine-readable
and human-readable coverage reports without changing production state or
printing secrets.

#### Scenario: Coverage audit completes
- **WHEN** the command evaluates all in-scope entries
- **THEN** both reports contain matching totals and every required contract has
  an explicit status

### Requirement: Closure classification
The closure report MUST classify every remaining non-pass result as a fixed
gap, accepted exception, external blocker, or deferred non-critical
enhancement.

#### Scenario: Provider credentials are unavailable
- **WHEN** a required read-only provider cannot be queried because external
  authentication is not configured
- **THEN** the report records an external blocker and does not claim the
  contract is passing
