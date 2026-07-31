## MODIFIED Requirements

### Requirement: Complete workflow catalog
Marketing Studio SHALL show image slideshow, web motion, ASCII, faceless/lesson, brand reel, guided app demo, coherent local-model film, Grok-asset film, Blender film, podcast short, and lyric video as explicit recipes with truthful output style, spend posture, runtime owner, readiness, required inputs, supported channels, and action.

#### Scenario: Workflow is ready in another surface
- **WHEN** a guided app demo brief has the inputs required by Forge
- **THEN** Marketing Studio identifies Forge as the runtime owner and provides a continuation action that preserves the saved plan instead of claiming a local render

#### Scenario: Workflow prerequisites are missing
- **WHEN** a workflow requires an approved capture, source, host capability, local model, paid service, timed lyric, or rights record that is absent
- **THEN** its execution action is disabled and the exact missing input or readiness blocker is shown

#### Scenario: Lyric video is selected
- **WHEN** the operator selects lyric video
- **THEN** Marketing Studio identifies the local lyric compositor as owner, shows optional Blender visual generation, and presents the separate music, timed-lyric, attribution, and rights requirements

#### Scenario: Multiple implementations produce similar output
- **WHEN** image, web-motion, local-model, Grok, or Blender recipes can satisfy the same idea
- **THEN** the Studio keeps them as distinct choices and compares their engine, spend, runtime, quality, and prerequisites without silently choosing the most expensive path

### Requirement: Explicit execution confirmation
Marketing Studio SHALL NOT execute a render solely because a project, idea, recipe, options, conversation, or brief was selected or saved and SHALL require an explicit operator build or continuation action.

#### Scenario: Production plan completes
- **WHEN** a saved plan has all required inputs
- **THEN** its lifecycle remains planned until the operator chooses its named build or continuation action

### Requirement: Unified production review
Marketing Studio SHALL list saved plans and produced artifacts with their project, idea, recipe, engine or owner, spend posture, lifecycle, freshness, quality state, review state, and next valid action.

#### Scenario: Produced video needs review
- **WHEN** a render completes without final creative acceptance
- **THEN** Productions exposes playback and quality evidence while Postiz preparation remains gated

#### Scenario: Existing specialized review owns the decision
- **WHEN** an artifact belongs to Brand Reel, Forge, or Editorial
- **THEN** Productions links to the authoritative decision surface and does not duplicate its acceptance state

#### Scenario: Saved plan has no artifact
- **WHEN** the operator opens a planned production before execution
- **THEN** Productions identifies its selected recipe, readiness, blocker, and build or continuation action instead of displaying a fake preview

