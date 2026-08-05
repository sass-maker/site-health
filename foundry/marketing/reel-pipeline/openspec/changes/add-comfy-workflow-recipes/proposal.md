## Why

The Studio can describe local video models but cannot yet turn a prompt and
character reference into a reproducible real render. The current Mac proof
shows that a pinned native ComfyUI graph can produce useful LTX video in under
a minute without exceeding the host limits, while MiniMax H3 is too slow on
this host and must remain an explicit specialist lane.

## What Changes

- Add versioned local workflow recipes that pin the Comfy graph, model and
  runtime revisions, file hashes, exposed inputs, defaults, seed, and resource
  envelope.
- Add a single local Comfy executor behind the existing video execution
  boundary. It validates an allowlist of built-in nodes, submits one job at a
  time, records progress and peak memory, interrupts at the configured limit,
  and returns the normal video artifact envelope.
- Make the already proven MLX LTX 2.3 Q4 runtime the final-quality recipe and
  keep official Lightricks LTX 2B distilled image-to-video as a fast preview
  recipe on this 48 GiB Apple Silicon host. Keep MiniMax H3 R2V visible but
  blocked from automatic Mac execution until it has a practical compatible
  runtime.
- Let operators start from a vetted imported workflow, then adjust only prompt,
  character references, aspect ratio, duration, motion strength, and seed.
  Do not auto-install custom nodes or execute arbitrary uploaded graphs.
- Add an automatic workflow planner that turns a request into a persisted,
  inspectable proposal before execution. The proposal selects a truthful
  production archetype, exact recipe versions, models, phases, required inputs,
  and resource posture from a bounded workflow library.
- Let operators expand the proposal to inspect its production phases and the
  underlying Comfy nodes or raw API graph where applicable, revise the proposal
  through a constrained natural-language instruction, review the resulting
  version and diff, and explicitly play the approved proposal.
- Add episode manifests that expand a 2- to 3-minute concept into ordered short
  recipe runs, continuity references, character voice assignments, an original
  music cue, and deterministic FFmpeg assembly.
- Surface the proposed workflow and its readiness directly after prompt intake
  in the existing Studio UI, with one explicit Play workflow action and direct
  links to the resulting video and receipt.
- Add artifact-led History, Recipes, and Workflows pages. History derives from
  the existing brief and artifact stores and keeps the original prompt, frozen
  workflow, and playable video together; the two libraries expose reusable
  recipes and production archetypes without introducing another orchestration
  layer.
- Prove the complete loop with five creative, resource-guarded local sample
  prompts whose actual workflow proposals and generated videos remain visible
  in History.

## Capabilities

### New Capabilities

- `comfy-workflow-recipes`: Vetted, pinned, resource-guarded local Comfy
  workflows and their execution receipts.
- `local-episode-assembly`: Reproducible multi-shot episode manifests with
  character continuity, local voices, original music, and final assembly.

### Modified Capabilities

- `marketing-video-studio`: Expose ready local workflow recipes, tweakable
  inputs, automatic inspectable workflow proposals, constrained revisions,
  execution state, and playable artifacts in the existing Studio.

## Impact

- Affected code: model profiles, Studio recipe catalog/UI/API, video execution,
  the existing MLX Local Video Forge runner, a Comfy adapter, episode assembly,
  tests, and the local video runbook.
- Local-only external runtime: the pinned official ComfyUI checkout and model
  weights remain under ignored `.reel-pipeline/` storage and do not enter the
  Node production dependency graph.
- Storage and compute: preflight refuses a download or render that would cross
  85% disk use; execution is serial and interrupts at 90% system RAM.
- Security: only localhost Comfy requests and allowlisted built-in node types
  are permitted. No Comfy Manager, arbitrary custom-node installer, inbound
  network listener, deployment, or publication is added.
