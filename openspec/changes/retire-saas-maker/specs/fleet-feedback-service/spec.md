## ADDED Requirements

### Requirement: Fleet owns one backend-free feedback package

Fleet SHALL contain `@saas-maker/feedback` as an independently checkable React
package and SHALL NOT require a Fleet-hosted runtime.

#### Scenario: Maintainer works on feedback

- **WHEN** a maintainer opens `fleet-ops/packages/feedback/`
- **THEN** the complete package source, README, lockfile, and native checks are
  available without a service workspace or SaaS Maker repository

### Requirement: Submission is consumer-owned

The widget MUST require an `onSubmit` callback and MUST NOT contain a default
endpoint, project key, implicit fetch, or hosted-service dependency.

#### Scenario: User submits feedback

- **WHEN** the form passes validation
- **THEN** the widget invokes `onSubmit` with a structured payload and reports
  success only after the callback resolves

### Requirement: Pinpoint and screenshots remain local

The callback payload MUST expose structured page-element context and MAY expose
an attached screenshot as a browser `File`.

#### Scenario: User points at an element and attaches an image

- **WHEN** feedback is submitted
- **THEN** the consumer receives the anchor and original file without the
  package uploading either artifact

### Requirement: npm README is sufficient documentation

The package tarball MUST include installation, callback, payload, Pinpoint,
screenshot, compatibility, and privacy guidance.

#### Scenario: User opens the npm package page

- **WHEN** npm renders the package README
- **THEN** the user can integrate every supported feature without another site

### Requirement: Fleet validates the package natively

Fleet MUST expose structural and native checks for typechecking, building, and
packing the package.

#### Scenario: Package source regresses

- **WHEN** a type or build contract fails
- **THEN** the package or Fleet component check exits non-zero

