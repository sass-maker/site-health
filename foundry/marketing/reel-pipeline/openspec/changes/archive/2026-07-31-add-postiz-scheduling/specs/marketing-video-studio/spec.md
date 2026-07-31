## MODIFIED Requirements

### Requirement: Evidence-gated Postiz draft handoff
Marketing Studio SHALL prepare and submit Postiz drafts or future scheduled
posts only from compatible artifacts with explicit source, rights, creative
approval, quality, brand, channel, destination, and stable public-media
evidence.

#### Scenario: Handoff is prepared
- **WHEN** an artifact has the required content and media evidence
- **THEN** the system writes or returns a proposed content package, media receipt, and distribution request without making a Postiz network call

#### Scenario: Stable public media is missing
- **WHEN** an approved local artifact has no stable public HTTPS media URL
- **THEN** Postiz draft or scheduled submission fails before any network request and reports that artifact publication is required

#### Scenario: Draft submission is explicitly approved
- **WHEN** an operator-approved distribution request passes exact Postiz account mapping and media preflight without a schedule
- **THEN** the system creates an unscheduled Postiz draft and records the sanitized receipt

#### Scenario: Scheduled submission is explicitly approved
- **WHEN** an operator-approved distribution request passes exact Postiz account mapping and media preflight with a future ISO timestamp
- **THEN** the system creates a Postiz scheduled post for that exact timestamp and records the sanitized scheduled receipt

#### Scenario: Schedule is invalid or in the past
- **WHEN** an operator supplies an invalid or non-future schedule
- **THEN** the system rejects the submission before media upload or any Postiz network request

## ADDED Requirements

### Requirement: Postiz owns the publication lifecycle
Marketing Studio SHALL allow an operator to create a Postiz draft or future
schedule, but SHALL NOT publish immediately or connect directly to YouTube or
Instagram. Postiz SHALL remain the owner of credentials, calendar execution,
provider publication state, rescheduling, cancellation, and analytics.

#### Scenario: Operator chooses a schedule
- **WHEN** the operator selects a local future date and time in Distribute
- **THEN** Marketing Studio shows the device timezone, converts the selection to an absolute UTC ISO timestamp, and asks Postiz to schedule it

#### Scenario: Scheduled request is accepted
- **WHEN** Postiz returns a scheduled receipt
- **THEN** Marketing Studio records and displays the scheduled time and does not claim that provider publication has already occurred

#### Scenario: Operator chooses an unscheduled draft
- **WHEN** the operator creates a Postiz draft without selecting a schedule
- **THEN** Marketing Studio records the draft receipt and exposes an Open Postiz continuation action

#### Scenario: Immediate publication is requested
- **WHEN** a caller attempts to request immediate publication
- **THEN** Marketing Studio rejects the request before any network call

#### Scenario: Production already has a Postiz receipt
- **WHEN** an operator or caller tries to submit a production that already has a draft or scheduled Postiz receipt
- **THEN** Marketing Studio rejects the duplicate before any network call and directs lifecycle changes to Postiz

## REMOVED Requirements

### Requirement: Postiz remains the scheduling surface
**Reason**: The draft-only handoff contradicts the operator requirement to
schedule YouTube and Instagram posts from the unified Marketing Studio UI.

**Migration**: Use the new evidence-gated scheduled submission. Postiz still
owns the durable calendar, credentials, publication lifecycle, and analytics.
