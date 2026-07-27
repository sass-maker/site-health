## Why

Reel Pipeline already exposes many render techniques, but they are fragmented
across adapters and proofs. Combining them as a feature checklist produces
incoherent videos; the pipeline needs a story-first composition contract that
chooses a few appropriate techniques and gives each one a narrative job.

## What Changes

- Add a typed scene grammar for short product films with explicit setup,
  tension, analysis, verdict, proof, and close roles.
- Add a deterministic compositor that can combine real product capture,
  generated motion, typography, SVG/Canvas graphics, ASCII texture, voice,
  captions, music, and effects without exposing every capability in every
  video.
- Add visual-budget and continuity rules: one dominant subject per scene, one
  supporting layer, one principal transition, readable mobile typography, and
  an explicit reason for every chosen technique.
- Add reusable screen/device, evidence-path, focus-pull, mask-zoom, and
  match-cut primitives behind the existing manifest boundary.
- Add a CodeVetter `evidence-beam` proof film that tells one complete story:
  uncertain code enters, evidence is assembled, and a shipping verdict exits.
- Add versioned film skills that package a proven story grammar, visual rules,
  required assets, motion/caption/audio defaults, quality gates, and reference
  output so an AI prompt can reproduce a known standard instead of improvising
  the production method each time.
- Add a small operator console for prompt intake, film-skill selection, asset
  and rights inspection, job status, variant review, and explicit
  accept/retry/render decisions. It is not a nonlinear editor.
- Add a button-driven guided app-demo workflow that records an explicitly
  selected real app, window, or browser tab and can composite an optional
  same-session presenter at bottom right. Register `guided-app-demo@1` as the
  repeatable film style governing that composition.
- Preserve prompts, sources, licenses, timings, engine revisions, and output
  hashes in the normal review package.
- Keep experimental or restricted tools, including Wav2Lip and gated LTX
  LipDub weights, out of the production-safe default.

## Capabilities

### New Capabilities

- `coherent-scene-composition`: Narrative scene grammar, visual-budget
  validation, deterministic mixed-media composition, and reproducible review
  output for story-first product films.
- `film-skill-library`: Versioned, inspectable production recipes and a minimal
  operator workflow for choosing and applying them to AI-authored briefs.

### Modified Capabilities

- None.

## Impact

- Affected surfaces: Local Video Forge composition contracts, browser
  screen/camera capture, the Remotion proof runtime, local render scripts,
  manifests, review artifacts, the existing local studio/server UI, tests,
  and operator documentation.
- External inputs: approved product screenshots or recordings and optional
  locally generated LTX shots remain assets behind the existing manifest.
- Dependencies: no new production dependency is required; native SVG/Canvas,
  Remotion, Chrome, and FFmpeg remain the default deterministic toolchain.
- Deployment: the Worker changes require the normal later manual deployment;
  this change does not deploy. Rendering remains on the Mac and publishing
  remains outside this service.
