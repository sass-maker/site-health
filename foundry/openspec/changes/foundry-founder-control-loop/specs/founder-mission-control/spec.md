## ADDED Requirements

### Requirement: Canonical objective and mission model

Foundry SHALL represent owner goals as objectives and bounded executions as
missions linked to canonical Fleet project identifiers.

#### Scenario: Create a mission for one project

- **WHEN** the owner accepts a draft mission naming a known project
- **THEN** Foundry records its objective, intended outcome, project identifier,
  constraints, completion criteria, authority boundary, and initial state

#### Scenario: Request names an unknown project

- **WHEN** mission intake cannot resolve a project through the canonical registry
- **THEN** the mission remains a draft and requests owner clarification rather
  than creating a new project identity

### Requirement: Narrow natural-language mission intake

Foundry SHALL turn a concise owner request into a reviewable mission draft
without treating the intake as a general chat history.

#### Scenario: Draft from an owner request

- **WHEN** the owner submits a natural-language request
- **THEN** Foundry proposes an outcome, scope, constraints, evidence required,
  approval boundaries, and completion criteria before execution

#### Scenario: AI drafting is unavailable

- **WHEN** no AI adapter is configured
- **THEN** deterministic intake remains available and the request is not sent
  to an unconfigured or paid provider

### Requirement: Accountable actor state

Foundry SHALL identify the factual owner, agent, automation, or provider actor
responsible for each mission event and current unit of work.

#### Scenario: Automation starts work

- **WHEN** a registered automation begins an accepted mission step
- **THEN** the mission shows the automation identity, declared authority,
  start time, current state, and latest receipt

#### Scenario: Actor has no current receipt

- **WHEN** actor state is stale beyond its configured freshness window
- **THEN** the interface marks it stale and does not imply that work is active

### Requirement: Owner-first home

The private home SHALL prioritize Needs me, Working now, What shipped, What
changed, and Recommended next in that order of meaning rather than exposing
infrastructure inventory as the primary product.

#### Scenario: Owner opens Foundry

- **WHEN** the owner opens the home page
- **THEN** each section shows real current data or an honest empty state and
  links to the originating mission and evidence

### Requirement: Mission timeline and deliverables

Each mission SHALL expose a chronological timeline of work, decisions,
deliverables, evidence, blockers, and measured outcomes.

#### Scenario: Mission completes

- **WHEN** all declared completion criteria are supported by evidence
- **THEN** Foundry records a completion event and presents the deliverables and
  outcome without deleting intermediate failures or decisions

#### Scenario: Work claims completion without evidence

- **WHEN** an actor reports completion but required evidence is absent
- **THEN** the mission remains awaiting verification and appears in Needs me or
  Working now according to the missing evidence owner

### Requirement: Schedules and daily summary

Foundry SHALL present enabled scheduled work and generate a concise daily owner
summary from mission and evidence state.

#### Scenario: Daily summary is generated

- **WHEN** the configured daily summary window closes
- **THEN** the summary reports decisions needed, active work, completed
  outcomes, material changes, and failed/stale schedules without raw log noise

#### Scenario: Fresh clone has no activated schedules

- **WHEN** Foundry runs on a host that has not passed activation checks
- **THEN** schedule intent is visible but no job is represented as enabled
