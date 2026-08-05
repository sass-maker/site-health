# geo-observatory Specification

## Purpose
TBD - created by archiving change geo-observatory. Update Purpose after archive.
## Requirements
### Requirement: Stable, comparable observations

Every observatory run SHALL execute the same configured queries per product
and classify each result A (own domain top-3), B (partial page-one visibility:
own domain below top 3 or surfaced only via a hub/aggregator), or C (absent
from first page), with evidence URLs.

#### Scenario: brand query observation

- GIVEN a tracked product with a configured brand query
- WHEN the protocol runs the query on live web search
- THEN one ledger entry is recorded with date, product, query, kind, class,
  top-result URLs, and notes

### Requirement: Append-only ledger with validated entries

Observations SHALL be appended to a JSONL ledger via the record script,
which rejects entries missing required fields or using unknown
product/query identifiers.

#### Scenario: invalid entry rejected

- GIVEN an observations file with an entry whose class is "D"
- WHEN the record script runs
- THEN it exits non-zero naming the invalid entry and appends nothing

### Requirement: Trend report regeneration

The record script SHALL regenerate the latest-report doc after each append:
per product, each query's class across the most recent runs, plus a movers
section (any class change since the previous run).

#### Scenario: class change surfaces as mover

- GIVEN a product whose brand query was C last run and B this run
- WHEN the report regenerates
- THEN the movers section lists that product/query as C→B

### Requirement: Scheduled execution

The protocol SHALL run on a weekly schedule through the designated operations
host's versioned agent runner; a fresh clone remains inert until explicit host
activation, and a missed or failed run leaves the ledger unchanged (no partial
writes).

#### Scenario: scheduled run fails before completion

- GIVEN the weekly observatory routine starts
- WHEN any configured query fails before the run can be recorded atomically
- THEN the routine reports the failure and leaves the observation ledger
  unchanged

### Requirement: Configured target queries appear with search outcomes

Fleet Console SHALL show each project's latest configured target-query observation inside that project's Google Search expansion, separately from Search Console query evidence.

#### Scenario: Project has tracked target queries

- **WHEN** the operator expands a Google Search project with geo-observatory evidence
- **THEN** the expansion shows each configured query, its kind, latest A/B/C class, and observation date
- **AND** the view identifies the evidence as a live web-search observation rather than Search Console data

#### Scenario: Project has no tracked target queries

- **WHEN** the operator expands a project without geo-observatory evidence
- **THEN** the existing Search Console evidence remains available
- **AND** no empty target-query section is added

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
