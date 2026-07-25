# significant-hobbies-toolbox-automation Specification

## Purpose
TBD - created by archiving change automate-significant-hobbies-toolbox. Update Purpose after archive.
## Requirements
### Requirement: Complete family mapping
The registry MUST map Significant Hobbies, Reader, Anime List, SWE Interview
Prep, LoopTV and Chess to unique canonical surfaces, repositories, runtimes,
checks and activation definitions.

#### Scenario: Child domain lacks owner
- **WHEN** a family domain cannot be mapped to exactly one project
- **THEN** family automation validation fails

### Requirement: Per-child usability evidence
Each family project MUST expose build/live/indexing, revision and errors plus its
declared meaningful activation or an explicit not-applicable result.

#### Scenario: LoopTV loads but cannot play
- **WHEN** the page probe succeeds but playback activation fails
- **THEN** LoopTV usability fails independently from page availability

### Requirement: Private personal data protection
Fleet reports MUST NOT persist reading bodies, private notes, learning answers,
watchlists, hobby journals, saved games, credentials or user-identifying state.

#### Scenario: Reader sync is measured
- **WHEN** a sync completion is recorded
- **THEN** only aggregate status/count/freshness evidence is retained

### Requirement: Background freshness by declared cadence
Any import, sync or scheduled content job MUST expose bounds, last success,
failure/retry and unresolved state evaluated against its actual declared cadence.

#### Scenario: Quarterly job is within cadence
- **WHEN** the last success remains inside its quarterly freshness window
- **THEN** it is not marked stale merely because no daily run exists

### Requirement: Independent failure and digest policy
A failure in one family child MUST NOT mark all children failed, and routine
Toolbox failures SHALL be deduplicated into a digest unless data/security risk
requires immediate action.

#### Scenario: Chess is unavailable
- **WHEN** Chess fails while other family surfaces pass
- **THEN** the report names Chess only and preserves other child statuses

### Requirement: Quiet experiment boundaries
Family projects MAY receive bounded attributed experiments, but automation MUST
respect review approval, expiry, stop rules and no automatic roadmap/promotion.

#### Scenario: Anime List experiment is inconclusive
- **WHEN** attribution is missing or the threshold is unmet at expiry
- **THEN** the experiment stops and records an inconclusive result
