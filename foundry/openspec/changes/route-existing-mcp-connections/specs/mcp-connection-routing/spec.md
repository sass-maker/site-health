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
- **THEN** Codex launches CodeVetter's installed STDIO MCP against that repository's local query-only data

#### Scenario: Hosted personal data is enabled
- **WHEN** the operator links an eligible cloud-backed personal connection through ChatGPT web's OAuth flow
- **THEN** ChatGPT calls the product-scoped Cloudflare HTTPS MCP route and receives only data owned by the approved Fleet owner

#### Scenario: Hosted public data is enabled
- **WHEN** the operator enables an eligible public connection
- **THEN** ChatGPT web calls the product-scoped Cloudflare HTTPS MCP route without gaining access to an authenticated or unpublished source

#### Scenario: Selected transport is unavailable
- **WHEN** a local process, hosted route, or owning application is unavailable
- **THEN** that connection fails with a bounded explicit error and does not fall back to a broader data source or credential

### Requirement: Only existing data boundaries are eligible
Phase-one activation SHALL include only products that already have a tested
local MCP boundary, an app-owned MCP endpoint, or an existing cloud API/static
export covered by the read-only adapter tests. OAuth grant/state storage MAY be
added solely to authorize ChatGPT web to existing eligible projections. It MUST
NOT create cloud sync, general application account storage, multi-user product
linking, or a new private data projection for an otherwise ineligible product.

#### Scenario: Device-only product is considered
- **WHEN** Indulge or another product stores its records only on a device and has no approved cloud data boundary
- **THEN** the product is reported as deferred and no MCP route, sync job, database, or account model is created

#### Scenario: Existing cloud product is considered
- **WHEN** Reader, Calorie, Setline, Starboard, High Signal, Significant Hobbies public data, or Research Papers public exports pass their existing source and privacy contracts
- **THEN** the product is eligible for the matching hosted MCP route without expanding the underlying data projection

#### Scenario: Existing native MCP is considered
- **WHEN** Anime List is activated
- **THEN** the OAuth gateway forwards only authorized MCP traffic to its app-owned Streamable HTTP implementation rather than duplicating its tools

### Requirement: Personal hosted connections use owner-only MCP OAuth
Hosted personal connections SHALL authenticate ChatGPT web through an MCP OAuth
2.1 flow backed by an approved Cloudflare Access identity. The gateway SHALL
validate the OAuth issuer, audience/resource, expiry, and product read scope on
every request. ChatGPT MUST NOT receive, store, or submit an application's
dedicated read credential.

#### Scenario: Approved owner completes OAuth
- **WHEN** the allowlisted owner authenticates through Cloudflare Access and grants one product's read scope to ChatGPT
- **THEN** the gateway issues a scoped MCP token and uses only that product's Cloudflare-stored read credential for upstream calls

#### Scenario: OAuth token is missing, invalid, expired, or revoked
- **WHEN** a personal MCP request has no valid OAuth token for the exact resource and product read scope
- **THEN** the request fails closed with the required OAuth challenge without invoking the product API or disclosing owner data

#### Scenario: Unapproved identity attempts authorization
- **WHEN** any identity other than the explicitly allowlisted owner reaches the authorization flow
- **THEN** no MCP grant or application credential is issued and no private tool can be called

#### Scenario: Concurrent private product calls execute
- **WHEN** OAuth-authorized requests for different private products execute concurrently
- **THEN** OAuth context, upstream application credentials, and results remain isolated to their individual products and requests

#### Scenario: Application credential is revoked
- **WHEN** a product's dedicated read credential is revoked at the owning application
- **THEN** that product fails closed even if an older MCP OAuth grant still exists

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
- **WHEN** the operator disables one ChatGPT app, revokes its OAuth grant, or revokes its application read credential
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

#### Scenario: Private route lacks ChatGPT-compatible OAuth
- **WHEN** a private product endpoint accepts only an application PAT or browser session
- **THEN** it is reported as source-ready and ChatGPT-authentication-pending rather than registered as a ChatGPT app

#### Scenario: Setline has no owner account
- **WHEN** Setline's cloud database has no real owner row
- **THEN** its route may be deployed but owner activation remains pending until a real sign-in permits safe credential issuance

#### Scenario: CodeVetter repository is not enabled
- **WHEN** a repository is not indexed and explicitly enabled in CodeVetter
- **THEN** the local connection is reported as consent-pending and no scope is created by bypassing CodeVetter
