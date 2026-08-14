# portfolio-project-strip Specification

## Purpose
TBD - created by archiving change add-portfolio-project-strip. Update Purpose after archive.
## Requirements
### Requirement: Render a current-project list

The package SHALL render a labeled list of project links from supplied data or
the bundled catalog, excluding the `currentProjectId` when provided.

#### Scenario: Current project is excluded

- **WHEN** the caller provides `currentProjectId="codevetter"`
- **THEN** CodeVetter is not rendered as a destination

### Requirement: Fast catalog loading

The package SHALL render synchronously from props or its bundled catalog and
MAY revalidate from a caller-provided `catalogUrl` with a single GET request.
Failed, invalid, or timed-out requests SHALL retain the last valid catalog.

#### Scenario: Revalidation succeeds

- **WHEN** `catalogUrl` returns a valid project array
- **THEN** the strip updates to that array without blocking initial render

#### Scenario: Revalidation fails

- **WHEN** the request fails, times out, or returns invalid data
- **THEN** the component keeps the prop or bundled catalog and renders no error UI

### Requirement: Accessible motion

The strip SHALL use semantic links, expose a navigable label, pause motion on
hover and keyboard focus, and disable continuous motion when the user prefers
reduced motion.

#### Scenario: Reduced motion is enabled

- **WHEN** `prefers-reduced-motion: reduce` matches
- **THEN** project links remain visible and usable without animation

### Requirement: Themeable visual surface

The package SHALL provide light, dark, and auto theme modes plus CSS custom
properties for integrating with a host product's visual system.

#### Scenario: Consumer selects an explicit theme

- **WHEN** the caller selects the light or dark theme
- **THEN** the strip applies that theme while preserving consumer token overrides

