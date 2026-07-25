# data-research-toolbox-automation Specification

## Purpose
TBD - created by archiving change automate-data-research-toolbox. Update Purpose after archive.
## Requirements
### Requirement: Authoritative and derived data map
Each project MUST classify stored data as authoritative external source,
reconstructable derived state, cache, or irreplaceable user state and SHALL
record ownership plus backup/export/reconstruction treatment.

#### Scenario: Search index is reconstructable
- **WHEN** backup is marked not-applicable
- **THEN** a bounded rebuild path, source and expected cost/time are documented

### Requirement: Refresh lifecycle and quality
Every import/refresh MUST expose source watermark, bounds, timeout,
idempotency/deduplication, retries, output counts/quality signal, freshness and
durable failure state.

#### Scenario: Refresh exits successfully with zero output
- **WHEN** zero output violates the declared expectation
- **THEN** the run fails quality verification rather than advancing freshness

### Requirement: Search activation evidence
Research Papers and Starboard SHALL expose privacy-safe successful search/result
inspection or saved/organized action evidence without storing raw private query
or repository content in Foundry.

#### Scenario: Private repository search occurs
- **WHEN** activation is measured
- **THEN** aggregate outcome is recorded without repository identity or query

### Requirement: Public and API health
Each public/API surface MUST expose build/live/indexing, revision, errors and
latency evidence appropriate to its runtime.

#### Scenario: Index page is live but search API fails
- **WHEN** the search API probe fails
- **THEN** usability fails independently from landing availability

### Requirement: Bounded Toolbox marketing
Experiments MUST use canonical destinations, attribution, approved claims,
expiry and stop rules and MUST NOT trigger corpus/ranking product work.

#### Scenario: Research Papers gains traffic
- **WHEN** an experiment succeeds
- **THEN** Foundry records evidence and recommendation without automatic scope
  expansion
