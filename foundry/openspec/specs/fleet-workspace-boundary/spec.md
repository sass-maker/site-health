# Fleet Workspace Boundary

## Purpose

Define Fleet Workspace as the canonical shared-infrastructure repository while
preserving independent product and component boundaries.
## Requirements
### Requirement: Fleet Workspace is the canonical shared infrastructure repository
The `sass-maker/fleet-workspace` repository SHALL be the sole version-controlled
home for shared fleet operations, skills, schedules, registries, host tooling,
the marketing pipeline, Reel Pipeline, Drank, PSI Swarm, and Mobile Dev Cockpit.

#### Scenario: Agent changes shared infrastructure
- **WHEN** an agent changes a shared fleet script, skill, schedule, registry, marketing pipeline, Drank, PSI Swarm, Reel Pipeline, or Mobile Dev Cockpit source
- **THEN** the canonical edit occurs in Fleet Workspace rather than SaaS Maker

### Requirement: Helper source is reconciled before ownership changes
Fleet Workspace MUST preserve useful committed changes and attribution from the
standalone and imported helper trees. A helper copy MUST NOT be removed from
SaaS Maker until unique changes are reconciled and the relevant native checks
pass in the new canonical path.

#### Scenario: Imported and standalone Reel Pipeline differ
- **WHEN** the imported Reel Pipeline tree contains changes not present in the standalone repository
- **THEN** those changes are reviewed, transferred or explicitly superseded, and verified before the imported tree is removed

### Requirement: Fleet exposes a sanitized public projection
Fleet Workspace SHALL own the complete project registry and SHALL generate a
deterministic, allowlisted public product projection for SaaS Maker. The public
projection MUST exclude private status, tasks, failures, credentials, machine
state, user data, and unpublished claims.

#### Scenario: Public projection is generated
- **WHEN** the canonical Fleet registry is valid
- **THEN** generation produces a deterministic public snapshot containing only schema-allowlisted product marketing fields

#### Scenario: Private field enters source data
- **WHEN** a private operational field is present in the canonical Fleet registry
- **THEN** public projection validation prevents that field from entering SaaS Maker output

### Requirement: Components retain native runtime boundaries
Fleet Workspace SHALL coordinate its components without forcing them into one
language, package manager, deployment, data store, or release cadence.

#### Scenario: Fleet validates a component
- **WHEN** a component is changed
- **THEN** Fleet invokes that component's native smallest relevant checks and preserves its independent deploy identity

### Requirement: CodeVetter and App Health remain independent
Fleet Workspace MUST NOT import CodeVetter or App Health product source.
References to those products SHALL be integrations or links only, with no Fleet
ownership claim over their runtime, data, deployment, or product roadmap.

#### Scenario: Fleet records product health or code evidence
- **WHEN** Fleet links to App Health or CodeVetter evidence
- **THEN** the source and authority remain in the independent product repository

### Requirement: Independent product source remains outside Fleet-owned app roots
Fleet Workspace MUST NOT own Setline or India Standards product source under
`foundry/apps/`. Each product SHALL own its source, product planning, runtime,
data, deployment, and roadmap in its standalone Significant Hobbies repository.
Fleet references to either product SHALL be catalog, automation, monitoring, or
sanitized public-projection integrations only.

#### Scenario: Fleet records an independent product
- **WHEN** Fleet catalogs, monitors, or publicly lists Setline or India Standards
- **THEN** the product source and authority remain in its standalone repository

#### Scenario: Embedded product copy is discovered
- **WHEN** Setline or India Standards source exists under `foundry/apps/`
- **THEN** validation or review treats that tree as a repository-boundary defect
  to reconcile and remove

### Requirement: Internal catalog generates project views
Fleet Workspace MUST use its internal project catalog as the sole project
identity source and SHALL generate human-readable inventory and sanitized
external project data from that catalog.

#### Scenario: Internal project metadata changes
- **WHEN** an operator changes a project's shared identity, lifecycle, repository, deployment, or public-listing posture
- **THEN** one generation command updates the applicable Fleet README, private console, compatibility views, and public catalog

#### Scenario: Personal portfolio links to SaaS Maker
- **WHEN** the comprehensive SaaS Maker catalog changes
- **THEN** the personal website and its README remain curated and require no mirrored project-list update

### Requirement: Independent products are standalone-operable
An independent product repository MUST own the tracked instructions and native
commands required to install, test, build, and manually deploy that product. It
MUST NOT require a private Fleet checkout, sibling Fleet filesystem path, or
private Fleet documentation for those operations.

#### Scenario: Product is cloned without Fleet
- **WHEN** an operator clones an independent product without Fleet Workspace
- **THEN** the repository's tracked instructions and native commands remain sufficient to install, test, build, and prepare a manual deployment

#### Scenario: Product command references private Fleet source
- **WHEN** a tracked product command resolves `../foundry/ops` or another private Fleet source path
- **THEN** boundary validation fails and identifies the reverse dependency

### Requirement: Fleet orchestration is one-way
Fleet Workspace MAY catalog, monitor, validate, and invoke repo-local commands
for independent products, but independent products MUST NOT call Fleet-owned
private source as part of their native runtime or release contract.

#### Scenario: Fleet validates an independent product
- **WHEN** Fleet runs an independent product check
- **THEN** Fleet changes working directory to the product checkout and invokes a command owned by that product

#### Scenario: Fleet checkout is unavailable
- **WHEN** an independent product runs without Fleet Workspace present
- **THEN** its native product behavior and manual release preparation remain available

### Requirement: Fleet audits available product boundaries read-only
Fleet Workspace SHALL provide a read-only audit that scans available
independent child repositories for tracked reverse dependencies to private
Fleet source. Missing child checkouts SHALL be reported as skipped rather than
treated as product failures.

#### Scenario: Available checkout is independent
- **WHEN** the audit scans an available product whose tracked operational files contain no private Fleet dependency
- **THEN** the audit reports that product as independent without modifying either repository

#### Scenario: Registered checkout is missing
- **WHEN** the audit cannot find a registered independent product checkout
- **THEN** it records the checkout as skipped and continues scanning

