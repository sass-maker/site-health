## MODIFIED Requirements

### Requirement: Canonical editorial runtime
Mashup SHALL own the podcast editorial planner as an independently runnable helper while preserving its CLI, SQLite-backed resumable stages, scoring behavior, local loopback editor, and multi-clip rendering.

#### Scenario: Run the independent planner
- **WHEN** an operator invokes the Mashup editorial command
- **THEN** the runtime runs without requiring the Reel Pipeline source tree

### Requirement: Approved edits render through Mashup
Mashup SHALL render an approved podcast edit through its owned multi-clip renderer while preserving original audio, source headings, watermark identity, captions, and interval-bound visual credits, and SHALL emit an artifact receipt with input and output hashes.

#### Scenario: Convert an approved edit
- **WHEN** an operator converts an approved `fleet.podcast-edit.v1` document
- **THEN** Mashup emits a playable artifact and receipt that retain the original source audio and every visible source credit

#### Scenario: Convert an unapproved edit
- **WHEN** an operator attempts to convert an edit whose approval is not approved
- **THEN** conversion fails without rendering an artifact

## REMOVED Requirements

### Requirement: Standalone retirement requires parity
**Reason**: Mashup is no longer being retired into Reel Pipeline; it becomes the canonical independent owner of the editorial runtime.

**Migration**: Preserve the consolidated runtime and its state compatibility while relocating ownership to `foundry/helpers/mashup`, then prove independent CLI, contract, and scoped test parity before removing the nested Reel Pipeline copy.

