## MODIFIED Requirements

### Requirement: Advisory Bundlephobia evidence
The cleanup surface SHALL optionally retrieve Bundlephobia evidence for exact,
operator-confirmed public browser npm package specifiers and MUST keep remote
lookup results separate from dependency-change enforcement.

#### Scenario: Browser package lookup succeeds
- **WHEN** Bundlephobia returns valid evidence for an exact operator-confirmed package specifier
- **THEN** the cleanup report includes the resolved version, minified and gzip bytes, dependency count, module signals, side-effects signal, description, and repository

#### Scenario: Bundlephobia is unavailable
- **WHEN** a requested remote lookup times out, fails, or returns invalid data
- **THEN** the lookup reports a clear error without changing manifests or altering dependency-diff findings

#### Scenario: No public browser candidate is confirmed
- **WHEN** the operator does not supply an exact public browser npm specifier
- **THEN** the cleanup run skips remote Bundlephobia requests and does not infer package names from repository files

### Requirement: Post-change unused-dependency validation
The skill MUST discover and run the repository's existing Knip path for JS/TS
unused-code and unused-dependency validation when available, and MUST use
existing ecosystem-appropriate checks without installing an audit package.

#### Scenario: Knip is configured
- **WHEN** a JS/TS repository has a Knip script, dependency, or standard configuration
- **THEN** the combined cleanup runner invokes the repository-native Knip path and records its result

#### Scenario: Knip is unavailable
- **WHEN** the repository has no discoverable Knip path
- **THEN** the runner reports unused-dependency validation as unavailable and continues with existing relevant checks without installing an audit package
