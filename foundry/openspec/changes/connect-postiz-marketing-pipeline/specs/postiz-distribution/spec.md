## ADDED Requirements

### Requirement: Explicit Postiz account mapping
Every enabled brand and channel SHALL map to one explicit Postiz integration and the system SHALL fail closed when the mapping is absent, disabled, duplicated, or belongs to a different provider.

#### Scenario: Brand channel is unmapped
- **WHEN** Fleet prepares a package for an unmapped brand and channel
- **THEN** no media upload or post create request is sent and a configuration blocker is returned

### Requirement: Draft-first review
Fleet SHALL create completed marketing packages as Postiz drafts by default and SHALL NOT promote a draft to scheduled or immediate publication without an explicit owner action in Postiz.

#### Scenario: Render completes
- **WHEN** an approved Fleet content package and media receipt are ready for distribution
- **THEN** the adapter creates a Postiz draft and records its normalized receipt without scheduling or publishing it

### Requirement: Stable media handoff
The adapter SHALL upload media from a stable public HTTPS artifact URL, SHALL reject private or expiring local-only locations, and SHALL include the resulting Postiz media id and path in the provider-specific post payload.

#### Scenario: Only a local artifact exists
- **WHEN** a package has no stable public media URL
- **THEN** the adapter fails before creating a Postiz post and reports that artifact publication is required

### Requirement: Provider-specific payloads
The adapter SHALL translate each supported channel into its documented Postiz settings without reusing an undifferentiated payload across Instagram Reels and YouTube Shorts.

#### Scenario: YouTube Short draft is created
- **WHEN** a YouTube variant is handed to Postiz
- **THEN** the payload contains the mapped integration, uploaded video, title, description, and explicit YouTube visibility settings

### Requirement: Ambiguous failure reconciliation
The adapter SHALL NOT blindly retry a create request after an ambiguous network or server failure and SHALL require reconciliation against Postiz before another create attempt.

#### Scenario: Connection ends during create
- **WHEN** Postiz may have accepted a create request but no definitive response arrives
- **THEN** Fleet records an indeterminate receipt and does not automatically issue the same create again

### Requirement: Sanitized receipts and analytics
Fleet SHALL retain package-attributed Postiz draft, schedule, publication, and analytics receipts while excluding credentials, social tokens, unpublished body content, and private integration identifiers from public snapshots.

#### Scenario: Marketing dashboard refreshes
- **WHEN** Postiz has publication and analytics data for a package
- **THEN** the public Fleet view receives only aggregate stage and outcome data with freshness and attribution
