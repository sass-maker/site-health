## MODIFIED Requirements

### Requirement: Studio page served by the control server
The control server SHALL serve the unified Marketing Studio at `GET /studio`
without a build step or external assets. The page SHALL provide Create,
Productions, Distribute, and Tools views; the Tools view SHALL preserve forms
for ideas, titles, tags, scripts, keywords, transcripts, thumbnails, brand
voice, ideas management, factory operations, and faceless runs.

#### Scenario: Page loads
- **WHEN** a browser requests `/studio`
- **THEN** the server returns 200 text/html containing the conversational composer, supported video workflows, production and distribution views, and every existing Studio tool

#### Scenario: Existing tool remains usable
- **WHEN** the operator opens Tools after the unified workspace ships
- **THEN** the existing tool form calls its stable `/studio/:tool` endpoint and presents the same structured result as before

#### Scenario: Specialized surface is available
- **WHEN** the operator selects a workflow owned by Forge, Review, Editorial, or Postiz
- **THEN** the page names that owner and exposes the correct continuation destination without embedding provider credentials or private content
