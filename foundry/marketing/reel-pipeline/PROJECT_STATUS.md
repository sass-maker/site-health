# Reel Pipeline — Project Status

Last updated: 2026-07-31

## Why / What

Reel Pipeline is Fleet's media-generation and source-editorial service. It
accepts approved, source-backed briefs or podcast edit decisions, renders
reviewable media, records artifact provenance, and creates evidence-gated draft
or future-schedule handoffs for Postiz.

It deliberately does not own social credentials, durable calendar execution,
rescheduling, cancellation, publishing state, or provider analytics. Postiz
owns that downstream lifecycle.

## Dependencies

### External

- Cloudflare Worker and R2 for production artifact intake/storage.
- Postiz for draft review, scheduling, publishing, integrations, and metrics.
- FFmpeg/Chromium and optional local render engines, including Blender 5.2, on
  generation hosts.
- Optional MoneyPrinterTurbo, Kokoro, Grok/Imagine local assets, and Remotion
  adapters.
- Python 3.11+, uv, FFmpeg, and optional local transcription engines for the
  nested podcast editorial runtime.

### Fleet

- Source projects provide approved content packages or VideoBrief inputs.
- High Signal and Significant Content provide source-backed creative inputs.
- Content Factory defines approved brief, artifact manifest, and media receipt
  contracts.

## Timeline

- **2026-07-31:** added rights-gated literal lyric videos to Marketing Studio
  with exact timed-text preservation, separate composition and recording
  evidence, deterministic cue-to-scene planning, optional safe Blender 5.2
  plates, local composition, review receipts, and a reproducible public-domain
  “Twinkle, Twinkle, Little Star” canary using a new local recording.
- **2026-07-31:** unified the internal Marketing Studio around a persistent,
  conversational video brief covering faceless lessons, brand reels, guided
  app demos, coherent films, and podcast shorts. Added explicit runtime
  routing, deduplicated production review/playback, fail-closed distribution
  evidence, and Postiz draft or exact future-schedule handoffs for YouTube
  Shorts and Instagram Reels. Postiz remains the owner of credentials, durable
  calendar execution, publication state, rescheduling, cancellation, and
  analytics.
- **2026-07-29:** consolidated Mashup's Python planner, SQLite-backed stage
  state, provenance-gated archive tooling, tests, and operator editor under
  `editorial/`. Added the strict `fleet.podcast-edit.v1` handoff, an
  approval-gated render adapter, source-hash verification, and a render
  receipt. Proved the boundary with a real 46-second ZEROPOD short while
  preserving the original EDL, source audio, source heading, source timing,
  watermark, and sidecar captions.
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
- Internal Marketing Studio and faceless/lesson workflows.
- Worker/R2 production reel renderer.
- Content-package renderer and Postiz draft or future-schedule handoff.
- Source-backed podcast planning, approval, and multi-clip rendering.
- Rights-gated literal lyric-video production with optional Blender scenes.

## Features (shipped)

- VideoBrief validation and provider-neutral render adapters.
- Content Factory manifests with hashes and provenance.
- Local render modes: mock, HTML composition, ASCII, Grok local asset,
  reel-maker adapter smoke, Kokoro, and brand video.
- Worker/R2 render flow with Rust watch/render orchestration.
- Significant Content and High Signal intake contracts.
- Postiz integration mapping, media upload, and draft or exact future-schedule
  adapter for YouTube Shorts and Instagram Reels.
- Conversational `fleet.marketing-studio-brief.v1` intake with revisioned local
  persistence, multi-turn natural-language refinement, normalized
  brand/channel/creative state, explicit source-URL capture without inferred
  approval, and honest readiness across six video workflows.
- Exact LRC, SRT, or structured lyric-cue normalization; separate
  composition/lyric and master-recording rights gates; one-to-one literal scene
  planning; deterministic native or Blender-backed plates; synchronized
  captions, attribution, approved audio, hashes, and quality evidence.
- Safe Blender 5.2 adapter execution through a repository-owned scene builder,
  bounded manifests, factory startup, disabled auto-execution, run-directory
  path controls, versioned provenance, and artifact hashes.
- Unified Create, Productions, Distribute, and Tools operator views with
  explicit execution, local artifact playback, quality state, specialized
  runtime continuations, safe public-field prefill for Brand Reel and Forge,
  deduplicated brief-owned artifacts, and the complete legacy Content Studio
  toolset.
- Fail-closed Studio-to-Postiz preparation requiring source, claim,
  destination, rights, creative approval, quality evidence, render evidence,
  and a stable public media URL; draft and scheduled submissions preserve the
  exact UTC timestamp, reject invalid or past times, reject immediate
  publication, and prevent duplicate Postiz submissions.
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
- Nested podcast editorial runtime with resumable transcription, enrichment,
  and embedding state, independently surfaced scoring terms, and an
  operational editor.
- Strict `fleet.podcast-edit.v1` normalization, source-rights and source-hash
  checks, approval gating, exact EDL preservation, multi-source rendering, and
  deterministic render receipts.
- Hard rejection of repeated editorial member IDs and overlapping source-audio
  intervals, with snapped boundary handles de-overlapped before export.
- Separate duration modes: a bounded 30–60 second short selector and the
  standard multi-clip planner/render contract for targets above 60 seconds.

## Work queue

Open work is tracked only in [GitHub Issues](https://github.com/sass-maker/fleet-workspace/issues?q=is%3Aissue+is%3Aopen+label%3A%22product%3Areel-pipeline%22).
An open issue is a to-do, a linked pull request is in progress, and merge plus
issue closure makes the work done.
