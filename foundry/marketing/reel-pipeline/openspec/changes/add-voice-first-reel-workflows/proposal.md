## Why

Reel Maker can produce strong isolated renders, but it does not yet offer one dependable path from a spoken or typed idea to an editable production plan, reusable characters, deliberate soundtrack choices, and a finished video. The current procedural music, hidden manual planner, and model-specific experiments make quality difficult to repeat and leave the mature local-generation lane without a reviewable proof.

## What Changes

- Add a voice-first create action that records an operator request locally, transcribes it through a runnable local speech-to-text adapter, and compiles either spoken or typed input into the same saved, editable workflow.
- Make the workflow visible and manually operable as ordered stages for brief, cast, scenes, generation, edit, sound, export, and review. Support rerunning a stage while explicitly invalidating affected downstream outputs.
- Add a character directory for reusable fictional characters, project-specific cast instances, visual references, continuity constraints, and rights/source posture.
- Add first-class soundtrack selection with separate lanes for operator-owned local audio, official platform sounds, generated music, and the existing procedural bed as a clearly labeled draft fallback.
- Establish ACE-Step as the first generated-music canary candidate, but prohibit model-weight installation until the official Apple-silicon runtime builds and passes a no-weight readiness probe. Record license, source revision, model hash, runtime, prompt, and output evidence.
- Add a private mature-content proof lane for fictional, clearly consenting adults with explicit age assertions and local review evidence. Continue to reject minors or uncertain age, coercion, and sexualized real-person likenesses.
- Keep experiment rights separate from distribution readiness: private generation can proceed without Fleet branding or publication rights, while export-to-publish and Postiz remain evidence-gated.
- Preserve explicit model choice as a hard constraint: a selected model that lacks a runnable executor fails before generation instead of silently switching models or handing execution to another surface.

## Capabilities

### New Capabilities

- `editable-reel-workflow`: Voice and text intake, saved stage graphs, manual stage controls, checkpoints, reruns, and downstream invalidation.
- `character-directory`: Reusable character records, workflow cast instances, prompt compilation, continuity controls, and source/likeness evidence.
- `soundtrack-production`: Owned-audio, platform-sound, generated-music, and draft-fallback lanes with synchronization, mixing, and evidence.
- `mature-local-generation`: Bounded local generation and review for fictional consenting adults with explicit age and likeness safeguards.

### Modified Capabilities

- `marketing-video-studio`: Brief creation becomes the entry point to an executable, editable workflow with hard model selection and private-experiment versus distribution boundaries.
- `studio-web-ui`: Create exposes talk/type intake, the manual workflow, cast and soundtrack controls, and truthful step/model readiness without changing the primary navigation.

## Impact

- Affects Studio brief normalization, workflow persistence, execution dispatch, local artifact manifests, character and soundtrack storage, video composition, and the `/studio` Create and Productions views.
- Reuses the existing browser microphone pattern and local WhisperKit/MLX Whisper options; no speech runtime is installed by this change proposal.
- Introduces an ignored local-runtime adapter boundary for generated music. ACE-Step is the first candidate because its official projects expose Apple-silicon MLX and native Metal paths; Stable Audio remains an unevaluated alternative until its local Mac runtime is proven.
- Does not add a production dependency, fetch commercial music, weaken distribution rights checks, publish content, or install model weights as part of specification work.
- Meaningful UI implementation will require the Fleet design workflow, responsive evidence at 390/768/1440 pixels, and owner feedback before it is called complete.
