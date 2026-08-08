## ADDED Requirements

### Requirement: FleetWorkspace runtime is an internal Fleet component
The FleetWorkspace operational-learning runtime SHALL live under the canonical
internal application boundary in `sass-maker/fleet-workspace`. Its runtime,
evidence, and OpenSpec contract MUST remain distinct from independently owned
product source, and integrations with CodeVetter or PostTrainLLM MUST remain
links or future adapter boundaries unless separately approved.

#### Scenario: Initial runtime slice is implemented
- **WHEN** FleetWorkspace records and verifies a GitHub transition
- **THEN** its source lives under `foundry/apps/internal/` without importing CodeVetter or PostTrainLLM source

