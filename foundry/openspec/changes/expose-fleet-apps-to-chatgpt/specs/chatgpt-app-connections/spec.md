## Purpose

Provide personal, robust, read-only MCP connections that let ChatGPT retrieve selected public and owner-scoped information from eight Fleet applications without exposing privileged credentials, unrelated private data, or mutation capabilities.

## ADDED Requirements

### Requirement: App-scoped ChatGPT connections
The system SHALL present Reader, Starboard, High Signal, Calorie, Anime List by Significant Hobbies, Significant Hobbies, Research Papers, and Setline as eight separate MCP connections with distinct names, instructions, tool catalogs, credentials, and enablement state.

#### Scenario: User enables one application
- **WHEN** the user enables one connection and leaves the other seven disabled
- **THEN** ChatGPT can discover and call only the enabled application's tools

#### Scenario: Connection identity is inspectable
- **WHEN** an MCP client initializes any connection
- **THEN** the server returns a stable application-specific name, version, instructions, and tool catalog

### Requirement: Private personal transport
The system SHALL support private/local connections through outbound-only Secure MCP Tunnel profiles backed by local stdio or approved Streamable HTTP MCP servers, without requiring new public inbound MCP endpoints.

#### Scenario: Connection is healthy
- **WHEN** the matching profile is running, associated with the user's ChatGPT workspace, and ready
- **THEN** ChatGPT can discover and invoke that connection

#### Scenario: Tunnel is unavailable
- **WHEN** a matching private profile is stopped or unhealthy
- **THEN** calls fail without falling back to a public unauthenticated or broader-privilege endpoint

### Requirement: Strictly read-only focused tools
Every connection SHALL expose one focused tool per recognizable retrieval goal, with an action-oriented name, human-readable title, usage description, explicit input schema, explicit structured output schema, and accurate MCP safety annotations. Every tool MUST advertise `readOnlyHint: true` and `destructiveHint: false`, and no tool may mutate application or provider state.

#### Scenario: Client lists tools
- **WHEN** an MCP client requests a tool catalog
- **THEN** every advertised tool is read-only, non-destructive, and distinguishable from the other retrieval tools

#### Scenario: Read-semantic POST is required by an existing API
- **WHEN** Anime List performs catalog search through its existing POST endpoint
- **THEN** the server permits only that fixed method/path pair and validated search body, and the operation changes no application or provider state

#### Scenario: User requests a mutation
- **WHEN** the user asks to save, update, log, complete, publish, delete, subscribe, import, sync, refresh, ingest, or otherwise mutate state
- **THEN** no available MCP tool can perform or broaden into that action

#### Scenario: User requests an escape hatch
- **WHEN** the user supplies a URL, route, HTTP method, headers, SQL, or arbitrary request body
- **THEN** no tool treats those values as transport instructions

### Requirement: Least-privilege owner authentication
Owner-scoped connections SHALL use dedicated, revocable, hashed read credentials that resolve exactly one user and authorize only the advertised read operations. The system MUST NOT use Cloudflare account tokens, database administration tokens, browser session cookies, provider credentials, or another credential with write authority.

#### Scenario: Existing owner credential is used
- **WHEN** Reader or Anime List calls an owner tool with a valid dedicated `rdr_*` or `anime_list_*` credential
- **THEN** the owning application resolves the user and applies its existing ownership checks

#### Scenario: Calorie or Setline owner credential is used
- **WHEN** an owner calls a Calorie or Setline tool with the new app-specific read-only token
- **THEN** the application resolves one owner and permits only the narrow read handlers

#### Scenario: Credential is missing, invalid, or revoked
- **WHEN** an owner-specific tool lacks a valid active credential
- **THEN** the call fails closed without falling back to an anonymous, shared, cookie, or admin identity

### Requirement: Reader retrieval workflows
The Reader connection SHALL let the owner search saved reading, inspect one saved item, and list existing lists or projects needed to interpret results. It MUST NOT expose saving, note or metadata changes, list changes, deletion, key management, PDF object download, AI-provider credentials, or public-share management.

