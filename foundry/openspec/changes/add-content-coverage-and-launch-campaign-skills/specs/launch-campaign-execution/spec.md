## ADDED Requirements

### Requirement: One-off launch scope

The `launch-campaign` skill SHALL create campaigns for a new product or a
material feature and SHALL NOT default to a recurring daily posting calendar.

#### Scenario: Launch a material feature

- **WHEN** the owner supplies a product and material feature
- **THEN** the skill derives one bounded launch sequence from current product
  truth, audience, proof, activation path, and launch readiness

### Requirement: Complete launch preview

The skill SHALL show all execution steps, every flagship post in full, every
eligible secondary destination and its exact submission content, all manual or
blocked destinations, timing, costs, accounts, assets, exclusions, and
measurement before requesting approval.

#### Scenario: Review the planned campaign

- **WHEN** planning completes
- **THEN** the owner can inspect the complete canonical article, social posts,
  email or changelog copy, launch-page fields, directory fields, browser
  actions, and exclusions from one manifest

### Requirement: Quality-tiered distribution

The skill SHALL create a small flagship lane with original channel-native
content and a broad secondary lane with lower-effort but relevant,
destination-specific submissions.

#### Scenario: Create flagship content

- **WHEN** a channel has strong audience fit and supports meaningful narrative
- **THEN** its content passes product accuracy, evidence, hook, value density,
  voice, platform fit, repetition, CTA, and policy checks

#### Scenario: Create secondary submissions

- **WHEN** an eligible directory or secondary content platform fits the
  product
- **THEN** the skill supplies the exact relevant category, tagline,
  description, tags, assets, and tracked URL required by that destination

#### Scenario: Destination would be spam

- **WHEN** a destination is irrelevant, exists only for deceptive backlink
  profiles, requires duplicate community flooding, or conflicts with platform
  policy
- **THEN** it is excluded rather than executed

### Requirement: Readiness and destination verification

The skill SHALL verify product activation, destination eligibility,
submission rules, cost, account mapping, and automation mode using current
evidence before an item becomes executable.

#### Scenario: Product is not ready for a broad launch

- **WHEN** the landing page, activation path, proof, or required assets are
  materially incomplete
- **THEN** the campaign is classified as targeted, early-access, or blocked
  with the exact remediation needed

#### Scenario: Directory data is stale

- **WHEN** the stored directory registry disagrees with the live destination
- **THEN** live evidence controls the plan and the discrepancy is recorded

### Requirement: Approved multi-surface execution

The skill SHALL execute an unchanged approved campaign through a purpose-built
connector or API when available, Postiz for mapped social work, and the
connected browser for remaining normal UI actions.

#### Scenario: Execute a supported browser submission

- **WHEN** the approved manifest contains a browser item, the destination is
  still eligible, and the required authenticated session is available
- **THEN** the skill enters the approved fields, submits through normal visible
  interaction, and records the result evidence

#### Scenario: Browser encounters a platform control

- **WHEN** execution encounters CAPTCHA, anti-bot challenge, missing sign-in,
  moderation-sensitive outreach, or unexpected payment
- **THEN** the skill stops that item and records a manual, blocked, or
  separately gated outcome without bypassing the control

### Requirement: Launch measurement

The skill SHALL attach consistent campaign attribution, publication receipts,
and 7-day and 30-day outcome summaries to the originating product and mission.

#### Scenario: Reconcile campaign outcomes

- **WHEN** publication and available analytics receipts have been collected
- **THEN** the report distinguishes reach, referral, signup, activation, and
  conversion evidence from unavailable metrics and recommends keep, change, or
  drop decisions by channel
