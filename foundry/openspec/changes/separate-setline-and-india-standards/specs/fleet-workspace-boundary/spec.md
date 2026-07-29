## ADDED Requirements

### Requirement: Independent product source remains outside Fleet-owned app roots
Fleet Workspace MUST NOT own Setline or India Standards product source under
`foundry/apps/`. Each product SHALL own its source, product planning, runtime,
data, deployment, and roadmap in its standalone Significant Hobbies repository.
Fleet references to either product SHALL be catalog, automation, monitoring, or
sanitized public-projection integrations only.

#### Scenario: Fleet records an independent product
- **WHEN** Fleet catalogs, monitors, or publicly lists Setline or India Standards
- **THEN** the product source and authority remain in its standalone repository

#### Scenario: Embedded product copy is discovered
- **WHEN** Setline or India Standards source exists under `foundry/apps/`
- **THEN** validation or review treats that tree as a repository-boundary defect
  to reconcile and remove
