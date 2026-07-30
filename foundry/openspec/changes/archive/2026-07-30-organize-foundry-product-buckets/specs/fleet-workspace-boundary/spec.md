## MODIFIED Requirements

### Requirement: Fleet Workspace is the canonical shared infrastructure repository

The `sass-maker/fleet-workspace` repository SHALL be the sole version-controlled
home for shared Fleet packages, skills, public apps, internal apps, Marketing,
the final dashboard, and their operational substrate. Canonical paths SHALL
place public apps under `foundry/apps/public/`, internal apps under
`foundry/apps/internal/`, Fleet Console under `foundry/apps/dashboard/`,
Marketing under `foundry/marketing/`, shared packages under
`foundry/packages/`, and Fleet-owned skills under `foundry/ops/skills/`.

#### Scenario: Agent changes a directly owned Fleet component

- **WHEN** an agent changes AI Visibility, Feedback, a Fleet skill, Mobile
  Cockpit, the public directory, Drank, PSI Swarm, Marketing, or Fleet Console
  source
- **THEN** the canonical edit occurs in the component's category-owned Fleet Workspace path
