## Purpose

Define a review-gated local production path that turns one approved short-form brief into a coherent vertical video with narration, music, motion, captions, and auditable final media.

## ADDED Requirements

### Requirement: Complete production plan
The post-ready preset SHALL require one ordered timeline that assigns every spoken line, caption cue, visual beat, animation direction, transition, and audio intent before rendering begins.

#### Scenario: Complete brief is accepted
- **WHEN** an approved brief contains a hook, ordered scenes, narration, visual direction, caption copy, music intent, and closing beat
- **THEN** the preset produces a normalized timed production plan with no uncovered section of the target duration

#### Scenario: Editorial input is incomplete
- **WHEN** a brief omits narration, visual direction, music intent, or a closing beat
- **THEN** the preset fails before media generation and reports the missing production-plan field

### Requirement: Narration is a mastered production source
The post-ready preset SHALL synthesize or accept a complete narration track, preserve its engine or source provenance, and validate that its duration and levels are usable in the final timeline.

#### Scenario: Local voice is ready
- **WHEN** a supported local voice runtime is available and the plan requests synthesis
- **THEN** the preset creates narration for every spoken scene, joins it in timeline order, and records the voice, speed, runtime, source hashes, duration, and measured audio levels

#### Scenario: Operator selects a voice
- **WHEN** the operator requests a specific supported voice from the curated catalog
- **THEN** preview and final production use that exact voice and speed without silently falling back to another delivery

#### Scenario: Approved narration is supplied
- **WHEN** the operator supplies a narration file with explicit provenance
- **THEN** the preset uses that track without resynthesis and records its hash, duration, and measured audio levels

#### Scenario: Narration cannot be produced
- **WHEN** neither a supported local voice runtime nor an approved narration file is available
- **THEN** the preset stops with a specific blocker and does not label a silent or placeholder render post-ready

### Requirement: Music is rights-safe and mixed under speech
The post-ready preset SHALL use only a generated, repository-owned, or explicitly approved music source and SHALL produce a final mix in which narration remains intelligible.

#### Scenario: Approved music is supplied
- **WHEN** a music file includes source and rights provenance
- **THEN** the preset trims or loops it to the timeline, applies planned fades and speech ducking, and records the source hash and mix settings

#### Scenario: Local music fallback is requested
- **WHEN** the preset supports a local original music fallback and no external music file is supplied
- **THEN** it produces a reusable original bed, marks the generating recipe and engine, and uses it as the recorded music source

#### Scenario: Music provenance is absent
- **WHEN** a supplied music file lacks rights provenance
- **THEN** the preset rejects it before rendering the final master

### Requirement: Every scene has purposeful motion
The post-ready preset SHALL render every planned scene with a changing visual state that serves its narrative role, while keeping captions legible at phone size.

#### Scenario: Still imagery drives a scene
- **WHEN** a scene uses a still image as its dominant visual
- **THEN** the output applies a planned camera move, layered motion, or reveal rather than holding or vibrating one static frame

#### Scenario: Generated or captured video drives a scene
- **WHEN** a scene uses an approved video source
- **THEN** the output fits, trims, and transitions the source according to the scene plan without obscuring its principal action or captions

### Requirement: One deterministic final master and sidecars
The post-ready preset SHALL merge all planned media into one 9:16 H.264/AAC MP4 and emit the supporting files needed to inspect or revise it.

#### Scenario: Production completes
- **WHEN** all timeline sources pass readiness and provenance checks
- **THEN** the preset emits a playable final MP4, narration and mix audio, SRT captions, normalized plan, hashes, engine revisions, and a production receipt in one run directory

#### Scenario: Merge fails
- **WHEN** any render, transition, caption, audio, or encoding stage fails
- **THEN** the preset keeps available diagnostic artifacts, reports the failed stage, and does not emit a passing post-ready receipt

### Requirement: Post-ready is a review-gated result
The preset SHALL distinguish a technically complete render from a post-ready render and SHALL require automated media checks plus explicit review approval for the latter label.

#### Scenario: Automated review package is created
- **WHEN** the final MP4 is encoded
- **THEN** the preset decodes the full duration, verifies video and audio streams, checks duration and output format, samples one frame per second, and emits a contact sheet and machine-readable results

#### Scenario: Reviewer approves the render
- **WHEN** a reviewer confirms the voice, music, animation, captions, pacing, and transitions are acceptable with no unresolved critical issue
- **THEN** the production receipt records an approved post-ready status and the review evidence

#### Scenario: Review finds a critical issue
- **WHEN** review identifies a missing scene, unreadable caption, poor voice or music balance, frozen or placeholder motion, broken transition, or invalid source evidence
- **THEN** the receipt remains review-only and records the issue instead of declaring the video post-ready
