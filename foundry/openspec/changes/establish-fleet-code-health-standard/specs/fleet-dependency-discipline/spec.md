## MODIFIED Requirements

### Requirement: Fleet-wide active repository scan
The guard SHALL scan local Fleet repositories whose catalog lifecycle is
`maintained` and tier is `focus`, `active`, or `secondary`, include the Foundry
git repository, and deduplicate multiple project paths that resolve to the same
git top level. It MUST report catalog identities excluded by lifecycle or tier
separately and MUST NOT inspect them or count them in maintained-project
results.

#### Scenario: Multiple surfaces share Foundry
- **WHEN** several maintained registry records resolve inside the Foundry monorepo
- **THEN** the guard checks the Foundry git root once and associates the relevant project identifiers

#### Scenario: Registered checkout is unavailable
- **WHEN** an included maintained registry path is missing or is not a git repository
- **THEN** the report records it as skipped and continues scanning the remaining repositories

#### Scenario: Excluded lifecycle or tier
- **WHEN** a registry record has lifecycle `past` or tier `parked`, `out-of-fleet`, or `non-product`
- **THEN** Fleet mode reports the identity as excluded and does not inspect that checkout

