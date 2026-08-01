## 1. Lyric contracts and planning

- [x] 1.1 Add the lyric brief, separate rights-evidence, timed-cue, literal-scene, and production-manifest schemas with backward-compatible Studio normalization.
- [x] 1.2 Implement bounded LRC, SRT, and structured-cue parsing that preserves text verbatim and reports cue-specific validation errors.
- [x] 1.3 Implement fail-closed rights readiness for composition/lyrics, master recording, attribution, and evidence.
- [x] 1.4 Implement deterministic one-to-one literal scene planning and editable scene-plan revisions without lyric mutation.
- [x] 1.5 Cover lyric parsing, normalization, rights, and literal-plan behavior with targeted unit tests.

## 2. Blender runtime and adapter

- [x] 2.1 Add Blender 5.2 capability detection and register a truthful `blender` render mode behind the existing adapter factory.
- [x] 2.2 Add bounded Blender scene-manifest validation, run-directory path controls, normalized hashing, and cache identity.
- [x] 2.3 Add the repository-owned Blender scene builder for allowlisted primitives, materials, lights, cameras, and motions.
- [x] 2.4 Implement safe background Blender execution with factory startup, disabled auto-exec, progress, timeout, sanitized diagnostics, and standard render-result provenance.
- [x] 2.5 Add injected-process adapter tests and a request-to-artifact smoke that runs without Blender installed.
- [x] 2.6 Install and verify the compatible local Blender runtime without adding a Node production dependency.

## 3. Lyric composition and evidence

- [x] 3.1 Implement deterministic vertical lyric composition using visual plates, Canvas-rendered synchronized text, contrast treatment, attribution, captions, and approved audio.
- [x] 3.2 Add reduced-motion behavior, safe-area checks, cue coverage, input and artifact hashes, and quality evidence.
- [x] 3.3 Connect optional Blender visual plates to lyric composition while preserving a truthful failure when Blender is explicitly required.
- [x] 3.4 Persist lyric production artifacts and evidence through the existing saved-brief and Productions lifecycle.
- [x] 3.5 Add lyric-render, evidence, failure, and regression tests through the existing pipeline contracts.

## 4. Existing Marketing Studio extension

- [x] 4.1 Add `lyric-video` to conversational classification, workflow capabilities, saved briefs, readiness, revision, and explicit execution.
- [x] 4.2 Add lyric-specific inputs and Blender readiness to the existing Create editor using the current preserve-lane components and responsive behavior.
- [x] 4.3 Add lyric playback, cue and rights evidence, quality status, and next actions to existing Productions patterns.
- [x] 4.4 Extend distribution checks so lyric productions require complete rights evidence and all existing Postiz gates before draft or future scheduling.
- [x] 4.5 Add Studio API, UI marker, accessibility, responsive, and distribution regression tests.

## 5. Real canary and review

- [x] 5.1 Add the attributed public-domain “Twinkle, Twinkle, Little Star” timed-lyric fixture and generate a new local recording with recorded provenance.
- [x] 5.2 Render a real Blender-backed canary, validate playback and artifact metadata, and retain its reproducible evidence without committing downloaded commercial media.
- [x] 5.3 Run the Studio in a real browser at the required widths, capture the design receipt, and complete Impeccable critique, audit, and owner-feedback gates in the preserve lane.

## 6. Documentation and completion

- [x] 6.1 Document lyric input, rights posture, literal planning, Blender installation/readiness, runtime safety, canary usage, and Postiz boundaries.
- [x] 6.2 Update `PROJECT_STATUS.md` with shipped capability truth while leaving work tracking in GitHub issue #89.
- [x] 6.3 Run targeted tests first, then the existing Node, Rust, Studio smoke, renderer smoke, docs, design, OpenSpec, and diff checks.
- [x] 6.4 Sync the completed capability specs, archive the OpenSpec change, and perform a final completion audit without committing, pushing, deploying, or publishing.
