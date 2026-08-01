## ADDED Requirements

### Requirement: Fleet Console owns the marketing video product UI
Fleet Console SHALL expose prompt-first video creation at `/marketing` and the
complete playable style catalog at `/marketing/explore-gallery`. Reel Pipeline
and specialized runtimes SHALL remain service and evidence owners and SHALL NOT
require the operator to use a separate product UI to complete this flow.

#### Scenario: Operator creates a video
- **WHEN** the operator starts from Fleet Console Marketing
- **THEN** prompt, exact recipe and variant selection, contextual inputs, execution, blockers, playback, and owner evidence remain inside the Fleet Console flow

#### Scenario: Specialized runtime owns the render
- **WHEN** Brand Reel, Forge, Editorial, Blender, lyric composition, or another registered runtime handles execution
- **THEN** Fleet Console receives the normalized result while the owner-native manifest and review evidence remain authoritative

#### Scenario: Internal control route exists
- **WHEN** Reel Pipeline retains an internal diagnostic or control page
- **THEN** Fleet Console does not present that route as the Marketing product or require it for the operator journey