#### Scenario: Search saved reading
- **WHEN** the owner provides a query and optional list, project, type, or result limit
- **THEN** the connection returns bounded matches with stable identifiers, title, canonical URL, type, snippet, tags, list references, timestamps, and continuation state

#### Scenario: Inspect one saved item
- **WHEN** the owner supplies an identifier returned by search
- **THEN** Reader returns that owned item's readable content, notes, metadata, and source URL subject to an explicit response-size bound

#### Scenario: Item belongs to another user
- **WHEN** an authenticated detail request references an item outside the resolved owner's authority
- **THEN** the call fails without disclosing whether another user's record exists

### Requirement: Starboard retrieval workflows
The Starboard connection SHALL let the user search the public repository catalog, inspect a repository, query grounded tool-adoption evidence, and preview a cataloged public GitHub project. It MUST NOT expose saved libraries, discussions, private repositories, authenticated filters, jobs, backfills, or raw database access.

#### Scenario: Search public repositories
- **WHEN** the user supplies a query and optional language, tool, sort, or limit filters
- **THEN** the connection returns bounded public matches with stable identifiers, canonical repository URLs, evidence-bearing metadata, and continuation state

#### Scenario: Preview a public project
- **WHEN** the user supplies a cataloged public repository URL or owner/name pair
- **THEN** Starboard returns its public profile and grounded peer/tool recommendations or a specific unavailable error

### Requirement: High Signal retrieval workflows
The High Signal connection SHALL let the user search published signals, inspect one signal and cited evidence, retrieve the current Daily Brief, and query public track-record context. It MUST NOT expose owner watchlists, mentions, delivery, review, admin, ingest, source refresh, AI-provider, or database mutation capabilities.

#### Scenario: Search published signals
- **WHEN** the user supplies a query and supported filters
- **THEN** High Signal returns bounded published matches with stable identifiers, confidence, dates, entities, source-linked evidence, and continuation state

#### Scenario: Retrieve Daily Brief
- **WHEN** the user requests the current brief with an optional supported region
- **THEN** High Signal returns public brief sections with cited evidence and explicit freshness

### Requirement: Calorie owner retrieval workflows
The Calorie connection SHALL let the owner retrieve one local day's nutrition summary, bounded nutrition history, saved foods, and goal-cycle context. It SHALL exclude medication routines and check-ins from schemas and output, and MUST NOT log food, water, weight, medication, or any other state.

#### Scenario: Retrieve daily nutrition
- **WHEN** the owner supplies a valid local date and timezone
- **THEN** Calorie returns bounded food entries, calories, carbs, protein, fibre, water, weight context if enabled, targets, fasting context, and recorded/calculated provenance without medication fields

#### Scenario: Retrieve nutrition history
- **WHEN** the owner supplies a valid range of at most one year
- **THEN** Calorie returns bounded daily aggregates and continuation state without treating missing days as recorded zeroes

#### Scenario: Search saved foods
- **WHEN** the owner supplies an optional query and archive state
- **THEN** Calorie returns only that owner's bounded matching foods with explicit nutrient units

#### Scenario: Medical interpretation is requested
- **WHEN** the user asks the tool to diagnose, prescribe, or infer medication adherence
- **THEN** no Calorie tool provides medication data or represents informational nutrition calculations as medical advice

### Requirement: Anime List retrieval workflows
The Anime List connection SHALL preserve its existing public anime/manga catalog tools and owner-only watchlist tools while adding explicit schemas, bounded inputs and outputs, safety annotations, redaction, timeouts, and stable error mapping. It MUST NOT expose watchlist, schedule, dismissal, import, token-management, or catalog mutation routes.

#### Scenario: Search a catalog
- **WHEN** the user supplies valid anime or manga filters
- **THEN** Anime List returns a bounded catalog page with total, stable MAL identifiers, canonical detail URLs, and continuation state

