## Purpose

Define per-transition evidence and receipt recording for accreditation
outcomes, kept separate from campaign execution receipts, with mandatory
evidence for post-submission states.

## ADDED Requirements

### Requirement: Evidence recorded per state transition

The system SHALL record an evidence entry for every state transition
containing the observed timestamp, live URL, HTTP status, form detection
result, CAPTCHA detection, sign-in requirement, payment requirement,
screenshot path, and outcome.

#### Scenario: Evidence is captured on verification

- **WHEN** a platform transitions from `seed` to `verified`
- **THEN** the transition record includes `liveUrl`, `httpStatus`,
  `formDetected`, `captchaDetected`, `signinRequired`, `outcome`, and
  `observedAt`

#### Scenario: Evidence is captured on live confirmation

- **WHEN** a platform transitions to `live` after a confirmed submission
- **THEN** the transition record includes the verified live URL and HTTP
  status of the published page

### Requirement: Post-submission states require verified evidence

The system SHALL reject transitions to `live`, `indexable`, or `detected`
states that do not include a verified live URL and HTTP status in the evidence
record.

#### Scenario: Live transition without evidence is rejected

- **WHEN** a transition to `live` is attempted without a `liveUrl` or
  `httpStatus`
- **THEN** the system rejects the transition and does not modify state

#### Scenario: Indexable transition requires crawlable evidence

- **WHEN** a transition to `indexable` is attempted
- **THEN** the evidence record must include a verified live URL that returned
  a crawlable HTTP status (200 or 301 to a 200)

### Requirement: Accreditation evidence is separate from campaign receipts

The system SHALL use a distinct record shape
(`fleet.platform-accreditation-evidence.v1`) for accreditation evidence and
SHALL NOT conflate it with campaign execution receipts
(`fleet.campaign-item-receipt.v1`).

#### Scenario: Accreditation evidence does not pollute campaign receipts

- **WHEN** an accreditation state transition is recorded
- **THEN** the evidence entry uses the accreditation evidence schema, not the
  campaign receipt schema, and is stored in the accreditation state file

### Requirement: Read-only summary of accreditation state

The system SHALL provide a read-only summary command that prints per-platform
state, last evidence record, and staleness status without modifying any state.

#### Scenario: Owner inspects accreditation status

- **WHEN** the owner runs the summary command
- **THEN** the output lists each platform with its `currentState`,
  `verifiedAt`, staleness flag, and the most recent evidence record's outcome
  and live URL

### Requirement: Honest outcome labeling

The system SHALL label every evidence record with `outcome: confirmed` or
`outcome: indeterminate` and SHALL NOT advance state on indeterminate
outcomes.

#### Scenario: Indeterminate probe does not advance state

- **WHEN** a probe returns a timeout, unexpected redirect, or unclear form
  state
- **THEN** the evidence record stores `outcome: indeterminate` and the
  platform remains in its current state
