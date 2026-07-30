## ADDED Requirements

### Requirement: Films declare a narrative spine
The system SHALL require each coherent scene composition to declare a concise
story spine and ordered scenes whose roles are one of `setup`, `tension`,
`analysis`, `verdict`, `proof`, or `close`.

#### Scenario: Scene lacks narrative purpose
- **WHEN** a scene selects visual techniques but omits its role or purpose
- **THEN** validation fails before rendering

### Requirement: Scenes obey a visual budget
The system SHALL limit each scene to one dominant subject, at most one
supporting visual layer, one principal action, one camera movement, and one
principal transition unless an explicit reviewed exception is recorded.

#### Scenario: Feature montage is submitted
- **WHEN** a scene attempts to show presenter, slideshow, chart, ASCII, and
  generated video as simultaneous subjects
- **THEN** validation rejects the scene as exceeding the visual budget

### Requirement: Techniques are resolved behind narrative scenes
The system SHALL resolve product capture, generated motion, typography,
SVG/Canvas graphics, voice, captions, music, and effects as media bindings
behind the normalized scene contract rather than as independent top-level
stories.

#### Scenario: Rendering engine changes
- **WHEN** an approved scene changes from deterministic Canvas motion to a
  compatible Remotion implementation
- **THEN** its narrative role, purpose, timing, and asset provenance remain
  unchanged

### Requirement: Product evidence is real and revisioned
Any product interface used as evidence SHALL come from an approved screenshot
or recording of the real product and SHALL record its source revision.
Generated interface imagery SHALL NOT be presented as product evidence.

#### Scenario: Generated UI contains a claim
- **WHEN** an AI-generated image appears to show a CodeVetter finding, metric,
  test result, or verdict
- **THEN** the compositor may use it only as non-evidentiary atmosphere and
  must replace it with real capture before presenting the claim

### Requirement: Publication tier respects licenses
Every media binding SHALL record its source and publication tier. The renderer
SHALL fail closed when a commercial or publishable render includes a
proof-only or license-restricted asset.

#### Scenario: Wav2Lip presenter is included in a publishable render
- **WHEN** a scene references Wav2Lip model output and the requested tier is
  publishable or commercial
- **THEN** validation fails with the restricted asset identified

### Requirement: Output remains editor-ready and reproducible
The compositor SHALL write the final MP4, narration source, SRT captions,
normalized scene timeline, manifest, input hashes, engine revisions, source
licenses, and representative review frames without overwriting an existing
completed render.

#### Scenario: CodeVetter reference film completes
- **WHEN** the delegated `evidence-beam` film renders successfully
- **THEN** its output folder contains all editor-ready media and reproducibility
  records required for review

### Requirement: CodeVetter proof tells one continuous story
The reference film SHALL depict uncertain code being isolated, connected to
real evidence, and resolved into one qualified shipping verdict. Techniques
that do not advance that path SHALL be omitted.

#### Scenario: Optional animation adds no narrative value
- **WHEN** an ASCII field, chart, slide, or presenter is proposed only to
  demonstrate availability
- **THEN** the reference film excludes that technique

### Requirement: Film skills are versioned and reproducible
The system SHALL represent each reusable film skill with a stable ID and
version plus its narrative-role sequence, asset requirements, scene
primitives, visual and audio defaults, quality gates, reference manifest, and
known failure modes. A rendered manifest SHALL record the exact selected skill
ID and version.

#### Scenario: AI creates a film from a prompt
- **WHEN** the operator submits a freeform brief and chooses or accepts a
  suggested film skill
- **THEN** the AI fills a structured manifest constrained by that exact skill
  version rather than inventing an unbounded composition

#### Scenario: A recipe changes after a successful render
- **WHEN** motion, typography, audio, or quality-gate behavior changes
- **THEN** the film skill receives a new version and older renders continue to
  resolve to their original recipe

### Requirement: Operators can manage the production loop in one UI
The system SHALL provide a local operator console that can create a prompted
film task, choose a film skill, inspect asset provenance and rights, monitor
local or remote task status, review variants or representative frames, record
an explicit selection decision, and launch an approved final render.

#### Scenario: Operator reviews generated variants
- **WHEN** preview variants finish
- **THEN** the console shows the prompt, seed, skill version, render metadata,
  and media side by side with `accept`, `retry`, `change-motion`,
  `change-keyframe`, and `cloud-candidate` decisions

#### Scenario: Operator attempts final render without approval
- **WHEN** no keyframe or variant has an explicit accepted decision
- **THEN** the console refuses to enqueue the final render

### Requirement: Operator console remains bounded
The operator console SHALL NOT implement freeform timeline editing,
frame-by-frame keyframing, arbitrary layer dragging, or social publishing.

#### Scenario: Operator needs a custom editorial change
- **WHEN** a requested change cannot be expressed through film-skill variables
  or selection decisions
- **THEN** the system exports the editor-ready package for completion in an
  external editor

### Requirement: Operators can record real applications from the console
The operator console SHALL expose a button-driven workflow to record an
explicitly selected screen, application window, or browser tab using browser
capture permission. Recording SHALL start only after an operator gesture and
confirmed permission, SHALL expose visible recording state and elapsed time,
and SHALL provide a local preview and discard decision before upload.

#### Scenario: Screen-capture permission is denied
- **WHEN** the operator clicks `Record app` and denies or closes the browser
  permission chooser
- **THEN** the console remains usable, states that capture did not start, and
  offers a retry without uploading an asset

#### Scenario: Operator approves a recorded take
- **WHEN** the operator stops, previews, and approves the take
- **THEN** the console streams the recording to authenticated storage and
  records its media type, duration, bytes, hash, source revision, rights
  approval, capture time, and selected film-skill version

### Requirement: Guided app demos can include an authentic face overlay
The `guided-app-demo@1` film skill SHALL support an optional same-session
camera presenter composited at bottom right while the real application remains
the dominant subject. The skill SHALL pin presenter size and safe margins,
require genuine synchronized recorded audio, and SHALL NOT label unrelated or
generated mouth motion as synchronized speech.

#### Scenario: Operator records app and presenter together
- **WHEN** the operator enables `Include presenter` before starting capture
- **THEN** the local preview and approved source show the camera track at the
  skill-defined bottom-right position with app and microphone timing captured
  in the same session

#### Scenario: Presenter synchronization is not trustworthy
- **WHEN** an imported face track has no same-session or explicit sync receipt
- **THEN** `guided-app-demo@1` refuses a publishable final and identifies the
  presenter asset as the failing input

### Requirement: Capture workflow and film style share one job record
Button-created and AI-authored guided app-demo jobs SHALL use the same durable
job schema, exact film-skill contract, source asset, review decisions, and
final-render gate.

#### Scenario: AI preconfigures a guided demo
- **WHEN** AI selects `guided-app-demo@1` and prefills the prompt and capture
  instructions
- **THEN** the operator still grants capture permission, approves the take,
  and uses the same review controls as a manually created job
