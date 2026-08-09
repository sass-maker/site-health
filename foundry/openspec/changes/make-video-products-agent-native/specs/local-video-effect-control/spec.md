## ADDED Requirements

### Requirement: Studio supports headless operation parity
Local AI Video Studio SHALL expose supported source inspection, analysis,
planning, catalog discovery, graph validation, graph editing, cost estimation,
rendering, project inspection, selection, and export through a non-interactive
agent interface that uses the same domain rules as SwiftUI.

#### Scenario: Agent plans without opening the app
- **WHEN** an agent supplies a local source reference, instruction, output profile, and variant count
- **THEN** Studio returns validated reproducible graphs and planner provenance without launching or automating SwiftUI

#### Scenario: Agent edits a graph
- **WHEN** an agent adds, removes, or tunes a registered effect through the headless interface
- **THEN** Studio applies the same schema, compatibility, hash, stale-preview, and cost rules used by direct controls

#### Scenario: Agent requests an unsupported effect
- **WHEN** an agent requests an unknown or unavailable effect
- **THEN** Studio returns a stable validation error or disclosed fallback and never reports an unsupported effect as rendered

### Requirement: Studio human and agent surfaces remain consistent
SwiftUI and the headless interface SHALL call one orchestration boundary so an
operation performed by either surface produces compatible project state,
canonical hashes, manifests, and export validity.

#### Scenario: Continue an agent-created project in SwiftUI
- **WHEN** an agent saves a valid Studio project and a creator opens it in SwiftUI
- **THEN** the app displays the same variants, revisions, warnings, selections, and completed artifact identities
