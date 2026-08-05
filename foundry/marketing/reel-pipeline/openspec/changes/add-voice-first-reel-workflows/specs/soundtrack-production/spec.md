## Purpose

Makes music an intentional production stage with legally distinct source lanes, useful creative controls, synchronized previews, and reproducible mix evidence.

## ADDED Requirements

### Requirement: Explicit soundtrack source lanes
Every soundtrack selection SHALL use exactly one source lane: operator-owned local audio, official platform sound, generated music, or procedural draft. The UI and production manifest SHALL identify the active lane and SHALL NOT present procedural draft audio as final-quality music.

#### Scenario: Operator supplies owned music
- **WHEN** the operator selects a supported local audio file and records its ownership or license posture
- **THEN** the system hashes the file, probes it, and makes it available for an embedded final mix

#### Scenario: Operator selects a commercial platform sound
- **WHEN** the operator chooses an official platform sound reference without an embeddable cleared master
- **THEN** the system creates a silent upload master plus timing instructions for adding that sound in the official platform and does not download or embed the commercial recording

### Requirement: Generated music controls and variations
Generated music SHALL accept duration, prompt, instrumental or vocal intent, BPM, key, meter, and optional reference-audio controls supported by the selected runtime. It SHALL allow multiple labeled variations to be previewed and one to be selected before the final mix.

#### Scenario: Instrumental bed is generated
- **WHEN** the operator requests a 20-second instrumental funk bed at 118 BPM and confirms a ready generated-music runtime
- **THEN** the system produces one or more previewable variations with runtime, model, prompt, seed, duration, and file evidence

#### Scenario: Unsupported control is requested
- **WHEN** a selected runtime cannot honor a requested music control
- **THEN** the system identifies the unsupported control before generation rather than silently ignoring it

### Requirement: Music runtime installation gate
Generated-music model weights SHALL NOT be installed until the selected official Apple-silicon runtime source builds successfully and passes its available no-weight readiness probes. Model download SHALL require an explicit operator action after expected disk use, license, source revision, and target paths are shown.

#### Scenario: Runtime preflight fails
- **WHEN** the native or MLX runtime cannot build or start its command surface on the local Mac
- **THEN** model weights are not downloaded and the exact preflight failure is retained

#### Scenario: Runtime preflight passes
- **WHEN** the official runtime builds and its command or server readiness probe succeeds without model weights
- **THEN** the system may offer the separately confirmed model-download action with size, license, and path details

### Requirement: Reproducible soundtrack mix
The sound stage SHALL support trim, offset, loop, fades, gain, and narration ducking and SHALL write a manifest for the selected source plus every mix transform. Export quality evidence SHALL verify the expected audio stream and duration.

#### Scenario: Music is mixed under narration
- **WHEN** the operator exports a reel with narration and selected music
- **THEN** the final artifact uses the saved gain and ducking settings and the quality receipt reports an audio stream of the expected duration
