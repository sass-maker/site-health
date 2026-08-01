## MODIFIED Requirements

### Requirement: Factory conveyor
The factory SHALL support `plan` (generate and save N backlog ideas for a niche), `produce` (advance the next N `new` ideas through script→render, updating each idea's status on the same record), `autopilot` (discover and advance eligible lane-aware items under standing policies), and `status` (counts per pipeline stage and content lane plus recent renders and automation exceptions). Produce and Autopilot SHALL isolate per-item failures.

#### Scenario: Plan then produce
- **WHEN** `plan` saves 5 ideas and `produce --count 2` runs
- **THEN** exactly 2 ideas move to `rendered` with artifact links and 3 remain `new`

#### Scenario: Produce failure isolation
- **WHEN** one idea's render fails during a produce batch
- **THEN** other ideas still complete and the failed idea stays `new` with the error reported

#### Scenario: Autopilot runs enabled project policies
- **WHEN** `autopilot` runs with new eligible High Signal, Significant Hobbies, or major changelog sources
- **THEN** each item advances through the stages permitted by its standing policy without manual production selection

#### Scenario: Status separates lanes
- **WHEN** the factory contains project automation, operator-request, and personal-automation records
- **THEN** `status` reports counts and recent outcomes for each lane without merging their provenance

