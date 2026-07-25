## MODIFIED Requirements

### Requirement: Review-debt backpressure

The Fleet source-package generator SHALL inspect aggregate Postiz draft state before generating new work and SHALL fail closed when state is unavailable or unreviewed draft debt exceeds configured limits.

#### Scenario: Review queue is above the ceiling

- **WHEN** unreviewed Postiz drafts exceed the global or per-focus-project ceiling
- **THEN** no new content package is created and one review action is reported

#### Scenario: A focus project needs an experiment

- **WHEN** review debt is below the ceiling and a configured focus project has no recent active experiment
- **THEN** the generator may create a bounded source-backed package for that project

### Requirement: Public snapshot is aggregate-only

The public Fleet dashboard SHALL expose only sanitized aggregate marketing state.

#### Scenario: Build a marketing snapshot

- **WHEN** the authenticated local command reads Fleet package receipts and Postiz outcomes
- **THEN** its public output contains counts, stages, freshness, failures, and next actions but no post content, API keys, integration ids, notes, or private media URLs

#### Scenario: Postiz API is unavailable

- **WHEN** a refresh fails
- **THEN** the last good snapshot remains readable and is visibly marked stale with the failed refresh time

### Requirement: Operator approval remains authoritative

The control plane SHALL preserve Postiz as the only draft review, scheduling, and social-publication system of record and SHALL NOT auto-approve or auto-publish content.

#### Scenario: Review is required

- **WHEN** generated work awaits a decision
- **THEN** the private operator surface links to the corresponding Postiz draft

#### Scenario: A pending item ages

- **WHEN** a Postiz draft remains unreviewed past a hold window
- **THEN** no Fleet renderer, orchestrator, or scheduler promotes it without an explicit owner action in Postiz

### Requirement: End-to-end stage visibility

The marketing page SHALL show source readiness, generated packages, rendered media, Postiz drafts, scheduled posts, published posts, and measured outcomes per canonical project.

#### Scenario: Inspect a focus project

- **WHEN** the operator opens `/marketing`
- **THEN** the project shows its current program, downstream stage, freshness, blocker, and next action without exposing unpublished content

### Requirement: Mobile review notification

The system SHALL send concise notifications for excessive Postiz draft debt, publication failures, and stale focus projects through the existing Fleet notification service.

#### Scenario: Review debt becomes actionable

- **WHEN** Postiz drafts cross the configured review threshold
- **THEN** one deduplicated notification reports counts and a private Postiz review link without embedding unpublished post bodies
