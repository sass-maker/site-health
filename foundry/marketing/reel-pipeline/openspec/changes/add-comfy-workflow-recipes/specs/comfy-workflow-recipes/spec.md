## Purpose

Defines how trusted local Comfy workflows become repeatable, resource-bounded
video recipes without allowing arbitrary graphs or machine-wide installers.

## ADDED Requirements

### Requirement: Versioned workflow recipe
The system SHALL represent every runnable Comfy workflow as a versioned recipe
that identifies its source, graph hash, allowed built-in nodes, runtime and
model revisions, model hashes and licenses, locked defaults, exposed inputs,
seed policy, and expected disk and memory envelope.

#### Scenario: Recipe is inspected before execution
- **WHEN** an operator selects a local workflow recipe
- **THEN** the system shows its model, mode, readiness, resource envelope, adjustable inputs, and provenance before enabling generation

#### Scenario: Recipe input is adjusted
- **WHEN** the operator changes an exposed prompt, reference, aspect ratio, duration, motion strength, or seed
- **THEN** the system produces a normalized run request without changing locked graph structure or hidden node settings

### Requirement: Vetted workflow ingestion
The system SHALL accept only workflow sources whose graph can be reduced to an
allowlisted set of locally available built-in nodes and SHALL NOT automatically
install custom nodes or execute arbitrary uploaded graph code.

#### Scenario: Official MP4 embeds a supported graph
- **WHEN** an operator imports a Comfy-generated MP4 whose embedded prompt uses only allowlisted nodes
- **THEN** the system extracts a candidate recipe, records the source and graph hash, and requires an explicit save before it becomes selectable

#### Scenario: Workflow needs a custom node
- **WHEN** an imported graph names a node outside the allowlist
- **THEN** the system marks the workflow unsupported and identifies the node without installing or running it

### Requirement: Bounded workflow library
The system SHALL expose a versioned library of production archetypes that
describe their intended use, phase sequence, exact recipe and model bindings,
required inputs, adjustable controls, quality lane, resource posture, and
truthful readiness. Library breadth MAY reuse one vetted graph across distinct
production archetypes but SHALL identify the shared graph and SHALL NOT claim a
new model or executable graph where none exists.

#### Scenario: AI selects a workflow archetype
- **WHEN** a request matches a ready library archetype
- **THEN** the system persists a proposal naming the selected archetype, its selection reason, exact recipes and models, phases, required inputs, readiness, and resource limits without starting execution

#### Scenario: No ready local workflow matches
- **WHEN** no ready local archetype can satisfy the requested output
- **THEN** the proposal names the blocker and an honest alternative without silently routing to an external or non-executing workflow

### Requirement: Inspectable and revisable proposal
The system SHALL let the operator inspect the human-readable production phases,
model and recipe versions, resource limits, Comfy node summary, and raw Comfy
API graph before execution, and SHALL preserve every proposal revision and its
bounded diff.

#### Scenario: Operator expands a proposed workflow
- **WHEN** the proposal contains a Comfy-backed phase
- **THEN** the system shows the exact node types, connections, locked values, adjustable inputs, graph hash, and exportable raw graph without requiring execution

#### Scenario: Operator revises through a prompt
- **WHEN** the operator asks to change duration, pacing, shot grammar, quality lane, seed, or another declared plan field
- **THEN** the system creates a new proposal version, shows the changed fields, preserves prior versions, and revalidates readiness without executing media

#### Scenario: Operator plays a proposal
- **WHEN** the operator explicitly plays the current ready proposal version
- **THEN** the system freezes that version, revalidates its recipes and resource envelope, and invokes only the existing registered executors

### Requirement: Guarded serial execution
The system SHALL submit at most one local Comfy render at a time, SHALL refuse
execution when projected disk use would exceed 85 percent, and SHALL interrupt
an active run when system RAM use reaches 90 percent.

#### Scenario: Ready LTX preview recipe runs
- **WHEN** the official distilled LTX 2B recipe, its reference image, and its pinned models are ready on a compatible Apple Silicon host
- **THEN** the system submits the normalized graph to localhost, monitors it, and returns a playable preview MP4 plus a reproducibility receipt

#### Scenario: Ready LTX final recipe runs
- **WHEN** the pinned MLX LTX 2.3 recipe, its reference image, and its pinned models are ready on a compatible Apple Silicon host
- **THEN** the system runs the existing Local Video Forge boundary and returns a playable final-quality MP4 plus a reproducibility receipt

#### Scenario: Resource ceiling would be crossed
- **WHEN** preflight or active monitoring observes a configured disk or memory ceiling
- **THEN** the system refuses or interrupts the run, preserves diagnostic evidence, and does not start another job

### Requirement: Truthful model qualification
The system SHALL keep a model out of automatic selection unless a real local
canary has completed within its declared compatibility and resource envelope.

#### Scenario: MiniMax H3 needs CPU fallback
- **WHEN** H3 requires unsupported MPS operations and its fallback cannot finish a practical canary
- **THEN** H3 remains visible as an explicit specialist option with its blocker and is not selected automatically

#### Scenario: LTX 2B canary passes but misses the quality bar
- **WHEN** LTX 2B completes a real MPS canary within the configured limits but the operator classifies its quality as preview-only
- **THEN** its recipe becomes eligible for automatic local preview selection but not final or hero selection

#### Scenario: LTX 2.3 owns final output
- **WHEN** final or hero quality is requested on this host
- **THEN** automatic selection chooses the pinned MLX LTX 2.3 recipe only when its runtime and model readiness pass
