# marketing-video-maker Specification

## Purpose
Define the complete prompt-first video creation experience inside Fleet Console
Marketing.

## ADDED Requirements

### Requirement: Complete prompt-first selection
The `/marketing` maker SHALL accept one prompt, expose every stable recipe and
variant, show output/runtime/spend/source posture, and reveal only the inputs
required by the selected variant before an explicit create action.

#### Scenario: Operator changes variants
- **WHEN** the operator selects a different exact variant
- **THEN** compatible prompt fields remain, incompatible execution inputs stop affecting readiness, and the displayed requirements and preview update

#### Scenario: Auto is selected
- **WHEN** the operator leaves selection on Auto
- **THEN** the maker chooses a fixture-ready or real-ready final-video variant, reveals the choice before execution, and never chooses a continuation-only outcome

#### Scenario: Gallery mix is selected
- **WHEN** the maker receives two or three ordered component variants from the gallery
- **THEN** it shows the base and influence chips, preserves their order, and offers a mixed fixture action without relabelling the mix as an exact catalog variant

### Requirement: Creation remains in Fleet Console
Every stable variant SHALL expose a Fleet Console action that invokes the local
execution contract and returns a normalized production, fixture proof, or exact
blocker without making another UI the terminal outcome.

#### Scenario: Fixture mode is selected
- **WHEN** the operator creates a fixture demonstration
- **THEN** the exact variant preview is returned in the maker and labelled as a deterministic fixture

#### Scenario: Mixed fixture mode is selected
- **WHEN** the operator creates a valid gallery mix
- **THEN** the maker returns one playable local composition with all component IDs, hashes, compositor, and mix posture in its provenance

#### Scenario: Real production is ready
- **WHEN** required sources, rights, and runtime checks pass for real mode
- **THEN** Fleet Console starts the owning adapter and shows the returned video, provenance, quality, and owner evidence

#### Scenario: Real production is blocked
- **WHEN** a required local source, rights record, or runtime is missing
- **THEN** the real create action is disabled with the exact blocker while the exact fixture preview remains playable

### Requirement: Responsive accessible operation
The maker SHALL remain keyboard-operable with visible focus, semantic status,
reduced-motion behavior, and no horizontal page scrolling at 390, 768, and
1440 pixel viewport widths.

#### Scenario: Narrow viewport
- **WHEN** the maker is opened at 390 pixels wide
- **THEN** prompt, selectors, contextual inputs, preview, provenance, blocker, and primary action remain reachable in logical order
