## ADDED Requirements

### Requirement: Closed-loop automation lifecycle
Every automated action SHALL follow observe, diagnose, policy decision, action,
verification, durable receipt, and notification stages; a failed or missing
verification MUST NOT be reported as success.

#### Scenario: Safe refresh succeeds
- **WHEN** automation refreshes an indexing or health snapshot
- **THEN** it records the source evidence, action, verification result, and
  final receipt before marking the run successful

### Requirement: Explicit action levels
The registry MUST classify actions as observe, propose, execute-safe, or
approve-required, and the runner SHALL reject actions above its authorized
level.

#### Scenario: Production deploy is proposed
- **WHEN** an automation identifies a deployable fix
- **THEN** it may prepare evidence or a reviewed change but MUST wait for
  explicit production deployment approval

#### Scenario: Consequential infrastructure action is requested
- **WHEN** an action would migrate data, change DNS or credentials, delete
  state, alter rate limits, or publish a new public claim
- **THEN** the runner blocks execution and routes an approval request

### Requirement: Bounded and repeatable execution
Every recurring job MUST declare bounded inputs, timeout, lock or concurrency
policy, retry maximum, idempotency or deduplication behavior, cost budget,
dry-run behavior, and durable unresolved failure state.

#### Scenario: Previous run still holds the lock
- **WHEN** a scheduled invocation begins before the prior run releases its lock
- **THEN** the new invocation exits safely or records a skipped overlap without
  duplicating work

#### Scenario: Retry budget is exhausted
- **WHEN** an action reaches its maximum retry count
- **THEN** it stops, preserves failure evidence, and emits one deduplicated
  actionable notification

### Requirement: Portable scheduled execution
Versioned automation definitions MUST resolve the Fleet checkout through a
portable configured root or repository-relative path and SHALL expose
installation state, last run, next run, exit status, receipt/log location, and
notification-delivery state.

#### Scenario: Schedule contains a stale checkout path
- **WHEN** a configured command points to a non-existent user-specific Fleet
  checkout
- **THEN** installation validation fails before reporting the schedule active

### Requirement: Last-known-good snapshots
Dashboard and reporting consumers SHALL read sanitized snapshots, retain the
last known good snapshot when refresh fails, and visibly mark stale or blocked
dimensions.

#### Scenario: Analytics provider is unavailable
- **WHEN** the analytics refresh fails
- **THEN** the previous snapshot remains readable with its original timestamp
  and a visible stale state

### Requirement: Attention-aware notifications
The notification system SHALL deduplicate repeated failures and route severity
according to attention class and risk: routine results to history/digest,
Toolbox failures to digest by default, and immediate alerts only for defined
data, security, cost, Foundry-control, or prolonged My Work risks.

#### Scenario: Toolbox homepage briefly fails
- **WHEN** one Toolbox probe fails transiently without data or security risk
- **THEN** the result is retained for retry/digest and does not immediately page
  the operator

### Requirement: Auditable agent work
The system MUST record triggering evidence, intended scope, affected project,
verification, resulting identifiers, and approval state whenever automation
creates a task, patch, pull request, marketing draft, or external submission.

#### Scenario: Agent opens a corrective pull request
- **WHEN** a bounded automation prepares a repository fix
- **THEN** the receipt links the finding, branch or pull request, checks, and
  whether deployment remains pending

### Requirement: Fail closed on missing authority
Automation MUST NOT broaden its authority when credentials, approval, provider
state, or verification are unavailable.

#### Scenario: Publishing credentials are absent
- **WHEN** an approved marketing item reaches a publisher without configured
  credentials
- **THEN** it remains in a quiet blocked state and is not marked published
