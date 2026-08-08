# studio-web-ui Specification

## Purpose
TBD - created by archiving change studio-web-ui. Update Purpose after archive.
## Requirements
### Requirement: Studio page served by the control server
The control server SHALL serve the unified Marketing Studio at `GET /studio`
without a build step or external assets. The page SHALL provide Create,
Productions, Distribute, and Tools views; Create SHALL expose the lyric-video
workflow and its timed-lyric, audio, attribution, separate-rights, literal
visual, reduced-motion, and Blender-readiness fields; the Tools view SHALL
preserve forms for ideas, titles, tags, scripts, keywords, transcripts,
thumbnails, brand voice, ideas management, factory operations, and faceless
runs.

#### Scenario: Page loads
- **WHEN** a browser requests `/studio`
- **THEN** the server returns 200 text/html containing the conversational composer, all six supported video workflows, lyric-specific inputs, production and distribution views, and every existing Studio tool

#### Scenario: Existing tool remains usable
- **WHEN** the operator opens Tools after the unified workspace ships
- **THEN** the existing tool form calls its stable `/studio/:tool` endpoint and presents the same structured result as before

#### Scenario: Specialized surface is available
- **WHEN** the operator selects a workflow owned by Forge, Review, Editorial, or Postiz
- **THEN** the page names that owner and exposes the correct continuation destination without embedding provider credentials or private content

#### Scenario: Lyric workflow is selected
- **WHEN** the operator chooses lyric video
- **THEN** the existing brief editor reveals a Music and lyrics section, names the local compositor, shows Blender as an optional capability, and lists any rights or runtime blockers without changing primary navigation

### Requirement: Studio tool API
The control server SHALL expose `POST /studio/:tool` JSON endpoints that
dispatch to the existing studio modules and return their JSON results, and
`GET /studio/ideas-list` for the ideas manager. Unknown tools SHALL return
404; invalid input SHALL return 400 with the error message.

#### Scenario: Tool call succeeds
- **WHEN** `POST /studio/titles` receives `{"topic": "latte art"}`
- **THEN** the response is 200 with the same JSON the CLI would print

#### Scenario: Invalid input
- **WHEN** `POST /studio/titles` receives `{}`
- **THEN** the response is 400 with an error naming the missing field

#### Scenario: Unknown tool
- **WHEN** `POST /studio/bogus` is called
- **THEN** the response is 404

### Requirement: Faceless run from the browser
`POST /studio/faceless` SHALL run the faceless workflow with the mock engine
by default, accept an explicit engine override, and never trigger posting.

#### Scenario: Mock run from UI
- **WHEN** `POST /studio/faceless` receives `{"topic": "test"}`
- **THEN** the workflow runs with the mock engine and returns the run summary JSON

### Requirement: Lyric render from the browser
`POST /studio/lyric-video` SHALL validate and run a saved lyric brief only after
an explicit browser action, SHALL return production and evidence JSON, and
SHALL never fetch lyrics or trigger posting.

#### Scenario: Ready lyric run is confirmed
- **WHEN** the endpoint receives a saved ready lyric brief identifier and explicit confirmation
- **THEN** the workflow renders it and returns the production summary, playback artifact, cue coverage, rights status, and quality evidence

#### Scenario: Render is not confirmed
- **WHEN** the endpoint receives a ready brief without explicit confirmation
- **THEN** it returns a validation error and performs no audio, Blender, composition, or distribution work

#### Scenario: Rights are blocked
- **WHEN** the endpoint receives a lyric brief with incomplete separate rights evidence
- **THEN** it returns a rights-specific validation error before any render process starts

### Requirement: Blender readiness in Studio
The Studio UI SHALL show Blender capability status, exact compatible version
when ready, and an actionable blocker when unavailable without implying that
Blender is required for every lyric video.

#### Scenario: Blender is ready
- **WHEN** the capability probe finds a compatible Blender runtime
- **THEN** the lyric brief shows Blender ready and allows the operator to request Blender literal scenes

#### Scenario: Blender is not ready
- **WHEN** the capability probe cannot find a compatible runtime
- **THEN** the lyric brief shows the blocker, keeps Blender-required execution disabled, and preserves non-Blender planning and editing actions

### Requirement: Content lane and automation observability
Marketing Studio SHALL group or filter productions by Project Autopilot, Ask Me, and Personal Automations and SHALL show each item's scope, trigger, source, policy, selected recipe, spend posture, run state, and next recovery action. The UI SHALL remain an optional monitor and override surface rather than a prerequisite for policy-owned production.

#### Scenario: Operator reviews project automation
- **WHEN** the operator opens Productions after unattended High Signal, Significant Hobbies, or changelog runs
- **THEN** Project Autopilot shows each production with project attribution, policy, recipe, quality, distribution state, and any exception

#### Scenario: Operator-request content is present
- **WHEN** content was created through a direct agent or Studio conversation
- **THEN** Ask Me shows it separately even when it has project scope

#### Scenario: No dashboard session exists
- **WHEN** an enabled automation policy runs while no browser is open
- **THEN** the run continues normally and the next dashboard load reads its persisted receipts and state
