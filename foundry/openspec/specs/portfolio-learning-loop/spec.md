# portfolio-learning-loop Specification

## Purpose

Define Foundry's evidence-gated post-ship learning, ranked recommendations,
mission handoff, outcome evaluation, and portfolio attention rules.

## Requirements

### Requirement: Post-ship evidence boundary

Foundry SHALL begin product outcome synthesis only after the relevant product
change is merged, required CI is green, intended deployment is complete, and
production smoke evidence passes.

#### Scenario: Change is merged but not deployed

- **WHEN** repository evidence is green but deployment or smoke evidence is absent
- **THEN** Foundry labels the change awaiting release and does not attribute
  subsequent product outcomes to it

### Requirement: Cross-signal recommendation synthesis

Foundry SHALL synthesize recommendations from marketing, AI visibility, domain,
feedback, usage or outcome, and release evidence without treating missing
dimensions as negative evidence.

#### Scenario: Visibility drops after a product change

- **WHEN** comparable AI-visibility evidence declines after a verified release
- **THEN** Foundry creates a recommendation linking the release, affected
  prompts or providers, confidence, and suggested investigation

#### Scenario: One evidence provider is unavailable

- **WHEN** an expected evidence source is stale or unavailable
- **THEN** the recommendation discloses the gap and lowers confidence rather
  than inventing a complete assessment

### Requirement: Ranked next actions

Recommendations SHALL be ranked by expected impact, evidence confidence,
effort, reversibility, project attention class, and freshness.

#### Scenario: Ignored project has a routine recommendation

- **WHEN** evidence suggests routine work for an ignored project
- **THEN** Foundry suppresses it from Recommended next unless the evidence
  represents security, cost, data-loss, or explicit reactivation risk

### Requirement: Recommendation-to-mission handoff

Foundry SHALL allow the owner to accept, reject, snooze, or refine a
recommendation before it becomes a mission.

#### Scenario: Owner accepts a recommendation

- **WHEN** the owner accepts a recommendation
- **THEN** Foundry creates a mission draft preserving the source evidence,
  recommendation rationale, proposed outcome, and owner modifications

### Requirement: Outcome learning

Foundry SHALL compare a completed mission's declared success criteria with
post-ship evidence and record whether the expected outcome was supported,
unsupported, mixed, or not yet measurable.

#### Scenario: Marketing experiment reaches its measurement window

- **WHEN** the configured outcome window ends
- **THEN** Foundry records measured results, baseline, attribution caveats, and
  a continue, stop, or change recommendation without automatically launching
  the next experiment

### Requirement: Attention-aware daily view

The owner view SHALL separate human-led My Work, quietly maintained Toolbox,
Foundry-owned capabilities, and excluded projects.

#### Scenario: Portfolio home is rendered

- **WHEN** current recommendations and missions span multiple attention classes
- **THEN** My Work decisions remain prominent, Toolbox work is summarized,
  Foundry work is grouped as one system, and ignored work is excluded by
  default
