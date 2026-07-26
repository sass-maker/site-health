## ADDED Requirements

### Requirement: One internal catalog owns project identity
Fleet SHALL create project identity only in the internal project catalog.
Generated views and subsystem policy overlays MUST resolve an existing catalog
id and MUST NOT independently introduce a project.

#### Scenario: New repository is registered
- **WHEN** an operator adds one valid project entry to the internal catalog
- **THEN** generation updates every applicable internal and sanitized external project view without requiring a second identity entry

#### Scenario: Policy references an unknown project
- **WHEN** an automation, marketing, family, or indexing overlay references an id absent from the internal catalog
- **THEN** catalog validation fails with the unknown id and owning overlay

### Requirement: Repository coverage is reconciled
Fleet MUST reconcile bounded active and inactive repository roots against the
internal catalog.

#### Scenario: Active checkout is unregistered
- **WHEN** an immediate Git repository exists under the Fleet root without a matching catalog repository path
- **THEN** check mode fails and names the checkout

#### Scenario: Historical checkout is unregistered
- **WHEN** an immediate Git repository exists under the inactive-history root without a matching catalog source path
- **THEN** check mode fails and names the checkout

#### Scenario: Optional history is absent
- **WHEN** a historical catalog entry has no local checkout on a fresh machine
- **THEN** validation preserves the entry without failing repository coverage

### Requirement: Generated surfaces are deterministic
Fleet SHALL generate project inventory documentation and public catalog data
deterministically from the internal catalog.

#### Scenario: Generated files are current
- **WHEN** generation runs twice against unchanged catalog input
- **THEN** the second run produces no file changes

#### Scenario: Generated file drifts
- **WHEN** check mode finds output that differs from canonical generation
- **THEN** it fails and names every stale output

### Requirement: Public projection is explicitly privacy-gated
The external project catalog MUST emit only catalog entries explicitly marked
for public listing and MUST reject private repositories or non-allowlisted
fields.

#### Scenario: Public past repository is listed
- **WHEN** a past project has explicit public listing metadata and a public repository URL
- **THEN** the external catalog includes its sanitized name, description, lifecycle label, and repository URL

#### Scenario: Private historical repository exists
- **WHEN** a historical project is private or has hidden listing posture
- **THEN** its identity and metadata are absent from every external artifact

### Requirement: Private views distinguish project posture
The private Fleet Console SHALL distinguish maintained, local-only, and past
projects and SHALL resolve Git metadata through either the active repository
path or historical `sourcePath`.

#### Scenario: Healthy local-only project is displayed
- **WHEN** a registered project has `deployKind: none` and no explicit blocker
- **THEN** the console labels it Local-only rather than Blocked

#### Scenario: Historical checkout is displayed
- **WHEN** a past project has a valid local `sourcePath`
- **THEN** the console shows its repository URL, latest commit, local path, and past-project posture in a separate lane
