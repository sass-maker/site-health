## ADDED Requirements

### Requirement: Internal catalog generates project views
Fleet Workspace MUST use its internal project catalog as the sole project
identity source and SHALL generate human-readable inventory and sanitized
external project data from that catalog.

#### Scenario: Internal project metadata changes
- **WHEN** an operator changes a project's shared identity, lifecycle, repository, deployment, or public-listing posture
- **THEN** one generation command updates the applicable Fleet README, private console, compatibility views, and public catalog

#### Scenario: Personal portfolio links to SaaS Maker
- **WHEN** the comprehensive SaaS Maker catalog changes
- **THEN** the personal website and its README remain curated and require no mirrored project-list update
