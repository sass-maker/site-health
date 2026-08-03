## ADDED Requirements

### Requirement: Real multi-image slideshow proofs

Every image-slideshow gallery item SHALL render from at least three repository-owned, rights-safe images and SHALL visibly demonstrate the composition and transition behavior named by its exact selected variant.

#### Scenario: Operator compares slideshow styles

- **WHEN** the operator plays the six image-slideshow demos
- **THEN** each preview changes between multiple real images and cinematic, editorial cutout, filmstrip, split-frame, polaroid-stack, and soft-parallax treatments are visibly distinguishable

#### Scenario: Gallery thumbnails slideshow output

- **WHEN** the operator opens the gallery before starting playback
- **THEN** each slideshow card shows a frame from its registered multi-image video artifact rather than unrelated presentation-only artwork

#### Scenario: Preview pack is regenerated

- **WHEN** the repository-owned preview build runs on a fresh clone
- **THEN** it regenerates the six slideshow artifacts deterministically from the committed source images without provider credentials or network access
