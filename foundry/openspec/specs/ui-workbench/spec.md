# ui-workbench Specification

## Purpose
Provide explicit routing and project-native execution guidance for recurring UI
creation and transformation jobs through Fleet's existing skills while
preserving design, accessibility, product, and verification contracts.
## Requirements
### Requirement: Existing skills route each UI job to the smallest complete workflow
Fleet SHALL use its existing design-engineering entrypoint to distinguish
general UI design, direction ideation, brand direction, component extraction,
Tailwind canonicalization, dark-mode UI adaptation, dark-mode raster
adaptation, responsive adaptation, and semantic markup reconstruction without
creating a new skill for any of those jobs.

#### Scenario: Existing Fleet workflow owns the job
- **WHEN** a request is general UI design, multiple direction exploration, brand direction, component extraction, dark-mode adaptation, raster editing, or responsive adaptation
- **THEN** the router delegates to `design-workflow`, `design-inspiration`, the matching Impeccable command, or imagegen without creating a duplicate skill contract

#### Scenario: No separate skill is justified
- **WHEN** a request is bounded Tailwind class canonicalization or semantic markup reconstruction from an image
- **THEN** `design-engineering` follows a concise inline recipe with explicit mutation boundaries and verification instead of adding another child skill

### Requirement: UI transformations preserve project contracts
Every workbench workflow MUST inspect the nearest project instructions,
existing design context, stack, components, assets, and relevant checks before
editing, and MUST preserve protected product behavior unless the user explicitly
expands scope.

#### Scenario: Refactor or utility cleanup is requested
- **WHEN** Impeccable component extraction or design-engineering Tailwind canonicalization changes source structure
- **THEN** routes, rendered behavior, public component APIs, interaction states, styling intent, and relevant checks remain intact

#### Scenario: Visual behavior changes materially
- **WHEN** a theme, responsive system, or new brand direction creates meaningful visual work
- **THEN** Fleet's preserve or overhaul lane and its browser, quality, and owner-acceptance gates remain authoritative

### Requirement: Theme and responsive workflows adapt the whole relevant state model
Dark-mode and responsive workflows SHALL evaluate applicable surfaces, text,
controls, navigation, data displays, media, interaction states, and supported
viewports rather than applying an isolated color inversion or breakpoint patch.

#### Scenario: Dark mode is added to a light-only surface
- **WHEN** the project has no complete dark theme
- **THEN** the workflow defines project-native semantic theme roles, contrast, states, preference behavior, and asset handling without relying on blanket inversion

#### Scenario: Desktop-oriented UI is adapted
- **WHEN** the project is incomplete at phone or tablet widths
- **THEN** the workflow addresses overflow, wrapping, navigation, reading size, touch targets, forms, tables, and content priority at the project's required browser widths

### Requirement: Raster adaptations use explicit image-generation handoff
Dark-mode raster work SHALL use the installed image-generation capability for
requested asset edits and MUST preserve the source asset's interface purpose,
dimensions, composition, important content, and transparent-edge behavior.

#### Scenario: Raster asset needs a dark counterpart
- **WHEN** a light-background screenshot, illustration, mockup, photo, texture, or background cannot be made theme-compatible through layout treatment alone
- **THEN** the workflow creates and reviews a dedicated dark variant while retaining the original asset and avoiding CSS filter substitution

### Requirement: Markup reconstruction separates semantics from styling
Markup reconstruction SHALL derive accessible document structure from the
provided screenshot, mockup, wireframe, or design export and SHALL leave visual
styling and component extraction to later explicit work.

#### Scenario: Image evidence is sufficient
- **WHEN** the supplied image clearly communicates hierarchy and controls
- **THEN** the workflow produces one semantic unstyled HTML or JSX structure with appropriate landmarks, headings, labels, lists, tables, buttons, links, and form relationships

#### Scenario: Critical semantics are ambiguous
- **WHEN** the image cannot establish content order, control behavior, or accessible naming
- **THEN** the workflow states the smallest assumptions or requests the missing evidence instead of inventing product behavior

### Requirement: Every mutation receives proportional verification
Each workbench workflow that edits project files MUST run the smallest relevant
native check first and SHALL report skipped browser, accessibility, visual, or
behavioral validation and residual risk.

#### Scenario: Focused check passes
- **WHEN** the project provides a relevant formatter, test, typecheck, build, or browser check
- **THEN** the workflow runs the narrowest applicable command and reports its result

#### Scenario: Required proof is unavailable
- **WHEN** the environment cannot run a necessary check or inspect a required state
- **THEN** the workflow names the missing proof and does not claim that state as verified

