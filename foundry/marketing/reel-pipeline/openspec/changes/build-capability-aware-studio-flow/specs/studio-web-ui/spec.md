## MODIFIED Requirements

### Requirement: Studio page served by the control server
The control server SHALL serve the unified Marketing Studio at `GET /studio` without a build step or external assets. Create SHALL expose the ordered Project, Idea, Video recipe, and Options flow plus truthful Edit, Build or Preview, and Prepare in Postiz actions; Productions, Distribute, and Tools SHALL preserve their existing responsibilities and controls.

#### Scenario: Page loads
- **WHEN** a browser requests `/studio`
- **THEN** the server returns 200 text/html containing project selection, project-scoped idea selection and creation, the complete recipe catalog, bounded recipe options, terminal actions, and every existing Studio view and tool

#### Scenario: Existing tool remains usable
- **WHEN** the operator opens Tools after the production planner ships
- **THEN** the existing tool form calls its stable `/studio/:tool` endpoint and presents the same structured result as before

#### Scenario: Specialized surface is available
- **WHEN** the operator selects a workflow owned by Forge, Review, Editorial, or Postiz
- **THEN** the page names that owner and exposes the correct continuation destination without embedding provider credentials or private content

#### Scenario: Lyric workflow is selected
- **WHEN** the operator chooses lyric video
- **THEN** the brief editor reveals its Music and lyrics section, names the local compositor, shows Blender as an optional capability, and lists rights or runtime blockers without changing primary navigation

#### Scenario: Operator returns to a saved plan
- **WHEN** the operator selects an existing brief after a reload
- **THEN** the page restores the saved project, idea, recipe, and options and identifies the next incomplete or actionable step

