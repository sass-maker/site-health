## ADDED Requirements

### Requirement: Conversational video brief
Marketing Studio SHALL accept a natural-language video request and SHALL
produce a saved, editable, versioned production brief without starting a
render.

#### Scenario: Operator describes a video
- **WHEN** the operator asks for a 45-second product demo for YouTube Shorts
- **THEN** the system saves a normalized brief containing the original request, video kind, duration, channel, creative fields, source posture, and next action

#### Scenario: No LLM provider is configured
- **WHEN** the operator submits a request while every Studio LLM provider is unavailable
- **THEN** the system returns a deterministic template brief in the same schema and identifies the result as template-derived

#### Scenario: Operator changes the inferred workflow
- **WHEN** the operator edits the video kind or another normalized brief field
- **THEN** the saved brief is revised and readiness is recalculated without silently retaining incompatible execution inputs

### Requirement: Complete workflow catalog
Marketing Studio SHALL show faceless/lesson, brand reel, guided app demo,
coherent film, and podcast short as explicit video workflows with truthful
readiness, required inputs, runtime owner, and action.

#### Scenario: Workflow is ready in another surface
- **WHEN** a guided app demo brief has the inputs required by Forge
- **THEN** Marketing Studio identifies Forge as the runtime owner and provides a continuation action that preserves the brief instead of claiming a local render

#### Scenario: Workflow prerequisites are missing
- **WHEN** a workflow requires an approved capture, source, or host capability that is absent
- **THEN** its action is disabled and the exact missing input or readiness blocker is shown

### Requirement: Explicit execution confirmation
Marketing Studio SHALL NOT execute a render solely because a conversation or
brief was created and SHALL require an explicit operator execution action.

#### Scenario: Brief creation completes
- **WHEN** a new brief has all required inputs
- **THEN** its lifecycle remains planned until the operator chooses its named creation or continuation action

### Requirement: Direct faceless production
Marketing Studio SHALL run a confirmed faceless/lesson brief through the
existing Studio workflow and SHALL associate its script, video, quality
evidence, and artifact directory with the saved brief.

#### Scenario: Offline mock production succeeds
- **WHEN** the operator confirms a valid faceless brief with the mock engine
- **THEN** the system produces the existing script and render artifacts, records the result on the brief, and exposes the video in Productions

#### Scenario: Real engine is unavailable
- **WHEN** the operator selects a real faceless engine whose runtime is not ready
- **THEN** the run fails with an actionable readiness error and no distribution action becomes available

### Requirement: Unified production review
Marketing Studio SHALL list saved briefs and produced artifacts with their
video kind, lifecycle, freshness, quality state, review state, and next action.

#### Scenario: Produced video needs review
- **WHEN** a render completes without final creative acceptance
- **THEN** Productions exposes playback and quality evidence while distribution remains unavailable

#### Scenario: Existing specialized review owns the decision
- **WHEN** an artifact belongs to the brand-reel or Forge workflow
- **THEN** Productions links to the authoritative Review or Forge decision surface and does not duplicate its acceptance state

### Requirement: Evidence-gated Postiz draft handoff
Marketing Studio SHALL prepare and submit Postiz drafts only from compatible
artifacts with explicit source, rights, creative approval, quality, brand,
channel, destination, and stable public-media evidence.

#### Scenario: Handoff is prepared
- **WHEN** an artifact has the required content and media evidence
- **THEN** the system writes or returns a proposed content package, media receipt, and distribution request without making a Postiz network call

#### Scenario: Stable public media is missing
- **WHEN** an approved local artifact has no stable public HTTPS media URL
- **THEN** Postiz draft creation fails before any network request and reports that artifact publication is required

#### Scenario: Draft submission is explicitly approved
- **WHEN** an operator-approved distribution request passes exact Postiz account mapping and media preflight
- **THEN** the system creates an unscheduled Postiz draft and records the sanitized receipt

### Requirement: Postiz remains the scheduling surface
Marketing Studio SHALL NOT accept or set a schedule or publication action and
SHALL direct the operator to Postiz for calendar, scheduling, publication, and
provider analytics.

#### Scenario: Draft is ready for scheduling
- **WHEN** a Postiz draft receipt exists
- **THEN** Marketing Studio exposes an Open Postiz action and states that no schedule or publication was performed by Reel Pipeline

### Requirement: Responsive and accessible operation
Marketing Studio SHALL remain operable with keyboard navigation and at 390,
768, and 1440 pixel viewport widths, with visible focus, semantic status text,
and no state conveyed by color alone.

#### Scenario: Operator uses a narrow viewport
- **WHEN** the workspace is opened at 390 pixels wide
- **THEN** primary views, brief editing, production playback, distribution blockers, and advanced tools remain reachable without horizontal page scrolling

#### Scenario: Operator uses only a keyboard
- **WHEN** the operator navigates and activates the primary workflow without a pointer
- **THEN** every interactive control has a visible focus state, an accessible name, and a logical focus order