#### Scenario: Read an owner watchlist
- **WHEN** the user calls an authenticated watchlist tool with a valid PAT
- **THEN** Anime List returns only that owner's bounded anime or manga watchlist data

#### Scenario: Cookie-only authentication is supplied
- **WHEN** an MCP request has a browser session cookie but no valid bearer PAT
- **THEN** owner-only tools reject it while public catalog tools remain public

### Requirement: Significant Hobbies public retrieval workflows
The Significant Hobbies connection SHALL expose only public hobby/experience corpus data and timelines whose stored visibility is exactly `PUBLIC`. It MUST NOT expose Daily, journal, habits, Trajectory, commitments, bucket lists, private or unlisted timelines, account data, or signed-out device-local data.

#### Scenario: Search hobbies or experiences
- **WHEN** the user provides a query and supported category, facet, effort, cost, or limit filters
- **THEN** the connection returns bounded public corpus matches with stable slugs, concise descriptions, canonical URLs, and continuation state

#### Scenario: Inspect an experience
- **WHEN** the user supplies a stable public experience slug
- **THEN** the connection returns its public description, first steps, related experiences, and source-owned canonical URL

#### Scenario: Search public timelines
- **WHEN** the user requests public timeline examples or supplies a public query
- **THEN** the connection returns only records verified as `PUBLIC`, with stable identifiers, public profile/timeline URLs, and bounded summaries

#### Scenario: Private Significant Hobbies data is requested
- **WHEN** the user requests private Daily or Living records
- **THEN** no available tool broadens the request into a session, database, or device-local read

### Requirement: Research Papers retrieval workflows
The Research Papers connection SHALL support paper search/detail, similar papers, hot papers, sleepers, and curated reading paths. It MUST NOT invoke RAG/paid-answer POST routes, ingest or enrichment jobs, raw ClickHouse queries, PDF redistribution, or operator controls.

#### Scenario: Search the local corpus
- **WHEN** the operator-local FastAPI service is healthy and the user submits a bounded query
- **THEN** the connection returns matching paper metadata, stable paper identifiers, canonical source links, relevant scores/provenance, and continuation state with `retrievalMode: "local-corpus"`

#### Scenario: Static fallback supports the request
- **WHEN** the local corpus is unavailable and an approved public static export supports the requested hot, sleeper, or reading-path operation
- **THEN** the connection returns that bounded result with the exact fallback mode and export freshness labeled

#### Scenario: Static fallback cannot support the request
- **WHEN** full-corpus search, detail, or similarity is requested while the local corpus is unavailable
- **THEN** the tool returns `unsupported_in_current_mode` and does not fabricate a partial corpus answer

### Requirement: Setline owner retrieval workflows
The Setline connection SHALL let the owner retrieve programme/template structure, bounded workout history, one historical session, and recorded-history progress. It SHALL preserve exercise/set order and authored, adjusted, recorded, and calculated distinctions. It MUST NOT start or alter sessions, complete or defer sets, accept progression recommendations, import/export/replace state, sync writes, delete accounts, or act as a coach.

#### Scenario: Retrieve a training programme
- **WHEN** the owner requests the bundled or current custom programme
- **THEN** Setline returns its ordered weeks, days, workouts, exercises, targets, units, and authored provenance without rewriting or recommending changes

#### Scenario: Retrieve workout history
- **WHEN** the owner supplies valid bounded date, workout, or exercise filters
- **THEN** Setline returns matching saved sessions with immutable order, explicit actuals, units, and continuation state

#### Scenario: Retrieve progress
- **WHEN** the owner requests an existing exercise, workout, or programme-week progress view
- **THEN** Setline returns recorded-history analytics with measurement provenance and honest empty/legacy boundaries

#### Scenario: Coaching or execution is requested
- **WHEN** the user asks ChatGPT to change a programme, accept a recommendation, or record a set
- **THEN** no Setline tool can perform the action or represent an inference as recorded data

