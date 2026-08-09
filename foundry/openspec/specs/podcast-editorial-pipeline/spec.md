# podcast-editorial-pipeline Specification

## Purpose
TBD - created by archiving change consolidate-mashup-into-reel-pipeline. Update Purpose after archive.
## Requirements
### Requirement: Canonical editorial runtime
Mashup SHALL own the podcast editorial planner as an independently runnable
helper while preserving its CLI, SQLite-backed resumable stages, scoring
behavior, local loopback editor, and multi-clip rendering.

#### Scenario: Run the independent planner
- **WHEN** an operator invokes the Mashup editorial command
- **THEN** the runtime runs without requiring the Reel Pipeline source tree

### Requirement: Versioned podcast edit contract
The system SHALL export and normalize a `fleet.podcast-edit.v1` document that
contains the edit identity, strategy, prompt, duration, clips, source paths,
source titles, original source ranges, transcript text, member segment IDs,
captions or visual cues, score, eight independent score terms, weights,
calibration, rationale, and approval state.

#### Scenario: Export a planned edit
- **WHEN** the editorial runtime exports an EDL
- **THEN** no source locator, score term, visual provenance field, or transcript text is lost

#### Scenario: Reject an incomplete edit
- **WHEN** a podcast edit omits a required source range or any of the eight score terms
- **THEN** contract normalization fails before rendering begins

### Requirement: Expensive stages remain resumable
The consolidated editorial runtime SHALL continue to reuse persisted
transcription, enrichment, embedding, boundary-review, and render-intermediate
outputs when their inputs and recipe identities are unchanged.

#### Scenario: Repeat an unchanged run
- **WHEN** the operator repeats an editorial command with unchanged sources, models, and settings
- **THEN** completed expensive stages are reused rather than recomputed

### Requirement: Source content is not replayed
The planner SHALL exclude candidates that share underlying member segments
with material already selected. The exported contract and Reel Pipeline
normalizer SHALL reject an edit that repeats a member segment ID or contains
overlapping planned or rendered source-audio intervals from the same source.
Semantic similarity that does not reuse source material SHALL remain visible
through the independent `non_repetition` score rather than becoming an opaque
render-time heuristic.

#### Scenario: Repeat an underlying segment
- **WHEN** two clips contain the same `segment_id` or member `segment_ids` value
- **THEN** contract normalization fails before rendering begins

#### Scenario: Replay a source interval
- **WHEN** two clips from the same source have overlapping planned or rendered audio ranges
- **THEN** contract normalization fails before rendering begins

#### Scenario: Return to a theme without replaying material
- **WHEN** a long-form edit revisits a topic using disjoint source material
- **THEN** the edit remains valid and its semantic similarity is surfaced by `non_repetition`

### Requirement: Long-form planning remains available
The dedicated short-form command SHALL remain bounded to 30–60 seconds. The
standard editorial planner and `fleet.podcast-edit.v1` renderer SHALL accept
approved multi-clip edits longer than 60 seconds without applying the
short-form duration validator or an additional contract maximum.

#### Scenario: Plan a seven-minute edit
- **WHEN** an operator requests a 420-second standard mashup from a sufficient candidate pool
- **THEN** the planner may fill the target using unique clips and export it through the same podcast-edit contract

#### Scenario: Render an approved long-form edit
- **WHEN** an approved podcast edit has a target and clip timeline longer than 60 seconds
- **THEN** Reel Pipeline validates and renders it through the podcast-edit adapter

### Requirement: Source and generation boundaries remain explicit
The editorial runtime SHALL accept filmed or photographic media only when it is
creator-owned, licensed for the use, or public domain, and SHALL prohibit
synthetic dialogue, narration, voice cloning, and deceptive photoreal footage.
It MAY emit procedural non-photoreal motion, typography, shaders, diagrams, and
ASCII visual intent.

#### Scenario: Add a procedural visual cue
- **WHEN** an approved edit contains a non-photoreal procedural visual cue
- **THEN** the cue retains its kind and timing without being represented as sourced footage

#### Scenario: Add a filmed visual asset
- **WHEN** an edit contains existing filmed or photographic media
- **THEN** the asset includes a human-readable source title and provenance URL or ownership evidence

### Requirement: Approved edits render through Mashup
Mashup SHALL render an approved podcast edit through its owned multi-clip
renderer while preserving original audio, source headings, watermark identity,
captions, and interval-bound visual credits, and SHALL emit an artifact receipt
with input and output hashes.

#### Scenario: Convert an approved edit
- **WHEN** an operator converts an approved `fleet.podcast-edit.v1` document
- **THEN** Mashup emits a playable artifact and receipt that retain the original source audio and every visible source credit

#### Scenario: Convert an unapproved edit
- **WHEN** an operator attempts to convert an edit whose approval is not approved
- **THEN** conversion fails without rendering an artifact
