## ADDED Requirements

### Requirement: Marketing visual exploration

Fleet Console SHALL expose `/marketing/explore-gallery` inside the existing Marketing product shell so the operator can compare real video artifacts by visible treatment before choosing a production preset. The route SHALL read gallery evidence from Reel Pipeline without taking ownership of rendering, review, or publishing.

#### Scenario: Operator opens the gallery
- **WHEN** the operator opens `/marketing/explore-gallery`
- **THEN** Fleet Console retains the current navigation and Marketing context, shows real registered samples grouped by visual family, and does not duplicate the creation form

#### Scenario: Operator filters visual families
- **WHEN** the operator chooses a visual-family filter
- **THEN** the page shows only matching samples, preserves keyboard access, and updates the visible result count without reloading

#### Scenario: Operator chooses a reproducible style
- **WHEN** a playable sample maps to a stable production variant
- **THEN** its action opens `/marketing` with that exact variant selected and the maker displays the current runtime, spend, delivery, and blocker state

#### Scenario: Sample cannot be reproduced locally
- **WHEN** a sample is imported, experimental, baseline, external, unavailable, or lacks a stable variant
- **THEN** the page names that posture explicitly and does not present a misleading local creation action

#### Scenario: Reel Pipeline is unavailable
- **WHEN** Fleet Console cannot read the local gallery registry
- **THEN** the route shows an honest recovery state naming the Reel Pipeline service boundary while the surrounding Console remains usable
