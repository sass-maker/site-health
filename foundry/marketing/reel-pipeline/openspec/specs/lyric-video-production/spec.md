# lyric-video-production Specification

## Purpose
Define rights-gated, literal lyric-video planning, rendering, evidence, review,
and distribution eligibility.

## Requirements

### Requirement: Operator-supplied timed lyrics
The lyric-video workflow SHALL accept operator-supplied LRC, SRT, or structured
timed-lyric cues, SHALL normalize them to ordered bounded cues, and SHALL
preserve every cue's text verbatim.

#### Scenario: Valid LRC is supplied
- **WHEN** the operator supplies valid LRC text and compatible audio
- **THEN** the system produces ordered start and end times for every non-empty lyric cue without rewriting its text

#### Scenario: Timed lyrics are invalid
- **WHEN** timed lyrics contain invalid timestamps, overlaps, unsupported markup, empty cues, or times outside the audio duration
- **THEN** readiness fails with cue-specific blockers and no render begins

#### Scenario: Only a song title is supplied
- **WHEN** the operator names a song without supplying timed lyric text
- **THEN** the system reports that operator-supplied timed lyrics are required and does not fetch or generate them

### Requirement: Separate music rights evidence
The lyric-video workflow SHALL record composition/lyrics rights and
master-recording rights as separate operator assertions and SHALL require
attribution plus non-empty evidence before rendering or distribution.

#### Scenario: Public-domain song uses a new recording
- **WHEN** composition/lyrics posture is `public-domain`, master-recording posture is `original-recording`, and attribution and evidence are present
- **THEN** the rights gate passes while retaining the assertion, evidence, and input hashes in the production manifest

#### Scenario: Attribution is present but permission is unknown
- **WHEN** either rights posture is unknown or rejected even though attribution is present
- **THEN** rendering and distribution remain blocked with an explanation that attribution is not permission

#### Scenario: Licensed inputs are supplied
- **WHEN** both rights postures are `licensed` or `owned` and their evidence and attribution are present
- **THEN** the system records the asserted basis and allows the remaining readiness checks to proceed without claiming to have independently verified the licence

### Requirement: Literal cue-to-scene plan
The lyric-video workflow SHALL map every timed lyric cue to exactly one
reviewable literal scene record whose source lyric is unchanged and whose
objects, actions, environment, camera, and asset provenance conform to a
bounded schema.

#### Scenario: Literal plan is created
- **WHEN** valid timed lyrics pass readiness
- **THEN** the system creates one ordered scene record per cue and exposes the concrete interpretation for operator review

#### Scenario: Enrichment changes cue identity
- **WHEN** a planner result alters, omits, duplicates, or reorders source lyric cues
- **THEN** the plan is rejected before asset generation

#### Scenario: Operator edits an interpretation
- **WHEN** the operator changes a scene interpretation without changing its source cue
- **THEN** the system saves a new brief revision and recalculates the affected asset and render plan

### Requirement: Deterministic lyric-video composition
The system SHALL compose approved audio, visual plates, synchronized verbatim
lyrics, captions, attribution, and safe-area treatment into a
standards-compliant vertical video with artifact hashes and quality evidence.

#### Scenario: Lyric render succeeds
- **WHEN** the operator explicitly confirms a ready lyric brief
- **THEN** the system writes the video, captions, cue plan, rights manifest, render provenance, hashes, and quality evidence beneath one production directory

#### Scenario: Reduced motion is requested
- **WHEN** the operator enables reduced motion
- **THEN** the system replaces high-motion camera or text effects with restrained transitions while preserving timing, legibility, and literal imagery

#### Scenario: Visual plate is detailed
- **WHEN** a literal scene has insufficient contrast behind its lyric
- **THEN** the compositor applies the established contrast backing and safe-area rules rather than allowing unreadable text

### Requirement: Evidence-gated lyric distribution
A lyric-video production SHALL remain unavailable to Postiz until rights,
source, audio, cue, creative, quality, brand, destination, and stable public
media evidence all pass.

#### Scenario: Creative review is pending
- **WHEN** a lyric render completes but its literal plan or finished video has not been accepted
- **THEN** playback and evidence remain available while Postiz actions remain disabled

#### Scenario: Rights state changes after rendering
- **WHEN** a saved rights assertion or its evidence is removed or rejected after a render
- **THEN** the production becomes distribution-ineligible without deleting its local evidence

#### Scenario: All evidence passes
- **WHEN** an accepted lyric production passes every existing and lyric-specific distribution check
- **THEN** the operator can prepare a Postiz draft or future schedule through the existing handoff

### Requirement: Rights-safe real canary
The repository SHALL include a reproducible real canary based on a recognizable
public-domain composition and a newly generated recording, with explicit
attribution and no downloaded commercial recording.

#### Scenario: Canary runs with Blender ready
- **WHEN** the canary command runs on a host with the compatible Blender runtime
- **THEN** it produces a playable vertical lyric video and a manifest proving cue coverage, original recording provenance, Blender provenance, and artifact hashes

#### Scenario: Blender is unavailable
- **WHEN** the canary is requested on a host without a compatible Blender runtime
- **THEN** the command fails with an actionable readiness message before claiming a real Blender artifact
