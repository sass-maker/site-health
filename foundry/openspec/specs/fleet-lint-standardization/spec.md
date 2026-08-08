# fleet-lint-standardization Specification

## Purpose

Define a shared, inspectable lint configuration and agent-context contract that can be piloted safely before broader Fleet adoption.

## Requirements

### Requirement: Foundry owns the shared lint baseline
Fleet SHALL keep one version-controlled lint baseline under Foundry that extends the approved upstream preset and applies documented Fleet-wide formatting, accessibility, import, and generated-output exceptions.

#### Scenario: Consumer resolves the baseline
- **WHEN** an in-Fleet Biome project opts into the shared baseline
- **THEN** its native lint command resolves the upstream preset and Fleet overrides without copying the complete rule set locally

#### Scenario: Approved local exception remains visible
- **WHEN** a project needs a deliberate rule or formatter divergence
- **THEN** the project records only that local override and the parity report identifies it for owner review

### Requirement: Adoption begins with one bounded pilot
Fleet MUST apply the shared baseline to one existing in-repo pilot before changing independent project repositories.

#### Scenario: Pilot validation succeeds
- **WHEN** the pilot adopts the shared baseline
- **THEN** its existing check command passes and no production dependency, runtime behavior, deploy command, or production configuration changes

#### Scenario: Preset produces incompatible diagnostics
- **WHEN** the shared baseline introduces diagnostics that cannot be resolved with a small behavior-preserving change
- **THEN** the pilot remains incomplete and the incompatibility is reported rather than weakening the shared baseline silently

### Requirement: Parity reporting is read-only and deterministic
Fleet SHALL provide a read-only command that inventories recognized lint configurations across active in-Fleet projects and emits stable alignment, divergence, missing-configuration, and unavailable-checkout results.

#### Scenario: Active project matches the standard
- **WHEN** an active registered project resolves the shared baseline or an approved equivalent
- **THEN** the report classifies it as aligned and names its linter and configuration path

#### Scenario: Project deliberately diverges
- **WHEN** a registered exception identifies a project-specific lint posture
- **THEN** the report classifies it as deliberate divergence and includes the recorded reason

#### Scenario: Out-of-Fleet repository is present
- **WHEN** an excluded repository exists under the workspace root
- **THEN** the parity command omits it from adoption totals and does not propose edits for it

#### Scenario: Repeated report is unchanged
- **WHEN** the project registry and lint configurations have not changed
- **THEN** repeated machine-readable reports are byte-for-byte equivalent apart from explicitly excluded observation metadata

### Requirement: Agent lint context is generated without replacing project ownership guidance
Fleet MUST use the upstream agent-generation interface through a Foundry-owned staging boundary and MUST preserve the hand-maintained Fleet and project instructions outside a clearly owned generated section or companion file.

#### Scenario: Pilot context is regenerated
- **WHEN** the context sync command runs for the pilot
- **THEN** the generated lint guidance reflects the resolved preset while the package boundary, safety rules, commands, and product instructions remain intact

#### Scenario: Generated context drifts
- **WHEN** check mode detects that tracked pilot guidance differs from a fresh generated result
- **THEN** it exits non-zero and names the stale generated artifact without rewriting files

### Requirement: Wider rollout remains separately tracked
Fleet MUST keep adoption outside the pilot as repository-scoped GitHub follow-up issues and MUST NOT mutate independent product repositories as part of the pilot change.

#### Scenario: Pilot is accepted
- **WHEN** the pilot checks, parity report, and context check pass
- **THEN** the change records bounded follow-up issues for remaining project groups and can close without completing fleet-wide adoption
