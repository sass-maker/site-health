## ADDED Requirements

### Requirement: Provider coverage is disclosed by canonical project

Portfolio AI visibility output SHALL report the exact maintained projects with
current provider observations and SHALL report every other eligible project as
unobserved rather than substituting fixture or web-search evidence.

#### Scenario: Only some projects have provider observations

- **WHEN** provider-observation receipts exist for a strict subset of eligible projects
- **THEN** portfolio output names the observed project ids and the unobserved project ids
- **AND** it reports the corresponding coverage counts

#### Scenario: Evidence came from web search

- **WHEN** an exact target prompt is checked through organic web search
- **THEN** the result may update search discovery evidence
- **AND** it does not create a model mention, recommendation, rank, or citation observation

### Requirement: Provider labels describe the capture boundary

Each provider observation SHALL identify the provider/client boundary and model
used so subscription-backed Codex or Claude captures are not presented as a
generic ChatGPT or Claude consumer-product measurement.

#### Scenario: Observation was captured through an agent client

- **WHEN** a response was captured by Codex CLI, Claude Code, or another approved client
- **THEN** the retained provenance identifies that client, provider, and model
- **AND** UI copy does not broaden the claim beyond the captured surface
