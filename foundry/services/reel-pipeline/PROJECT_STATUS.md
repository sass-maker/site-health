# Reel Pipeline — Project Status

Last updated: 2026-07-26

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

## Todo / Planned / Deferred / Blocked

### Todo — production cutover

- Complete one manual LTX Desktop first-run generation.
- Deploy the tested `/forge/*` Worker routes through the normal manual process,
  then submit one task from each machine and complete a Mac-worker canary.
- Install Postiz on the designated Fleet machine.
- Connect social accounts in Postiz.
- Provide `POSTIZ_API_KEY` outside git and create the real integration mapping.
- Run one draft-only canary and verify the draft before any schedule is set.
- Complete existing Worker/R2 target-host canaries.

### Planned

- Read provider performance back through Postiz after the first real posts.
- Improve creative quality based on reviewed output and measured performance.

### Deferred

- Optional render engines that do not improve the current marketing loop.
- Additional creator automation before manual output quality is proven.

### Blocked

- Production Postiz verification is blocked on target-machine installation,
  account connections, and external credentials. The local adapter and
  contract tests are complete.
