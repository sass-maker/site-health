## ADDED Requirements

### Requirement: One queue accepts tasks from either machine

The system SHALL expose one authenticated coordinator that accepts the same
normalized video-forge task from the permanently hosted machine or any operator
machine. Creating a task SHALL copy its approved keyframe into coordinator
storage so execution does not depend on the submitting machine remaining
online.

#### Scenario: Hosted machine submits a task
- **WHEN** an operator on the hosted machine submits a valid shot and approved keyframe
- **THEN** the task is visible in the shared queue with status `queued`

#### Scenario: Local Mac submits a task
- **WHEN** an operator on the local Mac submits a valid shot and approved keyframe
- **THEN** the task is visible in the same shared queue with status `queued`

### Requirement: Approved keyframe is mandatory

The system SHALL refuse image-to-video generation unless the selected shot has
an existing keyframe and an explicit keyframe approval flag.

#### Scenario: Keyframe is not approved
- **WHEN** a shot has a keyframe path but `keyframeApproved` is not true
- **THEN** task creation and direct generation fail before invoking the MLX runtime

### Requirement: Capability-aware leased execution

Workers SHALL advertise capabilities, claim at most one compatible task at a
time, and receive a time-bounded lease. Only the lease owner SHALL update or
complete the task. An expired lease SHALL make the task reclaimable.

#### Scenario: Incompatible machine polls
- **WHEN** a worker without the task's `apple-silicon` and `mlx-ltx-2.3` capabilities polls
- **THEN** it does not claim the task

#### Scenario: Worker disappears
- **WHEN** a claimed task's lease expires without completion
- **THEN** an eligible worker can reclaim it and resume from recorded progress

### Requirement: Three reproducible variants

The first generation command SHALL create three sequential image-to-video
variants from the same approved keyframe and motion prompt, changing only the
configured seed. It SHALL never overwrite an existing completed variant.

#### Scenario: First direct run
- **WHEN** the operator runs the variants command for an approved shot with seeds 41, 42, and 43
- **THEN** three uniquely named MP4s and their metadata records are written

#### Scenario: Interrupted run resumes
- **WHEN** one seed completed before interruption
- **THEN** the next run preserves that output and renders only the two missing seeds

### Requirement: Memory and concurrency guard

The worker SHALL run no more than one generation process at a time and SHALL
refuse a heavy render when usable memory headroom is below the configured
minimum or macOS reports critical memory pressure.

#### Scenario: Insufficient headroom
- **WHEN** usable memory is below the preset threshold
- **THEN** no model process starts and the task remains retryable

### Requirement: Durable render metadata

Every variant SHALL record task id, project and shot ids, keyframe hash, prompt,
negative prompt, seed, dimensions, frame count, FPS, steps, pipeline, model
repository and resolved revision when available, inference-runtime revision,
start/end timestamps, duration, host id, peak memory when available, command
arguments, exit status, and output hash.

#### Scenario: Successful render
- **WHEN** the pinned MLX runtime exits successfully and writes an MP4
- **THEN** metadata is persisted before the variant is reported complete

### Requirement: Phase 0 proof is distinguished from mocks

The readiness report SHALL separately record real text-to-video,
image-to-video, and two-stage-HQ proof on the Mac. Injected or placeholder
outputs SHALL not satisfy these gates.

#### Scenario: Contract tests pass without model weights
- **WHEN** all mocked command-runner tests pass but no real proof receipts exist
- **THEN** readiness reports the implementation contract as passing and Phase 0 as blocked

### Requirement: Mixed-media demo outputs are editor-ready

The system SHALL provide a reproducible local demo preset that combines a
locally generated narration track, burned phrase-timed subtitles, approved
visual assets, deterministic graphic scenes, and restrained transition effects.
It SHALL write the MP4, source WAV, SRT, timeline, and render manifest together.

#### Scenario: Operator renders the demo preset
- **WHEN** the operator runs `forge:demo` with the approved presenter and three generated variants
- **THEN** the output folder contains an assembled MP4, narration WAV, SRT captions, timeline JSON, and manifest with input hashes and render settings

### Requirement: The visual arsenal is composable

Voice choice, caption treatment, ASCII field, proof slide, variant filmstrip,
metadata overlay, progress indicator, and transition treatment SHALL remain
independently configurable timeline primitives rather than requiring a separate
generation model for each treatment.

#### Scenario: A later demo changes one treatment
- **WHEN** an operator changes the caption style or disables the ASCII scene
- **THEN** the renderer can rebuild the composition without regenerating the approved video variants

### Requirement: Unsynchronized faces are not presented as speech

The composition SHALL NOT show unrelated mouth motion as if it were synchronized
to audible narration. Without a proven lip-sync source, narration SHALL use
cutaways, graphics, or clearly static portrait treatment while speech is heard.

#### Scenario: Source portrait has no matching phoneme timing
- **WHEN** the narration track plays and the available presenter clip has no lip-sync metadata
- **THEN** the composition uses non-speaking visual treatment and records `lipSync: false` in its manifest
