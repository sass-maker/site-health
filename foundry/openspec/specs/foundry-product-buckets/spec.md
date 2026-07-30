# Foundry Product Buckets

## Purpose

Define the six operator-facing Foundry product buckets, their ownership
boundaries, and how implemented connections are documented.

## Requirements

### Requirement: Foundry exposes six operator-facing product buckets

Foundry SHALL classify directly owned product capabilities as packages, skills,
public apps, internal apps, Marketing, or the final dashboard. Operational
substrate SHALL remain identifiable without appearing as a seventh product
bucket.

#### Scenario: Operator inspects Foundry

- **WHEN** the operator reads the Foundry entrypoint
- **THEN** every directly owned component is assigned to exactly one of the six product buckets or explicitly identified as shared operational substrate

### Requirement: Packages contain shared product contracts

The packages bucket SHALL contain AI Visibility and Feedback as directly tracked
shared packages with consumer-independent contracts.

#### Scenario: Shared package is changed

- **WHEN** AI Visibility or Feedback behavior changes
- **THEN** its native package check runs without requiring a shared monorepo package manager

### Requirement: Internal apps remain focused

The internal-app bucket SHALL contain Drank and PSI Swarm as focused
operator-facing systems. Marketing orchestration SHALL NOT be classified as a
focused internal app.

#### Scenario: Operator opens an internal app

- **WHEN** the operator needs domain intelligence or performance analysis
- **THEN** the corresponding focused app owns the detailed workflow and Fleet Console links to or summarizes its evidence

### Requirement: Public apps and dashboard have separate ownership

Mobile Cockpit and the public directory SHALL live under the public-app bucket.
Fleet Console SHALL live under the dashboard bucket and SHALL remain the final
cross-bucket aggregation surface.

#### Scenario: Dashboard displays specialized evidence

- **WHEN** Fleet Console displays evidence owned by another bucket
- **THEN** it references the owning component's durable output without duplicating that component's domain implementation

### Requirement: Connection status is documented from implemented contracts

Foundry SHALL maintain a durable connection overview that labels each
cross-bucket relationship as connected, partial, or missing and identifies the
implemented transport or absent contract.

#### Scenario: Intended connection has no implementation

- **WHEN** product direction describes a connection that has no ingestion,
  storage, API, generated artifact, or tested consumer
- **THEN** the overview labels the relationship missing rather than presenting it as shipped

#### Scenario: Connection is implemented

- **WHEN** a provider produces a durable contract consumed by another component
- **THEN** the overview identifies the provider, consumer, and transport as connected
