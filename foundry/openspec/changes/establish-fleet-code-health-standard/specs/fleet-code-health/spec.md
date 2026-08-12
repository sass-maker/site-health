## Purpose

Define one truthful, cross-ecosystem code-health contract for every maintained
Fleet project so quality coverage, regressions, exceptions, and missing
evidence are inspectable without reducing maintainability to an opaque score.

## ADDED Requirements

### Requirement: Maintained-project scope and explicit profiles
Fleet SHALL evaluate every catalog project whose lifecycle is `maintained` and
whose tier is `focus`, `active`, or `secondary` under an explicit applicable
profile. Fleet MUST report past, parked, out-of-fleet, and non-product
identities as excluded and MUST NOT count them in maintained-project health.
Profiles MUST support JavaScript/TypeScript, Python, Rust, Go, Swift/native,
mixed-language, and content/config-only projects without requiring one
ecosystem's tools in another.

#### Scenario: Maintained mixed-language project
- **WHEN** a maintained project contains multiple meaningful language surfaces
- **THEN** the audit evaluates it under a mixed-language profile with explicit capability applicability

#### Scenario: Past project remains present in the catalog
- **WHEN** a project has lifecycle `past` even if its tier was formerly active
- **THEN** the audit reports it as excluded and does not include it in maintained totals

### Requirement: Normalized and honest evidence states
Every project capability and project summary MUST use one of `pass`, `fail`,
`warning`, `unavailable`, `not-applicable`, or `excluded`. Missing required
evidence MUST be `unavailable`, MUST make strict enforcement non-green, and
MUST NOT be converted to `pass`. Reports MUST distinguish configured coverage
from executed check evidence.

#### Scenario: Required test path is missing
- **WHEN** a maintained code profile requires tests but the repository exposes no discoverable native test path
- **THEN** the test capability is `unavailable` and strict enforcement exits non-zero

#### Scenario: Coverage does not apply to content-only source
- **WHEN** a content/config-only profile has no executable production code
- **THEN** executable coverage is `not-applicable` rather than passed or unavailable

### Requirement: Blocking code-health contract
Applicable maintained code profiles MUST require check-only formatting,
linting, compiler or type validation, tests, unused-code/dependency analysis,
cognitive-complexity enforcement, duplication evidence, coverage evidence,
dependency-risk review, cycle detection, suppression hygiene, and repository
hygiene. A profile MAY satisfy a capability through an approved
ecosystem-native equivalent, but an equivalent MUST remain explicit and
inspectable.

The standard target SHALL be cognitive complexity at most 20 for changed
production functions; at least 80 percent changed-line coverage where
measurable; at least 80 percent line/function/statement and 70 percent branch
coverage for new projects; zero new dependency cycles; zero unapproved
production dependencies; zero critical or high dependency vulnerabilities;
and no increase in accepted production-code duplication. New suppressions MUST
carry a local reason, and durable `TODO` or `FIXME` markers MUST reference a
GitHub issue.

#### Scenario: New project meets the full target
- **WHEN** a new maintained code project is evaluated before release
- **THEN** every applicable blocking capability is available and its executed evidence meets the standard targets

#### Scenario: Changed function exceeds complexity target
- **WHEN** executed evidence reports cognitive complexity above 20 in a changed production function without an accepted exception
- **THEN** the complexity capability fails

#### Scenario: Durable suppression lacks justification
- **WHEN** a change introduces a lint, type, test, or coverage suppression without a local reason
- **THEN** suppression hygiene fails even if the suppressed check otherwise passes

### Requirement: Baseline and no-regression ratchets
Fleet MUST permit existing measured debt to enter an explicit baseline instead
of requiring broad rewrites, but maintained projects MUST NOT regress beyond
that baseline. Baselines and exceptions MUST identify the project, capability,
accepted value or finding, reason, owner, GitHub issue, and review date. An
expired, malformed, or orphaned exception MUST fail validation.

#### Scenario: Legacy duplication is baselined
- **WHEN** a maintained repository begins with duplication above the new-project target
- **THEN** the accepted value is recorded and later reports fail only when duplication increases or the exception expires

