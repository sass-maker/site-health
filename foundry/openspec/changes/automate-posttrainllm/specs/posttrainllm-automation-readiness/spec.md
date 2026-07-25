## ADDED Requirements

### Requirement: Private model work remains local
Automation MUST NOT upload private datasets, prompts, checkpoints, adapters,
model outputs, API keys, or local training files to Foundry telemetry.

#### Scenario: Training workflow completes
- **WHEN** a local completion receipt is produced
- **THEN** it contains only approved aggregate configuration/outcome/provenance
  fields and no private payload

### Requirement: Public surface contract
The landing and playground SHALL expose build/live/indexing, source revision,
primary download/run intent, and client failure evidence appropriate to their
runtime.

#### Scenario: Playground bundle fails
- **WHEN** the static landing is healthy but the playground cannot initialize
- **THEN** playground activation fails independently

### Requirement: Reproducible evaluation evidence
Any automated benchmark or quality claim MUST identify source revision, model,
configuration, dataset/version, time, result and artifact location or retention
status.

#### Scenario: Evidence inputs are missing
- **WHEN** a result lacks required provenance
- **THEN** it cannot update a public quality claim

### Requirement: Scheduled and artifact freshness
Scheduled data/feed/model metadata jobs and release artifacts MUST expose bounds,
freshness, failure, retry, ownership and unresolved state.

#### Scenario: Feed is stale
- **WHEN** the expected refresh window passes without success
- **THEN** Foundry reports the affected surface stale

### Requirement: Manual publication authority
Automation MAY prepare local artifacts, reports and PRs but MUST NOT publish a
model, release, benchmark claim or production deploy without approval.

#### Scenario: Candidate artifact passes
- **WHEN** validation succeeds
- **THEN** the receipt records readiness and pending publication approval
