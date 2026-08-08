## Purpose

Define the observable contract for recording attributable execution, predicting
external state changes, verifying reality, and preserving exact mismatches for
replay and later organizational learning.

## ADDED Requirements

### Requirement: Consequential execution is an attributable append-only timeline
The runtime SHALL record each meaningful execution step as an append-only event
containing `eventId`, `workspaceId`, `runId`, `actorId`, `timestamp`,
`causationId`, `correlationId`, `eventType`, and `payload`. Previously appended
events MUST remain unchanged when later observations or mismatches are recorded.

#### Scenario: A workspace run is replayed
- **WHEN** an operator lists the events for a completed workspace run
- **THEN** the events retain their original order, actor attribution, causal references, and payloads

### Requirement: Predictions are durable before external actions
The runtime MUST append an action proposal containing the predicted externally
observable after-state before starting the corresponding consequential action.

#### Scenario: An action returns success
- **WHEN** an external action reports successful completion
- **THEN** the timeline shows that the expected transition was persisted before the action started

### Requirement: Tool success does not prove transition success
The runtime SHALL observe external state after an action and SHALL compare that
state with the persisted prediction. It MUST NOT record the workflow goal as
complete unless observable goal evidence satisfies the world program.

#### Scenario: External state matches the prediction
- **WHEN** the observed after-state satisfies the persisted prediction
- **THEN** the runtime records a verified transition with the supporting observation as goal evidence

#### Scenario: External state contradicts the prediction
- **WHEN** the external action reports success but the observed after-state does not satisfy the persisted prediction
- **THEN** the runtime records a mismatch rather than a successful transition

### Requirement: Duplicate GitHub side effects are localized
For the initial GitHub issue workflow, the runtime SHALL observe open issues by
an exact experiment marker, predict the matching issue count, create an issue,
observe GitHub again, and distinguish a duplicate side effect from a failed
request. A retry believed to be idempotent that produces two matching issues
MUST be classified as `duplicate_side_effect` with the failed assumption and
expected and observed counts preserved.

The normal creation path MUST require zero matching open issues as a
precondition and MUST NOT execute the create action when that precondition
fails. Only the explicitly requested unsafe experiment retry may bypass this
duplicate protection.

#### Scenario: First marked issue is created
- **WHEN** no open issue has the experiment marker and one creation action completes
- **THEN** the runtime verifies exactly one matching open issue exists

#### Scenario: Unsafe retry creates a duplicate
- **WHEN** one matching open issue exists and a retry predicted to preserve one issue creates another
- **THEN** the runtime records a `duplicate_side_effect` mismatch identifying the false idempotency assumption

#### Scenario: Normal run finds an existing marked issue
- **WHEN** a normal run observes one or more matching open issues before creation
- **THEN** the runtime records a `precondition_failed` mismatch and does not execute the create action

### Requirement: Timeline output is human-readable and machine-preserving
The runtime SHALL expose both the original JSON event records and a chronological
plain-text rendering that identifies the actor, action, prediction, observation,
verification, and mismatch without changing the stored timeline.

#### Scenario: Operator prints a mismatch run
- **WHEN** an operator requests the readable timeline for a run containing a duplicate side effect
- **THEN** the output names the predicted count, observed count, mismatch class, and failed assumption
