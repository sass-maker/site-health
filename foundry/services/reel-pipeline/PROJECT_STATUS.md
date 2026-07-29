# Reel Pipeline — Project Status

Last updated: 2026-07-27

## Why / What

Reel Pipeline is Fleet's media-generation service. It accepts approved,
source-backed briefs, renders reviewable media, records artifact provenance,
and creates draft handoffs for Postiz.

It deliberately does not own social credentials, schedules, publishing state,
or provider analytics. Postiz owns that downstream lifecycle.

## Dependencies

### External

- Cloudflare Worker and R2 for production artifact intake/storage.
- Postiz for draft review, scheduling, publishing, integrations, and metrics.
- FFmpeg/Chromium and optional local render engines on generation hosts.
- Optional MoneyPrinterTurbo, Kokoro, Grok/Imagine local assets, and Remotion
  adapters.

### Fleet

- Source projects provide approved content packages or VideoBrief inputs.
- High Signal and Significant Content provide source-backed creative inputs.
- Content Factory defines approved brief, artifact manifest, and media receipt
  contracts.

## Timeline

- **2026-07-27:** added the coherent scene compositor, the immutable
  `evidence-beam@1` film skill, and a reproducible CodeVetter reference film
  with real product evidence, local LTX atmosphere, Kokoro narration,
  phrase-timed captions, review metadata, and a reduced-motion encode. Added
  the authenticated `/forge` operator console for prompt intake, exact skill
  choice, asset rights, queue status, variant decisions, and fail-closed final
  approval.
- **2026-07-27:** added `guided-app-demo@1` and the `/forge` app-recording
  workflow: real window/tab/screen capture, optional same-session camera and
  microphone presenter at bottom right, local preview-before-upload, immutable
  source-hash provenance, and Mac FFmpeg preview/final encoding.
- **2026-07-26:** added the Local Video Forge first vertical slice: pinned
  Apple Silicon LTX-2.3 generation, an approved-keyframe three-variant command,
  reproducibility metadata/review gallery, and an authenticated Worker/R2 queue
  that accepts tasks from either machine and is pulled by the generation Mac.
- **2026-07-26:** added a reproducible Local Video Forge mixed-media proof
  preset with local Kokoro narration, audio-derived subtitle timing, burned and
  external captions, ASCII/Canvas graphics, real variant proof frames, and a
  no-false-lip-sync composition rule.
- **2026-07-21:** removed the SaaS Maker queue, direct YouTube/Instagram
  publishers, OAuth helpers, posting/metrics loops, and duplicate marketing
  control services. Added the Postiz draft adapter and direct render-fixture
  readiness path.
- **2026-07:** completed source-backed content package, render manifest,
  Significant Content, studio, and local render-mode work.
- **Earlier:** established the Worker/R2 render path, Rust watcher, VideoBrief
  adapters, anonymous brand-reel, and review surfaces.

## Products

- Anonymous brand-reel generator.
- Internal content studio and faceless/lesson workflows.
- Worker/R2 production reel renderer.
- Content-package renderer and Postiz draft handoff.

## Features (shipped)

- VideoBrief validation and provider-neutral render adapters.
- Content Factory manifests with hashes and provenance.
- Local render modes: mock, HTML composition, ASCII, Grok local asset,
  reel-maker adapter smoke, Kokoro, and brand video.
- Worker/R2 render flow with Rust watch/render orchestration.
- Significant Content and High Signal intake contracts.
- Postiz integration mapping, media upload, and draft creation adapter.
- Fail-closed rejection of native social-provider distribution.
- Node and Rust regression suites plus focused Postiz and render-mode smokes.
- Local Video Forge JSON manifests, approval/memory gates, resumable
  three-seed generation, local review gallery, and cross-machine Worker/R2 task
  contract.
- Local Video Forge `forge:demo` mixed-media preset with timestamped MP4/WAV/SRT
  output, timeline and hash manifest, proof slides, and design evidence.
- Approved coherent-film manifests with deterministic scene primitives,
  caption/audio bindings, collision-free render packages, input/output hashes,
  engine revisions, review frames, BT.709 delivery, and reduced-motion output.
- Versioned film-skill contracts that pin narrative order, allowed primitives,
  asset requirements, render defaults, and quality gates; `evidence-beam@1` is
  the first registered skill.
- Authenticated hosted `/forge` console backed by the shared R2 queue, so human
  or AI-created tasks from either machine use the same skill, asset, review,
  and final-render state.
- Guided app-demo capture with a button-driven permission/record/preview/
  approve workflow, genuine same-session presenter synchronization, a
  versioned Film style, and deterministic 720×1280 preview / 1080×1920 final
  encoding on the Mac.

## Work queue

Open work is tracked only in [GitHub Issues](https://github.com/sass-maker/fleet-workspace/issues?q=is%3Aissue+is%3Aopen+label%3A%22product%3Areel-pipeline%22).
An open issue is a to-do, a linked pull request is in progress, and merge plus
issue closure makes the work done.
