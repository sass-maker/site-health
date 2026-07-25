## ADDED Requirements

### Requirement: Persistent Needs me items

Foundry SHALL create a Needs me item only for an owner decision,
clarification, external action, or explicit risk acceptance that blocks or
materially changes a mission.

#### Scenario: Automation requires publication approval

- **WHEN** a mission reaches a publication boundary
- **THEN** Foundry creates one deduplicated decision item containing the exact
  question, affected project, evidence, allowed responses, and consequences

#### Scenario: Routine status update arrives

- **WHEN** an event changes progress but requires no owner action
- **THEN** it appears in activity and does not create a Needs me item

### Requirement: Typed and reversible owner decisions

Decision items SHALL define allowed responses and SHALL record owner responses
as immutable decision events.

#### Scenario: Owner approves a reversible action

- **WHEN** the owner selects an allowed approval response
- **THEN** Foundry records the decision, actor, time, rationale if provided,
  scope, and downstream work newly authorized

#### Scenario: Owner reverses an earlier decision

- **WHEN** the action remains reversible and the owner changes the decision
- **THEN** Foundry appends a reversal event and retains both decisions in the
  mission timeline

### Requirement: Expiry, staleness, and deduplication

Needs me items SHALL carry a freshness or expiry policy and SHALL deduplicate
equivalent unresolved requests.

#### Scenario: Equivalent blocker is reported twice

- **WHEN** two events request the same decision for the same mission and scope
- **THEN** Foundry updates the existing item's evidence/freshness rather than
  creating duplicate owner work

#### Scenario: Decision evidence becomes stale

- **WHEN** the evidence supporting an unresolved item expires
- **THEN** Foundry marks the item stale and requires refresh before an
  irreversible action can be approved

### Requirement: No hidden authorization expansion

Resolving a decision SHALL authorize only the explicit action, target, and
scope presented to the owner.

#### Scenario: Approval covers one marketing draft

- **WHEN** the owner approves one named draft for one destination
- **THEN** the decision does not authorize additional drafts, accounts,
  schedules, or product changes
