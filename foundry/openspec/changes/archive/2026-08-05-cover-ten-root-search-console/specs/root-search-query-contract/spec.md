## MODIFIED Requirements

### Requirement: Every canonical root has four search intents

The contract SHALL contain exactly one active brand, exact-domain, category,
and problem query for every canonical root domain. Every contracted root SHALL
also be eligible for read-only Search Console collection through its existing
catalog project identity, independently of whether that identity belongs to the
27-project public metric portfolio.

#### Scenario: Contract coverage is validated

- **WHEN** the query contract is loaded against the canonical root-brand contract
- **THEN** every canonical root has all four required active query kinds
- **AND** missing roots, extra roots, duplicate identifiers, and duplicate active kinds are rejected

#### Scenario: A contracted root is outside the public metric portfolio

- **WHEN** a validated root belongs to a catalog project excluded from the
  27-project public metric portfolio
- **THEN** that catalog project is added to the Search Console measurement set
- **AND** its lifecycle, tier, and eligibility for other metrics remain unchanged

#### Scenario: A contracted root already has a public metric target

- **WHEN** a validated root resolves to a project already in the public metric portfolio
- **THEN** the Search Console measurement set contains one target for that project
- **AND** a conflicting primary measurement domain is rejected
