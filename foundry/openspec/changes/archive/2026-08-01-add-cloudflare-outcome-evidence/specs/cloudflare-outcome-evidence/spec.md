## ADDED Requirements

### Requirement: Cloudflare outcomes use one canonical portfolio

The system SHALL collect Cloudflare evidence for the canonical public metric
portfolio without maintaining a second project or hostname allowlist.

#### Scenario: A portfolio update starts

- **WHEN** the owner activates a Cloudflare Update control
- **THEN** the collector reads canonical projects from the Fleet registry
- **AND** it resolves their zones from the live read-only Cloudflare inventory
- **AND** one active portfolio run is shared by every requesting Console view

### Requirement: Only bounded provider-native evidence is retained

The collector SHALL store normalized traffic, referral, AI-crawl, and real-user
performance aggregates in the private outcome ledger without retaining raw
requests, IPs, credentials, or provider payloads.

#### Scenario: Cloudflare returns analytics

- **WHEN** a project hostname has compatible Web Analytics or HTTP evidence
- **THEN** Fleet retains native values, period, scope, provider URL, and bounded
  top-page, referrer, crawler, or status breakdowns
- **AND** missing or sampled evidence stays explicit

#### Scenario: A provider prerequisite fails

- **WHEN** credentials, zone access, or a dataset is unavailable
- **THEN** the update reports a bounded failure or project exclusion
- **AND** the last good ledger evidence remains readable

### Requirement: Cloudflare evidence stays semantically separate

Fleet Console SHALL place compatible Cloudflare evidence in the existing owner
surfaces without creating a combined score or claiming unsupported outcomes.

#### Scenario: The owner reads AI Awareness

- **WHEN** crawler or AI-referral evidence exists
- **THEN** core-project rows expose its native counts and project detail
- **AND** the view states that discovery does not establish a model mention,
  recommendation, rank, or citation

#### Scenario: The owner reads Performance or Marketing

- **WHEN** field Web Vitals or traffic evidence exists
- **THEN** Performance distinguishes real-user p75 values from PSI lab values
- **AND** Marketing exposes visits, page views, top pages, and referrers

### Requirement: Provider evidence links to its owning property

Every displayed Google or Cloudflare provider observation SHALL offer a direct
HTTPS link to the relevant provider property or zone surface.

#### Scenario: The owner opens provider evidence

- **WHEN** a Search Console or Cloudflare observation has a resolved property
- **THEN** its detail view links to that exact Search Console property or
  Cloudflare zone analytics surface in a new tab
- **AND** the URL is derived from normalized provider scope rather than UI
  conditionals
