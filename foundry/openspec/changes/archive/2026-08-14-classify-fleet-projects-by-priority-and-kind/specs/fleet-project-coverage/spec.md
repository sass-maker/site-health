## ADDED Requirements

### Requirement: Every project has orthogonal portfolio classification

The internal catalog MUST assign every project exactly one kind from `product`,
`platform`, or `experiment`; exactly one priority from P1, P2, or P4; exactly
one status from `active` or `archived`; and explicit boolean values for
`deployed` and `readyToBeShared`. Every project MUST also carry a sharing
readiness object with a `YYYY-MM-DD` verification date and a non-empty evidence
or blocker reason.

#### Scenario: A project lacks one classification field

- **WHEN** catalog validation encounters a project without a valid kind,
  priority, status, deployed value, sharing-readiness value, verification date,
  or reason
- **THEN** validation fails and names the project and missing or invalid field

#### Scenario: A future project is added

- **WHEN** an operator adds a new active, local-only, non-product, or historical
  identity
- **THEN** generation remains blocked until all five portfolio fields are
  explicitly assigned

### Requirement: Portfolio booleans remain evidence-consistent

Fleet MUST reject a project marked ready to be shared unless it is active and
deployed. Archived projects MUST NOT be marked ready to be shared. A deployed
value MUST describe whether a usable distributed or provider-hosted surface
currently exists; retained deployments may remain deployed even when their
project is archived.

The generated catalog MUST display the readiness reason and verification date
for every project.

#### Scenario: Inconsistent sharing readiness

- **WHEN** an archived or undeployed project declares `readyToBeShared: true`
- **THEN** catalog validation fails with the inconsistent fields

#### Scenario: Archived deployment remains online

- **WHEN** an archived project retains a live provider deployment for history
  or rollback
- **THEN** it may declare `deployed: true` while remaining archived and not
  ready to be shared

#### Scenario: Readiness evidence is absent

- **WHEN** a project omits its sharing-readiness verification date or reason
- **THEN** catalog validation fails and names the missing field

### Requirement: Operator catalog is organized by priority and kind

The generated private project catalog SHALL render priorities in P1, P2, P4
order and SHALL group projects by kind within each priority. It MUST display
status, deployed, and ready-to-be-shared values for every identity and MUST NOT
use the legacy Toolbox attention bucket as its primary organization.

Within P4, the catalog SHALL render active owner-finished work separately from
archived work before grouping each section by kind.

#### Scenario: Operator reads the complete catalog

- **WHEN** project surfaces are generated from a valid catalog
- **THEN** every project appears exactly once under its priority and kind with
  all portfolio fields visible

#### Scenario: A priority has no projects

- **WHEN** a valid priority currently has no assigned identities
- **THEN** the generated catalog still shows the priority with an explicit
  empty state so the P1/P2/P4 model remains visible

#### Scenario: Operator reads P4

- **WHEN** P4 contains both active and archived identities
- **THEN** the generated catalog shows separate `Finished (active)` and
  `Archived` sections with correct counts

### Requirement: Kinds remain product-oriented

Fleet MUST use only `product`, `platform`, and `experiment`. Standalone
user-facing offerings MUST be products, shared capabilities MUST be platforms,
and prototypes or research surfaces that are not maintained offerings MUST be
experiments. The former `utility` kind MUST be rejected.

#### Scenario: Former utility is classified

- **WHEN** a former utility is a standalone offering such as Starboard or App
  Health
- **THEN** it is classified as a product

#### Scenario: Shared RAG capability is classified

- **WHEN** Knowledge Base is classified
- **THEN** it is a platform

### Requirement: Priority has one canonical representation

Fleet MUST read owner priority from each project's portfolio classification and
MUST NOT require a second hand-maintained membership list. Generated registries
and private projections SHALL resolve priority from that per-project value.

#### Scenario: Priority changes

- **WHEN** the owner changes one project's priority in the canonical catalog
- **THEN** generation updates every dependent view without requiring a second
  priority edit

### Requirement: Extensions do not inflate project counts

Fleet MUST count a supporting extension as part of its owning project when the
owner says it has no independent product identity. Its repository aliases,
deployment evidence, and cloud resources MUST remain attached to the owner so
coverage is not lost during consolidation.

#### Scenario: Fleet Workflows is consolidated

- **WHEN** Fleet Workflows is classified as an extension of Fleet Workspace
- **THEN** it does not appear as a separate catalog project and its GitHub
  Actions deployment remains recorded under Fleet Workspace

### Requirement: Owner priority semantics remain explicit

Fleet MUST reserve P1 for exactly CodeVetter, Pace, PostTrainLLM, and Office OS,
the four owner-built products that are continuously improved and never treated
as finished. P2 MUST be the single active-focus tier for all other ongoing
work. P4 MUST represent finished or archived work. Priority MUST NOT be
presented as a completion percentage.

P2 MUST remain an eligible active-work pool rather than an operational task
list. GitHub Issues MUST remain the only operational tracker, and any stated
agent work cycle MUST contain no more than five P2 project identities.

#### Scenario: Operator reads P1

- **WHEN** the canonical catalog is generated
- **THEN** P1 contains exactly the four continuously developed owner products

#### Scenario: Archived project is classified

- **WHEN** a project has archived portfolio status
- **THEN** its priority is P4

#### Scenario: Active focus is classified

- **WHEN** an ongoing project is not one of the four P1 products
- **THEN** it uses P2 and never the removed P3 value

#### Scenario: Mashup is classified

- **WHEN** the catalog is reconciled against Mashup's current project status
- **THEN** Mashup is an active P2 experiment with a local-only source path and
  remains neither deployed nor ready to share

#### Scenario: Agent chooses work within P2

- **WHEN** an agent chooses its immediate project focus
- **THEN** it selects work from open GitHub Issues, names at most five P2
  projects, and does not create a replacement priority or task tracker

### Requirement: Catalog explains its operational purpose

The generated catalog MUST explain how priority, status, deployment, and
sharing readiness drive owner work, agent focus, publishing eligibility,
maintenance, archival preservation, and retained-resource review. It MUST also
distinguish provider-complete Cloudflare inventory from known-name-probed or
configuration-derived coverage.

#### Scenario: Operator asks what happens after classification

- **WHEN** the operator reads the catalog
- **THEN** it provides a concise next-action model for P1, P2, active P4,
  archived P4, share-ready, and non-share-ready projects
