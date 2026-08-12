## Purpose

Provides a durable, project-specific external publishing plan that converts Fleet priority and sharing-readiness truth into safe SEO/GEO distribution guidance.

## ADDED Requirements

### Requirement: Priority-complete publishing scope
The program SHALL contain exactly one project plan for every catalog identity classified P1 or P2 and every catalog identity classified P4 that is active, deployed, and ready to be shared.

#### Scenario: A P2 project is added
- **WHEN** a catalog identity is newly classified P2
- **THEN** validation fails until that identity has exactly one external publishing plan

#### Scenario: A P4 project becomes eligible
- **WHEN** a P4 project is active, deployed, and ready to be shared
- **THEN** validation fails until the ordered P4 set and project plans include it exactly once

### Requirement: Sharing readiness controls publication state
The program SHALL derive whether external publication is allowed from the canonical catalog and SHALL preserve non-shareable P1 or P2 identities as preparation-only plans with their current blocker.

#### Scenario: A project is not share-ready
- **WHEN** `readyToBeShared` is false in the catalog
- **THEN** its plan is marked blocked and contains no externally executable placement

#### Scenario: A project becomes share-ready
- **WHEN** `readyToBeShared` changes to true
- **THEN** validation requires the plan to be updated from preparation-only before publication is treated as allowed

### Requirement: Project-specific external placements
Each publishable project plan SHALL define a truthful narrative, a concrete source asset, and a ranked set of eligible external placements. Every placement SHALL identify its content format, execution owner, and why the venue fits that project.

#### Scenario: A venue rejects the product category
- **WHEN** a venue's current eligibility rules exclude a project's category or format
- **THEN** the venue is recorded as excluded rather than recommended

#### Scenario: A placement is recommended
- **WHEN** a placement is included in a project plan
- **THEN** the plan identifies a source asset, venue-specific format, fit rationale, and execution owner

### Requirement: Mechanical execution and content ownership boundaries
The program SHALL describe mechanical execution separately from content ownership. Every channel SHALL be agent-executable after authentication, either directly or with a precise owner unblock when the destination requires it.

#### Scenario: Authentication is sufficient for execution
- **WHEN** a destination accepts the authenticated account without another exceptional gate
- **THEN** the agent may prepare, submit, verify, and receipt the action end to end

#### Scenario: An exceptional unblock is required
- **WHEN** a destination requires authentication, CAPTCHA/2FA, payment, legal attestation, release authority, or an unexpected moderation decision
- **THEN** the owner performs only that unblock and the agent resumes execution

### Requirement: Concrete destination coverage
The program SHALL maintain a destination-level inventory behind the broad channel registry, SHALL distinguish maintained candidates from research-only seeds, and SHALL fail validation when a channel family has no concrete destination.

#### Scenario: A destination is retained from historical research
- **WHEN** its current policy, audience, cost, or submission flow has not been reverified
- **THEN** it remains research-only and cannot enter an executable campaign manifest

#### Scenario: A channel family is introduced
- **WHEN** a new broad channel is added to the publishing program
- **THEN** generation fails until at least one concrete destination accounts for that family

### Requirement: Generated tiered guide
The program SHALL generate deterministic human-readable guides for project plans and concrete destinations, grouped as P1, P2, and eligible finished P4, with channel rules, execution boundaries, blockers, exclusions, and maintenance instructions.

#### Scenario: Canonical program changes
- **WHEN** the canonical external-publishing configuration changes
- **THEN** the generated guide changes deterministically and the repository check detects stale output

### Requirement: Strategy and execution remain separate
The publishing program SHALL describe eligible strategy only. Completed submissions, outcomes, and live operational work SHALL remain in the existing growth ledger, submission receipts, and GitHub Issues rather than becoming a second task tracker.

#### Scenario: A placement is executed
- **WHEN** an external listing, article, post, or contribution is published
- **THEN** its URL and outcome are recorded in the existing execution systems without adding mutable completion state to the strategy guide
