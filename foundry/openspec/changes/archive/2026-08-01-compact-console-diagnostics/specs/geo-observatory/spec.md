## ADDED Requirements

### Requirement: Configured target queries appear with search outcomes

Fleet Console SHALL show each project's latest configured target-query observation inside that project's Google Search expansion, separately from Search Console query evidence.

#### Scenario: Project has tracked target queries

- **WHEN** the operator expands a Google Search project with geo-observatory evidence
- **THEN** the expansion shows each configured query, its kind, latest A/B/C class, and observation date
- **AND** the view identifies the evidence as a live web-search observation rather than Search Console data

#### Scenario: Project has no tracked target queries

- **WHEN** the operator expands a project without geo-observatory evidence
- **THEN** the existing Search Console evidence remains available
- **AND** no empty target-query section is added