#### Scenario: Exception review date passes
- **WHEN** the current date is later than an exception's review date
- **THEN** the exception is invalid and the affected capability cannot report green

### Requirement: Deterministic read-only Fleet audit
Fleet SHALL provide a dependency-free, read-only command that joins the
canonical project registry to the code-health configuration and
repository-native evidence. Repeated runs over unchanged inputs MUST produce
deterministic project ordering, capability ordering, summaries, and JSON apart
from explicitly separated observation metadata. Inspection MUST NOT install
tools, run write-mode formatters, delete findings, or modify inspected
repositories.

#### Scenario: Repeated inventory is unchanged
- **WHEN** the registry, code-health configuration, and repository-native configuration are unchanged
- **THEN** two machine-readable inventory reports are byte-for-byte identical

#### Scenario: Independent checkout is unavailable
- **WHEN** a maintained catalog project has no available local checkout
- **THEN** the audit continues, reports the project and required capabilities unavailable, and exits non-zero in strict mode

### Requirement: Decision-first reports without an opaque score
The audit MUST emit concise human output by default and stable JSON on request.
Reports MUST lead with failed and unavailable blocking evidence, preserve
warnings and exclusions, and include project, profile, capability,
applicability, evidence source, and reason. Fleet MUST NOT collapse code health
into a single numeric score; it MAY report counts and compatible metric series
with their units and direction.

#### Scenario: Mixed health results
- **WHEN** some projects pass while another lacks required evidence and another is excluded
- **THEN** the report leads with the non-green maintained project, retains the excluded identity separately, and emits no aggregate quality score

### Requirement: Scheduled trend evidence
Fleet SHALL define scheduled observations for complexity distribution,
duplication, unused code, coverage, dependencies, cycles, suppressions,
test duration or flakiness where available, source composition, and
high-churn/high-complexity hotspots. Raw line count and dependency count MUST be
treated as context rather than quality verdicts, and incompatible ecosystems or
units MUST NOT be aggregated into one metric series.

#### Scenario: Trend metric lacks comparable evidence
- **WHEN** two projects expose incompatible metric units or scopes
- **THEN** the report keeps the observations separate rather than averaging them

### Requirement: Review evaluates output properties rather than authorship
Fleet MUST NOT claim to detect whether code was AI-authored or assign an “AI
slop probability.” Meaningful behavior changes SHALL instead be reviewed for
observable risks including speculative abstraction, duplication, placeholder
behavior, swallowed errors, unjustified fallback behavior, untested boundary
cases, and documentation drift. Review payloads and repository content MUST
remain within the owning repository or approved private review boundary.

#### Scenario: Agent-generated change passes static checks
- **WHEN** a meaningful behavior change passes static checks but introduces an unnecessary parallel abstraction
- **THEN** review may still fail the change on observable maintainability grounds without making an authorship claim

### Requirement: Sequential project adoption
Fleet MUST establish the shared standard, policy, and inventory before mutating
independent project repositories. Adoption SHALL then proceed one maintained
project at a time in canonical owner-priority order, with focus projects before
active projects and active projects before secondary projects unless the owner
explicitly changes the order. Each project pass MUST use an isolated clean
worktree when its primary checkout is dirty or already has active work, and the
next project MUST NOT begin until the current project's findings are resolved,
accepted through a valid baseline, or recorded as repository-owned follow-up
with its verification result.

#### Scenario: Primary checkout has active work
- **WHEN** the next project in the adoption sequence has a dirty checkout or an existing feature branch in progress
- **THEN** code-health improvements use a separate clean worktree and preserve the active checkout unchanged

#### Scenario: Current project still has unclassified findings
- **WHEN** a sequential project pass has unresolved findings without a valid baseline or repository-owned issue
- **THEN** Fleet does not begin mutation work in the next project

#### Scenario: Owner changes project order
- **WHEN** the owner explicitly prioritizes a different maintained project
- **THEN** the sequence records that decision and continues with only that selected project active
