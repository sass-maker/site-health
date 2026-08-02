# project-d1-persistence Specification

## Purpose

Define the observable persistence contract for Fleet products whose relational data is moved from Turso to project-owned Cloudflare D1 databases.

## Requirements

### Requirement: Project-owned D1 persistence
Each migrated product SHALL use a D1 database owned and named for that product, exposed to application code through a declared Cloudflare binding.

#### Scenario: Production request uses relational data
- **WHEN** a migrated application handles a production request that reads or writes relational state
- **THEN** the request uses the project's declared D1 binding and does not require a Turso URL or authentication token

#### Scenario: One project is unavailable
- **WHEN** one project's D1 database or binding is unavailable
- **THEN** no other migrated project's database identity, data, or binding is used as an implicit fallback

### Requirement: Customer-visible behavior parity
The migrated persistence path MUST preserve the project's existing API contracts, authentication semantics, authorization boundaries, and durable user-visible state unless a separately approved product change says otherwise.

#### Scenario: Existing read journey
- **WHEN** a representative authenticated or public read journey is run against the migrated project
- **THEN** its response shape, ownership filtering, ordering, and material result set match the accepted pre-cutover behavior

#### Scenario: Existing write journey
- **WHEN** a representative create, update, and delete journey is run against the migrated project
- **THEN** the resulting state and authorization behavior match the accepted pre-cutover behavior

### Requirement: Runtime and automation coverage
Every production path that currently accesses Turso SHALL have a D1-compatible execution path before the project can cut over, including request handlers, authentication adapters, scheduled work, and maintained operational scripts.

#### Scenario: Scheduled database work exists
- **WHEN** a project has a cron or GitHub Actions workflow that reads or writes its relational database
- **THEN** the migration provides a Cloudflare-bound execution path and verifies it without exposing a public unauthenticated database operation

#### Scenario: Maintained operator command exists
- **WHEN** a documented operator command needs relational database access
- **THEN** the command either runs through a local or remote D1-aware boundary or is explicitly replaced and documented before cutover

### Requirement: Local development remains isolated
Each migrated project SHALL support local development and tests without connecting to production D1 by default.

#### Scenario: Developer starts the project locally
- **WHEN** the documented local development command runs without a production override
- **THEN** database reads and writes target local D1 state or deterministic test fixtures

#### Scenario: Automated test mutates data
- **WHEN** a database test creates or modifies records
- **THEN** it cannot mutate the remote production database
