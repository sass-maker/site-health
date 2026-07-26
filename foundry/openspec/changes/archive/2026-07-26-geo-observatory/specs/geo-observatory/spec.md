# Spec: geo-observatory

## ADDED Requirements

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
