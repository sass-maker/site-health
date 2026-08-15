## MODIFIED Requirements

### Requirement: Channel eligibility uses accreditation state

The skill SHALL load `accreditation-state.json` and include platforms with
`currentState: accredited` directly in the manifest without a full re-probe,
subject to per-campaign audience-fit confirmation. Platforms with
`currentState: seed` or `blocked` SHALL be surfaced as a bounded verification
queue. Platforms with `currentState: rejected` SHALL be excluded unless the
owner explicitly overrides.

#### Scenario: Accredited platform skips full re-probe

- **WHEN** the skill researches channel eligibility and a platform is in
  `accredited` state with a non-stale `verifiedAt`
- **THEN** the platform is included in the manifest after audience-fit
  confirmation without a full form, CAPTCHA, and authentication re-probe

#### Scenario: Seed platform enters verification queue

- **WHEN** the skill researches channel eligibility and a platform is in
  `seed` state
- **THEN** the platform appears in the campaign's verification queue rather
  than the eligible destinations list
