## ADDED Requirements

### Requirement: Eligible recipes expose compact theme and model choices

The Fleet Console Marketing maker SHALL preserve its existing recipe selector
and SHALL progressively expose Theme and Model choices only when the selected
recipe supports them. Both controls SHALL default to Auto.

#### Scenario: Operator selects coherent local film
- **WHEN** the selected recipe supports generated footage and theme packs
- **THEN** Theme appears in the production settings and Model appears in Advanced without replacing the recipe selector

#### Scenario: Operator returns to a deterministic local recipe
- **WHEN** the operator selects ASCII animation or another recipe without model support
- **THEN** Model is hidden and the saved recipe remains executable through its existing adapter

### Requirement: Model tradeoffs and blockers are inspectable

The maker SHALL show the selected profile's speed, quality, resource class,
native-audio posture, license/territory posture, readiness, and exact blocker.
An unavailable profile SHALL remain selectable for inspection but SHALL NOT
enable render.

#### Scenario: Operator inspects MiniMax H3
- **WHEN** H3 source or weights are not ready on the host
- **THEN** the maker describes it as an experimental open-weight quality profile, shows the missing setup, and keeps Make video disabled

#### Scenario: Auto chooses LTX
- **WHEN** Auto resolves to ready LTX for a speed-prioritized brief
- **THEN** the maker names LTX and the selection reason before asking for render confirmation

### Requirement: Model setup requires a separate confirmation

No interaction that reads the arsenal, changes Theme or Model, saves a brief,
or starts another ready render SHALL download or install a model.

#### Scenario: Operator selects an unavailable model
- **WHEN** the operator selects Wan Remix or H3
- **THEN** the UI exposes a separate setup action with disk/compatibility details and does not start it until separately confirmed
