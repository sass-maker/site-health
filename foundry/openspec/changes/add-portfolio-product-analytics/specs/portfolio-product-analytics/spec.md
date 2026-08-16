## Purpose

Defines the shared event contract, PostHog aggregate collector, D1 database
collectors, Fleet Console Product Analytics page, and privacy validation that
together produce grounded portfolio-wide user metrics without retaining PII or
raw provider payloads.

## ADDED Requirements

### Requirement: A shared 5-event taxonomy covers every product type

The system SHALL define exactly five analytics events — `page_view`, `signup`,
`activated`, `core_action`, and `returned` — and every instrumented product
SHALL emit a subset of these events with a `project_id` property matching the
canonical catalog ID. The `core_action` event SHALL carry an `action` property
naming the product-specific verb.

#### Scenario: A product emits the core action

- **WHEN** a user completes the primary product action
- **THEN** the product emits a `core_action` event with `project_id` and an
  `action` property
- **AND** no product emits an event outside the five-event taxonomy

#### Scenario: A product has no instrumentation

- **WHEN** a maintained product has no PostHog or D1 instrumentation
- **THEN** the system shows it as Not measured
- **AND** it does not infer zero, hide the row, or fabricate evidence

### Requirement: The user-metrics outcome family extends the existing ledger

The system SHALL add a `user-metrics` family to the existing visibility outcome
store with two providers — `posthog-insights` and `d1-aggregate` — and SHALL
validate every observation against a family-specific metric contract before
appending it to the private JSONL ledger.

#### Scenario: A PostHog observation is appended

- **WHEN** the PostHog collector produces a valid `user-metrics` observation
- **THEN** the store validates its metrics against the `user-metrics` contract
- **AND** it appends the observation to the same ledger as Cloudflare and Search
  Console evidence
- **AND** it deduplicates by observation id

#### Scenario: An observation has an unknown metric

- **WHEN** a `user-metrics` observation contains a metric label not in the
  contract
- **THEN** the store rejects the observation
- **AND** no invalid data enters the ledger

### Requirement: The PostHog collector reads the shared project via the Query API

The system SHALL provide a PostHog aggregate collector that reads the shared
PostHog project via the Query API (`/api/projects/:id/query/` with
`TrendsQuery`). The legacy Insights trend endpoint returns 403 and SHALL NOT
be used. The collector SHALL group events by `project_id`, including
historical aliases that predate the catalog id, over a bounded 7-day window,
and emit one normalized `user-metrics` observation per product with Visitors,
Identified users, Activation rate, D1/D7 retention, and Core actions where
available.

#### Scenario: A product has PostHog events

- **WHEN** the collector queries a product with PostHog events in the last 7
  days
- **THEN** it emits a `user-metrics` observation with provider
  `posthog-insights`
- **AND** the observation carries the measured metrics, period, and observation
  timestamp

#### Scenario: A product has no PostHog events

- **WHEN** the collector queries a product with no PostHog events
- **THEN** it reports a bounded exclusion
- **AND** the last good ledger evidence remains readable

#### Scenario: The PostHog API rate limit is hit

- **WHEN** the collector exceeds the PostHog Query API rate limit
- **THEN** it reports a bounded failure
- **AND** it does not retry aggressively or block the update cycle

### Requirement: D1 collectors emit aggregate counts without PII

The system SHALL provide a D1 aggregate collector that runs read-only aggregate
SQL against authoritative product databases and emits `user-metrics`
observations with provider `d1-aggregate` containing Accounts, Activation rate,
D1/D7 retention, and Core actions counts. The collector SHALL NOT return or
retain any row-level data, user identifiers, or free-text content.

#### Scenario: A product has an authoritative D1 database

- **WHEN** the D1 collector runs aggregate queries against a product database
- **THEN** it emits a `user-metrics` observation with provider `d1-aggregate`
- **AND** the observation contains only non-negative aggregate counts

#### Scenario: A product database is inaccessible

- **WHEN** D1 access is unavailable for a product
- **THEN** the collector reports a bounded exclusion
- **AND** the last good ledger evidence remains readable

### Requirement: Fleet Console projects user metrics as a per-product directory

Fleet Console SHALL provide a Product Analytics page under the Metrics group
that reads `user-metrics` observations from the outcome ledger and renders a
per-product directory with visitors, identified users, accounts, activation
rate, D1/D7 retention, core actions, observation date, and provider boundary.
Missing metrics SHALL remain Not measured and SHALL NOT become zero.

#### Scenario: A product has both PostHog and D1 evidence

- **WHEN** a product has `user-metrics` observations from both providers
- **THEN** the Console shows the merged metric set with each provider boundary
  labeled
- **AND** it does not create a combined score

#### Scenario: A product has only D1 evidence

- **WHEN** a product has `user-metrics` observations from only the D1 collector
- **THEN** the Console shows Accounts, Activation rate, retention, and Core
  actions
- **AND** Visitors and Identified users remain Not measured

#### Scenario: A product has no user-metrics evidence

- **WHEN** a maintained product has no `user-metrics` observation
- **THEN** the Console shows Not measured for every metric
- **AND** it preserves the product row with its catalog identity

### Requirement: The Product Analytics page remains responsive and evidence-linked

The Product Analytics page SHALL remain keyboard operable and readable at 390,
768, and 1,440 CSS pixels. Status SHALL not depend on color alone, and every
product row SHALL link to the relevant project detail evidence where such a
project exists.

#### Scenario: The operator uses a narrow viewport

- **WHEN** the Product Analytics page is opened at 390 CSS pixels
- **THEN** its records remain structurally readable without shrinking text or
  hiding status language

#### Scenario: The operator opens supporting evidence

- **WHEN** the operator follows a product evidence link
- **THEN** the Console opens the canonical project detail section

### Requirement: No PII or credentials enter the ledger

The system SHALL NOT retain personally identifiable information, raw event
payloads, API tokens, cookies, or provider credentials in the outcome ledger.
PostHog distinct IDs SHALL be opaque hashes; D1 queries SHALL return counts
only. The ledger SHALL contain only normalized aggregate metrics, periods, and
observation metadata.

#### Scenario: A PostHog observation contains a distinct ID

- **WHEN** the PostHog collector processes an event with a distinct ID
- **THEN** the ledger retains only the aggregate count of distinct IDs
- **AND** no individual distinct ID value is stored

#### Scenario: A D1 query returns row-level data

- **WHEN** a D1 aggregate query is composed
- **THEN** it uses `COUNT` or `COUNT(DISTINCT)` only
- **AND** no row-level result is written to the ledger

### Requirement: Rollout follows attention order with a pilot first

The system SHALL pilot five products (RolePatch, Karte, Drank, one static site,
one local-first product) before rolling out to the remaining portfolio. Rollout
SHALL proceed in attention order: P1 products first, then active P2, then
remaining maintained. Products without instrumentation SHALL appear as Not
measured until instrumented.

#### Scenario: The pilot completes

- **WHEN** all five pilot products have `user-metrics` evidence in the ledger
- **THEN** the rollout proceeds to P1 products
- **AND** the pilot products remain measurable

#### Scenario: A P1 product is not yet instrumented

- **WHEN** a P1 product has no PostHog or D1 instrumentation
- **THEN** it appears as Not measured in Product Analytics
- **AND** it is prioritized for the next rollout step
