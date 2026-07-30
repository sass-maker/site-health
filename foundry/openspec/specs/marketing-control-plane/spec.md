# marketing-control-plane Specification

## Purpose

Define the canonical Fleet marketing control plane, approval boundaries, orchestration, publishing isolation, and operator visibility.

## Requirements

### Requirement: Marketing is a first-class Foundry product family

Foundry SHALL classify Reel Pipeline, Editorial, Content Factory, rendering
engines, distribution handoff, campaign state, and outcome evidence as one
Marketing family under `foundry/marketing/`.

#### Scenario: Operator inspects Marketing

- **WHEN** the operator follows a campaign from source through measurement
- **THEN** Foundry presents the involved Marketing components as one product family while preserving their specialized runtime contracts

#### Scenario: Marketing status reaches Fleet Console

- **WHEN** Marketing produces durable queue, approval, render, publication, or outcome evidence
- **THEN** Fleet Console may aggregate that evidence without owning the production or distribution logic

### Requirement: Canonical marketing program

The system SHALL maintain one versioned registry covering every active Fleet project with a canonical identity, aliases, operating mode, domain posture, trusted content base, CTA, brand channel mappings, and focus state.

#### Scenario: Resolve a historical project identity

- **WHEN** queue data contains a configured historical alias
- **THEN** aggregate reporting attributes it to the canonical project without modifying the source row

#### Scenario: Reject ambiguous identity

- **WHEN** a canonical slug or alias belongs to more than one project
- **THEN** registry validation fails before snapshots or automation run

### Requirement: Review-debt backpressure

The marketing queue builder SHALL inspect aggregate queue state before generating ideas and SHALL fail closed when state is unavailable or review debt exceeds configured limits.

#### Scenario: Review queue is above the ceiling

- **WHEN** unreviewed generated work exceeds the global or per-focus-project ceiling
- **THEN** no new marketing post is created and one review action is reported

#### Scenario: A focus project needs an experiment

- **WHEN** review debt is below the ceiling and a configured focus project has no recent active experiment
- **THEN** the builder may create a bounded reviewable batch for that project

### Requirement: Public snapshot is aggregate-only

The public Fleet dashboard SHALL expose only sanitized aggregate marketing state.

#### Scenario: Build a marketing snapshot

- **WHEN** the authenticated local command reads queue records
- **THEN** its public output contains counts, stages, freshness, failures, and next actions but no post content, owner ids, task ids, notes, or private result URLs

#### Scenario: Queue API is unavailable

- **WHEN** a refresh fails
- **THEN** the last good snapshot remains readable and is visibly marked stale with the failed refresh time

### Requirement: Operator approval remains authoritative

The control plane SHALL use Foundry's private owner-decision inbox as the
acceptance/rejection system of record for Foundry-owned marketing work and
SHALL NOT auto-accept or auto-post content.

#### Scenario: Review is required

- **WHEN** generated work awaits a decision
- **THEN** the dashboard, owner notification, and mobile brief link to one
  authenticated Foundry Needs me item containing the draft identity, evidence,
  destination, and allowed responses

#### Scenario: A pending item ages

- **WHEN** a generated or pending item remains unreviewed past a hold window
- **THEN** no renderer, orchestrator, or scheduler changes it to accepted without an explicit owner action

### Requirement: Source-backed brand packages

Every source-backed channel program SHALL create versioned packages from typed product-owned records and SHALL preserve source provenance through rendering, publishing, and metrics.

#### Scenario: Propose content from a product base

- **WHEN** OpenClaw selects a topic from High Signal, Significant Hobbies, or SWE Interview Prep
- **THEN** the package records the canonical source ids/URLs, claims, brand, destination, revision, and proposed channel variants

#### Scenario: Revise an approved claim

- **WHEN** a source claim or approved script changes
- **THEN** the system creates a new package revision instead of mutating the approved variant

### Requirement: Media production is isolated from distribution

Reel Pipeline SHALL consume approved media variants and return render/quality receipts without selecting topics, approving content, or choosing social accounts.

#### Scenario: Render an approved video variant

- **WHEN** Reel Pipeline receives a valid approved package revision
- **THEN** it returns an attributable artifact and quality receipt and does not publish it

### Requirement: Publisher adapters isolate brand accounts

A social publisher SHALL map each brand channel to an explicit platform integration and SHALL return schedule, publication, and metrics receipts.

#### Scenario: Account mapping is absent

- **WHEN** an approved variant targets a channel without an explicit brand account mapping
- **THEN** scheduling fails closed and reports a configuration blocker

#### Scenario: One package targets multiple channels

- **WHEN** an approved package contains platform-specific variants
- **THEN** the publisher preserves each variant's content/settings and does not reuse one undifferentiated payload across platforms

### Requirement: OpenClaw orchestration is observable

OpenClaw SHALL be considered active for marketing only when a registered job produces durable task state, dry-run evidence, and Telegram completion/failure delivery.

#### Scenario: Run the marketing job in dry-run mode

- **WHEN** the registered job selects sources and proposes packages
- **THEN** task status and the dashboard show the run while no queue row, schedule, or public post is created

### Requirement: End-to-end stage visibility

The marketing page SHALL show foundation, queued, approved, produced, published, and measured state per canonical project.

#### Scenario: Inspect a focus project

- **WHEN** the operator opens `/marketing`
- **THEN** the project shows its current experiment, queue pressure, downstream stage, freshness, blocker, and next action

### Requirement: Mobile review notification

The system SHALL send concise notifications for excessive review debt, posting failures, and stale focus projects through the existing Fleet notification service.

#### Scenario: Review debt becomes actionable

- **WHEN** the queue crosses the configured review threshold
- **THEN** one deduplicated notification reports counts and a private review link without embedding unpublished post bodies

### Requirement: Marketing work is mission-linked

Every generated campaign, approved variant, render, publication, and measured
result SHALL reference a canonical project and mission.

#### Scenario: Approved content is published

- **WHEN** Postiz returns a publication receipt for an approved variant
- **THEN** Foundry attaches the receipt to the originating mission and updates
  its marketing outcome state without copying provider-owned private content

### Requirement: Marketing recommendations use visibility and feedback

Foundry SHALL combine AI visibility, domain intelligence, explicit feedback,
distribution receipts, and measured outcomes when recommending marketing work.

#### Scenario: Citation gap is actionable

- **WHEN** repeated AI-visibility evidence identifies a fresh, high-confidence
  citation gap for an active project
- **THEN** Foundry may propose a source-backed marketing mission linking the
  affected prompts, citations, target audience, expected outcome, and evidence
  required for review
