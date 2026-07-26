## ADDED Requirements

### Requirement: Weekly operator-controlled observation

Fleet SHALL define one weekly Cloudflare and Turso spend observation job that
remains disabled until the operator explicitly activates it.

#### Scenario: Fleet cron is installed before spend monitoring is approved

- **WHEN** the checked-in Fleet cron block is installed while the spend job is disabled
- **THEN** no recurring spend audit is scheduled

### Requirement: Sanitized private spend history

The spend guard SHALL record only validated aggregate provider state in an
idempotent append-only machine-local ledger and SHALL regenerate a latest JSON
snapshot and a human-readable latest report from the accepted snapshot.

#### Scenario: A run is recorded twice

- **WHEN** the recorder receives the same run identifier more than once
- **THEN** exactly one ledger entry exists and the latest projections remain deterministic

#### Scenario: Input contains a secret-shaped field

- **WHEN** a snapshot contains tokens, credentials, raw SQL, database URLs, or raw provider payload fields
- **THEN** the recorder rejects the snapshot without updating the ledger or latest projections

### Requirement: Material alert policy

The recorder SHALL classify a snapshot as `critical` when a known quota is at
least 95% used, `warning` when a known quota is at least 85% used, a cost
becomes newly positive, or consequential provider evidence is unavailable, and
`ok` otherwise.

#### Scenario: Routine usage remains below the warning threshold

- **WHEN** provider evidence is available, no cost becomes newly positive, and every known quota is below 85%
- **THEN** the snapshot is recorded without an owner alert

#### Scenario: Quota pressure is material

- **WHEN** a known provider quota reaches 95% usage
- **THEN** the result is critical and identifies the provider and quota dimension

### Requirement: Provider-specific evidence honesty

The recurring report SHALL preserve each provider's own billing or reset period
and SHALL keep unavailable monetary evidence `unknown`.

#### Scenario: Cloudflare billing is unavailable but Turso usage is known

- **WHEN** Cloudflare billing access fails and Turso plan and quota evidence are available
- **THEN** the report records the Turso result and retains Cloudflare monetary state as unknown

### Requirement: Read-only execution

The recurring spend guard SHALL NOT mutate provider resources, plans,
credentials, production configuration, databases, schemas, indexes, or
application data.

#### Scenario: An optimization opportunity is detected

- **WHEN** a recurring run identifies avoidable usage
- **THEN** it records a recommendation and performs no remediation
