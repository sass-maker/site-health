# launch-campaign-accreditation-integration Specification

## Purpose
Modify the launch-campaign skill's channel-eligibility step to consume
accredited platforms from the persistent state file instead of reverifying
every seed on every campaign.
## Requirements
### Requirement: Accredited platforms enter the manifest directly

The launch-campaign skill SHALL load `accreditation-state.json` and include
platforms with `currentState: accredited` in the campaign manifest without
requiring a full re-probe, subject to per-campaign audience-fit confirmation.

#### Scenario: Accredited platform is included

- **WHEN** the skill plans a campaign and a platform is in `accredited` state
  with a non-stale `verifiedAt`
- **THEN** the platform is included in the manifest's eligible destinations
  after audience-fit confirmation

#### Scenario: Stale accredited platform re-enters verification

- **WHEN** an accredited platform's `verifiedAt` is older than `stalenessDays`
- **THEN** the skill surfaces it in the verification queue rather than
  including it directly

### Requirement: Seed and blocked platforms form a bounded verification queue

The skill SHALL surface platforms with `currentState: seed` or `blocked` as a
bounded verification queue, listing the blocker type (CAPTCHA, sign-in,
payment, anti-bot) for each blocked platform.

#### Scenario: Seed platforms are queued for verification

- **WHEN** the skill plans a campaign and platforms are in `seed` state
- **THEN** those platforms appear in a verification queue section of the
  campaign preview, not in the eligible destinations

#### Scenario: Blocked platforms list their blocker

- **WHEN** a platform is in `blocked` state with a recorded blocker type
- **THEN** the verification queue entry includes the blocker type so the owner
  can decide whether to enable it

### Requirement: Rejected platforms are excluded unless overridden

The skill SHALL exclude platforms with `currentState: rejected` from the
campaign manifest unless the owner explicitly overrides the rejection with a
recorded reason.

#### Scenario: Rejected platform is silently excluded

- **WHEN** a platform is in `rejected` state and the owner has not overridden
- **THEN** it does not appear in the manifest's eligible destinations or the
  verification queue

### Requirement: Protected channels remain individually planned

The skill SHALL continue to plan Hacker News, LinkedIn, and X individually
with destination-native content and SHALL NOT substitute broad-distribution
copy for protected-channel posts, regardless of accreditation state.

#### Scenario: Protected channel is planned individually

- **WHEN** the skill plans a campaign
- **THEN** Hacker News, LinkedIn, and X each have an individual plan with
  native content and are not included in the broad accreditation flow

### Requirement: Channel-inventory output includes accreditation state

The `channel-inventory.mjs` script SHALL annotate each platform in its JSON
output with `currentState` and `verifiedAt` from the accreditation state file
so the skill and owner can distinguish accredited from seed platforms.

#### Scenario: Inventory output reflects accreditation state

- **WHEN** `channel-inventory.mjs` is run
- **THEN** each platform entry includes `currentState` and `verifiedAt`
  fields sourced from `accreditation-state.json`

