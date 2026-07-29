## ADDED Requirements

### Requirement: Complete preview manifest

The system SHALL represent every proposed content, repository, publishing,
browser, cost, timing, account, verification, and measurement action in one
versioned campaign manifest before approval is requested.

#### Scenario: Preview a launch campaign

- **WHEN** a launch plan contains flagship posts, directory submissions,
  Postiz work, browser work, and exclusions
- **THEN** the preview shows every full content body, destination, action mode,
  account mapping, schedule, cost, blocker, exclusion reason, and expected
  receipt

#### Scenario: Preview content publication

- **WHEN** content coverage recommends new or updated first-party pages
- **THEN** the preview shows the complete page bodies, repository paths,
  internal links, checks, commit or push actions, and any production publish
  command before approval

### Requirement: Immutable approval

The system SHALL bind owner approval to the canonical hash of one complete
campaign manifest and SHALL invalidate that approval when any material manifest
field changes.

#### Scenario: Execute an unchanged approved manifest

- **WHEN** the owner approves the displayed manifest hash and execution
  recomputes the same hash
- **THEN** every eligible action in that manifest may execute without another
  approval prompt

#### Scenario: Content changes after approval

- **WHEN** content, destination, account, timing, cost, repository action, or
  publish command changes after approval
- **THEN** execution fails closed and the revised manifest returns to preview

### Requirement: Per-item execution gate

The system SHALL verify manifest approval, item eligibility, current
destination readiness, and absence of a confirmed matching receipt immediately
before each item executes.

#### Scenario: Retry a partially completed campaign

- **WHEN** an approved campaign is resumed after some items succeeded
- **THEN** confirmed matching items are skipped and only remaining eligible
  items enter execution

#### Scenario: Destination changes materially

- **WHEN** a live destination now requires unexpected payment, authentication,
  CAPTCHA, anti-bot completion, different content, or a prohibited action
- **THEN** that item is blocked without changing or submitting the approved
  content

### Requirement: Truthful receipts and reconciliation

The system SHALL record deterministic item identities and distinguish
confirmed, queued, manual, blocked, failed, indeterminate, and published
outcomes without treating an ambiguous create as success.

#### Scenario: Browser result is ambiguous

- **WHEN** a form submission changes pages but provides no reliable success
  signal or external identity
- **THEN** the item is recorded as indeterminate and is not blindly retried

#### Scenario: Provider confirms publication

- **WHEN** a provider returns a stable post identifier or a live matching URL
- **THEN** the receipt records the campaign revision, item identity, provider,
  external identity, timestamp, and sanitized result reference

### Requirement: Private campaign state

The system SHALL keep unpublished content, approvals, browser evidence,
destination/account identifiers, and detailed receipts in private
machine-local storage outside the repository and public snapshots.

#### Scenario: Build a public status summary

- **WHEN** Fleet reports campaign progress publicly
- **THEN** it exposes only sanitized counts, stages, freshness, blockers, and
  already-public result URLs
