## ADDED Requirements

### Requirement: Founder Control provides a normalized connection projection

Founder Control SHALL expose a versioned private projection containing the six
Foundry buckets, their components, intended connections, current status,
freshness, sanitized evidence summaries, recorded outputs, project rollups,
history, and bounded improvement actions.

#### Scenario: Operator requests connection state

- **WHEN** the authenticated Console requests `/v1/connections`
- **THEN** it receives stable output, project, history, improvement, bucket,
  component, connection, summary, and evidence fields without querying provider
  stores from the browser

### Requirement: Output claims come from recorded evidence

The projection MUST report skill executions, captured output metadata, numeric
observations, public checks, domain histories, and performance histories only
when the corresponding provider evidence is readable. It MUST NOT combine
incompatible units into a synthetic output or productivity score.

#### Scenario: Skill run retained an output

- **WHEN** a stored skill run has one or more sanitized retained streams
- **THEN** the projection reports the run, project, status, capture type,
  bounded result summary, output count, stored byte count, and any structured
  observations without returning the output body or filesystem path

#### Scenario: Project has multiple evidence providers

- **WHEN** a canonical project has skill, public workflow, Drank, PSI, or AI
  visibility evidence
- **THEN** the project rollup identifies each produced observation, its current
  result, its history availability, and its newest observation time

#### Scenario: Project has only one comparable observation

- **WHEN** a metric or project signal has fewer than two comparable observations
- **THEN** the projection labels it baseline-only or without history rather
  than asserting a trend

### Requirement: Improvement actions are evidence-backed

The projection SHALL derive bounded improvement actions from missing, partial,
failing, stale, regressing, or unmeasured evidence and identify the affected
project or system relationship. It SHALL join a matching canonical active
mission when one exists and label every unlinked action not started rather than
presenting a recommendation as work underway.

#### Scenario: Public project check fails

- **WHEN** the newest availability or performance report marks a project failed
- **THEN** the output projection ranks a repair action and links it to the
  project evidence

#### Scenario: Focus project lacks AI visibility output

- **WHEN** a configured focus project has no AI visibility observation
- **THEN** the output projection requests a first baseline without claiming
  that visibility improved or declined

#### Scenario: Recommended action has no active mission

- **WHEN** an evidence-backed improvement has no matching active canonical mission
- **THEN** Fleet Console labels it not started and identifies it as a recommendation

### Requirement: Transport status and evidence freshness remain distinct

The projection MUST distinguish transport state (`connected`, `partial`,
`missing`, or `unavailable`) from evidence freshness (`fresh`, `stale`,
`unknown`, or `not-applicable`). A connected path with stale or absent
observations MUST NOT appear equivalent to a connected path with fresh
evidence.

#### Scenario: Package exists without ingestion

- **WHEN** the Feedback package is readable but no Fleet ingestion or Console inbox consumes submissions
- **THEN** the Feedback relationship is partial or missing and is not labeled connected

#### Scenario: Producer and consumer are readable

- **WHEN** a supported producer emits a readable durable contract consumed by Fleet Console
- **THEN** the projection labels the connection connected and includes its transport and observation time

#### Scenario: Implemented transport has stale evidence

- **WHEN** a producer and consumer remain implemented but their newest durable observation exceeds its freshness window
- **THEN** the transport remains connected while the projection and Console expose stale evidence as an actionable gap

### Requirement: Provider failure is isolated

Every connection reader SHALL fail softly and preserve the remainder of the
projection when an optional checked-in report, local file, submodule, or
machine-local database is absent or unreadable.

#### Scenario: Skill-run store is unavailable

- **WHEN** the machine-local skill-run store cannot be read
- **THEN** skill evidence is marked unavailable while project, Marketing, and other connection summaries remain readable

### Requirement: Private evidence remains bounded

The connection projection MUST return only counts, safe labels, timestamps,
status, transport descriptions, owner paths, structured observations, and a
bounded result summary that passes the private-path and sensitive-text filter.
It MUST NOT return retained skill output bodies, feedback bodies, credentials,
private database paths, or raw provider payloads. A separate owner-only run
detail request MAY return the already-sanitized retained streams for one
explicit run, bounded by stream and response size and without filesystem paths.

#### Scenario: Skill runs have retained output

- **WHEN** skill-run envelopes reference owner-readable retained output
- **THEN** Fleet Console receives run and metric counts plus a bounded safe
  result summary when derivable, but no retained output body or filesystem
  location

#### Scenario: Operator explicitly opens one run output

