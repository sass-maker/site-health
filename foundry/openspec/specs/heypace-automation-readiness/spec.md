# heypace-automation-readiness Specification

## Purpose
TBD - created by archiving change automate-heypace. Update Purpose after archive.
## Requirements
### Requirement: Private context remains local
HeyPace MUST NOT export raw audio, transcripts, screenshots, screen context,
local actions, or signing credentials into fleet analytics, logs, or reports.

#### Scenario: Local action succeeds
- **WHEN** activation evidence is recorded
- **THEN** it records only a sanitized outcome/version/time signal

### Requirement: Layered Apple build evidence
Automation MUST distinguish compilation/tests, simulator evidence, signing
readiness, physical-device validation, and distribution status.

#### Scenario: Simulator passes but device is unavailable
- **WHEN** build and simulator checks pass without physical-device evidence
- **THEN** device validation remains blocked rather than inherited as pass

### Requirement: Landing and acquisition evidence
The canonical landing surface SHALL expose build/live/indexing and primary
download or release-interest evidence tied to a source revision.

#### Scenario: Landing route fails
- **WHEN** the canonical route is non-successful
- **THEN** the product health report records a public-surface failure

### Requirement: Crash and release visibility
The app SHALL have a privacy-safe failure/release evidence path sufficient to
identify app version, platform/build and aggregate failure class without user
content.

#### Scenario: Release regression is observed
- **WHEN** a version produces a verified crash/failure signal
- **THEN** Foundry can associate it with the release and prepare a bounded task

### Requirement: Human-controlled distribution
Automation MAY prepare release evidence or a PR but MUST NOT sign, enroll a
device, publish to TestFlight/App Store, or deploy production without approval.

#### Scenario: Release checks pass
- **WHEN** all automatable checks are green
- **THEN** the final receipt requests distribution approval and performs no
  publication

