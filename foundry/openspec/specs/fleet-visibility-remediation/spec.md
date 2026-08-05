# Fleet visibility remediation

## Purpose

Keep Fleet visibility metrics evidence-backed, inventory-complete, and honest
about the boundary between source prerequisites and externally observed
outcomes.
## Requirements
### Requirement: Valid metric evidence

The Fleet Metrics projection SHALL distinguish a failed, placeholder, or absent
measurement from a valid numerical zero.

#### Scenario: Failed performance run

- **WHEN** the latest performance receipt reports a failed or incomplete run
- **THEN** the project is shown as unmeasured for that result
- **AND** the failed receipt is not converted into a zero performance score or
  zero LCP.

#### Scenario: Incomplete design review

- **WHEN** a design receipt does not contain a completed scored review
- **THEN** the project is shown as unmeasured for design
- **AND** the placeholder is not ranked as a zero score.

#### Scenario: Independent project checkout is unavailable

- **WHEN** a maintained project's receipt was validated from an explicitly
  selected project workspace and its required evidence bytes were hashed
- **THEN** Fleet MAY project the sanitized deterministic snapshot when that
  checkout is absent
- **AND** a readable local receipt still undergoes direct validation and takes
  precedence
- **AND** neither source may invent or mutate the recorded scores.

#### Scenario: Search observation is recorded

- **WHEN** an operator records a current search class for a configured project
  query
- **THEN** the evidence names the exact configured query and records two or
  three current Web Search result URLs
- **AND** class A requires the project's own origin in the first three results
- **AND** class C cannot contain the project's own origin
- **AND** a later corrected observation on the same day takes precedence.

### Requirement: Source-derived agent coverage

Projects with public route catalogs SHALL be able to expose canonical
agent-readable representations derived from the same source content.

#### Scenario: Large public corpus

- **WHEN** a project contains more public routes than the bounded audit limit
- **THEN** it exposes source-derived agent-readable routes without committing a
  duplicate file for every page
- **AND** the audit reports both total discovered routes and checked routes.

### Requirement: Canonical tracked search intents

Generated agent-readable surfaces SHALL expose each maintained project's exact
tracked brand and category search intents from the canonical GEO query registry.

#### Scenario: Agent surfaces are generated

- **WHEN** Fleet generates a project's public agent catalog and full agent brief
- **THEN** it includes the configured brand and category intents with their
  canonical query ids, kinds, and exact query text
- **AND** the generator does not infer, rewrite, deduplicate by text, or
  keyword-stuff those queries
- **AND** every emitted intent remains attributable to the canonical project id.

#### Scenario: Tracked intent coverage is incomplete

- **WHEN** a maintained visibility project has no configured brand or category
  intent, contains a duplicate query id, or cannot be joined to the canonical
  project inventory
- **THEN** generation fails closed with the affected project named
- **AND** it does not publish a partial or invented intent set.

### Requirement: Evidence-backed authority percentile

Fleet SHALL retain the observed raw Domain Rating while evaluating the
portfolio target against a reproducible external percentile benchmark.

#### Scenario: Domain authority satisfies the portfolio gate

- **WHEN** a project has a current raw Domain Rating and an attributable,
  dated external benchmark containing a cohort definition and percentile method
- **THEN** Fleet records both the raw rating and computed percentile rank
- **AND** the authority gate passes only when the percentile rank is at least 90.

#### Scenario: Authority benchmark is missing or self-referential

- **WHEN** the benchmark is absent, stale, unattributed, lacks a cohort
  definition, or ranks only the Fleet portfolio against itself
- **THEN** the authority percentile is unavailable and fails closed
- **AND** a raw Domain Rating of 90 is not presented as proof of the 90th
  percentile.

### Requirement: Honest remediation reporting

Local prerequisite work SHALL not be reported as improved external visibility
until deployment and a later observation demonstrate the outcome.

#### Scenario: Local SEO improvement

- **WHEN** metadata, content, internal links, or agent surfaces improve locally
- **THEN** the change is reported as a prerequisite improvement
- **AND** domain authority, search rank, or AI citation improvement remains
  unclaimed until externally observed.

### Requirement: Canonical root-domain brand contract

Fleet SHALL maintain one validated brand record for every root domain measured
by the Domains view. Each record SHALL declare one canonical public name and a
bounded list of deliberate aliases, and generators SHALL copy those values
without inventing additional spellings.

#### Scenario: Root-domain coverage is complete

- **WHEN** the Fleet contracts are validated
- **THEN** every root domain measured by the Domains view has exactly one brand record
- **AND** no extra, duplicate, or malformed root-domain record is accepted

#### Scenario: Structured data is generated

- **WHEN** a registered product maps to a root-domain brand record
- **THEN** generated JSON-LD uses the canonical name as `name`
- **AND** emits only the declared non-empty aliases as `alternateName`

#### Scenario: Product metadata disagrees with the contract

- **WHEN** a root product's title, primary heading, social site name, or
  structured-data name uses an undeclared public brand
- **THEN** the brand audit fails with the domain and conflicting value named
- **AND** search-rank improvement is not claimed merely because the metadata is corrected
