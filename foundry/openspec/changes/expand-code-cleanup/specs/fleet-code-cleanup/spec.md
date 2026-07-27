## ADDED Requirements

### Requirement: One-command cleanup orchestration
The Fleet cleanup runner MUST provide one repository command that executes the
dependency comparison, configured unused-code/dependency analysis,
repository-native quality checks, and `git diff --check`, and SHALL include
explicit Bundlephobia candidates when supplied.

#### Scenario: Repository has complete cleanup coverage
- **WHEN** an operator runs cleanup in a repository with Knip and native quality scripts
- **THEN** the runner executes each selected read-only stage and emits one combined report

#### Scenario: Explicit browser candidates are supplied
- **WHEN** the operator supplies one or more exact public browser npm specifiers
- **THEN** the same cleanup run includes advisory Bundlephobia results for those candidates

### Requirement: Repository-native command discovery
The runner MUST use the repository's declared package manager and existing
scripts, MUST run configured Knip separately, and MUST execute each distinct
safe `check`, format-check, lint, typecheck, and test command while avoiding
commands clearly duplicated or invoked by another selected script.

#### Scenario: Aggregate check exists
- **WHEN** the root package manifest provides a `check` script plus focused quality scripts with distinct commands
- **THEN** the runner invokes the aggregate and distinct focused scripts because the `check` name alone does not prove their coverage

#### Scenario: Duplicate focused command
- **WHEN** a focused script has the same command as an already-selected check or is explicitly invoked by it
- **THEN** the runner marks the focused script skipped instead of running duplicate work

#### Scenario: Knip is configured
- **WHEN** the repository exposes a standard Knip script, dependency, or configuration
- **THEN** the runner invokes the existing Knip path without installing a package

### Requirement: Read-only execution
The runner MUST NOT install packages, invoke write-mode formatters,
automatically remove code or dependencies, edit repository files, or execute
deploy, migration, release, or production commands.

#### Scenario: A repository lacks a cleanup tool
- **WHEN** Knip or another expected quality script is unavailable
- **THEN** the runner reports the missing coverage without installing or scaffolding the tool

#### Scenario: Format script may write files
- **WHEN** a repository only exposes a write-mode `format` script
- **THEN** the runner skips it and does not modify the working tree

### Requirement: Complete failure-tolerant report
The runner SHALL continue after individual stage failures and MUST report every
selected stage with a deterministic `passed`, `failed`, `unavailable`, or
`skipped` status.

#### Scenario: Knip fails before typecheck
- **WHEN** the configured Knip command exits non-zero
- **THEN** the runner records the failure and still executes the remaining selected checks

#### Scenario: A command exceeds its timeout
- **WHEN** a selected native command does not finish within the configured limit
- **THEN** the runner records a failed timed-out result and continues to later stages

### Requirement: Cleanup decision and exit signal
The combined report MUST lead with whether action is required and the command
MUST exit non-zero when dependency review is required, a local selected check
fails, or an explicitly requested Bundlephobia lookup fails.

#### Scenario: All selected stages pass
- **WHEN** dependency comparison is clean and all selected local and requested remote stages pass
- **THEN** the command exits successfully and reports no action required

#### Scenario: Local check fails
- **WHEN** any selected local cleanup check fails
- **THEN** the complete report is emitted and the command exits non-zero

#### Scenario: Optional coverage is absent
- **WHEN** Knip or native quality scripts are unavailable but no selected stage fails
- **THEN** the command reports incomplete coverage without treating absence alone as a failed check

### Requirement: Stable machine-readable output
The cleanup runner MUST emit human-readable output by default and stable JSON
on request, including schema version, repository, summary, dependency report,
coverage, ordered check results, and Bundlephobia results.

#### Scenario: JSON cleanup report
- **WHEN** the operator supplies `--json`
- **THEN** the runner emits valid JSON without interleaving child-process output

#### Scenario: Human cleanup report
- **WHEN** the operator does not request JSON
- **THEN** the runner prints a concise decision-first summary and actionable details for failed or unavailable stages
