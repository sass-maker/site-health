# Local Video Effect Control

## Purpose

Defines how creators discover and directly control locally available video
effects while preserving one validated graph contract across manual and
natural-language editing.

## Requirements

### Requirement: Capability catalog is truthful

The studio SHALL expose each registered effect with its supported parameters,
readiness, preview and render cost class, compatibility constraints, and
fallback behavior. An unavailable capability MUST remain visible with an
actionable reason and MUST NOT be presented as successfully rendered.

#### Scenario: Inspect an available effect

- **WHEN** a creator opens the effect controls
- **THEN** the studio shows the effect's valid controls and local cost posture

#### Scenario: Inspect an unavailable effect

- **WHEN** an effect requires a missing model or unsupported runtime
- **THEN** the studio identifies the blocker and prevents a misleading successful state

### Requirement: Prompt and controls share one graph

Natural-language planning and direct effect controls SHALL read and write the
same validated `EffectGraph` representation, and every direct change SHALL pass
the same effect, parameter, compatibility, and render-cost validation as a
planned change.

#### Scenario: Add an effect directly

- **WHEN** a creator adds an effect with direct controls
- **THEN** the resulting graph is validated and can be described, saved, and rendered through the same pipeline as a prompt-generated graph

#### Scenario: Adjust a planned effect

- **WHEN** a creator changes a parameter on an effect created by the planner
- **THEN** the graph records the new value and marks any prior preview stale until rerendered

### Requirement: Controls support variant-safe editing

The studio SHALL let a creator target one variant or all variants, add or
remove supported effects, and edit only schema-valid parameters without
silently altering unrelated graph nodes.

#### Scenario: Edit one variant

- **WHEN** a creator changes an effect on the selected variant
- **THEN** other variant graphs and their reproducibility identities remain unchanged

#### Scenario: Apply an effect to all variants

- **WHEN** a creator explicitly chooses all variants
- **THEN** the effect is added through independent validation for every target graph and any incompatible target is reported

### Requirement: Direct editing remains local and independent

The effect catalog and controls SHALL operate offline and SHALL NOT require Reel
Pipeline, Mashup, ComfyUI, a cloud account, or arbitrary code execution.

#### Scenario: Related products are absent

- **WHEN** Reel Pipeline and Mashup are not installed
- **THEN** the studio can still browse effects, edit graphs, validate plans, and save projects
