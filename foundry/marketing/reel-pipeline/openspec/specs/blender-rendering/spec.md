# blender-rendering Specification

## Purpose
Define the safe, deterministic local Blender boundary used to generate literal
visual plates with inspectable provenance.

## Requirements

### Requirement: Blender runtime capability
The renderer SHALL detect a compatible Blender 5.2 runtime, report its exact
version and executable, and expose truthful readiness before a Blender-backed
run begins.

#### Scenario: Compatible runtime is installed
- **WHEN** Blender 5.2 responds to the capability probe
- **THEN** the renderer reports ready with the exact version and executable used for subsequent renders

#### Scenario: Runtime is absent or incompatible
- **WHEN** Blender is missing or outside the supported compatibility range
- **THEN** the renderer reports an actionable blocker and does not fall back while claiming Blender output

### Requirement: Validated Blender scene manifest
The Blender adapter SHALL accept only a bounded JSON scene manifest containing
allowlisted primitives, materials, lights, cameras, motions, frame counts,
dimensions, and run-directory output paths.

#### Scenario: Valid literal scene is submitted
- **WHEN** a literal scene uses only allowed manifest values within configured bounds
- **THEN** the adapter writes a normalized manifest and hashes it before invoking Blender

#### Scenario: Unsafe input is submitted
- **WHEN** a manifest contains arbitrary code, add-ons, external file paths, parent-directory traversal, unknown object types, or values outside safety bounds
- **THEN** validation fails before Blender starts

### Requirement: Safe headless execution
The Blender adapter SHALL launch the runtime without a shell in background
factory-startup mode, with automatic script execution disabled, and SHALL run
only the repository-owned scene builder against the normalized manifest.

#### Scenario: Blender process starts
- **WHEN** a validated render request is confirmed
- **THEN** the recorded process arguments include background, factory-startup, and disable-autoexec controls plus the repository-owned builder and normalized manifest

#### Scenario: Generated Python is supplied
- **WHEN** a caller attempts to supply Python source or select another script
- **THEN** the adapter rejects the request before process creation

### Requirement: Standard Blender render result
The Blender adapter SHALL return the existing render-result contract with
visual artifacts, logs, duration, engine version, manifest hash, artifact
hashes, and success or failure state.

#### Scenario: Visual plate succeeds
- **WHEN** Blender exits successfully and produces every expected frame or plate
- **THEN** the adapter validates the artifacts and returns standard metadata consumable by Content Factory and the lyric compositor

#### Scenario: Artifact is incomplete
- **WHEN** Blender exits successfully but expected outputs are missing, empty, or outside the run directory
- **THEN** the adapter marks the render failed and does not expose the output as production-ready

#### Scenario: Blender process fails
- **WHEN** Blender times out or exits non-zero
- **THEN** the adapter records sanitized diagnostics, leaves other renderers unaffected, and returns an actionable failure

### Requirement: Deterministic Blender caching
The system SHALL cache Blender visual outputs by compatible runtime version,
normalized manifest hash, builder version, and render settings, and SHALL never
reuse a cache entry whose provenance differs.

#### Scenario: Identical scene is requested
- **WHEN** an identical validated scene is requested with the same compatible runtime and builder
- **THEN** the adapter may reuse the verified cached artifact and records the cache hit

#### Scenario: Runtime or manifest changes
- **WHEN** the Blender version, builder version, manifest, or render settings change
- **THEN** the adapter produces a new cache identity and does not reuse the previous plate

### Requirement: Blender request-to-artifact smoke
The repository SHALL provide an offline adapter smoke and a real-runtime canary
covering capability probe, request, progress, artifact, and provenance.

#### Scenario: Offline smoke runs in tests
- **WHEN** automated tests run without Blender installed
- **THEN** an injected process fixture verifies command posture and standard artifact handling without claiming a real render

#### Scenario: Real-runtime canary runs
- **WHEN** a developer explicitly runs the Blender canary on a compatible host
- **THEN** the command renders a real visual artifact, validates it, and records the installed runtime version
