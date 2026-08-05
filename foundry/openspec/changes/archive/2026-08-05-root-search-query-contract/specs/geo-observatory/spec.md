## ADDED Requirements

### Requirement: Root-domain observations follow the root query contract

Weekly live-search observation SHALL use the active root-domain query identifiers for brand, exact-domain, category, and problem intent while continuing to accept historical ledger entries for superseded identifiers.

#### Scenario: Weekly root observation runs

- **WHEN** the observatory measures a canonical root domain
- **THEN** it measures each active query in the root query contract
- **AND** records the stable query identifier, result class, evidence URLs, and observation date

#### Scenario: Historical observation is read

- **WHEN** the ledger contains an observation for a superseded query identifier
- **THEN** validation accepts the historical entry
- **AND** the latest report does not present it as the active target
