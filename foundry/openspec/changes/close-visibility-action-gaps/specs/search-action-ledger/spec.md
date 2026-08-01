## MODIFIED Requirements

### Requirement: Search discovery changes precede measurement
The explicit Search update SHALL run safe discovery notification before it
collects provider-native performance and URL Inspection values. The Search
table SHALL remain an outcome view and SHALL NOT include row-level action or
change columns.

#### Scenario: Indexed project has zero impressions

- **WHEN** Search Console records zero project impressions and URL Inspection
  reports the canonical homepage as indexed
- **THEN** the row retains zero measured impressions and the passing Google
  index evidence in its expanded details
- **AND** no generic indexing task is shown

#### Scenario: Canonical homepage is not indexed

- **WHEN** URL Inspection returns a non-passing verdict
- **THEN** Google's coverage, robots, fetch, canonical, and crawl evidence is
  retained in bounded normalized form
- **AND** the next explicit update retries allowed discovery submissions before
  measuring again

#### Scenario: Inspection cannot run

- **WHEN** the Search Console update cannot inspect a canonical homepage
- **THEN** expanded provider details report Inspection unavailable
- **AND** the table does not substitute a generic Check indexing task

#### Scenario: Search terms are expanded

- **WHEN** the operator expands a project row
- **THEN** query, landing page, impressions, clicks, CTR, and average position
  are shown
- **AND** no action column is added