- **WHEN** the operator expands output for one retained run
- **THEN** Founder Control returns only that run's sanitized, size-bounded
  streams without returning a filesystem path or loading output bodies into the
  bulk ledger response

### Requirement: Console mirrors the six product buckets

Fleet Console SHALL expose a responsive, collapsible sidebar that maps the
owner views to Projects, Metrics, Marketing, and Feedback without
repeating repository bucket headings in the navigation. Projects SHALL be the
default Console destination; Overview SHALL not remain as a separate primary
page. Generic skill history SHALL not remain as a primary or secondary Console
destination.

#### Scenario: Operator moves between product concerns

- **WHEN** the operator expands the Console navigation
- **THEN** each repository bucket has one clear destination and its current page
  is identifiable without relying on color alone

#### Scenario: Operator collapses the desktop sidebar

- **WHEN** the operator collapses the sidebar
- **THEN** icon navigation and accessible names remain available while the
  content region gains space

#### Scenario: Operator opens navigation on a phone

- **WHEN** the viewport is narrow and the operator opens navigation
- **THEN** a modal drawer exposes every destination, closes by button, backdrop,
  or Escape, and returns focus to the opener

### Requirement: Console separates evidence by operator question

Fleet Console SHALL distribute output evidence across focused Projects,
Metrics, Marketing, and Feedback pages instead of combining all evidence in one
Outputs page.

#### Scenario: Operator follows a legacy skill-history route

- **WHEN** the operator opens `/skill-uses`, `/activity`, `/build`, or `/devlog`
- **THEN** the Console redirects to Metrics
- **AND** generic operational run logs are not presented as longitudinal
  project history

#### Scenario: Operator opens Metrics

- **WHEN** helper evidence is available
- **THEN** Metrics shows every approved visibility outcome and readiness family
- **AND** each family shows its project-level current result, native-unit
  history, and evidence-backed action when available
- **AND** availability checks, arbitrary skill metrics, connection coverage,
  and generic measurement totals remain outside the Metrics page

#### Scenario: Operator opens Projects

- **WHEN** project registry and output evidence are available
- **THEN** Projects acts as a directory with one row per canonical product and
  direct actions to open its Console record, owned website changelog, and source
  repository
- **AND** helper-category providers remain in Metrics rather than appearing as
  standalone directory projects
- **AND** the directory starts immediately after a compact page-level project
  filter without a redundant subsection heading
- **AND** unavailable public or source actions are stated honestly rather than
  replaced with mission or decision filler

#### Scenario: Operator opens Feedback without ingestion

- **WHEN** the Feedback package exists but no Fleet ingestion or inbox exists
- **THEN** Feedback shows an owner inbox with zero submissions and a concise
  factual empty state
- **AND** it does not replace the missing feedback with package, transport, or
  architecture documentation

#### Scenario: Operator opens Feedback with submissions

- **WHEN** sanitized project-owned submissions are available through the
  normalized projection
- **THEN** Feedback shows the newest submissions first with project, category,
  bounded message, page context, attachment presence, and received time

### Requirement: Console applies one project scope

Fleet Console SHALL expose one URL-persisted project filter across Projects,
Metrics, Marketing, and Feedback.

#### Scenario: Operator selects one project

- **WHEN** the operator selects a canonical project
- **THEN** the current page filters its project-owned rows, actions, periods,
  and charts and every sidebar destination carries the same project scope

#### Scenario: Operator clears project scope

- **WHEN** the operator selects all projects
- **THEN** the page returns to portfolio evidence without retaining a hidden
  project constraint

#### Scenario: System Map opens under project scope

- **WHEN** one project is selected and the operator opens the System Map
- **THEN** the map remains explicitly portfolio-wide because transports are
  system relationships

### Requirement: Comparable numerical evidence is graphed

The normalized projection SHALL include bounded dated series for retained
numeric observations, and the Console SHALL graph every series with two or more
comparable points without combining incompatible units.

#### Scenario: PSI Swarm has historical observations

- **WHEN** a project has at least two PSI observations
- **THEN** Metrics graphs performance score, LCP, and CLS as separate dated
  series and states start, current, change, observation count, and date range
- **AND** moving anywhere across a plot exposes the nearest observation's exact
  date and native-unit value without persistent point markers

#### Scenario: D-Rank has historical observations

- **WHEN** a project domain has at least two domain-rating observations
- **THEN** Metrics graphs domain rating and states its historical improvement
  without copying Drank domain logic into the client

