## MODIFIED Requirements

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
- **WHEN** the operator opens Tools after the lyric workflow ships
- **THEN** the existing tool form calls its stable `/studio/:tool` endpoint and presents the same structured result as before

#### Scenario: Specialized surface is available
- **WHEN** the operator selects a workflow owned by Forge, Review, Editorial, or Postiz
- **THEN** the page names that owner and exposes the correct continuation destination without embedding provider credentials or private content

#### Scenario: Lyric workflow is selected
- **WHEN** the operator chooses lyric video
- **THEN** the existing brief editor reveals a Music and lyrics section, names the local compositor, shows Blender as an optional capability, and lists any rights or runtime blockers without changing primary navigation

## ADDED Requirements

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
