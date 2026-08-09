## Purpose

Defines a safe, discoverable, machine-readable contract through which authorized
AI agents operate Fleet video products without UI automation or arbitrary code.

## ADDED Requirements

### Requirement: Products publish complete capability manifests
Each video product SHALL publish a versioned machine-readable manifest covering
every supported agent operation, its input schema, side-effect class, readiness,
resource posture, and result schema. Manifest completeness SHALL be validated
against the product's registered commands, effects, recipes, or stages.

#### Scenario: Agent discovers a product
- **WHEN** an agent requests the product manifest
- **THEN** it receives enough structured information to select and validate any supported operation without reading source code or prose documentation

#### Scenario: A capability lacks an operation
- **WHEN** a registered product capability has no agent operation or explicit human-only reason
- **THEN** capability validation fails and the product cannot claim complete agent readiness

### Requirement: Operations use one versioned envelope
Every agent request and result SHALL use a versioned JSON envelope containing
product, operation, operation ID, schema version, inputs or result, lifecycle
state, timestamps, provenance, warnings, artifacts, and stable errors.

#### Scenario: Successful read operation
- **WHEN** an agent invokes a valid read-only operation
- **THEN** stdout contains exactly one successful result envelope and diagnostics do not corrupt the JSON channel

#### Scenario: Invalid request
- **WHEN** an agent supplies an unknown operation, field, enum, or out-of-range value
- **THEN** the product returns a non-zero exit and one result envelope with a stable error code, field path, retryability, and actionable message

### Requirement: Side effects are explicit and controllable
The contract SHALL distinguish read, plan, write, render, and external side
effects. Mutating or render operations SHALL support validation without
execution, operation identity, cancellation where execution is asynchronous,
and idempotency protection where repeating work could duplicate artifacts.

#### Scenario: Agent validates expensive work
- **WHEN** an agent invokes a render-capable operation in validation mode
- **THEN** it receives normalized inputs, blockers, fallbacks, and a resource estimate without producing media

#### Scenario: Agent repeats an identified mutation
- **WHEN** an agent retries a completed operation with the same idempotency key and inputs
- **THEN** the product returns the prior result or a stable conflict instead of silently duplicating work

### Requirement: Operation evidence is inspectable
Every completed operation SHALL expose planner/runtime provenance, normalized
parameters, warnings and degradations, artifact identities and hashes when
artifacts exist, and the validation evidence used to declare success.

#### Scenario: Agent verifies a result
- **WHEN** an agent inspects a completed operation
- **THEN** it can explain what ran, what changed, what degraded, and which artifact corresponds to the validated request

### Requirement: Safety boundaries remain closed
Agent operations MUST resolve only registered capabilities and MUST NOT accept
shell commands, executable source, arbitrary plugins, unapproved paths, hidden
network uploads, or model-authored code.

#### Scenario: Request attempts arbitrary execution
- **WHEN** an operation input contains an unsupported command or unregistered capability
- **THEN** validation rejects it before any subprocess, renderer, or model execution begins

### Requirement: External publication follows configured policy
An agent MAY package, draft, schedule, or publish completed video only through a
configured channel whose machine-readable policy explicitly allows the
requested action. Channel policies SHALL distinguish `draft_only`,
`approval_required`, and `autonomous`, and every external write SHALL return a
durable provider receipt.

#### Scenario: Autonomous channel is configured
- **WHEN** a validated artifact meets the channel package requirements and the configured policy is `autonomous`
- **THEN** the agent may publish or schedule it and receives the provider identity, remote post identity, terminal state, timestamps, and normalized request evidence

#### Scenario: Approval is required
- **WHEN** the configured policy is `approval_required` and no valid approval receipt is supplied
- **THEN** the agent may prepare a draft but publication returns a stable approval-required result without an external post

#### Scenario: No channel is configured
- **WHEN** an agent requests publication without a matching configured channel
- **THEN** the operation fails closed with a stable channel-not-configured result and retains the local artifact
