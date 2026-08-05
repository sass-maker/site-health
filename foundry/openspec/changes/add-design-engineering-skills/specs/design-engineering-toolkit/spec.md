## Purpose

Define focused, executable design-engineering workflows for reference research,
component pattern mining, web 3D delivery, and creative browser effects.

## ADDED Requirements

### Requirement: Design-engineering requests route to one focused workflow
The toolkit SHALL classify a request by its primary job and load only the
focused workflow and references needed for that job.

#### Scenario: Request has one primary job
- **WHEN** an agent receives a request for inspiration, component research, web 3D, or creative effects
- **THEN** it routes to the matching focused skill without loading unrelated category guidance

#### Scenario: Request spans multiple jobs
- **WHEN** a request genuinely requires more than one focused workflow
- **THEN** the agent orders the workflows by dependency and names the handoff between their outputs

### Requirement: Project identity and scope remain authoritative
Every focused workflow MUST read the nearest project instructions and relevant
design context before recommending or changing a design surface.

#### Scenario: External reference conflicts with tracked direction
- **WHEN** a tool, gallery, component, or effect conflicts with the project's tracked visual language
- **THEN** the project direction wins unless the owner has approved or delegated an overhaul

### Requirement: Inspiration research produces transferable evidence
The inspiration workflow SHALL gather current, attributable references and
distill principles rather than copying another product's visual language,
content, assets, or proprietary implementation.

#### Scenario: Direction research is requested
- **WHEN** the agent researches inspiration for a surface
- **THEN** it reports the search frame, named references, anti-references, transferable principles, provenance, and unresolved constraints

#### Scenario: An overhaul receipt is active
- **WHEN** research supports an active Fleet overhaul workflow
- **THEN** it narrows the evidence to two or three named references suitable for the existing direction receipt and keeps direction probes distinct from source screenshots

### Requirement: Component research covers complete behavior
The component-pattern workflow MUST compare mature implementations and produce
project-adapted guidance for anatomy, states, input methods, accessibility,
responsive behavior, motion, data boundaries, and failure conditions.

#### Scenario: An unfamiliar component is requested
- **WHEN** the agent researches a component not already established in the project
- **THEN** it compares two or three relevant implementations and distinguishes transferable behavior from source-specific styling

#### Scenario: Implementation is also requested
- **WHEN** the user asks the agent to implement the researched component
- **THEN** it reuses existing project primitives and dependencies, applies the smallest coherent change, and validates the component's relevant states and interactions

### Requirement: Web 3D uses the least expensive sufficient rendering tier
The web-3D workflow SHALL choose among static imagery, CSS, SVG, Canvas, WebGL,
and an existing project 3D stack based on the experience rather than defaulting
to a new framework.

#### Scenario: A 3D treatment does not require real-time rendering
- **WHEN** a static or lightweight technique can deliver the intended experience
- **THEN** the workflow selects that cheaper tier and does not add a WebGL production dependency

#### Scenario: Real-time 3D is justified
- **WHEN** the experience requires real-time 3D
- **THEN** the workflow records asset provenance, optimization evidence, loading behavior, interaction controls, fallback behavior, and browser performance evidence

### Requirement: Creative effects are purposeful, accessible, and bounded
The creative-effects workflow MUST tie animation, SVG, Canvas, shader, pointer,
or scroll effects to a named communication or interaction purpose and define
reduced-motion, input, visibility, and low-capability behavior.

#### Scenario: An expressive effect is requested
- **WHEN** the agent shapes or builds a creative browser effect
- **THEN** it records the effect's purpose, rendering tier, activation, exit, input model, fallback, and measurable performance budget before implementation

#### Scenario: The effect harms core use
- **WHEN** the effect obscures content, traps input, destabilizes layout, or exceeds the agreed performance or accessibility boundary
- **THEN** the workflow simplifies, disables, or removes the effect rather than treating spectacle as the primary success criterion

### Requirement: Tool availability and external claims are verified
Focused workflows SHALL treat external directories as discovery sources and
MUST verify drift-prone availability, pricing, licensing, and compatibility
claims before relying on them.

#### Scenario: A required local tool is absent
- **WHEN** diagnostics show that a required executable or project dependency is unavailable
- **THEN** the agent reports the missing capability and requests approval before adding a production dependency or paid tool
