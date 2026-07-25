## ADDED Requirements

### Requirement: Canonical audit manifest

The skill SHALL resolve products, canonical domains, repository ownership, live
status, and policy exclusions from Fleet-owned configuration before browser
testing begins.

#### Scenario: Explicit Fleet Workspace exclusion

- **WHEN** an operator requests a Fleet audit excluding `fleet-workspace`
- **THEN** the manifest omits that project while retaining other eligible live
  public products

### Requirement: Bounded distinct-surface selection

The skill SHALL inspect actual product navigation and promises and SHALL test no
more than six genuinely distinct public surfaces per product.

#### Scenario: Single-page product

- **WHEN** a product exposes one page with search and filter interactions
- **THEN** the skill tests those interactions without inventing additional
  routes to fill the surface budget

#### Scenario: Multi-surface product

- **WHEN** a product exposes landing, browse, search, detail, primary action,
  and access-boundary surfaces
- **THEN** the skill selects at most one representative of each surface type

### Requirement: Safe functional interaction

The skill SHALL perform a meaningful read-only interaction on each selected
surface where possible and SHALL NOT submit production data, enter credentials,
complete OAuth, purchase, rate, email, or invoke destructive controls.

#### Scenario: Mutation required

- **WHEN** verifying a workflow would require a production mutation or private
  credential
- **THEN** the workflow is marked `not_verified` with the blocking reason

### Requirement: Reproducible status classification

The skill SHALL classify each product as `pass`, `degraded`, `fail`, or
`not_verified` and SHALL retain the expected result, observed result, guest
state, and reproduction count.

#### Scenario: Core action fails twice

- **WHEN** a primary public action fails on an initial attempt and one retry
- **THEN** the product is classified `fail` with exact reproduction evidence

#### Scenario: Existing authenticated session

- **WHEN** the browser profile is already signed in and cannot provide a clean
  guest check without altering user state
- **THEN** guest access is recorded as unverified rather than inferred

### Requirement: Repair handoff

The skill SHALL emit Markdown and JSON results whose actionable findings identify
the owning project, repository, surface, action, evidence, severity, and smallest
next diagnostic step.

#### Scenario: Audit completes

- **WHEN** all manifest targets are completed or explicitly blocked
- **THEN** the reports contain one product verdict per target and a
  severity-ordered repair queue
