## ADDED Requirements

### Requirement: One canonical Foundry repository
SaaS Maker MUST become the sole active source repository for Foundry, the full
Fleet Ops layer, Fleet Dashboard, PSI Swarm, Mobile Dev Cockpit, Drank, and Reel
Pipeline after cutover.

#### Scenario: Helper source changes after cutover
- **WHEN** a feature or fix targets an imported helper
- **THEN** its source change, review, CI, documentation, and release originate
  from the canonical SaaS Maker repository

### Requirement: Preserved provenance
Every imported helper MUST retain auditable attribution to its source repository,
source SHA, branch/tags, and meaningful commit history.

#### Scenario: Inspect imported file history
- **WHEN** an operator traces an imported component
- **THEN** the monorepo and migration record identify the original repository
  and import boundary without relying on a deleted source

### Requirement: Independent component boundaries
Each imported runtime MUST retain an explicit owner path, native toolchain,
build/test commands, deploy identity, data/config dependencies, health evidence,
and rollback procedure.

#### Scenario: Only Drank changes
- **WHEN** a commit changes only Drank and no shared dependency
- **THEN** CI runs Drank plus required shared checks without rebuilding or
  deploying unrelated components

### Requirement: One canonical Foundry catalog
The monorepo MUST maintain exactly one hand-edited, schema-validated catalog for
product, component, package, skill, repository, attention, surface, changelog,
public-roadmap, evidence, automation, and ownership metadata. Compatibility
registries and site data MUST be generated from it and MUST NOT become
independent sources of truth.

#### Scenario: Generated registry is edited directly
- **WHEN** a compatibility registry differs from the output of the canonical
  catalog generator
- **THEN** validation fails and identifies the canonical catalog fields that
  must be changed instead

#### Scenario: Duplicate identity or surface is added
- **WHEN** two catalog records claim the same stable identity, domain, package,
  skill, schedule, or operational owner
- **THEN** validation blocks the change with both conflicting records

### Requirement: Public automated-product-factory directory
`sassmaker.com` SHALL present the Foundry as an automated product factory and
MUST provide a canonical public directory page, dated public changelog, and
explicitly public roadmap for every maintained product.

#### Scenario: Maintained product is published
- **WHEN** a My Work or Toolbox product is present in the canonical catalog
- **THEN** the public site renders its identity, purpose, current state, links,
  changelog, roadmap, and machine-readable discovery metadata

#### Scenario: Private project content exists
- **WHEN** a product has raw status notes, issues, security findings, private
  tasks, customer/user content, or unpublished claims
- **THEN** none of that content appears publicly unless an individual field is
  explicitly approved for the public projection

#### Scenario: Ignored or Removed record is encountered
- **WHEN** the public directory generator encounters an Ignored or Removed entry
- **THEN** it omits the entry unless a separate attribution-only page is
  explicitly approved

### Requirement: Five-pillar Foundry model
The Foundry MUST organize capabilities, catalog records, private navigation,
automation ownership, evidence and decisions under Build, Market, Learn,
Visibility and Control, with exactly one primary pillar per owned capability.

#### Scenario: Cross-pillar product change completes
- **WHEN** a product change moves from build through marketing and learning
- **THEN** its source, release, public change, experiment, outcome, health and
  approval evidence remain traceable through one stable action/receipt identity

#### Scenario: Private operational pillar is rendered publicly
- **WHEN** public generation encounters Visibility or Control data that is not
  explicitly public
- **THEN** the data is omitted and the projection test fails if it enters a
  public payload or browser bundle

### Requirement: Per-runtime observability catalog
Every maintained product MUST declare observability per runtime and surface,
including provider, purpose, signal families, privacy class, collection mode,
owner, evidence reference, freshness window, verification state and accepted
gaps without storing credentials, DSNs, or private payloads.

#### Scenario: PostHog SDK is present but no fresh event proof exists
- **WHEN** source inspection confirms PostHog configuration but normalized
  evidence cannot prove recent expected events
- **THEN** the coverage state is configured-unverified rather than passing

#### Scenario: Local-first product intentionally has no remote analytics
- **WHEN** remote analytics would violate the product's privacy boundary or add
  no actionable value
- **THEN** the catalog records the privacy-safe native build/crash alternative
  and a justified not-applicable product-analytics contract

#### Scenario: Duplicate telemetry capture is detected
- **WHEN** more than one adapter records the same page view, error, job outcome,
  or vital without an explicit ownership reason
- **THEN** Visibility reports an actionable duplication finding and identifies
  the canonical owner

### Requirement: Authenticated private Fleet control plane
`fleet.sassmaker.com` MUST fail closed behind authentication and SHALL expose
sanitized operational snapshots for builds, deployments, analytics, costs,
jobs, receipts, approvals, private planning, machines, observability topology,
evidence freshness, and
rollback state without placing provider credentials or raw private payloads in
the browser.

