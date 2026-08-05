## 1. Proven local baseline

- [x] 1.1 Pin official ComfyUI, LTX 2B distilled, T5 FP8, and MiniMax H3 model revisions and hashes outside git
- [x] 1.2 Run guarded real H3 and LTX canaries on the 48 GiB Mac and record compatibility, timing, disk, and peak-memory evidence
- [x] 1.3 Assemble a playable two-shot proof with fixed Kokoro character voices and a seeded ACE-Step original score

## 2. Recipe contract and validation

- [x] 2.1 Add the versioned workflow-recipe schema, normalization, input bounds, and deterministic input signature
- [x] 2.2 Add built-in-node allowlist validation and embedded Comfy MP4 prompt extraction without custom-node installation
- [x] 2.3 Add pinned LTX 2.3 final, LTX 2B preview, and blocked-on-this-host H3 R2V recipe manifests with real proof receipts
- [x] 2.4 Add focused tests for accepted recipes, unknown nodes, immutable graph fields, invalid inputs, and stale model hashes

## 3. Local Comfy execution

- [x] 3.1 Add localhost readiness and live node/model schema validation against the pinned recipe
- [x] 3.2 Add a serial Comfy API executor with queue/history tracking, 85 percent disk preflight, and 90 percent RAM interruption
- [x] 3.3 Return verified MP4 metadata, hashes, timing, peak memory, graph/model provenance, and failures in the existing artifact envelope
- [x] 3.4 Register the Comfy preview and existing MLX LTX 2.3 final executors behind Coherent local film without adding a production dependency or a second orchestration layer
- [x] 3.5 Add focused API and executor tests using injected local-server and resource-monitor fixtures

## 4. Episode manifests and assembly

- [x] 4.1 Add normalized episode, shot, cast, continuity-reference, dialogue, soundtrack, and assembly records
- [x] 4.2 Resolve cast through the existing character directory and invalidate only shots whose content signatures changed
- [x] 4.3 Add serial resumable shot execution with accepted-shot reuse and per-shot review state
- [x] 4.4 Reuse Kokoro, ACE-Step soundtrack evidence, and FFmpeg to assemble a deterministic episode receipt and final MP4
- [x] 4.5 Add tests for continuity blockers, partial resume, single-shot regeneration, audio evidence, and deterministic assembly

## 5. Existing Studio surface

- [x] 5.1 Expose ready recipes, specialist blockers, installed footprint, and tweakable inputs in the existing Coherent local film flow
- [x] 5.2 Add explicit generate, progress, interrupt, retry-shot, open-video, and open-receipt actions without exposing the raw graph editor
- [x] 5.3 Add episode planning and shot review to the same workflow and character-directory surfaces
- [x] 5.4 Run targeted UI/API tests and the required design-workflow review at 390, 768, and 1440 pixels

## 6. Documentation and completion

- [x] 6.1 Document pinned setup, recipe ingestion, resource limits, cleanup boundaries, and the LTX-2.3-final/LTX-2B-preview/H3-blocked qualification
- [x] 6.2 Run focused tests, full project tests, OpenSpec strict validation, and `git diff --check`
- [ ] 6.3 Render and review one complete 2- to 3-minute local episode before making the episode recipe auto-eligible
- [ ] 6.4 Update `PROJECT_STATUS.md` and archive the change only after the feature is implemented, reviewed, and accepted

## 7. Inspectable AI workflow planning

- [x] 7.1 Add a versioned workflow-archetype library with truthful recipe/model bindings, intent tags, phases, adjustable controls, readiness, and shared-graph disclosure
- [x] 7.2 Add deterministic request routing and persisted workflow proposal versions with selection reasons, required inputs, estimates, and bounded revision diffs
- [x] 7.3 Add proposal inspect, raw Comfy graph export, constrained revise, and explicit Play API boundaries that reuse existing executors
- [x] 7.4 Replace hidden quick execution and generic fixed-stage feedback with a concise expandable workflow proposal, modification prompt, and Play workflow interaction
- [x] 7.5 Add focused routing, proposal, revision, graph-inspection, execution, accessibility, and responsive tests; rerun the preserve-mode design review

## 8. Studio libraries and tested samples

- [x] 8.1 Add read-only API projections for production History, recipe catalog, and workflow-archetype library without adding a parallel ledger
- [x] 8.2 Add History, Recipes, and Workflows navigation and artifact-led responsive surfaces with prompt, workflow, video, readiness, and reuse actions
- [x] 8.3 Add a versioned five-sample prompt manifest and resumable serial local runner using the existing 85 percent disk and 90 percent RAM guards
- [ ] 8.4 Run the five samples and retain the real briefs, frozen workflows, videos, and receipts in History
- [x] 8.5 Add focused API/UI/runner tests, browser evidence at 390/768/1440, Impeccable critique/polish/audit, full validation, and owner review
