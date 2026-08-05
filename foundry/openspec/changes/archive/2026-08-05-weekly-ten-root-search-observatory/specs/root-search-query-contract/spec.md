## ADDED Requirements

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
