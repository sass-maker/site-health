## Purpose

Defines reproducible assembly of many short local generations into a coherent
two- to three-minute episode with persistent characters, voices, and music.

## ADDED Requirements

### Requirement: Episode manifest
The system SHALL normalize an episode request into a saved manifest containing
an ordered shot list, target duration, named characters, continuity references,
dialogue assignments, music direction, recipe identifiers, exposed recipe
inputs, fixed seeds, and final assembly settings before generation begins.

#### Scenario: Operator requests an episode
- **WHEN** the operator supplies a concept, target duration, and one or more characters
- **THEN** the system saves an editable shot-by-shot episode manifest without starting model execution

#### Scenario: Operator regenerates one shot
- **WHEN** the operator changes a prompt, reference, or seed for one shot
- **THEN** the system invalidates only that shot and dependent assembly output while preserving accepted shots

### Requirement: Persistent character directory
The system SHALL resolve episode cast members through the existing character
directory and SHALL persist approved visual references, appearance notes,
voice assignment, age declaration, and per-character continuity evidence.

#### Scenario: Character appears in multiple shots
- **WHEN** an episode assigns the same directory character to multiple shots
- **THEN** each applicable recipe run receives the approved references and the final receipt links every appearance to that character record

#### Scenario: Required reference is missing
- **WHEN** a shot requires strict character continuity but no approved reference is available
- **THEN** generation remains blocked with an actionable missing-reference message

### Requirement: Voice and music timeline
The system SHALL support fixed local voice assignments for dialogue and a
locally generated or operator-cleared music cue, and SHALL record every audio
input, timing decision, voice identifier, generation seed, and mix setting.

#### Scenario: Local dialogue and original score are ready
- **WHEN** all dialogue lines and the selected original music cue are available
- **THEN** the system assembles them against the shot timeline and records their hashes and timing in the episode receipt

#### Scenario: Audio rights or runtime is not ready
- **WHEN** an episode selects external audio without evidence or a local audio runtime that has not passed readiness
- **THEN** final assembly is blocked without silently substituting procedural or platform audio

### Requirement: Deterministic resumable assembly
The system SHALL render shots serially, reuse completed shots whose input
signatures still match, and produce a final playable video plus manifest and
quality evidence through deterministic local assembly.

#### Scenario: Interrupted episode resumes
- **WHEN** generation stops after some shots have completed
- **THEN** the next run reuses matching completed artifacts and continues from the first missing or invalidated shot

#### Scenario: Episode completes
- **WHEN** all required shots and audio inputs pass validation
- **THEN** the system writes the final MP4, exact timeline, input and output hashes, recipe receipts, and review state without publishing it

