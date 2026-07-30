## MODIFIED Requirements

### Requirement: Connection status is documented from implemented contracts

Foundry SHALL maintain a durable connection overview and an owner-visible Fleet
Console projection that label each cross-bucket relationship as connected,
partial, missing, stale, or unavailable and identify the implemented transport
or absent contract. The owner-visible projection SHALL also identify the
recorded output produced through those relationships without treating the
topology itself as an outcome.

#### Scenario: Intended connection has no implementation

- **WHEN** product direction describes a connection that has no ingestion,
  storage, API, generated artifact, or tested consumer
- **THEN** the overview and Fleet Console label the relationship missing rather
  than presenting it as shipped

#### Scenario: Connection is implemented

- **WHEN** a provider produces a durable contract consumed by another component
- **THEN** the overview and Fleet Console identify the provider, consumer,
  transport, and evidence freshness as connected

#### Scenario: Connected relationship has produced no evidence

- **WHEN** a transport is implemented but has no recorded output or observation
- **THEN** Fleet Console shows the path as connected and its output as zero or
  unmeasured rather than implying production
