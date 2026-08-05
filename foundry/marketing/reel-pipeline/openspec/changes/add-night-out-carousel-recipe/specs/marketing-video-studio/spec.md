## ADDED Requirements

### Requirement: Night Out is a real local recipe

Marketing Studio SHALL expose one `night-out-carousel` recipe that turns an
operator-approved image manifest into a real vertical MP4 with a reveal hook,
bouncy themed-image sequence, end prompt, and original local funk bed.

#### Scenario: Valid production runs
- **WHEN** the operator selects Night Out, supplies a valid approved asset manifest and rights evidence, and explicitly confirms real execution
- **THEN** Studio produces a playable 9:16 MP4 and a receipt naming every source image, its theme labels, audio provenance, and renderer version

#### Scenario: Required asset evidence is missing
- **WHEN** the asset manifest is missing, unreadable, outside approved local roots, contains fewer than four usable images, or lacks rights evidence
- **THEN** execution fails before headless Chrome or FFmpeg starts and names the invalid input

### Requirement: Night Out themes do not multiply recipes

The asset manifest SHALL carry the selected cast/world theme and per-card labels
without creating a separate production recipe for each theme.

#### Scenario: Operator changes the theme
- **WHEN** the operator changes the manifest from an original fantasy party to a rights-cleared superhero party
- **THEN** the saved recipe id remains `night-out-carousel` and the new theme is recorded in the render receipt

### Requirement: Night Out never publishes directly

Completing a Night Out render SHALL place the artifact in the existing review
lifecycle and SHALL NOT upload, schedule, or publish it.

#### Scenario: Render completes
- **WHEN** the local renderer finishes successfully
- **THEN** the brief moves to needs-review and Postiz preparation remains governed by existing source-rights and distribution evidence