#### Scenario: Unauthenticated request reaches a private route
- **WHEN** no valid operator authorization is present
- **THEN** the request receives no private HTML, JSON, snapshot, source map, or
  cached response

#### Scenario: Provider refresh is unavailable
- **WHEN** GitHub, Cloudflare, analytics, or machine evidence cannot refresh
- **THEN** the control plane retains the last-known-good sanitized snapshot,
  marks it stale or blocked, and never fabricates a passing state

### Requirement: Unified package and skill discovery
`packages.sassmaker.com` and `skills.sassmaker.com` MUST be generated from the
same catalog and MUST distinguish local packages, npm packages, and skills
without changing stable package names solely for directory organization.

#### Scenario: npm package is documented
- **WHEN** a catalog entry declares npm distribution
- **THEN** the package site shows its canonical name, source, version/release
  evidence, installation, API documentation, changelog, and support state

#### Scenario: operational skill is documented
- **WHEN** a skill is cataloged
- **THEN** the skill site shows its purpose, authority boundary, prerequisites,
  compatible runtimes, installation method, source path, and invoking schedules
  without exposing credentials or private prompt content

### Requirement: One source-owned design system
All Foundry web surfaces MUST consume one local shadcn-based design-system
package for tokens, typography, spacing, controls, data states, accessibility,
and responsive behavior. Third-party open-source blocks MUST be reviewed,
license-recorded, adapted into that package, and MUST NOT be installed ad hoc by
individual apps.

#### Scenario: Public page uses expressive motion
- **WHEN** an approved Aceternity-derived component is used on a public surface
- **THEN** it uses Foundry tokens, remains optional to core comprehension,
  respects reduced motion, and adds no unreviewed app-level dependency

#### Scenario: Operational state is rendered
- **WHEN** the private control plane displays loading, empty, stale, blocked,
  failure, approval, or success state
- **THEN** the state uses the shared components, remains keyboard accessible,
  preserves contrast and focus order, and is understandable without color alone

### Requirement: Single active operations host
The Foundry MUST keep checked-in cron, runtime skills, notification draining,
machine-only adapters, and Reel Pipeline execution inert on a fresh clone and
MUST run them on only one explicitly activated operations host at a time.

#### Scenario: Second clone attempts activation
- **WHEN** another machine attempts to start schedules while a healthy primary
  lease exists
- **THEN** activation fails closed, records the overlap, and leaves both source
  and production state unchanged

#### Scenario: Primary host is intentionally replaced
- **WHEN** the operator explicitly promotes a standby after validating the old
  lease is expired or revoked
- **THEN** bootstrap, skills, schedules, machine services, heartbeat, and
  notification health are verified and recorded before work begins

### Requirement: Reproducible host bootstrap
A clean clone MUST provide a documented, idempotent doctor/bootstrap path that
validates native toolchains, links all canonical skills, reports missing
machine-local authority without printing values, and renders schedules before
installation.

#### Scenario: New operations host lacks a prerequisite
- **WHEN** bootstrap detects a missing runtime, browser, model, notification
  target, device pairing, or credential reference
- **THEN** it reports a bounded setup action and does not partially activate
  dependent jobs

### Requirement: Stable production identity
Source consolidation MUST NOT silently rename domains, Cloudflare projects or
Workers, bindings, storage resources, or public APIs.

#### Scenario: Monorepo deploy dry-run
- **WHEN** a component's new deploy path is evaluated
- **THEN** it resolves to the existing declared production identity or blocks
  cutover with an explicit migration decision

### Requirement: Unified Foundry control contracts
The monorepo SHALL maintain one canonical project registry, automation/evidence
contract, skill source, Foundry manual entrypoint, task ownership model, design
system, and integration dashboard across all imported components.

#### Scenario: Duplicate schedule discovered
- **WHEN** two imported components claim the same recurring responsibility
- **THEN** consolidation assigns one canonical owner and disables neither copy
  until parity and cutover are approved

### Requirement: Safe component cutover
Each helper MUST pass source/history inventory, clean import, local build/test,
CI, deploy-identity dry-run, live parity where approved, and rollback evidence
before the old repository can be retired.

#### Scenario: Imported component fails parity
- **WHEN** the monorepo version fails a required check or live comparison
- **THEN** the source repository remains active and no archival occurs

### Requirement: Recoverable legacy retirement
Legacy repository archival MUST require explicit approval and MUST preserve
history, migration notice, final source SHA, replacement location, releases,
and known-good rollback reference.

#### Scenario: Archival approval is absent
- **WHEN** source consolidation is complete but no archival approval exists
- **THEN** the old repository remains intact and read-only migration guidance is
  prepared without destructive action
