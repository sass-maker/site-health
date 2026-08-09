## Why

Mashup's podcast/archive intelligence is a distinct product workflow, but it is currently nested inside Reel Pipeline and invoked through Reel-owned paths, scripts, and adapters. At the same time, Local AI Video Studio needs clearer capability discovery and direct controls without inheriting that coupling or depending on another product's source tree.

## What Changes

- **BREAKING**: extract Mashup's Python planner, persistence, editorial contracts, and multi-clip renderer from `foundry/marketing/reel-pipeline/editorial/` into an independently runnable helper under `foundry/helpers/mashup/`.
- **BREAKING**: remove Reel Pipeline's direct Python imports, relative subprocess calls, package scripts, and execution-registry entries that depend on the nested Mashup runtime.
- Preserve podcast/archive planning, resumable analysis, approval, provenance, and rendering inside Mashup with its own project metadata, checks, and operator entrypoints.
- Define an optional, versioned handoff in which Mashup emits a finished media artifact plus a receipt; Reel Pipeline may consume that artifact as ordinary source media but cannot invoke or inspect Mashup internals.
- Add a native Local AI Video Studio capability catalog describing supported effects, parameters, readiness, preview/render cost, constraints, and fallback behavior.
- Add direct effect controls to Local AI Video Studio so creators can add, remove, and tune supported effects without writing a prompt. Prompt planning and direct controls mutate the same validated `EffectGraph` representation.
- Preserve the studio's existing optical-printer visual language and local-first runtime. Do not add ComfyUI, a shared database, cross-product model storage, or a runtime dependency on Reel Pipeline or Mashup.
- Do not render test videos during implementation; validate graph behavior, UI state, builds, and unit tests first, then perform media validation with the owner at the end.

## Capabilities

### New Capabilities

- `local-video-effect-control`: Defines the native effect catalog and the prompt/direct-control parity contract for Local AI Video Studio.
- `mashup-media-handoff`: Defines Mashup's independent media-and-receipt output boundary and optional downstream consumption.

### Modified Capabilities

- `podcast-editorial-pipeline`: Changes the canonical editorial runtime owner from a nested Reel Pipeline runtime to the independent Mashup helper while retaining resumability, planning, validation, and rendering behavior.
- `marketing-video-execution`: Removes direct Mashup execution from Reel Pipeline and limits integration to validated finished media artifacts and receipts.
- `foundry-product-buckets`: Classifies Mashup as a focused helper product rather than an implementation detail owned by Marketing.

## Impact

- Affected products: `foundry/marketing/reel-pipeline`, new `foundry/helpers/mashup`, and `local-ai-video-studio`.
- Affected contracts: `fleet.podcast-edit.v1`, Reel Pipeline execution registry and recipes, a new Mashup artifact receipt, and Local AI Video Studio's `EffectGraph` editing surface.
- Existing Mashup CLI data and resumable state require an explicit path compatibility or migration strategy; no destructive movement of user data is permitted.
- Reel Pipeline and Mashup must each build and run without the other's source directory. Local AI Video Studio must build and run without either product.
- No new production dependency is proposed. Existing runtimes move behind clearer ownership boundaries.
