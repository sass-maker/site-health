## MODIFIED Requirements

### Requirement: Owner-first home

The private home SHALL prioritize Needs me, Working now, What shipped, What
changed, and Recommended next rather than infrastructure inventory. It SHALL
also show a compact output-and-health summary so current production and missing
evidence flows are visible without becoming the primary page hierarchy.

#### Scenario: Owner opens Foundry

- **WHEN** the owner opens the home page
- **THEN** each section shows real current data or an honest empty state and
  links to the originating mission and evidence

#### Scenario: Integration flow is missing

- **WHEN** a required cross-bucket consumer or transport is not implemented
- **THEN** Home shows the bounded gap summary and links to Connections without
  presenting provider or host inventory as owner work

#### Scenario: Recorded output exists

- **WHEN** Fleet has current skill, project, or public workflow output evidence
- **THEN** Home summarizes the bounded production counts and links to Outputs
  after the five owner-first sections
