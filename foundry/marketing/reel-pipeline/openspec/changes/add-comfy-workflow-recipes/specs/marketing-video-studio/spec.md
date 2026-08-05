## MODIFIED Requirements

### Requirement: Complete workflow catalog
Marketing Studio SHALL show faceless/lesson, brand reel, guided app demo,
coherent film, podcast short, and lyric video as explicit video workflows with
truthful readiness, required inputs, runtime owner, and action. Coherent local
film SHALL expose vetted local workflow recipes and episode mode with their
adjustable inputs, resource envelope, execution progress, and playable output.

#### Scenario: Workflow is ready in another surface
- **WHEN** a guided app demo brief has the inputs required by Forge
- **THEN** Marketing Studio identifies Forge as the runtime owner and provides a continuation action that preserves the brief instead of claiming a local render

#### Scenario: Workflow prerequisites are missing
- **WHEN** a workflow requires an approved capture, source, host capability, timed lyric, rights record, model, or character reference that is absent
- **THEN** its action is disabled and the exact missing input or readiness blocker is shown

#### Scenario: Lyric video is selected
- **WHEN** the operator selects lyric video
- **THEN** Marketing Studio identifies the local lyric compositor as owner, shows optional Blender visual generation, and presents the separate music, timed-lyric, attribution, and rights requirements

#### Scenario: Ready local recipe is selected
- **WHEN** the operator selects a ready vetted workflow recipe and supplies its required inputs
- **THEN** Marketing Studio exposes only the recipe's declared tweaks and offers one explicit action to generate a real local video

#### Scenario: Local generation completes
- **WHEN** a recipe or episode run returns a verified artifact envelope
- **THEN** Productions shows the playable video, model and recipe identity, progress or timing evidence, resource evidence, and reproducibility receipt

### Requirement: Prompt-first workflow proposal
Marketing Studio SHALL turn prompt intake into an inspectable workflow proposal
before generation and SHALL make Play workflow, rather than hidden automatic
execution or a dead external handoff, the primary execution boundary.

#### Scenario: Operator submits a generative request
- **WHEN** at least one ready local workflow can satisfy the request
- **THEN** Studio selects the best matching local archetype, displays its reason, phases, exact models, required inputs, estimates, and readiness, and does not generate until Play workflow is selected

#### Scenario: Operator wants expert detail
- **WHEN** the operator expands the workflow details
- **THEN** Studio shows a readable phase diagram and the exact Comfy graph details for Comfy-backed phases while keeping the default view concise

#### Scenario: Operator requests a modification
- **WHEN** the operator submits a workflow revision instruction
- **THEN** Studio shows the new proposal version and bounded diff, leaving the prior proposal and all media unchanged until Play workflow is selected

### Requirement: Artifact-led production history
Marketing Studio SHALL provide a History page derived from persisted briefs and
artifacts where each entry keeps the original prompt, frozen workflow proposal,
execution evidence, and playable video together.

#### Scenario: Completed sample is opened
- **WHEN** an operator opens a completed History entry
- **THEN** the page plays the real artifact and exposes the exact prompt, workflow archetype, recipe, model, seed, phases, and receipt without requiring navigation to another tool

#### Scenario: Planned entry has no artifact
- **WHEN** a persisted prompt has a proposal but no completed media
- **THEN** History shows the prompt and workflow state truthfully and does not render a fake or placeholder video

### Requirement: Browsable recipe and workflow libraries
Marketing Studio SHALL provide distinct Recipes and Workflows pages backed by
the existing versioned production recipe catalog and workflow-archetype
library. The pages SHALL identify readiness, runtime ownership, models,
adjustable controls, phases, and shared graph reuse without creating a second
execution framework.

#### Scenario: Operator chooses a recipe
- **WHEN** the operator selects Use recipe
- **THEN** Studio returns to Create with the recipe selected or translated into a bounded starting request and does not execute it

#### Scenario: Operator chooses a workflow
- **WHEN** the operator selects Use workflow
- **THEN** Studio returns to Create with that archetype as the intended production route and waits for the operator to plan and run it

### Requirement: Five-sample local canary
The repository SHALL include a reproducible five-sample manifest and serial
runner that exercise materially different creative prompts through the same
local proposal and execution boundary while preserving resource limits and
completed results.

#### Scenario: Five-sample run completes
- **WHEN** the five declared sample prompts have ready approved references and the host remains within its resource envelope
- **THEN** the runner persists five briefs, five frozen workflows, five real playable videos, and their receipts so the History page can show the tested set

#### Scenario: Sample run is resumed
- **WHEN** a declared sample id already has a completed playable artifact
- **THEN** the runner reuses it and continues with only the missing samples
