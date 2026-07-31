# Fleet visibility remediation

## ADDED Requirements

### Requirement: Valid metric evidence

The Fleet Metrics projection SHALL distinguish a failed, placeholder, or absent
measurement from a valid numerical zero.

#### Scenario: Failed performance run

- **WHEN** the latest performance receipt reports a failed or incomplete run
- **THEN** the project is shown as unmeasured for that result
- **AND** the failed receipt is not converted into a zero performance score or
  zero LCP.

#### Scenario: Incomplete design review

- **WHEN** a design receipt does not contain a completed scored review
- **THEN** the project is shown as unmeasured for design
- **AND** the placeholder is not ranked as a zero score.

#### Scenario: Independent project checkout is unavailable

- **WHEN** a maintained project's receipt was validated from an explicitly
  selected project workspace and its required evidence bytes were hashed
- **THEN** Fleet MAY project the sanitized deterministic snapshot when that
  checkout is absent
- **AND** a readable local receipt still undergoes direct validation and takes
  precedence
- **AND** neither source may invent or mutate the recorded scores.

#### Scenario: Search observation is recorded

- **WHEN** an operator records a current search class for a configured project
  query
- **THEN** the evidence names the exact configured query and records two or
  three current Web Search result URLs
- **AND** class A requires the project's own origin in the first three results
- **AND** class C cannot contain the project's own origin
- **AND** a later corrected observation on the same day takes precedence.

### Requirement: Source-derived agent coverage

Projects with public route catalogs SHALL be able to expose canonical
agent-readable representations derived from the same source content.

#### Scenario: Large public corpus

- **WHEN** a project contains more public routes than the bounded audit limit
- **THEN** it exposes source-derived agent-readable routes without committing a
  duplicate file for every page
- **AND** the audit reports both total discovered routes and checked routes.

### Requirement: Honest remediation reporting

Local prerequisite work SHALL not be reported as improved external visibility
until deployment and a later observation demonstrate the outcome.

#### Scenario: Local SEO improvement

- **WHEN** metadata, content, internal links, or agent surfaces improve locally
- **THEN** the change is reported as a prerequisite improvement
- **AND** domain authority, search rank, or AI citation improvement remains
  unclaimed until externally observed.
