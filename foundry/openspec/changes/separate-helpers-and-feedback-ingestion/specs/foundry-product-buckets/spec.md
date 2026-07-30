## MODIFIED Requirements

### Requirement: Foundry exposes six operator-facing product buckets

Foundry SHALL classify directly owned product capabilities as Helpers, Skills,
Public Apps, Marketing, Packages, or Fleet Console. Operational substrate SHALL
remain identifiable without appearing as a seventh product bucket.

#### Scenario: Operator inspects Foundry

- **WHEN** the operator reads the Foundry entrypoint
- **THEN** every directly owned component is assigned to exactly one of the six
  product buckets or explicitly identified as shared operational substrate

### Requirement: Packages contain shared product contracts

The Packages bucket SHALL contain Feedback as the directly tracked public
package with a consumer-independent contract. AI Visibility SHALL be classified
as a Helper even when consumers install or pack its typed library.

#### Scenario: Public package is changed

- **WHEN** Feedback behavior changes
- **THEN** its native package check runs without requiring a shared monorepo
  package manager

### Requirement: Internal apps remain focused

The Helpers bucket SHALL contain Drank, PSI Swarm, and AI Visibility as focused
supporting products. Helper runtime and domain logic MUST remain outside the
Skills bucket. Marketing orchestration SHALL NOT be classified as a Helper.

#### Scenario: Operator opens a helper

- **WHEN** the operator needs domain intelligence, performance analysis, or AI
  visibility analysis
- **THEN** the corresponding Helper owns the detailed workflow and Fleet
  Console links to or summarizes its evidence

#### Scenario: Helper exposes agent invocation

- **WHEN** a Helper has an installable or discoverable skill entrypoint
- **THEN** the Skills bucket contains only a link or thin adapter to the
  Helper-owned invocation contract and does not duplicate its implementation

### Requirement: Public apps and dashboard have separate ownership

The SaaS Maker public directory SHALL live under Public Apps. Fleet Console
SHALL own the final cross-bucket aggregation surface, and Mobile Cockpit SHALL
be represented only as an experimental, local-only mobile client within the
Fleet Console boundary until its future is explicitly decided.

#### Scenario: Dashboard displays specialized evidence

- **WHEN** Fleet Console displays evidence owned by another bucket
- **THEN** it references the owning component's durable output without
  duplicating that component's domain implementation

#### Scenario: Operator reviews public products

- **WHEN** the operator inspects the Public Apps bucket
- **THEN** Mobile Cockpit is absent and no documentation implies that it is a
  public or committed product