#### Scenario: AI Visibility has historical observations

- **WHEN** a project has at least two normalized AI Visibility runs
- **THEN** Metrics graphs visibility, recommendation, citation, coverage, and
  rank histories in their own units

#### Scenario: Numerical signal has one observation

- **WHEN** a numerical signal has fewer than two dated observations
- **THEN** the Console shows a baseline-only state and does not draw a trend or
  claim improvement

### Requirement: Metrics is the primary evidence workspace

Metrics SHALL answer whether Fleet projects are becoming more visible. It SHALL
show one canonical project row with D-Rank, AI Agent Readiness, PSI, and LCP for
every eligible project. It SHALL omit portfolio columns whose provider-backed
outcomes do not exist and SHALL keep Design review in project detail as a
quality gate rather than a comparative metric. Cells SHALL expose concrete
latest values, trend state, and measurement state without calculating or
presenting blended aggregate scores. The project identity SHALL open its project
page and each cell SHALL deep-link to the matching project section. The project page SHALL
contain D-Rank, Search Visibility, and Content Coverage under SEO; AI
Crawlability, AI Agent Readiness, and AI Visibility under GEO; PSI Swarm under
Performance; and Design Critique under Design.
Generic skill-run history SHALL remain outside Metrics and SHALL not be linked
as a secondary Console product.

The matrix and every project section SHALL use the same canonical 27-project
set rather than only projects that already produced evidence:

- Search Visibility SHALL include every canonical project while distinguishing
  configured projects, missing observations, and projects without a public
  domain.
- PSI Swarm SHALL include every maintained public listing with a canonical
  domain and every maintained live project with an explicit public-site metric
  override.
- D-Rank SHALL include every eligible project and use its canonical first
  domain for measurement.
- AI Visibility SHALL include every maintained public listing with a canonical
  domain and every maintained live project with an explicit public-site metric
  override, while distinguishing configured projects from eligible projects
  that do not yet have a configuration or baseline.
- Design Critique SHALL include every eligible project and distinguish missing
  design-review receipts from valid scored reviews.
- AI Agent Readiness, AI Crawlability, and Content Coverage SHALL include every
  canonical project and distinguish runnable public surfaces from projects
  without a public domain or recorded audit.
- AI Crawlability SHALL retain a separate score and history derived only from
  robots, critical AI-bot access, and sitemap checks in the shared agent audit.
- AI Agent Readiness SHALL retain public-route Markdown coverage as a
  percentage and native readable/public route counts, plus `/api/ai`
  catalog-surface integrity as a percentage and native valid/configured
  surface counts. Route volume alone SHALL NOT increase readiness.

#### Scenario: Operator opens Metrics

- **WHEN** the Metrics page first renders
- **THEN** the operator sees every eligible project with D-Rank, Agent
  Readiness, PSI, and LCP summaries
- **AND** concrete values such as domain rating and LCP remain visible when
  recorded
- **AND** selecting a project or summary opens the canonical project page at
  the relevant detailed section

#### Scenario: Operator opens a project metric section

- **WHEN** the operator follows a D-Rank, Agent Readiness, or Performance summary
- **THEN** the project page shows the native-unit histories, evidence, missing
  states, and available run controls for that section
- **AND** the other project metric sections remain available on the same page

#### Scenario: Eligible project has no recorded evidence

- **WHEN** an eligible project has no recorded evidence for a Metrics family
- **THEN** its family still includes the project with an explicit missing
  baseline, configuration, public-domain, or receipt state
- **AND** the Console does not present missing evidence as a zero score

#### Scenario: D-Rank retains non-active history

- **WHEN** the checked-in D-Rank dataset contains a domain mapped to a past or
  non-product catalog identity
- **THEN** D-Rank preserves that history in its authoritative dataset
- **AND** the primary Metrics coverage count does not treat that identity as an
  active eligible project

#### Scenario: Operator reviews observability history

- **WHEN** comparable observability observations are retained
- **THEN** Metrics graphs those project-level histories in their native units
- **AND** unrelated skill runs do not appear as project trends

#### Scenario: Public project publishes agent-readable routes

- **WHEN** a project's sitemap exposes public page URLs
- **THEN** the shared agent audit checks every bounded same-origin page on
  small sites and a deterministic distributed sample on large corpora for
  Markdown negotiation or a same-route Markdown alternate
- **AND** Metrics retains the dated readable count, checked-route count,
  public-route count, and coverage percentage
- **AND** the readiness result distinguishes complete coverage from a large but
  partially readable corpus

