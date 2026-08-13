# cross-org-priority-queue Specification

## Purpose
Provide one GitHub-native, manually rankable queue for an operator's open authored issues across every accessible repository and organization without replacing repository Issues as the operational source of truth.
## Requirements
### Requirement: Cross-organization authored issue aggregation
The queue SHALL contain every accessible open GitHub issue authored by the configured operator, regardless of repository or organization owner, and SHALL keep the original issue as the item rather than creating a duplicate task.

#### Scenario: Issue belongs to another organization
- **WHEN** the operator has access to an open authored issue in an organization different from the Project owner
- **THEN** synchronization adds the original issue to the central queue

#### Scenario: Issue is not accessible
- **WHEN** an authored issue is outside the authenticated operator's GitHub visibility
- **THEN** the queue neither exposes nor fabricates that issue

### Requirement: Exact manual queue order
The active Queue view SHALL group items by Priority, preserve manual order inside each group, and SHALL allow the operator to insert an issue between any two items in the same priority band by moving it directly.

#### Scenario: Insert an item in the middle
- **WHEN** the operator drags an issue between two existing rows in its priority band
- **THEN** the issue remains in that exact relative position after the Project is refreshed

#### Scenario: Synchronize after manual reordering
- **WHEN** synchronization runs after the operator has manually reordered existing items
- **THEN** synchronization preserves the relative order of every existing queue item

### Requirement: Priority metadata does not control rank
The Project SHALL expose a project-local Priority field, the active Queue SHALL group by that field, and the view MUST NOT configure a sort that disables manual ordering inside groups.

#### Scenario: Change an item's priority band
- **WHEN** the operator changes an issue from one Priority value to another
- **THEN** GitHub moves the issue to the matching group and the review remains incomplete until the operator places it intentionally within that band

#### Scenario: View issues by priority band
- **WHEN** the operator opens a priority-grouped or priority-filtered view
- **THEN** issues are presented using the shared project-local Priority values across organizations

### Requirement: Evidence-based priority review
The queue SHALL apply the operator's declared outcome order of Finish, then Market, then Measure; SHALL use issue body, labels, linked-work status, blockers, and dependencies as evidence; and MUST NOT assign priority from a title-only or age-only heuristic.

#### Scenario: Work is already in progress
- **WHEN** an issue has a linked open or merged pull request and no unresolved blocker
- **THEN** it is considered for the deliberately small `P0 — Now` finishing set before unstarted work

#### Scenario: Work is blocked or deferred
- **WHEN** an issue is labelled `blocked` or `deferred`
- **THEN** it is not assigned `P0 — Now` unless the issue itself removes the blocker and the operator chose it as current work

#### Scenario: Newly synchronized issue has not been reviewed
- **WHEN** synchronization adds a missing issue
- **THEN** Priority and Reasoning complexity remain unset so the item is visibly unreviewed rather than silently guessed

### Requirement: Reasoning complexity is independent of effort
The Project SHALL expose a project-local Reasoning complexity field from `R0 — Mechanical` through `R4 — Novel`, and SHALL classify the intelligence and ambiguity needed rather than duration, implementation size, or repetitive volume.

#### Scenario: Large repetitive task
- **WHEN** a task is lengthy but follows an exact deterministic checklist
- **THEN** it remains `R0 — Mechanical` or `R1 — Routine`

#### Scenario: Small architecture decision
- **WHEN** a small code change requires cross-system tradeoffs or novel investigation
- **THEN** it may be `R3 — Systems` or `R4 — Novel` despite requiring little implementation effort

### Requirement: Idempotent synchronization
Synchronization SHALL add only missing open authored issues, SHALL leave existing Project fields and manual positions unchanged, and SHALL produce a concise summary of discovered, added, unchanged, and failed items.

#### Scenario: Run synchronization twice
- **WHEN** the issue set has not changed between two synchronization runs
- **THEN** the second run adds no duplicate items and reports all discovered items as unchanged

#### Scenario: Discover a new issue
- **WHEN** a newly opened authored issue is visible to the authenticated operator
- **THEN** synchronization adds it without changing the order or metadata of existing items and reports it as requiring review

#### Scenario: Partial GitHub failure
- **WHEN** one issue cannot be added because of permissions or an API failure
- **THEN** synchronization continues with independent items, reports the failed issue without sensitive authentication data, and exits unsuccessfully

### Requirement: Closed issue handling
Closed issues SHALL leave the active Queue view without deleting or modifying their repository history, and reopening a still-linked issue SHALL make it eligible for the active queue again.

#### Scenario: Queued issue closes
- **WHEN** an issue in the Project is closed in its owning repository
- **THEN** it no longer appears in the active open Queue view

#### Scenario: Closed issue reopens
- **WHEN** a previously queued issue is reopened and remains accessible
- **THEN** synchronization or Project automation restores it to an active queue state without creating a duplicate issue

### Requirement: Existing user authentication only
The synchronization path SHALL use the operator's existing authenticated GitHub session, MUST NOT read or print token values, and MUST NOT store additional credentials in Fleet files.

#### Scenario: Required Project scope is unavailable
- **WHEN** the active GitHub authentication lacks the Project permissions required to read or write queue items
- **THEN** the command stops before mutation and reports the exact scope the operator must authorize

### Requirement: Scope and limitations are inspectable
The Project and Fleet documentation SHALL identify the queue owner, configured author, inclusion query, synchronization command, manual-order constraint, and known cross-organization visibility limitations.

#### Scenario: Operator audits queue behavior
- **WHEN** the operator reviews the Project description or Fleet documentation
- **THEN** the source query and the distinction between repository issue truth and Project-only ranking metadata are clear

