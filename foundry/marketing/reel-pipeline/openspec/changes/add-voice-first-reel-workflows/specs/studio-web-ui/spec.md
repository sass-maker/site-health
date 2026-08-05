## ADDED Requirements

### Requirement: Voice-first Create composer
The Create view SHALL provide visible typed and talk controls, recording state, transcript review, and a single action that creates an editable workflow. The talk control SHALL be keyboard operable and SHALL not start generation when recording or transcription completes.

#### Scenario: Operator uses talk to create
- **WHEN** the operator activates Talk, records a request, stops, edits the transcript, and confirms it
- **THEN** Create opens the resulting workflow with generation still awaiting an explicit action

### Requirement: Manual workflow is a primary surface
The Create view SHALL expose the current workflow stages, their state, inputs, blockers, and run or rerun actions without requiring hidden or developer-only controls. Quick mode SHALL visibly auto-advance the same stages and allow the operator to pause it.

#### Scenario: Operator chooses manual control
- **WHEN** the operator opens a planned workflow
- **THEN** every stage from brief through review is reachable, and ready stages can be operated in dependency order

### Requirement: Cast and soundtrack editors
The workflow surface SHALL provide a searchable character directory and cast editor plus a soundtrack editor that distinguishes owned audio, platform sound, generated music, and procedural draft. It SHALL show relevant rights and runtime blockers beside the affected control.

#### Scenario: Operator assigns cast and generated music
- **WHEN** the operator selects directory characters and the generated-music lane
- **THEN** the workflow shows character continuity inputs, mature eligibility where applicable, music controls, runtime readiness, and separate generation actions

### Requirement: Responsive accessible workflow operation
Voice intake, stage navigation, character selection, soundtrack controls, and production playback SHALL remain keyboard operable and usable without horizontal page scrolling at 390, 768, and 1440 pixel viewport widths. Recording and generation state SHALL not rely on color alone.

#### Scenario: Narrow-screen workflow editing
- **WHEN** the workflow is opened at 390 pixels wide
- **THEN** every stage and its primary action remains reachable in a single-column layout without horizontal page scrolling
