## MODIFIED Requirements

### Requirement: Studio page
The control server SHALL serve the general **Video Maker** at `GET /studio` without a build step or external assets. Fleet Console's `/marketing` surface SHALL contain one prompt, one creation action, optional recipe-based production settings behind progressive disclosure, and finished-video playback. Mashup, internal Studio tools, production planning, and distribution controls SHALL NOT appear as browser choices; existing Studio programmatic APIs MAY remain available.

#### Scenario: Page loads
- **WHEN** a browser requests `/studio`
- **THEN** the server returns 200 text/html containing the prompt-first Video Maker and an optional settings disclosure without a Mashup link, panel, or route

#### Scenario: Primary workflow is understandable
- **WHEN** the operator opens Video Maker for a new creation
- **THEN** the page presents one obvious next action without a capability catalog, project planner, Mashup choice, publishing choice, or internal tool navigation

#### Scenario: Operator chooses the visual production format
- **WHEN** the operator opens Settings in Fleet Console Marketing
- **THEN** the UI offers the concrete recipes published by `/studio/arsenal` and describes the selected recipe's output style, runtime, spend class, and readiness

#### Scenario: Auto selects a format
- **WHEN** the operator leaves Visual format on Auto and submits a prompt
- **THEN** the UI chooses only a currently ready local recipe, sends its recipe id with the brief, and names the chosen recipe in the progress state

#### Scenario: Selected recipe is not runnable
- **WHEN** a recipe needs setup or additional evidence
- **THEN** the UI explains the blocker before submission and does not save another dead-end request

#### Scenario: Selected recipe continues elsewhere
- **WHEN** the selected ready recipe is owned by another existing execution surface
- **THEN** the saved brief presents the real labeled continuation instead of claiming a local render

#### Scenario: Existing tool remains callable
- **WHEN** an agent calls a stable `/studio/:tool` endpoint after the UI is simplified
- **THEN** the existing tool behavior remains available without being promoted as an operator product

#### Scenario: Specialized video inputs are required
- **WHEN** the prompt selects a video workflow that needs source, rights, or runtime-specific evidence
- **THEN** Video Maker records the request and exposes the missing requirements without adding Mashup to its form

#### Scenario: Mashup stays CLI-only
- **WHEN** an operator inspects Fleet Console Marketing or the standalone Studio page
- **THEN** neither surface exposes Mashup, which remains available only through the existing editorial CLI
