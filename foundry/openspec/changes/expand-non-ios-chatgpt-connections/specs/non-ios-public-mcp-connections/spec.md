## Purpose

Extends ChatGPT's read-only reach to useful, already-public non-iOS product
data while keeping eligibility, source parity, isolation, and deferrals
explicit and testable.

## ADDED Requirements

### Requirement: Eligibility follows an existing structured read boundary
An additional non-iOS product SHALL be enabled only when it has a live,
bounded, structured, non-secret read contract that provides useful queryable
product data without requiring a new product API, data copy, account-linking
system, browser session, service credential, or mutation.

#### Scenario: Existing public JSON contract is eligible
- **WHEN** a maintained non-iOS product publishes useful structured JSON over HTTPS
- **THEN** the product can be added through fixed read-only gateway operations

#### Scenario: Product lacks an eligible boundary
- **WHEN** a product is static-only, device-only, browser-local, mutation-oriented, session-only, or service-key-only
- **THEN** it remains deferred with a recorded reason and no synthetic connector

### Requirement: Six additional public products are independently queryable
The system SHALL expose independent public connections for PostTrainLLM, SWE
Interview Prep, What It Takes to Win, SaaS Maker, Drank, and LoopTV.

#### Scenario: One additional connection is enabled
- **WHEN** an MCP client initializes any one of the six routes
- **THEN** it receives only that product's identity and read-only tool catalog

### Requirement: PostTrainLLM exposes published model evidence
The PostTrainLLM connection SHALL support bounded model and leaderboard reads
from its published leaderboard and gallery contracts, preserving stable model
identifiers, benchmark evidence, provenance, and freshness when available.

#### Scenario: User searches published models
- **WHEN** the user supplies optional text or benchmark filters
- **THEN** the connection returns matching published models within the requested bound

#### Scenario: User requests one model
- **WHEN** the user supplies a stable model identifier from a previous result
- **THEN** the connection returns that model's published metadata and evidence or a stable not-found error

### Requirement: SWE Interview Prep exposes the public curriculum
The SWE Interview Prep connection SHALL support bounded discovery of public
tracks, concepts, roadmaps, and system-design cases from the published
curriculum contracts.

#### Scenario: User searches learning material
- **WHEN** the user searches the curriculum with optional kind, track, difficulty, or text filters
- **THEN** the connection returns bounded public curriculum matches with stable identifiers and canonical URLs

#### Scenario: User requests a system-design case
- **WHEN** the user supplies a stable case identifier
- **THEN** the connection returns the published prompt, pattern, critical path, linked concepts, and practice or guide URL

### Requirement: What It Takes to Win exposes public research records
The What It Takes to Win connection SHALL support bounded search and detail
over the published research index without returning unpublished research
artifacts or accepting arbitrary dataset paths.

#### Scenario: User searches people or milestones
- **WHEN** the user supplies optional text and category filters
- **THEN** the connection returns bounded public matches with stable person identifiers

#### Scenario: User requests one public record
- **WHEN** the user supplies a stable person identifier from search
- **THEN** the connection returns the corresponding published index record or a stable not-found error

### Requirement: SaaS Maker exposes the privacy-checked public portfolio
The SaaS Maker connection SHALL support bounded product, surface, and learning
reads from the public agent catalog without exposing private Fleet registry,
operational, repository, or owner-only data.

#### Scenario: User searches public products
- **WHEN** the user supplies optional text, priority, tier, category, or maturity filters
- **THEN** the connection returns bounded privacy-checked public product records

#### Scenario: User requests one public product
- **WHEN** the user supplies a stable product identifier
- **THEN** the connection returns only that product's published catalog fields and links

### Requirement: Drank exposes the public Domain Rating lookup
The Drank connection SHALL retrieve the current public Domain Rating for one
validated domain through its existing fixed product route without exposing the
upstream provider credential or arbitrary provider access.

#### Scenario: User requests a Domain Rating
- **WHEN** the user supplies a valid public hostname
- **THEN** the connection returns the normalized hostname, current rating, retrieval time, and Drank provenance

### Requirement: LoopTV exposes public catalog status
The LoopTV connection SHALL expose the published catalog summary including
freshness, refresh coverage, total video count, and station counts without
forwarding the oversized full video catalog.

#### Scenario: User requests catalog status
- **WHEN** the user asks about LoopTV catalog freshness, coverage, size, or station counts
- **THEN** the connection returns the bounded public catalog summary with provenance

### Requirement: Additional connections remain strictly read-only and isolated
Every additional route MUST accept only fixed GET reads, MUST advertise
read-only and non-destructive tool annotations with no authentication, MUST
reject arbitrary transport instructions and credentials, and MUST not expose
another product's tools or route through its branded hostname.

#### Scenario: Mutation or arbitrary transport is requested
- **WHEN** a client asks for a write, arbitrary URL, method, header, body, SQL, file, or credential operation
- **THEN** no advertised tool can perform or broaden into that request

#### Scenario: Wrong branded host is used
- **WHEN** a client requests one product's route through another product's hostname
- **THEN** the gateway returns a bounded not-found response without invoking an upstream

### Requirement: Contract parity and retained evidence cover every enabled route
The system SHALL prove exact tool-catalog parity, fixed upstream mapping,
bounded output, privacy redaction, hostname isolation, positive and negative
protocol cases, and production-monitor readiness for every added route before
deployment or ChatGPT activation.

#### Scenario: Expansion is declared implementation-ready
- **WHEN** local verification completes
- **THEN** retained evidence identifies every expected tool and source, every passed gate, every skipped external action, and every residual limit
