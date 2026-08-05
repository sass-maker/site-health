## Purpose

Turns a spoken or typed reel idea into one saved, inspectable production workflow that can run automatically or be edited and operated stage by stage.

## ADDED Requirements

### Requirement: Equivalent voice and text intake
Reel Maker SHALL accept either a typed request or a locally recorded spoken request and SHALL compile both forms into the same editable workflow schema. It SHALL show the transcript before execution and SHALL allow the operator to edit it.

#### Scenario: Spoken request becomes a workflow
- **WHEN** the operator records a request, stops recording, and accepts the local transcript
- **THEN** the system saves the source transcript and produces an editable workflow without starting generation

#### Scenario: Speech runtime is unavailable
- **WHEN** microphone capture or every configured local transcription runtime is unavailable
- **THEN** the system explains the blocker, preserves any successfully captured recording, and keeps typed creation available

### Requirement: Visible ordered production stages
Every workflow SHALL expose ordered stages for brief, cast, scenes, generation, edit, sound, export, and review with their inputs, outputs, status, runtime owner, and blockers. The operator SHALL be able to use the workflow manually even when it was created from a quick prompt.

#### Scenario: Operator opens a generated plan
- **WHEN** prompt compilation completes
- **THEN** the system opens the saved workflow with every stage visible and editable before the first generation action

#### Scenario: Operator runs one stage
- **WHEN** the operator explicitly runs a ready stage
- **THEN** only that stage and its registered action execute, and the resulting artifacts and receipt are attached to the stage

### Requirement: Safe reruns and downstream invalidation
The workflow SHALL checkpoint successful stage outputs and SHALL mark dependent later outputs stale when an upstream input changes or stage is rerun. It SHALL NOT execute arbitrary commands encoded in a prompt or workflow record.

#### Scenario: Cast changes after scenes exist
- **WHEN** the operator changes a cast member after scene prompts were compiled
- **THEN** scene generation and every dependent output are marked stale while unaffected brief evidence remains valid

#### Scenario: Failed stage is retried
- **WHEN** a stage fails after earlier stages completed
- **THEN** the operator can retry that stage without repeating valid independent stages

### Requirement: Quick mode and manual mode share one source of truth
Quick creation SHALL be an auto-advance preference over the same persisted workflow used by manual mode, not a separate opaque recipe. Before each irreversible or cost-bearing local generation step, readiness SHALL be rechecked.

#### Scenario: Quick run pauses on a blocker
- **WHEN** quick mode reaches a stage whose model, source, or required input is not ready
- **THEN** the workflow pauses at that stage, exposes the exact blocker, and retains all completed editable work
