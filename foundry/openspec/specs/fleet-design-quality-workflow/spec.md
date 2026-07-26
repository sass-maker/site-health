# fleet-design-quality-workflow Specification

## Purpose

Define the Fleet-wide contract that protects project-specific visual identity,
requires owner alignment for substantial direction changes, and makes
meaningful UI completion reproducible through evidence, quality, and acceptance
gates.

## Requirements
### Requirement: Fleet classifies meaningful visual work before implementation
Fleet SHALL classify meaningful visual work as `preserve` or `overhaul` before
implementation begins.

#### Scenario: Existing identity is retained
- **WHEN** visual work is bounded to an existing design language
- **THEN** the workflow uses the preserve lane, follows tracked design context, and records before-state evidence

#### Scenario: New visual language is introduced
- **WHEN** work creates or materially replaces a visual language
- **THEN** the workflow uses the overhaul lane and blocks implementation until direction approval is recorded

### Requirement: Overhaul direction requires concrete owner alignment
The overhaul lane MUST use named references, materially distinct direction
evidence, and explicit owner approval or delegation before code is written.

#### Scenario: Direction is approved
- **WHEN** the owner selects one of two or three direction probes
- **THEN** the selected direction, references, evidence paths, and approval are recorded in the review receipt

#### Scenario: Direction remains pending
- **WHEN** no direction is approved or delegated
- **THEN** receipt validation fails before implementation can be considered approved

### Requirement: Design completion is evidence-gated
Fleet MUST validate a durable project review receipt before meaningful visual
work is considered complete.

#### Scenario: Review evidence clears the gate
- **WHEN** required design context, viewport screenshots, minimum critique and audit scores, zero unresolved P0/P1 findings, and a passing project check are recorded
- **THEN** deterministic receipt validation succeeds

#### Scenario: Material finding remains unresolved
- **WHEN** the receipt records one or more unresolved P0 or P1 findings
- **THEN** validation fails and names the severity gate

#### Scenario: Browser coverage is incomplete
- **WHEN** evidence omits any configured viewport width
- **THEN** validation fails and names each missing viewport

### Requirement: Owner satisfaction closes the workflow
Fleet MUST record final owner feedback as `keep`, `close`, `wrong-lane`, or
`delegated`, and SHALL accept only `keep` or explicit `delegated` judgment as a
completed design.

#### Scenario: Owner wants another iteration
- **WHEN** final feedback is `close` or `wrong-lane`
- **THEN** validation fails and the feedback remains available to guide the next iteration

#### Scenario: Owner delegates final judgment
- **WHEN** the owner explicitly delegates final visual judgment
- **THEN** the receipt records `delegated` and may pass the acceptance gate if every objective gate passes

### Requirement: Aesthetic heuristics remain advisory
Fleet SHALL record deterministic aesthetic-detector findings without allowing
them alone to block design completion.

#### Scenario: Detector contradicts an intentional design decision
- **WHEN** a detector warning exists but every objective and owner gate passes
- **THEN** receipt validation succeeds while preserving the warning as advisory evidence

### Requirement: Impeccable installation is reproducible
Fleet MUST pin both the Impeccable npm package version and installed skill
payload version in canonical policy, and MUST detect or repair an installed
payload version that differs from the payload pin.

#### Scenario: Installed version matches policy
- **WHEN** agent-stack skill installation runs with the pinned payload version already present
- **THEN** it leaves the installation unchanged

#### Scenario: Installed version drifts
- **WHEN** the installed skill reports a different payload version
- **THEN** self-check fails and skill installation uses the pinned npm package to reinstall the exact pinned payload version

### Requirement: Fleet design standards prefer project identity over a house style
Fleet design guidance MUST treat an existing `DESIGN.md` and approved direction
as authoritative over generic palettes, component-gallery preferences, or
detector aesthetics.

#### Scenario: Generic recommendation conflicts with project direction
- **WHEN** a reusable component or aesthetic heuristic conflicts with tracked project design context
- **THEN** the project-specific direction wins unless the owner approves an overhaul
