# root-search-query-contract Specification

## Purpose
Defines a stable, complete, and evidence-honest search query contract for Fleet's ten canonical root domains.
## Requirements
### Requirement: Every canonical root has four search intents

The contract SHALL contain exactly one active brand, exact-domain, category, and problem query for every canonical root domain.

#### Scenario: Contract coverage is validated

- **WHEN** the query contract is loaded against the canonical root-brand contract
- **THEN** every canonical root has all four required active query kinds
- **AND** missing roots, extra roots, duplicate identifiers, and duplicate active kinds are rejected

### Requirement: Historical query identity remains stable

The contract SHALL preserve retired or superseded queries with their original stable identifiers and SHALL identify the active replacement without rewriting history.

#### Scenario: A better query replaces an ambiguous query

- **WHEN** an operator supersedes a query whose search intent was ambiguous
- **THEN** the prior query remains in the contract as historical
- **AND** the new query receives a new identifier and becomes the active query for that intent kind

### Requirement: Brand collisions are explicit

Each root query record SHALL declare whether its canonical brand is ambiguous in search and SHALL provide a disambiguated active brand query when a collision exists.

#### Scenario: Generic product name collides with another entity

- **WHEN** a canonical product name has a known search collision
- **THEN** the contract labels that collision
- **AND** its active brand query includes a stable product or domain disambiguator

### Requirement: Missing provider evidence remains unknown

Query reporting SHALL distinguish a measured rank or result from a provider returning no observation.

#### Scenario: Search Console does not return a contracted query

- **WHEN** a contracted query has no Search Console row in the completed reporting window
- **THEN** its result is reported as not observed
- **AND** the system does not report rank zero, zero impressions, or a fabricated position for that query

### Requirement: Contracted query evidence is visible per project

The Google Search project expansion SHALL list all active contracted queries for its root domain with the latest available provider evidence.

#### Scenario: Operator expands a project search result

- **WHEN** the project belongs to a contracted root domain
- **THEN** the expansion lists the four active query kinds
- **AND** each query shows Search Console evidence, live-search evidence, or an explicit not-observed state

### Requirement: The weekly runner consumes the canonical active contract

The enabled weekly GEO Observatory job SHALL derive its complete search workload from the active queries in the validated root search query contract and SHALL NOT duplicate or infer that workload from the legacy all-project observatory configuration.

#### Scenario: Weekly workload is assembled

- **WHEN** the scheduled prompt starts a root search measurement
- **THEN** it loads `root-search-queries.json`
- **AND** it measures one brand, exact-domain, category, and problem query for each of the exact ten canonical roots
- **AND** it does not measure historical queries or unrelated subdomain projects as part of that run

#### Scenario: Contract changes additively in the future

- **WHEN** an active query is superseded according to the root contract
- **THEN** the next scheduled workload uses the active replacement
- **AND** the old identifier remains accepted as historical ledger evidence but cannot be newly recorded
