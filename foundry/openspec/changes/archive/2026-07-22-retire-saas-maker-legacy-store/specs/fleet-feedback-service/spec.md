## ADDED Requirements

### Requirement: Fleet owns one minimal feedback component

Fleet SHALL contain one independently checkable feedback component that owns
the `@saas-maker/feedback` package, existing feedback API, private inbox,
shared contracts, tests, and guarded deployment commands.

#### Scenario: Maintainer works on feedback

- **WHEN** a maintainer opens the Fleet feedback component
- **THEN** all retained feedback source and its native validation commands are
  available without reading the retired SaaS Maker repository

### Requirement: Existing runtime identities remain compatible

The migrated component MUST preserve the `@saas-maker/feedback` package name,
the `saasmaker-api` and `saasmaker-dashboard` Worker names, and the existing
`api.sassmaker.com` and `app.sassmaker.com` production URLs during migration.

#### Scenario: Existing consumer submits feedback

- **WHEN** a consumer using the current package and project key submits feedback
- **THEN** it continues using the existing API contract without a new endpoint,
  key, or Worker

### Requirement: npm README is the public documentation

The package tarball MUST include a complete README covering installation,
configuration, Pinpoint, screenshots, API requirements, and compatibility.

#### Scenario: User opens the npm package page

- **WHEN** npm renders the published package README
- **THEN** the user can integrate every supported package feature without a
  separate documentation website

### Requirement: Fleet validates the component natively

Fleet MUST expose structural and native checks for the feedback component,
including API tests, typechecks, widget build, inbox build, and package-pack
verification.

#### Scenario: Feedback source regresses

- **WHEN** a retained package or runtime fails its native check
- **THEN** the Fleet component validation exits non-zero and identifies the
  failing feedback surface

### Requirement: No additional Worker is created

The consolidation MUST NOT create a new Cloudflare Worker or duplicate the
existing API and inbox deployments.

#### Scenario: Source is moved into Fleet

- **WHEN** deploy configuration is validated from its Fleet location
- **THEN** it still resolves to the existing two Worker names and bindings
