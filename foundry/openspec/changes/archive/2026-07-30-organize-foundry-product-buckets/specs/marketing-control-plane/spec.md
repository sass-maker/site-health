## ADDED Requirements

### Requirement: Marketing is a first-class Foundry product family

Foundry SHALL classify Reel Pipeline, Editorial, Content Factory, rendering
engines, distribution handoff, campaign state, and outcome evidence as one
Marketing family under `foundry/marketing/`.

#### Scenario: Operator inspects Marketing

- **WHEN** the operator follows a campaign from source through measurement
- **THEN** Foundry presents the involved Marketing components as one product family while preserving their specialized runtime contracts

#### Scenario: Marketing status reaches Fleet Console

- **WHEN** Marketing produces durable queue, approval, render, publication, or outcome evidence
- **THEN** Fleet Console may aggregate that evidence without owning the production or distribution logic
