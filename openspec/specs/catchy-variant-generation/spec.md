# catchy-variant-generation Specification

## Purpose

Define complete, diverse, honest, and reviewable short-form creative variants.

## Requirements

### Requirement: Complete reel variant contract
Every reel variant eligible for export SHALL include a format, explicit hypothesis, first-beat hook, concrete payoff, ordered visual/narration scenes, on-screen text, caption, CTA, tags, and target duration.

#### Scenario: Validate an exportable variant
- **WHEN** a variant is marked approved
- **THEN** validation proves it contains every field required to render and evaluate the creative without another model inventing missing structure

### Requirement: First-beat hook quality
An approved variant SHALL place its exact hook in a first scene no longer than 1.5 seconds and SHALL reject known weak preambles.

#### Scenario: Reject a generic opener
- **WHEN** a reel begins with phrases such as “in this video” or “today we are going to”
- **THEN** the package cannot become ready until the opener is replaced

### Requirement: Deliberate variant diversity
A ready or published package SHALL contain at least three approved variants with distinct formats or hook hypotheses and no duplicate normalized hooks.

#### Scenario: Prepare a content launch
- **WHEN** a package advances from draft to ready
- **THEN** it contains multiple meaningfully different creative tests rather than cosmetic title rewrites

### Requirement: Honest payoff and destination
Every approved hook SHALL resolve to a payoff present in the scenes and SHALL use the package's canonical article as its destination CTA.

#### Scenario: Validate curiosity without clickbait
- **WHEN** the hook creates a curiosity gap
- **THEN** the script answers that gap and directs the viewer to the corresponding Significant Hobbies article

### Requirement: Creative quality remains reviewable
Automated heuristics SHALL report hook and completeness failures but SHALL NOT mark subjective creative quality or posting acceptance as approved.

#### Scenario: Pass deterministic checks
- **WHEN** a variant passes schema and hook heuristics
- **THEN** it becomes eligible for the existing Reel Pipeline quality and human/operator review gates rather than automatically publishable
