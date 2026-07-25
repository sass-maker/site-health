## ADDED Requirements

### Requirement: Private content exclusion
Automation MUST NOT persist email bodies, subjects, addresses, attachments,
search queries, motion/speech samples, screenshots, credentials or device
identifiers in fleet reports.

#### Scenario: Email sync fails
- **WHEN** failure evidence is recorded
- **THEN** it contains only sanitized provider/error class, stage, time and
  aggregate cursor/count metadata

### Requirement: Email synchronization lifecycle
Email Manager sync MUST expose bounded work, stable cursor/watermark,
concurrency, idempotency/deduplication, timeout, retry maximum, freshness and
durable unresolved failure.

#### Scenario: Sync retry repeats a page
- **WHEN** the same provider page is retried
- **THEN** no duplicate durable email/index record is created

### Requirement: Auth-safe Email health
Health verification MUST prove authenticated integration readiness without
printing tokens or retrieving/storing message content in evidence.

#### Scenario: Authentication expires
- **WHEN** the provider rejects the configured session
- **THEN** the report records an auth blocker and performs no credential change

### Requirement: Truthful Motion runtime state
Motion MUST distinguish source/build, simulator, signing, physical-device and
deployment evidence and SHALL represent intentional undeployed state explicitly.

#### Scenario: Build passes without deployment
- **WHEN** local checks succeed and no production target is approved
- **THEN** Motion is build-ready and intentionally undeployed, not live

### Requirement: Human-controlled sensitive actions
Automation MUST NOT sign devices, enroll accounts, rotate OAuth, create a Motion
backend, migrate private data or deploy production without approval.

#### Scenario: Missing signing profile
- **WHEN** device validation needs signing authority
- **THEN** Foundry records a concise external blocker
