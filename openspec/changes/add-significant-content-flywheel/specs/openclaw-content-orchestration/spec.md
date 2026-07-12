## ADDED Requirements

### Requirement: Command-driven orchestration
The system SHALL provide OpenClaw with documented commands for package creation, validation, export, Reel Pipeline import, status, receipt export, receipt application, and performance reporting.

#### Scenario: Run the offline loop
- **WHEN** OpenClaw follows the runbook against fixtures
- **THEN** it completes export, import, receipt creation, and receipt application without editing source code directly

### Requirement: Safe retries
Every OpenClaw-facing state transition command SHALL be idempotent or fail closed with an actionable conflict.

#### Scenario: Resume after interruption
- **WHEN** OpenClaw repeats the last completed command after losing session state
- **THEN** the repositories remain consistent and no duplicate idea, receipt, or platform assignment is created

### Requirement: Bounded authority
The OpenClaw workflow SHALL NOT expose commands that change credentials, production configuration, deployment state, marketing acceptance, or public posting without the existing explicit gates.

#### Scenario: Reach the posting boundary
- **WHEN** an imported reel is rendered and ready
- **THEN** OpenClaw reports the existing review/acceptance requirement instead of posting through an alternate path

### Requirement: Observable status
Both repositories SHALL expose machine-readable status showing package state, exported/imported variants, missing receipts, conflicts, and the next valid action.

#### Scenario: Inspect a partially completed cycle
- **WHEN** OpenClaw asks for status after a render but before upload
- **THEN** the response identifies the rendered variant, missing upload receipt, and valid next command

### Requirement: Scheduling is separately authorized
The initial implementation SHALL document a single bounded OpenClaw cycle but SHALL NOT create or modify a cron, heartbeat, gateway, or agent configuration.

#### Scenario: Finish offline verification
- **WHEN** the cross-repo fixture loop passes
- **THEN** scheduling remains an explicit follow-up requiring cadence, model, authority, and failure-policy approval