### Requirement: Bounded model-readable results
Tool results SHALL contain concise text plus `structuredContent` matching the declared output schema. Results MUST use stable identifiers, pagination or explicit limits, canonical source URLs where applicable, explicit freshness/retrieval mode, and enough state for follow-up without returning secrets, unrelated private data, or unbounded corpora.

#### Scenario: Follow-up uses a prior identifier
- **WHEN** ChatGPT calls a detail tool with an identifier returned by a prior call
- **THEN** the same record resolves or a specific stale/not-found error is returned

#### Scenario: Result exceeds a bound
- **WHEN** more records or text match than the supported response limit
- **THEN** the tool returns a bounded page or truncated detail with explicit continuation/truncation metadata

#### Scenario: Result depends on evidence
- **WHEN** a recommendation, signal, paper score, or calculation depends on stored evidence
- **THEN** the structured result includes its evidence/provenance and canonical source where available

### Requirement: Deterministic failures and degraded behavior
Each tool SHALL validate inputs before calling an app, enforce bounded timeouts, retry safe read operations at most once under documented conditions, validate upstream responses, and map failures to stable categories without fabricating success, evidence, or freshness.

#### Scenario: Input is invalid
- **WHEN** a tool receives an invalid identifier, URL, cursor, date, timezone, enum, filter, or limit
- **THEN** it returns `invalid_input` without calling the application

#### Scenario: Application times out
- **WHEN** an application does not respond within the configured bound
- **THEN** the tool returns a retryable `timeout` error and no partial result is represented as complete

#### Scenario: No records match
- **WHEN** a valid retrieval returns no matching records
- **THEN** the tool returns an empty structured collection rather than an exception or invented recommendation

### Requirement: Secret-safe operation
The runtime and adapters MUST NOT print or return application credentials, tunnel runtime keys, authorization headers, cookies, environment values, provider secrets, or secret-manager output. Diagnostics SHALL retain only tool names, sanitized arguments, outcomes, timing, retrieval mode, and sanitized errors.

#### Scenario: Credential is rejected
- **WHEN** an application rejects a credential
- **THEN** the result contains a useful `unauthorized` error without echoing credentials or authorization material

#### Scenario: Diagnostic output is retained
- **WHEN** an operator captures test, Inspector, server, or tunnel-doctor output
- **THEN** the retained output is safe to store without secret values or unrelated private record contents

### Requirement: Eight-connection acceptance suite
Each connection SHALL have deterministic contract tests and retained evaluations covering direct, indirect, follow-up, empty, invalid, unauthorized where applicable, degraded, unsupported, cross-app, and mutation prompts. Each connection MUST pass MCP Inspector discovery and representative retrieval before ChatGPT developer-mode setup.

#### Scenario: Metadata or schema changes
- **WHEN** a tool name, description, schema, annotation, authentication rule, result shape, or privacy projection changes
- **THEN** the affected contract tests and evaluations are rerun before refreshing the connection

#### Scenario: Negative selection case
- **WHEN** a prompt requests mutation, privileged data, another app's data, or an unsupported workflow
- **THEN** ChatGPT does not select a tool that broadens the request

### Requirement: Manual activation and publication boundary
Issue creation, dependency approval, credential-model approval, migration application, token issuance, tunnel association, ChatGPT installation, production deployment, and public plugin submission SHALL remain explicit operator actions. The implementation SHALL NOT automatically start tunnels, deploy apps, apply migrations, create credentials, create public MCP endpoints, or submit a plugin.

#### Scenario: Local implementation is complete
- **WHEN** code and local tests pass but external setup has not been approved or completed
- **THEN** the change is reported as implementation-ready, not connected, deployed, migrated, or published

#### Scenario: Public distribution is requested later
- **WHEN** the owner chooses to distribute a connection beyond personal developer mode
- **THEN** a separate reviewed change covers public HTTPS, OAuth 2.1 for private data, privacy disclosures, packaging, and OpenAI submission requirements
