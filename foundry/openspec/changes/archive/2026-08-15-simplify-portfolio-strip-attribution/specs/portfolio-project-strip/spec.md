## MODIFIED Requirements

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

## ADDED Requirements

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
