## MODIFIED Requirements

### Requirement: Foundry portfolio AI visibility

Foundry SHALL configure AI visibility by canonical project and retain normalized
history sufficient to compare visibility, citations, recommendation, rank,
competitor share, and citation-source ownership over time. Provider-backed runs
SHALL retain a bounded deduplicated set of normalized citation URLs and hosts,
but SHALL NOT retain raw answer text in the event ledger or Console. Foundry
SHALL distinguish fixtures, offline provider observations, and direct
live-provider execution in every recorded run.

#### Scenario: Manual project canary completes

- **WHEN** the owner runs an approved bounded check for one project
- **THEN** Foundry records coverage, normalized aggregates, bounded citation
  sources, evidence links, observed cost, and recommended actions in Marketing
  without activating a recurring schedule

#### Scenario: Provider observations are imported

- **WHEN** an operator supplies a valid provider-observation bundle whose
  project and prompt ids match canonical configuration
- **THEN** Foundry records normalized results as `provider-observation`, retains
  bounded normalized citation URLs and hosts but no raw answer text, and does
  not load credentials or contact a provider

#### Scenario: Canonical portfolio coverage is required

- **WHEN** the operator requests the all-project coverage gate
- **THEN** ingestion fails before recording any run unless the bundle contains
  exactly the 27 currently eligible AI Visibility project ids

#### Scenario: Observation provenance is incomplete

- **WHEN** a completed observation omits provider, model, capture time, provider
  request id, response text, or explicit cost
- **THEN** ingestion rejects the bundle before recording any run

#### Scenario: Project is ignored

- **WHEN** an ignored registry entry is considered for a Fleet run
- **THEN** no check is scheduled or executed without explicit reactivation
