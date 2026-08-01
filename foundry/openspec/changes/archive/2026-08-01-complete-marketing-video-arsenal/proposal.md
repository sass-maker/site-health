## Why

Fleet Console already owns the Marketing product, but its video maker exposes
48 combinations backed by only 35 exact local examples and several
continuation-only outcomes. The complete arsenal must live in `/marketing`,
remain playable on a fresh clone, and use Reel Pipeline as an execution service
rather than exposing another product UI.

## What Changes

- Make Fleet Console `/marketing` the sole product UI for prompt-first video
  creation and `/marketing/explore-gallery` the complete visual catalog.
- Give every one of the 48 stable recipe/variant pairs an exact playable,
  truthfully attributed, rights-safe preview committed with reproducible source
  fixtures.
- Add one Reel Pipeline execution contract and adapter registry covering every
  catalog variant in explicit `fixture` and `real` modes.
- Collect contextual real-production inputs inside the Fleet Console maker and
  return playback, provenance, blockers, and owner evidence there.
- Let the operator select two or three gallery styles as a reusable mix, carry
  the ordered component IDs into the maker, and render a clearly labelled local
  mixed fixture without confusing it with an exact single-style preview.
- Preserve Brand Reel, Forge, Editorial, Blender, lyric, and other runtime
  manifests as the authoritative production evidence.
- Keep commercial audio/lyrics, private captures, provider assets, credentials,
  publishing, and deployment outside the repository and this change.
- Track completion in Fleet issue #115.

## Capabilities

### New Capabilities

- `marketing-video-maker`: Prompt-first Fleet Console creation flow covering
  every stable recipe and variant without sending the operator to another UI.
- `marketing-video-execution`: Repository-owned execution contract, adapters,
  source validation, fixture mode, real-mode blockers, and normalized receipts.
- `video-demo-gallery`: Portable exact variant coverage, reproducible previews,
  media validation, provenance, maker presets, and ordered style mixes.

### Modified Capabilities

- `marketing-control-plane`: Fleet Console is the product boundary for video
  creation and gallery exploration while Reel Pipeline remains the execution
  service and specialized runtimes retain evidence ownership.

## Impact

- Changes Fleet Console Marketing Astro components and Reel Pipeline catalog,
  APIs, execution routing, fixture and mix generation, gallery registry, media
  serving, tests, and project truth.
- Reuses existing FFmpeg, browser, Blender, Forge, Brand Reel, Editorial, lyric,
  and local-model boundaries without a new production dependency.
- Adds a compact tracked preview pack and deterministic regeneration/validation
  scripts.
- Does not deploy, publish, access credentials, or add copyrighted commercial
  source media.
