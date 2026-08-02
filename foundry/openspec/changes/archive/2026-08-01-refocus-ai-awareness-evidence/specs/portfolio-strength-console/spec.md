## MODIFIED Requirements

### Requirement: AI Awareness uses provider-backed core-product outcomes

AI Awareness SHALL include only maintained P1 catalog entries whose category is
product. Its primary ledger SHALL derive known, mentioned, recommended, cited,
ranked, and source values only from provider-backed AI Visibility observations.
It SHALL distinguish citations to project-owned surfaces from citations to
independent external sources and SHALL keep older host-only evidence explicitly
unclassified when ownership cannot be proven. Fixture canaries, crawler
activity, AI referrals, content coverage, and technical agent readiness SHALL
NOT mark a product as known by AI.

#### Scenario: Core product has provider-backed evidence

- **WHEN** a maintained P1 product has a provider-backed AI Visibility
  observation
- **THEN** AI Awareness shows its native mention, recommendation, citation,
  rank, source ownership, coverage, and observation values with provider and
  time

#### Scenario: Core product has only readiness or fixture evidence

- **WHEN** a maintained P1 product has no provider-backed AI Visibility
  observation
- **THEN** AI Awareness says Not measured even if fixture, crawler, referral,
  content, or readiness evidence exists

#### Scenario: Operator inspects one project

- **WHEN** the operator expands a core project row
- **THEN** the Console shows its configured questions, bounded provider/model
  attempts, citation sources, and separately labeled Cloudflare discovery
  evidence
- **AND** no raw model answer is exposed

#### Scenario: Citation source ownership is not provable

- **WHEN** an older observation retains a citation host without a normalized URL
  sufficient to match an owned project surface
- **THEN** AI Awareness labels that source Unclassified rather than assuming it
  is owned or independent

#### Scenario: P1 record is not a product

- **WHEN** a P1 catalog entry has a non-product lifecycle or category
- **THEN** AI Awareness excludes it from the core-product set