#### Scenario: API catalog advertises agent surfaces

- **WHEN** `/api/ai` advertises one or more surfaces
- **THEN** the shared agent audit verifies that each bounded same-origin
  Markdown target resolves as non-HTML agent-readable content
- **AND** Metrics retains valid/configured counts and integrity percentage
- **AND** an empty array or an unreadable advertised target does not count as
  complete surface integrity

#### Scenario: Design review evidence exists

- **WHEN** a project has a valid design-review receipt or explicit design score
  observation
- **THEN** Metrics showcases critique and audit as prominent scored results
  against their native maximums, with completion bars, observation time, and
  owner-review state
- **AND** historical charts appear only when comparable design history exists

### Requirement: Metric collection is owner-triggered and allowlisted

Founder Control SHALL expose authenticated, asynchronous run actions for AI
Agent Readiness, AI Crawlability, Content Coverage, PSI Swarm, D-Rank, AI
Visibility canary, and Design Critique. Each action SHALL resolve its project
and command from canonical server-side configuration, run without a shell,
reject concurrent duplicate runs, expose bounded status, and refresh the
matching report after completion. Search Visibility SHALL identify its
agent-mediated observation workflow instead of exposing a local run action.

#### Scenario: Operator triggers PSI Swarm

- **WHEN** the operator starts PSI Swarm for a project with a canonical domain
- **THEN** Founder Control launches the existing local PSI runner for only that
  domain and returns a pollable run receipt

#### Scenario: Operator triggers D-Rank

- **WHEN** the operator starts D-Rank for a project with a canonical domain
- **THEN** Founder Control launches the existing Ahrefs public-endpoint updater
  for only that domain and preserves all other domain history

#### Scenario: Operator triggers AI Visibility

- **WHEN** live providers remain disabled
- **THEN** the action is labeled and executed as the existing fixture canary,
  never as a live visibility measurement

#### Scenario: Operator triggers Design Critique

- **WHEN** a project has a design-review receipt
- **THEN** Founder Control validates the existing receipt through the tracked
  design workflow and returns its bounded pass or failure result

#### Scenario: Operator triggers a readiness audit

- **WHEN** the operator starts AI Agent Readiness, AI Crawlability, or Content
  Coverage for a project with the required public surface
- **THEN** Founder Control launches the existing allowlisted skill runner for
  only that project and retains a normalized observation for future comparison
- **AND** an AI Agent Readiness or AI Crawlability run records both separate
  views from the same live audit

#### Scenario: Operator reviews Search Visibility

- **WHEN** Search Visibility requires a new observation
- **THEN** the owner may invoke the read-only Search Console collector
- **AND** the collector maps accessible properties to canonical project domains,
  requests aggregate clicks, impressions, CTR, and average position, and records
  only normalized outcomes in the private ledger
- **AND** a missing or unauthorized property is reported as unavailable rather
  than recorded as zero

#### Scenario: Metric action is already running

- **WHEN** the same metric family and project are already in flight
- **THEN** Founder Control returns the existing run receipt instead of starting
  another process

### Requirement: Search Console collection is private and read-only

Fleet Ops SHALL collect Search Console outcomes through owner-authorized local
Application Default Credentials without retaining access tokens, query rows, or
credentials. Domain-property requests SHALL be constrained to each project's
canonical HTTPS hostname so projects sharing one root property remain separate.
The default reporting window SHALL end on a completed, non-preliminary day.

#### Scenario: Several projects share one Domain property

- **WHEN** multiple canonical project hosts are covered by one accessible
  Search Console Domain property
- **THEN** the collector queries each host separately with a page filter
- **AND** stores one project-scoped aggregate observation per host

#### Scenario: Search Console returns no rows

- **WHEN** an authorized property returns no rows for the requested host and
  completed reporting period
- **THEN** the collector records zero impressions, clicks, and CTR for that
  measured scope
- **AND** does not invent an average position value

### Requirement: Metrics distinguishes outcomes, readiness, and fixtures

The normalized projection and Console MUST distinguish earned search or AI
visibility outcomes from technical readiness audits, domain-level authority
measurements, and fixture canaries. Every displayed measurement MUST retain its
source and provider observation time. The API generation time MUST NOT be used
as the measurement freshness boundary.

#### Scenario: Only an AI fixture canary exists

- **WHEN** a project has an AI Visibility observation whose evidence mode is
  `fixture`
