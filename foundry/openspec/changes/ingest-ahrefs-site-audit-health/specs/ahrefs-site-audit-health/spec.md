## Purpose

Provide a fail-closed Fleet view of Ahrefs Site Audit project health while
keeping it distinct from Domain Rating, on-page checks, and performance data.

## ADDED Requirements

### Requirement: Authenticated unit-free project health collection

The collector SHALL request the Ahrefs v3 Site Audit project-health endpoint
with a bearer credential supplied only at runtime, and SHALL NOT persist or
print the credential.

#### Scenario: Entitled request succeeds

- **WHEN** an entitled key returns a valid 200 project-health response
- **THEN** the collector normalizes the response without consuming or exposing the key

#### Scenario: Authentication is unavailable

- **WHEN** the key is missing or the provider returns 401 or 403
- **THEN** the collector returns an explicit authentication or entitlement error and no health metric is reported as zero

### Requirement: Canonical root mapping

The collector SHALL map provider projects to every root in
`foundry/ops/config/root-brands.json` by normalized target hostname, without
requiring provider project identifiers in tracked configuration.

#### Scenario: Complete ten-root coverage

- **WHEN** the provider response contains one matching project for each canonical root
- **THEN** the result contains exactly one labeled observation for each root

#### Scenario: Project is missing

- **WHEN** a canonical root has no matching provider project
- **THEN** that root is labeled `missing-project` with null provider metrics

### Requirement: Metric-safe observations

Each mapped observation SHALL label Ahrefs Health Score, crawl timestamp and
status, total crawled internal URLs, and URLs with errors, warnings, and notices
as Site Audit fields, independently of Domain Rating, Fleet on-page checks, and
PageSpeed metrics.

#### Scenario: Health score is zero

- **WHEN** Ahrefs returns a real `health_score` of 0
- **THEN** the collector preserves 0 as provider data rather than treating it as missing

#### Scenario: Provider field is null

- **WHEN** Ahrefs returns a null metric or crawl date
- **THEN** the collector preserves null and records the corresponding unavailable or incomplete state

### Requirement: Freshness and partial-coverage truth

The collector SHALL evaluate crawl age against a declared maximum age and SHALL
distinguish complete, partial, stale, missing, and provider-error outcomes.

#### Scenario: Crawl is stale

- **WHEN** a project crawl is older than the configured maximum age
- **THEN** the observation is labeled `stale-crawl` while retaining the returned metrics and date

#### Scenario: Coverage is partial

- **WHEN** at least one canonical root is missing, stale, incomplete, or not completed
- **THEN** the aggregate result is `partial` and identifies every affected root

### Requirement: Inspectable Fleet report

The command SHALL emit structured JSON and write a workspace-local Markdown
report that states the provider status and shows all canonical roots, including
exact error states.

#### Scenario: Report generated from fixtures

- **WHEN** collection completes with full or partial fixture data
- **THEN** the report keeps Site Audit metrics separately labeled and contains no credential material
