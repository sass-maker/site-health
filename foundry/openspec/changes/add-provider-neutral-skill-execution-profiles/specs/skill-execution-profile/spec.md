## ADDED Requirements

### Requirement: Provider-neutral skill profile
Every Fleet-owned skill SHALL carry a versioned execution profile that declares
recommended and minimum intelligence and reasoning capabilities without naming
a model provider or model identifier.

#### Scenario: Inspect a skill package
- **WHEN** an operator or host inspects a Fleet-owned skill
- **THEN** it can read the skill's recommended and minimum capability tiers,
  degradation policy, and rationale without loading provider-specific routing

### Requirement: Catalog profile discovery
The Fleet capability catalog SHALL expose a valid execution profile with every
skill record while keeping non-skill capability records unchanged.

#### Scenario: Resolve skill metadata
- **WHEN** a host retrieves a skill from the Fleet capability catalog
- **THEN** the response includes the complete provider-neutral execution
  profile before the skill body is mounted

### Requirement: Profile integrity
The capability catalog doctor MUST fail when a Fleet-owned skill has no
execution profile, has malformed profile JSON, uses unknown capability values,
or declares minimum quality above recommended quality.

#### Scenario: Detect an invalid profile
- **WHEN** catalog doctor inspects a skill whose minimum reasoning exceeds its
  recommended reasoning
- **THEN** doctor reports a deterministic profile error and returns an
  unhealthy verdict

### Requirement: Runtime compatibility decision
The system SHALL compare a skill profile with an abstract runtime capability
descriptor and return a deterministic recommendation without invoking or
selecting a provider model.

#### Scenario: Runtime meets the recommendation
- **WHEN** runtime intelligence and reasoning meet or exceed the skill's
  recommended values
- **THEN** the decision is `recommended` and execution may continue

#### Scenario: Runtime falls below the minimum
- **WHEN** either runtime capability is below the skill minimum
- **THEN** the decision follows the profile's `allow`, `ask`, or `deny`
  degradation policy as `degraded`, `approval_required`, or
  `redispatch_required`

### Requirement: Host retains model authority
Execution profiles SHALL remain advisory capability requirements and MUST NOT
override owner policy, administrator policy, provider availability, cost
controls, or explicit runtime selection.

#### Scenario: Host maps a capability tier
- **WHEN** a host receives a `redispatch_required` decision
- **THEN** the host chooses or declines a compatible runtime according to its
  own provider mappings and policies
