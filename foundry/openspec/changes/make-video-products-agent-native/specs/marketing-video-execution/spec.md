## ADDED Requirements

### Requirement: Reel Pipeline exposes every registered execution capability to agents
Reel Pipeline SHALL expose catalog discovery, input schema discovery, fixture
and real readiness, validation, execution, status, artifact inspection, and
receipt inspection through one non-interactive JSON interface. Coverage SHALL
be validated against every registered recipe and adapter.

#### Scenario: Agent discovers a recipe
- **WHEN** an agent requests Reel Pipeline capabilities
- **THEN** it receives each stable recipe and variant with adapter owner, required inputs, side effects, readiness, blockers, and supported execution modes

#### Scenario: Registry and agent surface drift
- **WHEN** a recipe or adapter exists without corresponding manifest coverage
- **THEN** the Reel Pipeline agent-readiness check fails

### Requirement: Reel execution is evidence-first
Every agent-triggered Reel execution SHALL return the normalized execution
envelope, owner manifest, source and artifact provenance, validation results,
and an explicit blocker rather than silently switching execution modes.

#### Scenario: Real execution is unavailable
- **WHEN** an agent requests real execution without the required runtime or inputs
- **THEN** Reel Pipeline returns a stable blocked result and does not substitute fixture media

### Requirement: Reel Pipeline owns channel packaging and publication
Reel Pipeline SHALL expose channel discovery, package validation, draft,
schedule, publish, and remote-result inspection for configured distribution
channels. It SHALL enforce each channel's aspect ratio, duration, caption,
metadata, rights, approval, and automation-policy requirements before any
external write.

#### Scenario: Agent publishes a completed video
- **WHEN** an approved artifact satisfies a configured autonomous channel's package and rights requirements
- **THEN** Reel Pipeline performs the provider write and returns a durable receipt linking the local artifact, channel, remote post, request, and provider result

#### Scenario: Package is incompatible
- **WHEN** an artifact or metadata violates the selected channel's requirements
- **THEN** Reel Pipeline returns structured remediation requirements and performs no external write
