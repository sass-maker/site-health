## MODIFIED Requirements

### Requirement: Studio page served by the control server
The control server SHALL serve the unified Marketing Studio at `GET /studio` without a build step or external assets. Create SHALL expose the ordered Project, Idea, Video recipe, and Options flow plus truthful Edit, Build or Preview, and Prepare in Postiz actions; Productions, Distribute, and Tools SHALL preserve their existing responsibilities and controls.

#### Scenario: Page loads
- **WHEN** a browser requests `/studio`
- **THEN** the server returns 200 text/html containing project selection, project-scoped idea selection and creation, the complete recipe catalog, bounded recipe options, terminal actions, and every existing Studio view and tool

#### Scenario: Existing tool remains usable
- **WHEN** the operator opens Tools after the production planner ships
- **THEN** the existing tool form calls its stable `/studio/:tool` endpoint and presents the same structured result as before

#### Scenario: Specialized surface is available
- **WHEN** the operator selects a workflow owned by Forge, Review, Editorial, or Postiz
- **THEN** the page names that owner and exposes the correct continuation destination without embedding provider credentials or private content

#### Scenario: Lyric workflow is selected
- **WHEN** the operator chooses lyric video
- **THEN** the brief editor reveals its Music and lyrics section, names the local compositor, shows Blender as an optional capability, and lists rights or runtime blockers without changing primary navigation

#### Scenario: Operator returns to a saved plan
- **WHEN** the operator selects an existing brief after a reload
- **THEN** the page restores the saved project, idea, recipe, and options and identifies the next incomplete or actionable step

## ADDED Requirements

### Requirement: Grouped recipe-variant selector
The Fleet Console Marketing maker SHALL expose Auto plus every finite recipe variant in one native grouped selector, SHALL keep unavailable variants selectable for inspection, and SHALL show the selected variant's delivery type, spend posture, runtime, required follow-up, and exact blocker.

#### Scenario: Operator opens the format selector
- **WHEN** the current arsenal contains the initial recipe definitions
- **THEN** the selector exposes all 48 finite variants grouped by recipe without multiplying them by the separate duration selector

#### Scenario: Operator chooses a blocked variant
- **WHEN** a variant requires a missing runtime, rights assertion, source, or local asset
- **THEN** selection remains possible, execution is disabled, and the summary names the exact missing requirement without hiding the variant

#### Scenario: Operator chooses a finite variant
- **WHEN** a variant is selected and the operator submits a prompt
- **THEN** its stable variant identifier and normalized option values are saved on the brief and used by execution

#### Scenario: Auto is selected
- **WHEN** the operator leaves format on Auto
- **THEN** the maker chooses only a locally ready final-MP4 variant and reveals the chosen variant before rendering starts

### Requirement: Marketing Explore Gallery
Fleet Console SHALL serve a style-first gallery at `/marketing/explore-gallery` inside the existing Marketing product shell. The gallery SHALL present registered real artifacts with their visual family, actual engine, source posture, spend posture, and delivery state, and SHALL hand reproducible samples back to the main maker using a stable variant id.

#### Scenario: Operator explores available styles
- **WHEN** the operator opens `/marketing/explore-gallery`
- **THEN** the route retains the Fleet Console navigation and Marketing context, groups playable artifacts by visible treatment, and provides family filters without duplicating the creation form

#### Scenario: Operator chooses a reproducible sample
- **WHEN** a gallery item maps to a stable recipe variant
- **THEN** its action opens `/marketing` with that exact variant selected and the maker displays its current readiness and requirements

#### Scenario: Sample is imported or unavailable
- **WHEN** an entry is an imported provider asset, external continuation, baseline fixture, or missing local file
- **THEN** the gallery labels that posture explicitly and does not claim the sample is a locally generated premium result

#### Scenario: Browser requests a video range
- **WHEN** a gallery video requests a valid MP4 byte range
- **THEN** the Reel Pipeline returns `206 Partial Content` with `Accept-Ranges`, `Content-Range`, and the requested bytes
