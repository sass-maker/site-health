## Purpose

Route existing read-only application data through the narrowest MCP transport
that matches where the data already lives, without creating new sync systems or
broadening an application's privacy boundary.

## ADDED Requirements

### Requirement: Connection transport follows the existing data boundary
The system SHALL classify every enabled connection as local personal,
Cloudflare-hosted personal, or Cloudflare-hosted public, and MUST NOT silently
substitute another transport class when the selected source is unavailable.

#### Scenario: Local personal data is enabled
- **WHEN** the operator enables CodeVetter for a repository through its existing local consent boundary
- **THEN** the ChatGPT/Codex host launches CodeVetter's installed STDIO MCP against that repository's local query-only data

#### Scenario: Hosted personal data is enabled
- **WHEN** the operator enables an eligible cloud-backed personal connection with its dedicated read credential
- **THEN** the MCP client calls the product-scoped Cloudflare HTTPS MCP route and receives only data owned by the resolved application account

#### Scenario: Hosted public data is enabled
- **WHEN** the operator enables an eligible public connection
- **THEN** the MCP client calls the product-scoped Cloudflare HTTPS MCP route without gaining access to an authenticated or unpublished source

#### Scenario: Selected transport is unavailable
- **WHEN** a local process, hosted route, or owning application is unavailable
- **THEN** that connection fails with a bounded explicit error and does not fall back to a broader data source or credential

### Requirement: Only existing data boundaries are eligible
Phase-one activation SHALL include only products that already have a tested
local MCP boundary, an app-owned MCP endpoint, or an existing cloud API/static
export covered by the read-only adapter tests. It MUST NOT create cloud sync,
account storage, or a new private data projection for an otherwise ineligible
product.

#### Scenario: Device-only product is considered
- **WHEN** Indulge or another product stores its records only on a device and has no approved cloud data boundary
- **THEN** the product is reported as deferred and no MCP route, sync job, database, or account model is created

#### Scenario: Existing cloud product is considered
- **WHEN** Reader, Calorie, Setline, Starboard, High Signal, Significant Hobbies public data, or Research Papers public exports pass their existing source and privacy contracts
- **THEN** the product is eligible for the matching hosted MCP route without expanding the underlying data projection

#### Scenario: Existing native MCP is considered
- **WHEN** Anime List is activated
- **THEN** clients use its app-owned Streamable HTTP MCP rather than a duplicate shared implementation

### Requirement: Personal hosted connections preserve app-owned authentication
Hosted personal connections SHALL accept a caller-supplied dedicated read
credential and apply it only to the matching product request. The hosted MCP
runtime MUST NOT embed owner credentials, persist bearer values, share a
credential across products, or use browser cookies and administrator tokens.

#### Scenario: Valid owner credential is supplied
- **WHEN** the MCP request carries a valid dedicated Reader, Calorie, Anime List, or Setline read credential
- **THEN** the owning application resolves exactly one account and returns only that account's bounded projection

#### Scenario: Credential is missing, invalid, or revoked
- **WHEN** a personal MCP request has no valid dedicated credential
- **THEN** the request fails closed without invoking an anonymous owner fallback or disclosing another account's existence

#### Scenario: Concurrent owners call the hosted runtime
- **WHEN** two requests with different product or owner credentials execute concurrently
- **THEN** credentials and results remain isolated to their individual requests

### Requirement: Public hosted connections remain public-only
Hosted public connections SHALL call only previously approved anonymous APIs or
static exports and MUST NOT hold or forward owner, provider, database, ingest,
or administrative credentials.

#### Scenario: Public corpus is queried
- **WHEN** a client queries Starboard, High Signal, Significant Hobbies public data, or an approved Research Papers public export
- **THEN** the route returns bounded published records with provenance, freshness, and continuation metadata where available

#### Scenario: Private expansion is requested
- **WHEN** a caller asks a public connection for private repositories, account records, private or unlisted timelines, full local paper-corpus access, ingest, refresh, or mutation
- **THEN** no advertised tool or transport instruction can perform the request

### Requirement: Connections remain independently inspectable and revocable
Every product SHALL retain a stable server identity, a product-specific tool
catalog, independent client enablement, and an independent revocation or
disable path even when hosted routes share one Cloudflare deployment.

#### Scenario: Client discovers one product route
- **WHEN** a client initializes a product-specific MCP route
- **THEN** it discovers only that product's server instructions, tools, schemas, and safety annotations

#### Scenario: One product is disabled
- **WHEN** the operator removes one client connection or revokes its owner credential
- **THEN** other product connections remain available and unchanged

### Requirement: Existing read-only and privacy proofs remain authoritative
All routed tools MUST retain explicit schemas, bounded output, stable errors,
secret redaction, `readOnlyHint: true`, and `destructiveHint: false`. Routing
changes MUST NOT add mutation tools, arbitrary HTTP/SQL inputs, or fields that
the existing source projection excludes.

#### Scenario: Mutation is requested
- **WHEN** a caller asks any routed connection to create, update, delete, sync, ingest, refresh, publish, or execute application state
- **THEN** no available tool can perform or translate the request into a mutation

#### Scenario: Transport escape hatch is attempted
- **WHEN** a caller supplies an origin, URL, method, headers, SQL, credential, or arbitrary request body as tool input
- **THEN** the input is rejected or remains ordinary validated domain data and never controls transport behavior

#### Scenario: Sensitive output is produced upstream
- **WHEN** an upstream response contains a credential-shaped or excluded private field
- **THEN** the MCP result omits or redacts it before returning model-readable content

### Requirement: Activation evidence distinguishes ready from deferred
The operator runbook SHALL report protocol readiness, source readiness,
authentication readiness, deployment state, client registration state, and any
residual limitation separately for every connection.

#### Scenario: Backend exists but hosted transport is absent
- **WHEN** an application's read API passes but its Cloudflare MCP route has not been deployed
- **THEN** the connection is reported as source-ready and transport-pending rather than active

#### Scenario: Setline has no owner account
- **WHEN** Setline's cloud database has no real owner row
- **THEN** its route may be deployed but owner activation remains pending until a real sign-in permits safe credential issuance

#### Scenario: CodeVetter repository is not enabled
- **WHEN** a repository is not indexed and explicitly enabled in CodeVetter
- **THEN** the local connection is reported as consent-pending and no scope is created by bypassing CodeVetter
