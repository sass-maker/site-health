# marketing-video-studio Specification

## Purpose
TBD - created by archiving change unify-marketing-video-studio. Update Purpose after archive.
## Requirements
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
coherent film, podcast short, and lyric video as explicit video workflows with
truthful readiness, required inputs, runtime owner, and action.

#### Scenario: Workflow is ready in another surface
- **WHEN** a guided app demo brief has the inputs required by Forge
- **THEN** Marketing Studio identifies Forge as the runtime owner and provides a continuation action that preserves the brief instead of claiming a local render

#### Scenario: Workflow prerequisites are missing
- **WHEN** a workflow requires an approved capture, source, host capability, timed lyric, or rights record that is absent
- **THEN** its action is disabled and the exact missing input or readiness blocker is shown

#### Scenario: Lyric video is selected
- **WHEN** the operator selects lyric video
- **THEN** Marketing Studio identifies the local lyric compositor as owner, shows optional Blender visual generation, and presents the separate music, timed-lyric, attribution, and rights requirements

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

### Requirement: Direct lyric-video production
Marketing Studio SHALL run a confirmed, rights-ready lyric-video brief through
the local lyric workflow and SHALL associate its audio evidence, timed lyrics,
literal scene plan, visual assets, video, captions, rights manifest, quality
evidence, and artifact directory with the saved brief.

#### Scenario: Rights-safe local production succeeds
- **WHEN** the operator confirms a valid lyric brief with a compatible local renderer
- **THEN** the system produces the lyric artifacts, records the result on the brief, and exposes playback and evidence in Productions

#### Scenario: Rights evidence is incomplete
- **WHEN** composition/lyrics rights, master-recording rights, evidence, or attribution are missing
- **THEN** execution fails before audio processing or asset generation and no distribution action becomes available

#### Scenario: Blender visuals are requested but unavailable
- **WHEN** a valid lyric brief explicitly requires Blender and its runtime is not ready
- **THEN** execution fails with the exact Blender readiness error instead of silently substituting another visual engine

### Requirement: Conversational lyric-video boundaries
Marketing Studio SHALL help classify and edit operator-supplied lyric-video
inputs but SHALL NOT retrieve song lyrics, infer missing copyrighted text, or
represent an operator rights assertion as independently verified.

#### Scenario: Operator requests a popular-song lyric video without inputs
- **WHEN** the operator names a current commercial song but supplies no timed lyrics, cleared audio, or rights evidence
- **THEN** the saved brief identifies the missing operator-supplied inputs and remains blocked without searching for the song or lyrics

#### Scenario: Operator supplies cleared inputs
- **WHEN** the operator supplies timed lyrics, audio, attribution, and complete separate rights postures
- **THEN** the conversation normalizes those inputs, identifies the assertions as operator-provided, and calculates production readiness

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
Marketing Studio SHALL prepare and submit Postiz drafts or future scheduled
posts only from compatible artifacts with explicit source, rights, creative
approval, quality, brand, channel, destination, and stable public-media
evidence.

#### Scenario: Handoff is prepared
- **WHEN** an artifact has the required content and media evidence
- **THEN** the system writes or returns a proposed content package, media receipt, and distribution request without making a Postiz network call

#### Scenario: Stable public media is missing
- **WHEN** an approved local artifact has no stable public HTTPS media URL
- **THEN** Postiz draft or scheduled submission fails before any network request and reports that artifact publication is required

#### Scenario: Draft submission is explicitly approved
- **WHEN** an operator-approved distribution request passes exact Postiz account mapping and media preflight without a schedule
- **THEN** the system creates an unscheduled Postiz draft and records the sanitized receipt

#### Scenario: Scheduled submission is explicitly approved
- **WHEN** an operator-approved distribution request passes exact Postiz account mapping and media preflight with a future ISO timestamp
- **THEN** the system creates a Postiz scheduled post for that exact timestamp and records the sanitized scheduled receipt

#### Scenario: Schedule is invalid or in the past
- **WHEN** an operator supplies an invalid or non-future schedule
- **THEN** the system rejects the submission before media upload or any Postiz network request

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

### Requirement: Postiz owns the publication lifecycle
Marketing Studio SHALL allow an operator to create a Postiz draft or future
schedule, but SHALL NOT publish immediately or connect directly to YouTube or
Instagram. Postiz SHALL remain the owner of credentials, calendar execution,
provider publication state, rescheduling, cancellation, and analytics.

#### Scenario: Operator chooses a schedule
- **WHEN** the operator selects a local future date and time in Distribute
- **THEN** Marketing Studio shows the device timezone, converts the selection to an absolute UTC ISO timestamp, and asks Postiz to schedule it

#### Scenario: Scheduled request is accepted
- **WHEN** Postiz returns a scheduled receipt
- **THEN** Marketing Studio records and displays the scheduled time and does not claim that provider publication has already occurred

#### Scenario: Operator chooses an unscheduled draft
- **WHEN** the operator creates a Postiz draft without selecting a schedule
- **THEN** Marketing Studio records the draft receipt and exposes an Open Postiz continuation action

#### Scenario: Immediate publication is requested
- **WHEN** a caller attempts to request immediate publication
- **THEN** Marketing Studio rejects the request before any network call

#### Scenario: Production already has a Postiz receipt
- **WHEN** an operator or caller tries to submit a production that already has a draft or scheduled Postiz receipt
- **THEN** Marketing Studio rejects the duplicate before any network call and directs lifecycle changes to Postiz
