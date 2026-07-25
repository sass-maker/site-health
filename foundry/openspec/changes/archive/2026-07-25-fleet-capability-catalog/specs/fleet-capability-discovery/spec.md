## ADDED Requirements

### Requirement: Canonical capability discovery
The system SHALL discover Fleet-owned skills, operator scripts, reusable
templates, and living operational documentation from canonical repository
paths without requiring a manually duplicated catalog.

#### Scenario: Discover capabilities from a fresh clone
- **WHEN** a user lists capabilities in a valid Fleet checkout
- **THEN** the system returns deterministic, namespaced entries derived from the canonical `foundry/ops/` files

#### Scenario: Exclude non-canonical material
- **WHEN** the repository contains archived documentation or generated evidence
- **THEN** the system excludes those files from the capability catalog

### Requirement: Human and machine discovery commands
The system SHALL expose read-only commands to list, search, and retrieve
capabilities with concise human output and stable machine-readable output.

#### Scenario: Search by operational intent
- **WHEN** a user searches with one or more terms
- **THEN** the system ranks matching identifiers, names, summaries, types, and paths deterministically

#### Scenario: Retrieve an exact capability
- **WHEN** a user requests an existing namespaced identifier
- **THEN** the system returns that capability's type, name, summary, and repository-relative path

#### Scenario: Request JSON output
- **WHEN** a user passes `--json`
- **THEN** the system returns a versioned success or error envelope with stable fields

#### Scenario: Request dense output
- **WHEN** a user passes `--dense` to a result-producing command
- **THEN** the system returns a compact representation suitable for limited agent context

### Requirement: Generated agent context
The system SHALL generate agent-facing discovery guidance from the same live
catalog used by human CLI commands.

#### Scenario: Generate broad context
- **WHEN** a user requests context without a query
- **THEN** the system emits concise usage guidance and catalog entries grouped by capability type

#### Scenario: Generate focused context
- **WHEN** a user requests context with a query or type filter
- **THEN** the system emits only the matching catalog subset using the same ranking and metadata contract as search

### Requirement: Catalog integrity diagnosis
The system SHALL provide a read-only doctor command that validates catalog
roots, identifiers, required metadata, duplicates, and referenced files.

#### Scenario: Healthy catalog
- **WHEN** all required roots and discovered entries satisfy the catalog contract
- **THEN** doctor reports success and exits successfully

#### Scenario: Invalid catalog
- **WHEN** required roots are missing or entries contain duplicate identifiers or missing required metadata
- **THEN** doctor reports actionable failures in human or JSON form and exits unsuccessfully

### Requirement: Dependency-free and non-executing operation
The system MUST use the existing Node.js runtime and MUST NOT execute discovered
capabilities, contact external services, or mutate the workspace.

#### Scenario: Search the catalog
- **WHEN** any discovery command runs
- **THEN** it performs repository reads only and does not invoke indexed scripts or skills
