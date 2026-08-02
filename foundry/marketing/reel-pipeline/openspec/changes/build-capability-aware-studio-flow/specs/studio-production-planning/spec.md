## Purpose

Defines the saved, capability-aware planning flow that turns a Fleet project and idea into a truthful, executable video-production choice.

## ADDED Requirements

### Requirement: Ordered production selection
Marketing Studio SHALL guide the operator through project, idea, video recipe, and recipe options in that order, and SHALL retain completed selections while later choices are made.

#### Scenario: Operator starts a production
- **WHEN** the operator opens Create without a saved selection
- **THEN** project selection is the first required decision and recipe execution remains unavailable

#### Scenario: Upstream selection changes
- **WHEN** the operator changes the selected project or idea
- **THEN** incompatible downstream selections are cleared and the next required step is identified

### Requirement: Project-scoped ideas
Marketing Studio SHALL list ideas for the selected Fleet project and SHALL allow a new project-scoped idea to be saved without starting production.

#### Scenario: Existing project has ideas
- **WHEN** the operator selects a Fleet project with saved ideas
- **THEN** the Studio lists those ideas with title, hook or angle, format, and lifecycle state

#### Scenario: Operator creates an idea
- **WHEN** the operator supplies a title for the selected project
- **THEN** the Studio saves a new idea associated with that project and selects it for planning

### Requirement: Capability-aware recipe catalog
Marketing Studio SHALL expose video recipes with their output style, actual execution owner, engine or continuation, spend posture, local or external requirements, supported channels, readiness state, and exact blocker.

#### Scenario: Local no-spend recipe is ready
- **WHEN** a recipe needs only an available repository-owned local path
- **THEN** the Studio labels it as no API spend and locally executable

#### Scenario: Recipe needs a local model or application
- **WHEN** a recipe requires Blender, a local model, an approved Grok asset, or another missing local input
- **THEN** the Studio identifies the requirement and does not claim the recipe is ready

#### Scenario: Recipe uses a paid or external runtime
- **WHEN** a recipe depends on an API, hosted service, Forge, Editorial, or Brand Reel
- **THEN** the Studio labels the spend or external-owner posture and exposes the truthful continuation or readiness check

### Requirement: Agent-readable arsenal contract
Marketing Studio SHALL expose one versioned, secret-free, read-only arsenal snapshot containing projects, Studio tools, workflow capabilities, video recipes, render engines, automation policies, readiness, spend posture, side-effect posture, guardrails, and valid next actions.

#### Scenario: AI operator discovers the arsenal
- **WHEN** a caller requests the arsenal through the Studio API or factory CLI
- **THEN** it receives the same normalized schema with source-registry provenance and stable identifiers instead of reconciling separate catalogs

#### Scenario: Caller narrows candidates
- **WHEN** a caller supplies supported channel, spend ceiling, owner, readiness, or recipe filters
- **THEN** the response retains the matching recipes and reports the applied filters without mutating production state

#### Scenario: Arsenal is inspected
- **WHEN** any caller reads or filters the arsenal
- **THEN** no idea, brief, render, upload, Postiz request, credential access, or social-provider call occurs

### Requirement: Arsenal reference integrity
The Studio SHALL reject arsenal definitions with duplicate identifiers, unknown render engines, unsupported owners or spend classes, invalid options or actions, or Studio tools that lack a stable handler.

#### Scenario: Catalog reference drifts
- **WHEN** a recipe names an engine absent from the render-mode registry or an automation policy names an absent recipe
- **THEN** validation fails with the offending stable identifier before an AI operator can select it

#### Scenario: External owner is represented
- **WHEN** a workflow or recipe executes in Forge, Editorial, Brand Reel, or Postiz
- **THEN** the arsenal identifies the external owner and continuation action without claiming local execution

### Requirement: Saved normalized recipe options
Marketing Studio SHALL save the selected idea, recipe, channel, duration, quality tier, variant count, and recipe-specific option values on the versioned production brief.

#### Scenario: Plan is saved
- **WHEN** the operator confirms valid selections and options
- **THEN** a versioned brief retains the project, idea, recipe, normalized options, calculated readiness, and next action across reloads

#### Scenario: Option is outside recipe bounds
- **WHEN** a caller supplies an unsupported channel, duration, quality tier, variant count, or recipe option
- **THEN** the Studio rejects or normalizes it before execution and reports the valid range

### Requirement: Exhaustive finite recipe variants
Marketing Studio SHALL deterministically expand every finite select and boolean recipe option into stable selectable variants while keeping duration, free text, file paths, and other unbounded inputs as separate fields.

#### Scenario: Recipe has multiple finite options
- **WHEN** a recipe defines three camera choices and three palette choices
- **THEN** the catalog exposes all nine camera and palette variants with stable identifiers, normalized values, and deterministic ordering

#### Scenario: Recipe requires an arbitrary local path
- **WHEN** a recipe includes a free-text or file-path input
- **THEN** the catalog exposes one selectable recipe variant and identifies the unresolved input instead of inventing path combinations

#### Scenario: Variant catalog is regenerated
- **WHEN** the same arsenal revision is loaded more than once
- **THEN** every variant retains the same identifier, label, values, order, readiness, and delivery contract

### Requirement: Explicit delivery contract
Every recipe variant SHALL identify whether its successful action produces a final local MP4, a local preview, or an external continuation, and SHALL report runtime or input blockers separately from selectability.

#### Scenario: Local recipe is labelled ready
- **WHEN** a locally executable variant is reported as Ready
- **THEN** confirmed execution produces a playable MP4 path and media evidence rather than only HTML or a still image

#### Scenario: Variant is preview-only or external
- **WHEN** a variant cannot produce a final local MP4 in Marketing Studio
- **THEN** it remains selectable and is labelled Preview only or Continue elsewhere with its exact owner and next action

### Requirement: Truthful terminal actions
Marketing Studio SHALL expose Edit, Build or Preview, and Prepare in Postiz actions for a saved plan, with each action enabled only when its prerequisites and ownership permit it.

#### Scenario: Plan has not produced media
- **WHEN** a saved plan is locally executable but has no artifact
- **THEN** Edit and Build preview are available while Preview and Prepare in Postiz identify the missing artifact

#### Scenario: Specialized owner executes the recipe
- **WHEN** the selected recipe belongs to Forge, Editorial, or Brand Reel
- **THEN** the build action becomes a continuation to that owner and the Studio does not claim local execution

#### Scenario: Reviewable artifact exists
- **WHEN** a produced artifact has local playback and quality evidence
- **THEN** Preview opens the production review and Prepare in Postiz remains gated by distribution evidence
