## MODIFIED Requirements

### Requirement: Studio page served by the control server
The control server SHALL serve the unified Marketing Studio at `GET /studio`
without a build step or external assets. The page SHALL provide Create,
Productions, Distribute, and Tools views; Create SHALL expose the lyric-video
workflow and its timed-lyric, audio, attribution, separate-rights, literal
visual, reduced-motion, and Blender-readiness fields; Productions SHALL expose
a compact platform-audio preview beside a verified silent upload master when a
production has a valid reference; the Tools view SHALL preserve forms for
ideas, titles, tags, scripts, keywords, transcripts, thumbnails, brand voice,
ideas management, factory operations, and faceless runs.

#### Scenario: Page loads
- **WHEN** a browser requests `/studio`
- **THEN** the server returns 200 text/html containing the conversational composer, all six supported video workflows, lyric-specific inputs, production and distribution views, reference-audio review when available, and every existing Studio tool

#### Scenario: Existing tool remains usable
- **WHEN** the operator opens Tools after the unified workspace ships
- **THEN** the existing tool form calls its stable `/studio/:tool` endpoint and presents the same structured result as before

#### Scenario: Specialized surface is available
- **WHEN** the operator selects a workflow owned by Forge, Review, Editorial, or Postiz
- **THEN** the page names that owner and exposes the correct continuation destination without embedding provider credentials or private content

#### Scenario: Lyric workflow is selected
- **WHEN** the operator chooses lyric video
- **THEN** the existing brief editor reveals a Music and lyrics section, names the local compositor, shows Blender as an optional capability, and lists any rights or runtime blockers without changing primary navigation

#### Scenario: Production has a platform-audio reference
- **WHEN** a production contains a valid official reference and a verified silent master
- **THEN** Productions shows the visible official player, synchronized silent visual, exact excerpt timing, silent-export evidence, and platform attachment instruction using the existing production-card pattern
