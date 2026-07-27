# Product-scoped telemetry routing Specification

## Purpose

Define one ingest key per product with explicit, isolated client-selected environments.

## Requirements

### Requirement: Product-scoped ingest keys

The system SHALL issue new ingest keys scoped to exactly one product, SHALL store only a non-reversible verifier, and SHALL NOT grant read or owner-control access through an ingest key.

#### Scenario: Product key authenticates telemetry

- **WHEN** ingest receives a valid non-revoked product key
- **THEN** it resolves the authenticated product before considering any client-supplied environment

#### Scenario: Product key attempts to select another product

- **WHEN** a payload contains any product identifier that differs from the key's product
- **THEN** ingest ignores or rejects that identifier and never writes outside the authenticated product

### Requirement: Explicit client environment

Product-key SDK batches SHALL carry a bounded environment string, and product-key OTLP resource spans SHALL carry the standard `deployment.environment.name` resource attribute. Ingest SHALL reject eligible telemetry whose environment is missing or invalid.

#### Scenario: SDK selects local

- **WHEN** an authenticated SDK batch declares environment `local`
- **THEN** every accepted event in that batch is routed to the authenticated product's `local` environment

#### Scenario: OTLP selects staging

- **WHEN** an authenticated OTLP resource declares `deployment.environment.name=staging`
- **THEN** eligible server spans from that resource are routed to the authenticated product's `staging` environment

#### Scenario: Product-key environment is absent

- **WHEN** product-key telemetry does not declare a valid environment
- **THEN** ingest rejects that telemetry without writing inventory, failures, installation state, dedupe, or aggregates

### Requirement: Bounded environment resolution

The system SHALL resolve environment names only beneath the authenticated product, SHALL normalize them to the documented bounded label contract, and SHALL transactionally create a missing valid environment without issuing another key.

#### Scenario: First local telemetry arrives

- **WHEN** a valid product key sends the first accepted telemetry for `local`
- **THEN** the system creates or reuses exactly one `local` environment beneath that product and records the telemetry there

#### Scenario: Environment bound is exhausted

- **WHEN** a product key attempts to create an environment beyond the per-product bound
- **THEN** ingest rejects that environment without affecting existing environments

### Requirement: Environment isolation

Inventory, aggregate metrics, retained failures, deduplication, and installation status SHALL remain scoped to the resolved `(product, environment)` pair.

#### Scenario: Local and staging share a product key

- **WHEN** the same product key sends equivalent routes for `local` and `staging`
- **THEN** each environment's queries return only its own accepted telemetry

### Requirement: Existing environment-key compatibility

Existing environment-scoped keys SHALL remain pinned to their stored environment during migration. A supplied environment SHALL either match that stored environment or be rejected.

#### Scenario: Legacy key omits environment

- **WHEN** an existing environment-scoped key sends a previously valid payload without environment
- **THEN** ingest continues routing it to the key's stored environment

#### Scenario: Legacy key conflicts with environment

- **WHEN** an environment-scoped key declares a different environment
- **THEN** ingest rejects the telemetry and writes no data

### Requirement: Product environment selection

The private dashboard SHALL present the durable environments belonging to the selected product in one accessible selector and SHALL refresh every dashboard query when the operator changes environment.

#### Scenario: Operator switches from local to staging

- **WHEN** the operator selects `staging` while viewing product `polaris`
- **THEN** installation state, endpoint metrics, and retained failures are queried using the staging environment ID

### Requirement: Polaris uses real routes

Polaris SHALL identify its OTel resource environment from runtime configuration and integration verification SHALL use normal server startup plus an existing application route without adding a demo-only endpoint.

#### Scenario: Local Polaris request is verified

- **WHEN** Polaris starts with environment `local` and handles a request on an existing route
- **THEN** the product key routes its privacy-bounded server span to `polaris / local`

#### Scenario: Staging Polaris deployment starts

- **WHEN** the merged staging deployment starts with `APP_ENV=staging`
- **THEN** its exported server spans are routed to `polaris / staging` without a Polaris infrastructure change