- **THEN** the matrix omits AI Visibility rather than repeating an unmeasured outcome
- **AND** the fixture remains available only as operational runner evidence
- **AND** its zero or non-zero value is excluded from outcome sorting and
  visibility claims

#### Scenario: Search Console evidence is absent

- **WHEN** a project has tracked web-search queries but no Google Search Console
  observation
- **THEN** the matrix omits the direct search outcome rather than repeating a
  missing provider state for every project
- **AND** query-level web-search observations remain available in the detailed
  SEO evidence without being presented as an overall project grade

#### Scenario: Technical GEO readiness is recorded

- **WHEN** an Agent Readiness or Crawlability audit records a score
- **THEN** the GEO summary labels that value technical readiness rather than
  earned AI visibility
- **AND** it retains the audit source and observation time

#### Scenario: D-Rank is measured for a domain

- **WHEN** Drank records a domain rating used by one or more project rows
- **THEN** every row identifies the measured domain, source, observation time,
  and whether the value is inherited from a shared root-domain scope

#### Scenario: A visible measure has no defensible source

- **WHEN** the projection cannot provide both provider evidence and an
  observation time for an outcome
- **THEN** the Console shows an explicit not-measured state instead of a zero,
  letter grade, generated timestamp, or inferred score

### Requirement: Operational skill logs remain centrally owned

Skill implementations SHALL emit structured observations to the Fleet runner
without writing directly to Console storage or D1. Generic skill-run envelopes
MAY remain available for debugging and auditability, but SHALL NOT be treated
as longitudinal project metrics.

#### Scenario: Local skill completes

- **WHEN** a supported skill completes locally
- **THEN** the central runner records one immutable normalized envelope and
  retained output metadata for operational inspection
- **AND** only approved observability observations project longitudinally into
  Metrics

#### Scenario: Hosted history is added later

- **WHEN** Fleet requires cross-machine hosted skill history
- **THEN** one authenticated Fleet ingestion boundary may persist sanitized run
  envelopes while individual skills remain storage- and credential-agnostic

### Requirement: Console preserves topology in a System Map sheet

The six-bucket panorama, gaps, complete connection ledger, and provider evidence
SHALL remain available from Metrics in a modal left-side sheet.

#### Scenario: Operator opens the System Map

- **WHEN** the operator activates System Map
- **THEN** the existing topology opens from the left with its connection state,
  gaps, ledger, and evidence intact while the output surface remains underneath

#### Scenario: Operator follows a connection deep link

- **WHEN** an owner path targets a connection ledger row
- **THEN** the System Map opens, the matching disclosure expands, and keyboard
  focus moves to that row

#### Scenario: Operator opens Metrics on a phone

- **WHEN** the viewport is 390 pixels wide
- **THEN** measures, project results, improvement actions, and the full-width
  System Map remain readable and keyboard accessible
  without horizontal page scrolling

### Requirement: Projects is the Console entrypoint

The owner SHALL land on the canonical project directory without passing through
a separate summary page. The directory SHALL favor durable project identity and
direct destinations over synthesized status filler.

#### Scenario: Project has public destinations

- **WHEN** a canonical project has a website, changelog, or source destination
- **THEN** Projects exposes each available destination directly from its row

#### Scenario: Project lacks a public destination

- **WHEN** one of those destinations is absent from canonical registry data
- **THEN** Projects labels that destination unavailable without inventing a URL

### Requirement: Every primary page earns its place

Each primary Console page SHALL answer one owner question using recorded
evidence or a concise factual empty state. Primary pages MUST NOT lead with
repository structure, implementation contracts, storage architecture,
connection topology, or explanatory filler.

#### Scenario: Operator reviews Projects

- **WHEN** canonical project state is available
- **THEN** the page answers what projects exist and where to open their Console
  record, changelog, website, and source

#### Scenario: Operator reviews Marketing

- **WHEN** AI visibility or publishing outcome evidence is available
- **THEN** Marketing shows observed visibility, historical movement,
  evidence-backed recommendations, and produced publishing outcomes
- **AND** configuration or pipeline architecture appears only when it directly
  blocks an outcome

#### Scenario: Diagnostic topology is needed

- **WHEN** the operator explicitly opens System Map
- **THEN** connection topology remains available as secondary diagnostics and
  never occupies a primary owner page

### Requirement: Credential-free external outcome ingestion

Founder Control SHALL accept a versioned private bundle of normalized Google
Search Console, Cloudflare AI Crawl Control, and Cloudflare Web Analytics
observations without loading credentials or calling provider APIs. It SHALL
validate the complete bundle before writing, require canonical project identity
and explicit provider periods, reject unknown metrics and private/raw fields,
and record stable observation ids idempotently.

