## MODIFIED Requirements

### Requirement: Operator approval remains authoritative

The control plane SHALL use Foundry's private owner-decision inbox as the
acceptance/rejection system of record for Foundry-owned marketing work and
SHALL NOT auto-accept or auto-publish content.

#### Scenario: Review is required

- **WHEN** generated work awaits a decision
- **THEN** the dashboard and mobile brief link to one authenticated Foundry
  Needs me item containing the draft identity, evidence, destination, and
  allowed responses

#### Scenario: A pending item ages

- **WHEN** a generated or pending item remains unreviewed past its hold window
- **THEN** no renderer, orchestrator, scheduler, or publisher changes it to
  accepted without an explicit owner decision

## ADDED Requirements

### Requirement: Marketing work is mission-linked

Every generated campaign, approved variant, render, publication, and measured
result SHALL reference a canonical project and mission.

#### Scenario: Approved content is published

- **WHEN** Postiz returns a publication receipt for an approved variant
- **THEN** Foundry attaches the receipt to the originating mission and updates
  its marketing outcome state without copying provider-owned private content

### Requirement: Marketing recommendations use visibility and feedback

Foundry SHALL combine AI visibility, domain intelligence, explicit feedback,
distribution receipts, and measured outcomes when recommending marketing work.

#### Scenario: Citation gap is actionable

- **WHEN** repeated AI-visibility evidence identifies a fresh, high-confidence
  citation gap for an active project
- **THEN** Foundry may propose a source-backed marketing mission linking the
  affected prompts, citations, target audience, expected outcome, and evidence
  required for review
