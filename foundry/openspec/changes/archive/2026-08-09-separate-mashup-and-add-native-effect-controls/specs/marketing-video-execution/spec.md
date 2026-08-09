## ADDED Requirements

### Requirement: External editorial products remain decoupled
Reel Pipeline SHALL NOT import, spawn, configure, or own the Mashup editorial runtime. It MAY ingest a finished Mashup media artifact only through the versioned media-handoff contract and SHALL treat it as an external source with verified provenance.

#### Scenario: Execute without Mashup installed
- **WHEN** Mashup is absent from the workspace
- **THEN** Reel Pipeline's catalog, validation, fixture execution, and supported real adapters continue to operate

#### Scenario: Ingest finished Mashup media
- **WHEN** an operator supplies a valid Mashup artifact and matching receipt
- **THEN** Reel Pipeline may use the artifact as source media without reading Mashup state or invoking its planner

#### Scenario: Request podcast planning inside Reel Pipeline
- **WHEN** an operator requests a Mashup planning operation from Reel Pipeline
- **THEN** Reel Pipeline reports that the workflow belongs to the independent Mashup product and performs no hidden subprocess execution