#### Scenario: Operator imports provider aggregates

- **WHEN** an operator supplies a valid bundle containing Search Console and
  Cloudflare aggregate observations
- **THEN** Fleet records only the normalized aggregate metrics in its private
  local visibility-outcome ledger
- **AND** project SEO and GEO detail expose their native values, source,
  period, observation time, and history
- **AND** the portfolio matrix remains unchanged

#### Scenario: Bundle validation fails

- **WHEN** any observation names an unknown project, unsupported
  provider/family pair, unknown metric, invalid period, secret/raw field, or
  conflicting observation id
- **THEN** ingestion fails before recording any observation

#### Scenario: Cloudflare activity exists without model-answer evidence

- **WHEN** AI crawler or AI referral activity is recorded but no live model
  answer observation exists
- **THEN** the project page shows the Cloudflare activity separately
- **AND** AI Visibility remains unmeasured rather than treating crawler access
  or referral visits as a mention, recommendation, rank, or citation

### Requirement: Four outcome-focused portfolio views

Fleet Console SHALL group Domains, AI Awareness, and Performance under a visible
Metrics heading. Projects, Marketing, and Feedback SHALL remain standalone tabs
below that group. It SHALL derive membership from the canonical catalog,
preserve native provider semantics, and keep skill and technical diagnostic
surfaces secondary.

#### Scenario: Operator reviews domain strength

- **WHEN** one or more maintained products share a registrable domain root
- **THEN** Domains shows that root once with its D-Rank, observation time,
  history state, and affected products
- **AND** missing D-Rank evidence remains explicit

#### Scenario: Operator inspects D-Rank history

- **WHEN** a domain has at least two dated D-Rank observations
- **THEN** Domains shows a continuous line without permanent point markers
- **AND** pointer hover or keyboard focus reveals the nearest observation date
  and value
- **AND** a one-point or missing series remains baseline-only or not measured

#### Scenario: Operator refreshes domain strength

- **WHEN** the operator selects Re-run from the Domains page
- **THEN** Founder Control launches one allowlisted portfolio D-Rank process
- **AND** the process updates all configured domains without concurrent writers
- **AND** the page exposes running and completion state before showing the refreshed evidence

#### Scenario: Operator opens a Metrics view

- **WHEN** Domains, AI Awareness, or Performance loads
- **THEN** it requests only its bounded outcome projection rather than the full
  connection topology
- **AND** the page does not show a project-scope dropdown
- **AND** Projects, Marketing, and Feedback retain project scoping

#### Scenario: Coverage includes a live non-active domain

- **WHEN** a past project or non-product identity explicitly opts its live domain
  into domain-strength coverage
- **THEN** Domains shows that registrable root without reactivating the catalog entry
- **AND** the project association reads `0 active projects`

#### Scenario: Operator reviews core AI awareness

- **WHEN** the catalog contains maintained P1 products
- **THEN** AI Awareness shows only those products and their provider-backed
  mention, recommendation, citation, rank, and coverage outcomes
- **AND** fixtures, crawler activity, and technical readiness cannot mark a
  product as known by AI

#### Scenario: Operator reviews marketing coverage

- **WHEN** the catalog contains a maintained product
- **THEN** Marketing shows its positioning availability, latest publishing
  receipt, outstanding evidence-backed recommendations, and whether it has
  never produced a marketing outcome

#### Scenario: Operator reviews whether products are fast enough

- **WHEN** a maintained public product has PSI and LCP evidence
- **THEN** Performance labels it `fast enough` only when it meets explicit
  score and LCP thresholds
- **AND** products below either threshold are `needs work`
- **AND** absent evidence is `not measured`, never a passing state

#### Scenario: Operator refreshes all public-product performance

- **WHEN** the operator selects Re-run all from Performance
- **THEN** Founder Control launches one portfolio PSI receipt covering every
  canonical public metric project
- **AND** the targets come from the same eligibility rules used by the page
- **AND** PSI runs sequentially so its shared history store has one writer
- **AND** the page exposes running and completion state before showing refreshed evidence

#### Scenario: Operator refreshes one public product

- **WHEN** the operator selects Re-run on one Performance row
- **THEN** Founder Control launches the existing project-scoped PSI action for
  only that canonical project URL
- **AND** the row exposes running, failure, and completion state before the
  Performance projection refreshes
