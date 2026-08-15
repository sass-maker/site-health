# portfolio-project-strip Specification

## Purpose

Provide a compact, accessible, portfolio-wide discovery rail that renders from
the canonical Fleet project catalog without putting first paint on the network
path.
## Requirements
### Requirement: Render a current-project list

The package SHALL render a compact, accessibly named list of project links from
supplied data or the bundled catalog, excluding the `currentProjectId` when
provided. The default visible surface SHALL contain only project links and
separators, without a visible author heading or motion-control label.

#### Scenario: Current project is excluded

- **WHEN** the caller provides `currentProjectId="codevetter"`
- **THEN** CodeVetter is not rendered as a destination

#### Scenario: Default surface stays compact

- **WHEN** the strip renders with default options
- **THEN** it exposes an accessible region name while showing only destination
  project links and separators

### Requirement: Attribute outbound project referrals

The strip SHALL append the known current project identifier as the `ref` query
parameter on every rendered outbound project link without changing the
canonical URL stored in the catalog. Existing unrelated query parameters and
fragments SHALL be preserved.

#### Scenario: Current project is known

- **WHEN** the current project identifier is `codevetter`
- **THEN** every rendered destination link contains `ref=codevetter`

#### Scenario: Destination already has URL state

- **WHEN** a destination URL contains another query parameter or fragment
- **THEN** the rendered link preserves that state and adds the referral source

#### Scenario: Current project is unknown

- **WHEN** no current project identifier can be resolved
- **THEN** the rendered destination keeps its canonical catalog URL unchanged

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
