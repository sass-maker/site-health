# portfolio-identity-toolbox-automation Specification

## Purpose
TBD - created by archiving change automate-portfolio-identity-toolbox. Update Purpose after archive.
## Requirements
### Requirement: Canonical portfolio presentation
The personal website MUST present CodeVetter, HeyPace, PostTrainLLM and High
Signal as the primary products and SHALL link SaaS Maker as the broader project
directory.

#### Scenario: Portfolio source drifts
- **WHEN** generated or authored content omits a primary product or promotes a
  Toolbox project into the primary set
- **THEN** validation fails before publication

### Requirement: Per-product usability contract
The personal website, RolePatch and Karte MUST each expose build/live/indexing,
source revision, client/server error evidence where relevant, and one declared
meaningful CTA or activation.

#### Scenario: Page views exist but activation is undefined
- **WHEN** a product records traffic without a declared meaningful action
- **THEN** experiment readiness remains incomplete

### Requirement: Private payload exclusion
Fleet evidence MUST NOT contain resume text, job descriptions, private profile
fields, contact/chat bodies, credentials, or user-identifying payloads.

#### Scenario: RolePatch flow succeeds
- **WHEN** activation is recorded
- **THEN** only a sanitized outcome/time/version/attribution signal is retained

### Requirement: Bounded quiet experiments
Any automated experiment MUST declare approved asset/source, destination,
attribution, start/expiry, budget, metric and stop rule.

#### Scenario: Experiment expires
- **WHEN** the expiry is reached
- **THEN** distribution stops and no replacement campaign is created

### Requirement: Human-controlled promotion
Toolbox evidence MAY create a recommendation but MUST NOT change portfolio
classification, create a product roadmap, publish unsupported claims or deploy
production without approval.

#### Scenario: Karte experiment succeeds
- **WHEN** the declared activation threshold is exceeded
- **THEN** Foundry records a promotion recommendation for Sarthak's decision
