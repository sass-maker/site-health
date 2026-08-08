# portfolio-strength-console Specification

## Purpose
Defines the evidence-bounded portfolio views that let the Fleet owner assess
domain strength, core-product AI awareness, marketing coverage, and performance
guardrails without blending unrelated signals.
## Requirements
### Requirement: Portfolio navigation follows owner questions

Fleet Console SHALL expose Domains, Google Search, AI Awareness, and Performance
under a visible Metrics group. It SHALL expose Growth and Marketing under a
separate visible Growth group, with Projects and Feedback remaining standalone
owner views. System topology, crawlability, agent readiness, design critique,
skill history, and other detailed evidence SHALL remain secondary diagnostics.
Project scope SHALL persist only on views whose contracts support it.

#### Scenario: Operator uses primary navigation

- **WHEN** the operator opens the Fleet Console navigation
- **THEN** Domains, Google Search, AI Awareness, and Performance appear under Metrics
- **AND** Growth and Marketing appear under Growth
- **AND** Projects and Feedback remain directly available outside those groups

#### Scenario: Operator follows an old Metrics link

- **WHEN** the operator opens `/metrics`
- **THEN** the Console redirects to Domains without losing a valid project scope

### Requirement: Domains groups shared roots once

Domains SHALL group maintained products by registrable root, show each root
once, list every affected product, and expose native D-Rank value, history
state, observation time, and source. A missing D-Rank SHALL remain Not measured
and SHALL NOT become zero.

#### Scenario: Multiple products share one registrable root

- **WHEN** two or more maintained products use subdomains of the same
  registrable root
- **THEN** Domains shows one root row with links to all affected products

#### Scenario: Root has no D-Rank observation

- **WHEN** no valid domain-rating evidence exists for a root
- **THEN** the row says Not measured and retains the affected products and
  evidence source boundary

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

### Requirement: Marketing is a maintained-product coverage directory

Marketing SHALL list every maintained product with positioning availability,
the newest bounded publication receipt when present, the count of open
marketing recommendations, and an explicit Never marketed state when no
publication receipt exists. Missing receipt evidence SHALL NOT be inferred from
configuration, a draft, a fixture, or a public domain.

#### Scenario: Product has publication evidence

- **WHEN** a maintained product has one or more normalized marketing publication
  receipts
- **THEN** Marketing shows only the newest receipt summary, provider, state, and
  observation time for the directory row

#### Scenario: Product has no publication evidence

- **WHEN** no normalized publication receipt exists for a maintained product
- **THEN** Marketing shows Never marketed and preserves positioning and
  recommendation state independently

### Requirement: Performance is an explicit guardrail

Performance SHALL include every maintained public product and classify it as
Fast enough only when the latest PSI performance score is at least 90 and the
latest LCP is at most 2,500 milliseconds. It SHALL classify a fully measured
product outside either threshold as Needs work and a product missing either
required measure as Not measured. The view SHALL NOT rank products or calculate
a blended portfolio score.

#### Scenario: Both guardrails pass

- **WHEN** a product has PSI at least 90 and LCP at most 2,500 milliseconds
- **THEN** Performance labels it Fast enough and shows both native values and
  observation time

#### Scenario: A measured guardrail fails

- **WHEN** a product has both required measures and either PSI is below 90 or
  LCP exceeds 2,500 milliseconds
- **THEN** Performance labels it Needs work and identifies the failing
  guardrail

#### Scenario: Required evidence is incomplete

- **WHEN** either PSI or LCP is unavailable
- **THEN** Performance labels the product Not measured rather than inferring a
  pass or failure

### Requirement: Portfolio views remain responsive and evidence-linked

The four portfolio views SHALL remain keyboard operable and readable at 390,
768, and 1,440 CSS pixels. Status SHALL not depend on color alone, and every
product or root row SHALL link to the relevant project detail evidence where
such a project exists.

#### Scenario: Operator uses a narrow viewport

- **WHEN** a portfolio view is opened at 390 CSS pixels
- **THEN** its records remain structurally readable without shrinking text or
  hiding status language

#### Scenario: Operator opens supporting evidence

- **WHEN** the operator follows a product or domain evidence link
- **THEN** the Console opens the canonical project detail section and preserves
  the current project scope contract

