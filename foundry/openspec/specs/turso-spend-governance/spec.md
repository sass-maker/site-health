# turso-spend-governance Specification

## Purpose
TBD - created by archiving change add-turso-spend-audit. Update Purpose after archive.
## Requirements
### Requirement: Current Turso plan and billing authority
The skill MUST retrieve current Turso pricing, quota, usage-and-billing
documentation, current plan, overage mode, and reset period before it quotes a
threshold, charge, projection, or saving.

#### Scenario: Free plan with overages disabled
- **WHEN** authenticated plan evidence confirms a zero-cost plan and overages are disabled
- **THEN** the skill distinguishes fail-closed quota exposure from current monetary spend

#### Scenario: Paid plan or overage cost
- **WHEN** authenticated billing evidence confirms a recurring plan fee or positive overage cost
- **THEN** the corresponding Turso account or organization is classified `paying-now`

#### Scenario: Current plan evidence is unavailable
- **WHEN** authentication, permission, CLI, API, or dashboard evidence cannot establish plan and overage mode
- **THEN** monetary state remains `unknown` and the report gives the smallest exact Turso handoff

### Requirement: Calendar-month quota assessment
The skill SHALL evaluate Turso usage against the provider's current reset
period and SHALL keep rows read, rows written, storage, syncs, databases,
locations, and groups as separate units.

#### Scenario: Quota is nearly exhausted
- **WHEN** current-cycle usage is near a known limit and overages are disabled
- **THEN** the report identifies an availability risk, the remaining allowance, reset time, confidence, and exact driving dimension

#### Scenario: Usage units differ
- **WHEN** multiple Turso usage dimensions are present
- **THEN** the skill reports them independently and does not add or compare incompatible units

### Requirement: Database-level attribution
The skill MUST attribute organization usage to exact Turso databases before
recommending optimization or cleanup.

#### Scenario: One database drives usage
- **WHEN** database inspection shows one database materially dominates a quota dimension
- **THEN** the report names that database, its usage, its Fleet owner when known, and the current product requirement it supports

#### Scenario: Database is unmatched
- **WHEN** a live Turso database does not map confidently to a Fleet project
- **THEN** the report keeps it unowned and requests dependency verification before any pause recommendation

### Requirement: Evidence-safe query optimization
The skill SHALL inspect query-level evidence only when it can change a material
decision and SHALL avoid exposing raw SQL literals or application data.

#### Scenario: Excessive rows read
- **WHEN** a necessary database materially drives row reads
- **THEN** the skill may use current query statistics to identify full scans, repeated aggregates, missing-index candidates, or duplicate scheduled work

#### Scenario: Query output contains literals
- **WHEN** provider query statistics contain SQL text or literals
- **THEN** the report describes only sanitized query shape and row-scan behavior and does not persist or quote the raw query

### Requirement: Credential-free Turso configuration discovery
The Fleet scanner SHALL detect tracked Turso/libSQL configuration without
reading connection values, local environment files, or credential stores.

#### Scenario: Project declares a Turso SDK
- **WHEN** a tracked package manifest declares a supported Turso or libSQL client dependency
- **THEN** the scanner emits a `turso` configuration-exposure surface with the tracked source file

#### Scenario: Safe example variables are present
- **WHEN** a tracked `.env.example` declares Turso or libSQL connection variable names
- **THEN** the scanner reports only those variable names and never their values

### Requirement: Turso necessity and safe action boundary
The skill MUST judge database necessity from Fleet lifecycle evidence and MUST
not mutate Turso or production state during an audit.

#### Scenario: Active product depends on database
- **WHEN** a live database supports a shipped or planned active-product capability
- **THEN** the decision is not `pause-candidate` solely because usage is high or low

#### Scenario: Retired or unused database
- **WHEN** a database maps to a retired, ignored, or unowned surface with no current requirement and negligible recent usage
- **THEN** the skill marks it `pause-candidate` and lists the verification required before a separate authorized cleanup

#### Scenario: Audit completes
- **WHEN** the skill completes a Turso audit
- **THEN** it performs no plan, overage, database, group, location, token, schema, index, SQL, migration, or production-config mutation

### Requirement: Combined provider report
The skill SHALL preserve provider-specific billing cycles and evidence while
presenting one decision-first Fleet report when Cloudflare and Turso are both
in scope.

#### Scenario: Billing periods differ
- **WHEN** Cloudflare and Turso use different reset or billing periods
- **THEN** the report states each provider period separately and does not combine their usage units

#### Scenario: One provider is unavailable
- **WHEN** consequential evidence is available for one provider but unavailable for the other
- **THEN** the report presents the known provider result and keeps the unavailable provider state explicitly `unknown`
