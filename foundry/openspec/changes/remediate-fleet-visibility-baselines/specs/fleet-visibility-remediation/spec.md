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
