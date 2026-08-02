## Purpose

Turns provider-authoritative Google Search evidence into a bounded advisory
work queue without inventing scores, hiding uncertainty, or mutating products.

## ADDED Requirements

### Requirement: Query evidence names its landing page

The Search Console collection SHALL retain a bounded normalized landing-page
URL beside each retained query and its impressions, clicks, CTR, and average
position. Existing observations without a landing page SHALL remain readable
and SHALL expose the page as unavailable rather than failing the ledger.

#### Scenario: Search Console returns query and page dimensions

- **WHEN** a project collection returns a query-page row inside its configured
  project scope
- **THEN** the normalized search term includes the query, landing page,
  impressions, clicks, CTR, and average position
- **AND** raw provider responses and credentials remain outside the ledger

#### Scenario: Historical query lacks a page

- **WHEN** a retained historical search term predates query-page collection
- **THEN** the observation remains valid
- **AND** its landing page is reported as unavailable

### Requirement: Search actions are conservative and deterministic

Fleet Console SHALL derive advisory search actions from provider-native values
using explicit sample floors. Missing evidence SHALL remain not measured, zero
impressions SHALL request an indexing and demand check, and evidence below the
sample floor SHALL request more data instead of prescribing a content change.

#### Scenario: Project has zero impressions

- **WHEN** Search Console records zero project impressions for a completed
  reporting window
- **THEN** the project action is Check indexing
- **AND** the action does not claim that the project is absent from Google's
  index

#### Scenario: Evidence is below the sample floor

- **WHEN** a project has fewer than 20 impressions or a query-page row has fewer
  than 10 impressions
- **THEN** its action is Collect more data
- **AND** position or CTR does not trigger a stronger recommendation

#### Scenario: Measured query-page opportunity is actionable

- **WHEN** a query-page row meets the sample floor
- **THEN** page-one evidence with no clicks is labeled Improve snippet
- **AND** positions 11 through 30 are labeled Strengthen ranking page
- **AND** positions beyond 30 are labeled Build search relevance
- **AND** page-one evidence with clicks is labeled Protect and expand

### Requirement: The portfolio ledger exposes the next action

The Google Search ledger SHALL show one sortable advisory action per project.
Each expanded project SHALL show the retained landing page and advisory action
for every available query-page row, while keeping unavailable pages and
privacy-filtered terms explicit.

#### Scenario: Operator scans the portfolio

- **WHEN** Google Search evidence loads
- **THEN** every project row shows a Next action derived from its latest native
  evidence
- **AND** the action column can be sorted by its deterministic priority

#### Scenario: Operator expands one project

- **WHEN** the operator opens a project disclosure with query-page evidence
- **THEN** each retained query shows its landing page, native metrics, and
  advisory action
- **AND** a landing-page URL can be opened without exposing private evidence

#### Scenario: Advice remains non-mutating

- **WHEN** the ledger recommends a search action
- **THEN** it does not edit content, change metadata, request indexing, submit a
  sitemap, deploy, or create product work automatically

### Requirement: Project search history is graphical

Expanded project evidence SHALL show hoverable time-series graphs for
impressions, clicks, and average position when at least two observations exist.
CTR SHALL remain a latest-snapshot value because it is derived from clicks and
impressions.

#### Scenario: A project has comparable search observations

- **WHEN** the operator expands a project with at least two retained Search
  Console observations
- **THEN** the view shows separate dated graphs for impressions, clicks, and
  average position where each series is available
