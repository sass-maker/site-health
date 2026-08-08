## MODIFIED Requirements

### Requirement: Explicit execution confirmation
Marketing Studio SHALL NOT execute a render solely because a conversation or ordinary brief was created. A render SHALL require either an explicit operator execution action or an enabled standing automation policy whose scope, source, recipe, spend, quality, and distribution bounds cover the brief.

#### Scenario: Brief creation completes
- **WHEN** a new operator-request brief has all required inputs but no standing automation policy applies
- **THEN** its lifecycle remains planned until the operator chooses its named creation or continuation action

#### Scenario: Policy-owned brief is ready
- **WHEN** project or personal automation creates a brief covered by its enabled standing policy
- **THEN** the policy acts as execution authority and the brief may advance without a per-item Build click

#### Scenario: Policy does not cover selected execution
- **WHEN** an automated brief would exceed its policy spend, recipe, rights, or runtime bounds
- **THEN** execution remains blocked and requires a policy change or explicit operator action

### Requirement: Evidence-gated Postiz draft handoff
Marketing Studio SHALL prepare and submit Postiz drafts or future scheduled posts only from compatible artifacts with explicit source, rights, creative authority, quality, brand, channel, destination, stable public-media evidence, and either per-item approval or a matching standing automation policy.

#### Scenario: Handoff is prepared
- **WHEN** an artifact has the required content and media evidence
- **THEN** the system writes or returns a proposed content package, media receipt, and distribution request without making a Postiz network call

#### Scenario: Stable public media is missing
- **WHEN** an approved local artifact has no stable public HTTPS media URL
- **THEN** Postiz draft or scheduled submission fails before any network request and reports that artifact publication is required

#### Scenario: Draft submission is explicitly approved
- **WHEN** a per-item approval or matching draft policy passes exact Postiz account mapping and media preflight without a schedule
- **THEN** the system creates an unscheduled Postiz draft and records the sanitized receipt

#### Scenario: Scheduled submission is explicitly approved
- **WHEN** a per-item approval or matching schedule policy passes exact Postiz account mapping and media preflight with a future ISO timestamp
- **THEN** the system creates a Postiz scheduled post for that exact timestamp and records the sanitized scheduled receipt

#### Scenario: Schedule is invalid or in the past
- **WHEN** a caller or policy derives an invalid or non-future schedule
- **THEN** the system rejects the submission before media upload or any Postiz network request
