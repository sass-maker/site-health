## ADDED Requirements

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
