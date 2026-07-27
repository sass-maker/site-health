# fleet-dependency-discipline Specification

## Purpose
Provide a consistent pre-install dependency review and a read-only,
zero-production-dependency guard that detects review-requiring manifest and
lockfile changes across individual repositories and the active local Fleet.
## Requirements
### Requirement: Pre-install dependency review
The Fleet skill MUST require an agent to inspect existing runtime, platform,
standard-library, and already-installed capabilities before adding or replacing
a dependency, and MUST require explicit approval before a new production
dependency is introduced.

#### Scenario: Existing capability is sufficient
- **WHEN** the requested behavior can be implemented safely with an existing dependency or platform capability
- **THEN** the agent does not add a new package and reports the existing path it will use

#### Scenario: Production dependency is justified
- **WHEN** a new production dependency remains necessary after the review
- **THEN** the agent records why existing code is insufficient, classifies the runtime scope, and obtains explicit approval before changing the manifest or lockfile

### Requirement: Read-only repository comparison
The guard SHALL compare a git base against either the current worktree or an
explicit head revision without checking out, staging, installing, rewriting, or
deleting files.

#### Scenario: Worktree check
- **WHEN** the guard runs with a repository path and no explicit revisions
- **THEN** it compares `HEAD` with tracked and untracked recognized dependency files in the current worktree

#### Scenario: Revision check
- **WHEN** the guard runs with explicit base and head revisions
- **THEN** it reads both snapshots from git and leaves the current worktree unchanged

### Requirement: npm direct dependency delta
The guard MUST parse changed `package.json` files and report sorted added,
removed, and version-changed entries from `dependencies`, `devDependencies`,
`peerDependencies`, and `optionalDependencies`.

#### Scenario: Direct npm package is added
- **WHEN** a package appears in a dependency group in the head snapshot but not the base snapshot
- **THEN** the report identifies the package, dependency group, and new version specifier as an addition

#### Scenario: Direct npm version changes
- **WHEN** a package remains in the same dependency group with a different version specifier
- **THEN** the report identifies the package, dependency group, prior version, and new version as a change

#### Scenario: Invalid package manifest
- **WHEN** either compared `package.json` cannot be parsed as a JSON object
- **THEN** the guard reports an error for that path and does not classify the repository as clean

### Requirement: Cross-ecosystem change visibility
The guard MUST recognize common Node, Python, Rust, Go, Ruby, CocoaPods, and
Swift dependency manifests and lockfiles, and MUST flag changed formats it does
not parse precisely for manual ecosystem-native review.

#### Scenario: Non-npm manifest changes
- **WHEN** a recognized non-`package.json` dependency manifest changes
- **THEN** the report lists the path, ecosystem, and manual-review requirement

#### Scenario: Lockfile changes without a parsed direct delta
- **WHEN** a recognized lockfile changes and no corresponding direct npm delta is available
- **THEN** the report labels the lockfile change separately and does not infer that no dependency changed

### Requirement: Strict enforcement signal
The guard SHALL support a strict mode that exits non-zero whenever a direct npm
dependency, opaque dependency manifest, or lockfile changed or a comparison
error occurred, while allowing parseable npm script and metadata-only changes.

#### Scenario: Strict check finds dependency files
- **WHEN** strict mode finds one or more changed recognized dependency files
- **THEN** the command exits non-zero after emitting the complete report

#### Scenario: Strict check is clean
- **WHEN** strict mode finds no review-requiring dependency delta and no comparison errors
- **THEN** the command exits successfully

#### Scenario: npm script changes without dependency changes
- **WHEN** a parseable `package.json` changes only scripts or non-dependency metadata
- **THEN** strict mode does not require dependency review

### Requirement: Fleet-wide active repository scan
The guard SHALL scan the local `focus`, `active`, and `secondary` Fleet
repositories from the canonical project registry, include the Foundry git
repository, and deduplicate multiple project paths that resolve to the same git
top level.

#### Scenario: Multiple surfaces share Foundry
- **WHEN** several registry records resolve inside the Foundry monorepo
- **THEN** the guard checks the Foundry git root once and associates the relevant project identifiers

#### Scenario: Registered checkout is unavailable
- **WHEN** an included registry path is missing or is not a git repository
- **THEN** the report records it as skipped and continues scanning the remaining repositories

#### Scenario: Excluded lifecycle tier
- **WHEN** a registry record is `parked`, `out-of-fleet`, or `non-product`
- **THEN** Fleet mode does not inspect that checkout

### Requirement: Advisory Bundlephobia evidence
The guard SHALL optionally retrieve Bundlephobia evidence for an exact npm
package specifier and MUST keep that remote lookup outside dependency-change
enforcement.

#### Scenario: Browser package lookup succeeds
- **WHEN** Bundlephobia returns valid evidence for an exact package specifier
- **THEN** the guard reports the resolved version, minified and gzip bytes, dependency count, module signals, side-effects signal, description, and repository

#### Scenario: Bundlephobia is unavailable
- **WHEN** the remote lookup times out, fails, or returns invalid data
- **THEN** the lookup exits with a clear error without changing manifests or affecting repository scan results

### Requirement: Post-change unused-dependency validation
The skill MUST use the repository's existing Knip path for JS/TS unused
dependency validation when available and MUST use the smallest
ecosystem-appropriate check otherwise.

#### Scenario: Knip is configured
- **WHEN** a JS/TS repository has a Knip script or configuration
- **THEN** the agent runs the repository-native Knip command after the dependency change

#### Scenario: Knip is unavailable
- **WHEN** the repository has no Knip path
- **THEN** the agent reports that unused-dependency validation is unavailable and runs the smallest relevant build, typecheck, or test without installing an audit package solely for the check

### Requirement: Deterministic decision-first output
The guard MUST provide human-readable output by default and stable JSON on
request, leading with whether dependency review is required and preserving
repository, path, ecosystem, change kind, and error details.

#### Scenario: Machine-readable report
- **WHEN** the user supplies `--json`
- **THEN** the guard emits valid JSON with a schema version and stable summary, repository, finding, skip, and error fields

#### Scenario: No dependency changes
- **WHEN** a repository comparison has no review-requiring dependency changes
- **THEN** the report clearly identifies the repository as clean for the compared snapshots
