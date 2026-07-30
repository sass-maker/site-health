## ADDED Requirements

### Requirement: Public automation owns its runnable inputs
The public automation repository MUST contain every source file and public input
required by a standalone run and MUST NOT check out Fleet Workspace or accept a
credential that can read private Fleet source.

#### Scenario: Public scheduled audit starts
- **WHEN** a scheduled audit runs in `sass-maker/workflows`
- **THEN** it completes from the public repository checkout and public network inputs only

#### Scenario: Candidate requires private source
- **WHEN** an automation candidate needs a private registry, package, application, or repository path
- **THEN** it remains in Fleet Workspace rather than receiving a private checkout credential

### Requirement: Public execution is distinct from reusable workflow hosting
The system MUST associate public-runner savings only with workflows whose caller
and execution context are the public repository. Documentation MUST state that a
private caller of a public reusable workflow remains billed to the private
caller.

#### Scenario: Fleet calls a public reusable workflow
- **WHEN** Fleet Workspace invokes a reusable workflow stored publicly
- **THEN** the run is classified as private Fleet execution and is not reported as free public execution

### Requirement: Fleet pins the public module
Fleet Workspace SHALL reference `sass-maker/workflows` as a git submodule at
`foundry/ops/workflows` and SHALL pin an exact verified commit.

#### Scenario: Fresh Fleet checkout includes automation
- **WHEN** an operator clones Fleet Workspace with its documented submodule command
- **THEN** the public automation module resolves to the exact recorded commit

#### Scenario: Public module advances
- **WHEN** a new public automation revision passes its own checks
- **THEN** Fleet adopts it through an explicit gitlink update rather than an unpinned branch reference

### Requirement: Public manifest is privacy allowlisted
The public module MUST accept only stable project identifiers, canonical public
URLs, and declared public probe paths. Generation and validation MUST reject
unknown fields and private operational content.

#### Scenario: Allowed site metadata is generated
- **WHEN** Fleet projects its public product data into the module manifest
- **THEN** the result is deterministic and contains only schema-allowlisted fields

#### Scenario: Private field is introduced
- **WHEN** input includes repository paths, lifecycle notes, failures, provider identifiers, credentials, machine state, or unpublished claims
- **THEN** validation fails before the public repository can be updated

### Requirement: Public workflows are bounded and least privilege
Every public workflow MUST declare explicit permissions, a timeout, bounded
concurrency, and only standard GitHub-hosted runners. Third-party actions MUST
be pinned to immutable commit SHAs.

#### Scenario: Scheduled run overlaps
- **WHEN** a scheduled audit starts while the prior run remains active
- **THEN** the declared concurrency policy prevents unbounded overlapping work

#### Scenario: Pull request changes workflow code
- **WHEN** an untrusted pull request validates public automation
- **THEN** the job has read-only permissions, no secrets, and no write-capable follow-up

### Requirement: Public outputs remain sanitized
Reports, artifacts, logs, and committed scoreboards MUST contain only public
URLs, measurements, timestamps, declared project IDs, and bounded diagnostic
errors.

#### Scenario: Tool emits credential-shaped text
- **WHEN** a subprocess or network response contains credential-shaped output
- **THEN** the public workflow redacts or rejects it before persistence

### Requirement: Private Fleet CI remains private
Product/package CI, Fleet policy and registry validation, sync guards, mobile
proof, deploy checks, and provider-authenticated inventory MUST remain in Fleet
Workspace whenever they depend on private source or authority.

#### Scenario: Product package changes
- **WHEN** a private package path changes in Fleet Workspace
- **THEN** its path-scoped private workflow remains the authoritative check
