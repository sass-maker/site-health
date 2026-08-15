# platform-accreditation-state Specification

## Purpose
Define a persistent per-platform accreditation state model that survives
campaign boundaries, records honest evidence for every state transition, and
preserves owner exclusions for protected channels.
## Requirements
### Requirement: Persistent accreditation state across campaigns

The system SHALL store per-platform accreditation state in a single versioned
JSON file under `foundry/ops/config/directory-submissions/` that persists
across campaigns and is readable by the launch-campaign skill.

#### Scenario: State survives between campaigns

- **WHEN** a campaign completes and a new campaign begins for a different
  product
- **THEN** the accreditation state file retains all previously recorded
  platform states, transitions, and evidence without reset

#### Scenario: Initial state is seeded from registries

- **WHEN** the accreditation state file is first created
- **THEN** every platform from `directories.json`, `research-probe.json`, and
  the article-syndication list starts with `currentState: seed`, a populated
  `source` field, and an empty transitions array

### Requirement: Nine-state lifecycle model

The system SHALL define nine platform states: `seed`, `verified`,
`accredited`, `rejected`, `queued`, `live`, `indexable`, `detected`, and
`blocked`, and SHALL enforce monotonic forward transitions except for
documented resolution paths.

#### Scenario: Valid forward transition

- **WHEN** a platform in state `verified` is confirmed ready for campaign
  inclusion
- **THEN** it transitions to `accredited` with a recorded evidence entry and
  timestamp

#### Scenario: Blocked platform is later enabled

- **WHEN** a platform in state `blocked` has its blocker resolved (sign-in
  completed, CAPTCHA passed, payment made)
- **THEN** it may transition to `accredited` with evidence of the resolution

#### Scenario: Invalid transition is rejected

- **WHEN** a transition is attempted from `rejected` directly to `live`
- **THEN** the system rejects the transition with a clear error and does not
  modify state

### Requirement: Owner exclusions for protected channels

The system SHALL mark Hacker News, LinkedIn, and X as `qualityGate: protected`
and SHALL exclude them from broad accreditation queue generation. They appear
in a separate protected-channels section and are always individually planned
within each campaign manifest.

#### Scenario: Protected channel is never broad-accredited

- **WHEN** the accreditation queue is generated
- **THEN** Hacker News, LinkedIn, and X appear only in the protected-channels
  section and are not listed under any product's accredited or seed platforms

### Requirement: Evidence recorded per state transition

The system SHALL record an evidence entry for every state transition
containing the observed timestamp, live URL, HTTP status, form detection
result, CAPTCHA detection, sign-in requirement, and outcome
(`confirmed` or `indeterminate`).

#### Scenario: Confirmed verification

- **WHEN** a platform is probed and the form is live with no blocker
- **THEN** the transition records `outcome: confirmed` with the live URL and
  HTTP status

#### Scenario: Indeterminate outcome does not advance state

- **WHEN** a probe returns an ambiguous result (timeout, unexpected redirect,
  unclear form state)
- **THEN** the platform remains in its current state and the evidence entry
  records `outcome: indeterminate`

### Requirement: Staleness detection for accredited platforms

The system SHALL track `verifiedAt` for each platform and SHALL flag
`accredited` platforms whose `verifiedAt` is older than `stalenessDays`
(default 30) for re-verification.

#### Scenario: Accredited platform becomes stale

- **WHEN** an accredited platform's `verifiedAt` is more than 30 days old
- **THEN** the queue generator includes it in the re-verification section
  rather than the ready-for-inclusion section

### Requirement: Transition history is capped

The system SHALL retain at most the 10 most recent transitions per platform
and SHALL archive older transitions to a separate `transitions-archive` array
to prevent unbounded file growth.

#### Scenario: History exceeds cap

- **WHEN** an 11th transition is recorded for a platform
- **THEN** the oldest transition is moved to `transitions-archive` and the 10
  most recent remain in `transitions`

