## MODIFIED Requirements

### Requirement: Fleet Workspace is the canonical shared infrastructure repository

The `sass-maker/fleet-workspace` repository SHALL be the sole version-controlled
home for shared Fleet helpers, skills, public apps, Marketing, packages, Fleet
Console clients, and their operational substrate. Canonical paths SHALL place
Drank, PSI Swarm, and AI Visibility under `foundry/helpers/`, the public
directory under `foundry/apps/public/`, Fleet Console and Mobile Cockpit under
`foundry/apps/dashboard/`, Marketing under `foundry/marketing/`, Feedback under
`foundry/packages/`, and Fleet-owned skills under `foundry/ops/skills/`.

#### Scenario: Agent changes a directly owned Fleet component

- **WHEN** an agent changes Drank, PSI Swarm, AI Visibility, Feedback, a Fleet
  skill, Mobile Cockpit, the public directory, Marketing, or Fleet Console
  source
- **THEN** the canonical edit occurs in the component's category-owned Fleet
  Workspace path

#### Scenario: Active path points to the retired taxonomy

- **WHEN** tracked active code, configuration, registry data, documentation, or
  a symlink points to a moved component's former path
- **THEN** workspace validation reports the stale reference rather than
  accepting two canonical locations
