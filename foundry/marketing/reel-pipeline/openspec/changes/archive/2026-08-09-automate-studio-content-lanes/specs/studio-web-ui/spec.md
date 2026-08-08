## ADDED Requirements

### Requirement: Content lane and automation observability
Marketing Studio SHALL group or filter productions by Project Autopilot, Ask Me, and Personal Automations and SHALL show each item's scope, trigger, source, policy, selected recipe, spend posture, run state, and next recovery action. The UI SHALL remain an optional monitor and override surface rather than a prerequisite for policy-owned production.

#### Scenario: Operator reviews project automation
- **WHEN** the operator opens Productions after unattended High Signal, Significant Hobbies, or changelog runs
- **THEN** Project Autopilot shows each production with project attribution, policy, recipe, quality, distribution state, and any exception

#### Scenario: Operator-request content is present
- **WHEN** content was created through a direct agent or Studio conversation
- **THEN** Ask Me shows it separately even when it has project scope

#### Scenario: No dashboard session exists
- **WHEN** an enabled automation policy runs while no browser is open
- **THEN** the run continues normally and the next dashboard load reads its persisted receipts and state

