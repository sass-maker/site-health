## ADDED Requirements

### Requirement: Feedback supports one caller-selected destination

`@saas-maker/feedback` SHALL require exactly one submission destination:
an `onSubmit` callback or an `ingestionUrl`. It MUST NOT invoke both for one
submission.

#### Scenario: Existing callback consumer submits feedback

- **WHEN** a consumer configures `onSubmit` without `ingestionUrl`
- **THEN** the widget passes the complete `FeedbackSubmission` to that callback
  with the existing success and error behavior

#### Scenario: Consumer configures an ingestion URL

- **WHEN** a consumer configures `ingestionUrl` without `onSubmit`
- **THEN** the widget submits the feedback to that URL using the documented
  HTTP contract

#### Scenario: Destination configuration is invalid

- **WHEN** an untyped consumer supplies both destinations or neither destination
- **THEN** the widget rejects the configuration without dropping or duplicating
  a submission

### Requirement: URL ingestion uses a stable multipart contract

URL ingestion SHALL send one HTTP `POST` whose multipart body contains a
`feedback` field with the JSON-serialized submission excluding `screenshot`
and, when present, a `screenshot` field containing the original file.

#### Scenario: Feedback has no screenshot

- **WHEN** URL mode submits feedback without a screenshot
- **THEN** the endpoint receives one multipart `feedback` field and no
  `screenshot` field

#### Scenario: Feedback has a screenshot

- **WHEN** URL mode submits feedback with a supported screenshot
- **THEN** the endpoint receives the same structured `feedback` field and the
  original file in the `screenshot` field

### Requirement: URL ingestion remains backend-agnostic and credential-free

The package SHALL accept relative and absolute HTTP(S) ingestion URLs, SHALL
omit browser credentials, and MUST NOT supply a default endpoint,
authorization, project key, storage, retry queue, or Fleet-hosted runtime.

#### Scenario: Consumer uses a same-origin endpoint

- **WHEN** `ingestionUrl` is a relative HTTP path
- **THEN** the browser submits to that caller-owned same-origin path without
  package-owned credentials

#### Scenario: Consumer uses a cross-origin endpoint

- **WHEN** `ingestionUrl` is an absolute HTTPS URL whose server permits the
  browser request
- **THEN** the package sends the same transport contract and leaves CORS,
  authentication, and retention to the consumer

#### Scenario: Consumer requires a custom authenticated API

- **WHEN** an endpoint cannot accept credential-free multipart ingestion
- **THEN** the consumer can use `onSubmit` to own authentication and payload
  transformation instead of exposing secrets through package configuration

### Requirement: Submission outcome reflects endpoint outcome

URL ingestion SHALL enter the success state only after a 2xx response and SHALL
surface network failures and non-2xx responses through the existing error
state. It MUST NOT automatically retry a failed submission.

#### Scenario: Endpoint accepts feedback

- **WHEN** the endpoint returns a 2xx response
- **THEN** the widget displays its existing successful-submission state

#### Scenario: Endpoint rejects feedback

- **WHEN** the endpoint returns a non-2xx response or the request fails
- **THEN** the widget retains the form data, displays an actionable error, and
  does not automatically send a second request

### Requirement: Public package compatibility is verified

The package SHALL preserve existing callback-mode TypeScript consumers and
SHALL verify URL-mode request construction and package contents without adding
a production dependency.

#### Scenario: Existing application upgrades

- **WHEN** an application using the documented `onSubmit` API checks against the
  changed package
- **THEN** its integration remains type-compatible and behaviorally unchanged

#### Scenario: Package is prepared for consumption

- **WHEN** the native package check runs
- **THEN** type checking, linting, build, transport tests, and dry-run package
  inspection pass
