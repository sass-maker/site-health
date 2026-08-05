## ADDED Requirements

### Requirement: Theme packs are independent production state

Marketing Studio SHALL expose stable theme packs for eligible recipes and save
the selected theme independently from the recipe variant and generation model.

#### Scenario: Operator changes only the theme
- **WHEN** the operator changes a Night Out production from fantasy to anime
- **THEN** the hook, motion template, recipe variant, duration, and model selection remain unchanged

#### Scenario: Recipe has no theme support
- **WHEN** the selected recipe does not declare theme-pack support
- **THEN** Studio omits the theme choice and preserves existing behavior

### Requirement: Theme source posture gates distribution

Every theme pack SHALL declare whether its source posture is original,
operator-owned, or named IP and SHALL identify the rights evidence required for
commercial preparation.

#### Scenario: Original generated theme is used
- **WHEN** a production uses an original theme pack with complete source evidence
- **THEN** its theme does not add a named-IP blocker to distribution readiness

#### Scenario: Named-IP theme lacks rights evidence
- **WHEN** a production selects an Avengers, DC, anime-franchise, or other named-IP pack without applicable commercial rights evidence
- **THEN** local private concepting remains available and Prepare in Postiz remains blocked with the missing evidence named

### Requirement: Mature-enabled themes fail closed on person rights

A mature-enabled theme SHALL require every depicted person to be a fictional
adult or a rights-cleared consenting adult reference and SHALL reject minors,
uncertain age, or non-consensual likeness use.

#### Scenario: Reference consent is missing
- **WHEN** a mature-enabled production uses a real-person reference without consent and likeness-rights evidence
- **THEN** generation and distribution preparation are blocked before a model runs
