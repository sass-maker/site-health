## Purpose

Defines unattended, policy-bounded content production from eligible sources through rendering, quality evidence, and Postiz preparation or future scheduling.

## ADDED Requirements

### Requirement: Versioned standing automation policy
Studio Autopilot SHALL execute only from a versioned repository-owned policy that identifies scope, source adapter, cadence or event trigger, channels, recipe allowlist, spend ceiling, retry limits, quality threshold, and distribution mode. Policies SHALL contain no credentials.

#### Scenario: Enabled policy runs
- **WHEN** a scheduler or operator invokes an enabled valid policy
- **THEN** Autopilot records the exact policy revision and evaluates only the work allowed by that policy

#### Scenario: Paid runtime exceeds policy
- **WHEN** the highest-ranked recipe requires spend above the policy ceiling
- **THEN** Autopilot selects a ready allowed fallback or records a blocked exception without calling the provider

### Requirement: Initial project automation sources
The initial project-automation set SHALL include High Signal reel briefs, Significant Hobbies editorial content, and major public Fleet project changelog entries.

#### Scenario: High Signal source advances
- **WHEN** a new High Signal reel brief appears in its configured content base
- **THEN** the daily High Signal policy creates one attributable project-automation intake item per new source fingerprint

#### Scenario: Significant Hobbies source advances
- **WHEN** a new Significant Hobbies editorial item appears in its configured content base
- **THEN** the weekly Significant Hobbies policy creates one attributable project-automation intake item per new source fingerprint

#### Scenario: Major project change ships
- **WHEN** a maintained public Fleet project records a new user-visible product, public surface, or substantive shipped-capability changelog entry and has a configured brand/channel mapping
- **THEN** the event policy creates an attributable changelog production using the canonical same-origin `/changelog` URL as public evidence

#### Scenario: Minor internal change is observed
- **WHEN** a changelog entry describes only fixes, cleanup, dependencies, documentation, tests, or internal operations
- **THEN** Autopilot records it as ineligible and creates no production

### Requirement: Idempotent discovery and resumption
Autopilot SHALL derive a stable idempotency key from policy, source identity, source revision or fingerprint, and channel. Re-running discovery or resuming an interrupted run SHALL NOT create duplicate ideas, briefs, renders, uploads, Postiz drafts, or schedules.

#### Scenario: Scheduled run repeats unchanged input
- **WHEN** an automation policy runs again with no new source fingerprint
- **THEN** it reports zero new productions and preserves existing records byte-for-byte

#### Scenario: Run is interrupted after rendering
- **WHEN** the same idempotency key resumes after a render receipt exists
- **THEN** Autopilot continues from the next incomplete stage instead of rendering again

### Requirement: Capability and cost aware recipe selection
Autopilot SHALL rank only policy-allowed recipes whose source requirements and runtime capabilities are ready. Selection SHALL be deterministic for the same policy and readiness snapshot and SHALL record rejected candidates and their blockers.

#### Scenario: Preferred local renderer is ready
- **WHEN** the highest-ranked local recipe satisfies the source and quality policy
- **THEN** Autopilot selects it and records the no-API or local-compute spend posture

#### Scenario: Preferred runtime is unavailable
- **WHEN** the preferred recipe is blocked and an allowed fallback is ready
- **THEN** Autopilot uses the fallback and records why the preferred recipe was skipped

#### Scenario: No recipe is ready
- **WHEN** every allowed recipe is blocked by inputs, rights, runtime, or spend policy
- **THEN** the item enters the exception queue without executing a renderer

### Requirement: Unattended bounded production
For an eligible item with a ready recipe, Autopilot SHALL create the normalized brief, execute the production, preserve artifacts and hashes, evaluate quality, and perform only bounded retries or fallback attempts allowed by policy.

#### Scenario: Production passes quality
- **WHEN** the rendered artifact meets the policy quality threshold
- **THEN** the run advances to artifact delivery and distribution preparation without requiring a setup click

#### Scenario: Quality fails after bounded attempts
- **WHEN** every permitted retry or fallback remains below the quality threshold
- **THEN** the run stops in a review exception with every attempt and blocker preserved

### Requirement: Policy-authorized Postiz handoff
Autopilot SHALL prepare a Postiz bundle after all source, rights, creative-policy, quality, stable-media, brand, channel, and account-mapping gates pass. It MAY create an unscheduled Postiz draft or an exact future schedule only when the standing policy explicitly authorizes that mode.

#### Scenario: Draft-only policy completes
- **WHEN** production evidence passes and the policy distribution mode is `draft`
- **THEN** Autopilot creates one Postiz draft and records its sanitized receipt

#### Scenario: Scheduled policy completes
- **WHEN** production evidence passes and the policy supplies an authorized future schedule rule
- **THEN** Autopilot requests the exact derived future time from Postiz and records the scheduled receipt

#### Scenario: Publication is requested
- **WHEN** a policy or caller asks Reel Pipeline to publish immediately or bypass Postiz
- **THEN** Autopilot rejects the action before any provider call

### Requirement: Observable runs and exceptions
Every Autopilot invocation SHALL return a run summary grouped by discovered, skipped, producing, review-required, draft-created, scheduled, and failed states, with the next recovery action for each exception.

#### Scenario: Mixed batch completes
- **WHEN** a run contains successful, unchanged, and blocked source items
- **THEN** the summary reports each item once with its lane, project, recipe, spend posture, terminal state, and actionable blocker

