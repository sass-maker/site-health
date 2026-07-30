## ADDED Requirements

### Requirement: Email Manager has one canonical Significant Hobbies origin

Email Manager SHALL use `https://mail.significanthobbies.com` as its canonical
production origin across Worker routing, auth configuration, public metadata,
agent surfaces, monitoring evidence, documentation, and Fleet project
projections.

#### Scenario: Operator opens Email Manager

- **WHEN** the operator opens the Email Manager project from Fleet Console
- **THEN** the website action targets `https://mail.significanthobbies.com`
- **AND** the source action targets the Significant Hobbies GitHub repository

#### Scenario: Public metadata is generated

- **WHEN** Email Manager emits canonical, Open Graph, sitemap, or agent-indexing
  URLs
- **THEN** every production URL uses `mail.significanthobbies.com`

### Requirement: Domain cutover is add-first and reversible

The migration MUST attach the new Workers Custom Domain and verify the existing
service through it before detaching the old hostname or reporting the migration
complete.

#### Scenario: New hostname is attached

- **WHEN** Cloudflare accepts `mail.significanthobbies.com` for the
  `email-manager` Worker
- **THEN** Cloudflare provisions the DNS record and certificate without a new
  Worker code deployment
- **AND** `mail.sassmaker.com` remains attached during verification

#### Scenario: New hostname fails verification

- **WHEN** TLS, landing, app, health, or authentication verification fails
- **THEN** the old hostname remains available
- **AND** the migration remains blocked rather than claiming completion

### Requirement: OAuth redirect migration is explicit

Email Manager MUST use
`https://mail.significanthobbies.com/api/auth/callback/google` as the production
Google OAuth callback, and completion MUST remain blocked until that exact URI
is authorized in Google Cloud.

#### Scenario: OAuth callback is not registered

- **WHEN** the new hostname serves the app but the Google OAuth console has not
  been updated
- **THEN** the migration reports the callback as a manual blocker
- **AND** it does not detach the old hostname

### Requirement: Internal components are not standalone projects

Mobile Dev Cockpit and Reel Pipeline SHALL remain internal Foundry components
without standalone project identities, domains, project filters, or generated
project routes.

#### Scenario: Project catalog is generated

- **WHEN** Fleet regenerates its project surfaces
- **THEN** neither `mobile-dev-cockpit` nor `reel-pipeline` appears as a
  canonical project
- **AND** their implementation paths remain represented in the Dashboard and
  Marketing system buckets
