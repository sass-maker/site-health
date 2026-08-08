# Reel Pipeline — Project Status

Last updated: 2026-08-09

## Why / What

Reel Pipeline is a standalone, local-first video-creation product whose source
is maintained inside the Fleet monorepo. Its primary product loop turns a
plain-language request into an inspectable workflow, explicit generation,
browser-playable result, reusable history entry, and optional evidence-gated
Postiz handoff. It also accepts approved source-backed briefs and podcast edit
decisions, renders reviewable media, and records artifact provenance.

It deliberately does not own social credentials, durable calendar execution,
rescheduling, cancellation, publishing state, or provider analytics. Postiz
owns that downstream lifecycle.

## Dependencies

### External

- Cloudflare Worker and R2 for production artifact intake/storage.
- Postiz for draft review, scheduling, publishing, integrations, and metrics.
- FFmpeg/Chromium and optional local render engines, including Blender 5.2, on
  generation hosts.
- Optional Kokoro, Grok/Imagine local assets, and Blender adapters.
- Python 3.11+, uv, FFmpeg, and optional local transcription engines for the
  nested podcast editorial runtime.

### Fleet

- Source projects provide approved content packages or VideoBrief inputs.
- High Signal and Significant Content provide source-backed creative inputs.
- Content Factory defines approved brief, artifact manifest, and media receipt
  contracts.

## Timeline

- **2026-08-09:** completed the safely shippable voice-first Studio workflow:
  Talk and Type now compile to the same persisted eight-stage graph with
  manual/quick execution, pause, retry, checkpoints, and downstream
  invalidation. Added searchable reusable cast controls, explicit soundtrack
  source and mix controls, mature/private readiness boundaries, and responsive
  browser evidence. The generated-music adapter remains intentionally blocked
  pending human listening review of its local ACE-Step canary.
- **2026-08-09:** finalized the product boundary between Video Maker and
  Mashup. Fleet Console Marketing and `/studio` expose the prompt-first Video
  Maker; the incorporated podcast editor remains an operator CLI with no
  Mashup navigation, page, or browser API.
- **2026-08-09:** shipped policy-bounded Studio autopilot lanes for High Signal
  daily briefs, Significant Hobbies weekly posts, and major maintained-project
  changelogs. Runs reuse source revisions and prior receipts, stop on explicit
  spend, rights, runtime, or distribution blockers, and can prepare Postiz
  drafts or exact future schedules only when the standing policy covers them.
- **2026-08-06:** established Reel Pipeline as a standalone product boundary,
  with `/studio` as its product surface rather than a diagnostics-only view.
  Tightened playback truth so History and Productions advertise an MP4 only
  after media probing confirms a decodable video stream; missing and legacy
  mock artifacts remain inspectable without a broken player.
- **2026-08-06:** made Marketing Studio's production archive generic and
  data-driven, keeping every saved prompt, executed workflow, receipt, and
  playable artifact together. Added registry-backed Recipes and Workflows
  libraries plus reproducible guarded sample workflows, including a five-shot
  30-second LTX story canary with original Kokoro voice and ACE-Step music.
- **2026-08-01:** completed the Fleet Console Marketing video arsenal boundary:
  all 49 stable variants now have compact rights-safe vertical MP4 fixtures,
  exact prompt presets, byte-range playback, fixture/real execution envelopes,
  registered owner adapters, and fail-closed completeness checks. Added ordered
  two-to-three-style gallery mixes with deterministic local FFmpeg composition
  and component provenance; Fleet Console `/marketing` remains the only
  product maker UI.
- **2026-08-01:** removed the unused MoneyPrinterTurbo and reel-maker engine
  submodules, their checkout-backed Node/Rust adapters, false readiness gates,
  and the blocked stock-service recipe. Product Proof remains an explicit
  Brand Reel handoff; local video creation remains repository-owned.
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

- Standalone local-first Video Maker (`/studio`) with Create, History, Recipes,
  and Workflows.
- Anonymous brand-reel generator and faceless/lesson workflows.
- Worker/R2 production reel renderer.
- Content-package renderer and Postiz draft or future-schedule handoff.
- Source-backed podcast planning, approval, and multi-clip rendering.
- Rights-gated literal lyric-video production with optional Blender scenes.
- Fleet Console Marketing execution API with exact gallery previews and
  deterministic ordered style mixes.

## Features (shipped)

- A focused prompt-first Video Maker browser surface with recipe-derived format
  selection and truthful continuations; Mashup remains CLI-only under the
  incorporated editorial runtime.
- Voice-first and typed brief intake feeding one persisted eight-stage
  workflow with manual or quick progression, readiness rechecks, pause/retry,
  reusable checkpoints, and transitive invalidation after upstream edits.
- Searchable reusable characters and workflow-specific cast overrides with
  source, likeness, mature-readiness, wardrobe, expression, and continuity
  evidence.
- Explicit procedural-draft, owned-local, platform-reference, and generated
  soundtrack lanes with retained mix transforms and fail-closed runtime,
  variation-selection, commercial-audio, and rights blockers.
- Versioned secret-free automation policies, source-revision idempotency,
  bounded retries, dry-run and execute commands, lane-aware Studio status, and
  Project Autopilot / Ask Me / Personal Automations production grouping.
- VideoBrief validation and provider-neutral render adapters.
- Content Factory manifests with hashes and provenance.
- Local render modes: mock, HTML composition, ASCII, Blender, Grok local asset,
  Kokoro, and brand video.
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
  path controls, versioned provenance, artifact hashes, and eight distinct
  local 3D scene languages.
- A secret-free, byte-range-capable Explore Gallery registry with 49 exact,
  portable, hash-validated rights-safe MP4 previews; style-family filtering;
  exact preset handoff; and ordered two-to-three-style mixes rendered locally
  with component provenance.
- Versioned fixture/real video execution envelopes, complete adapter and input
  registries for all 12 recipes and 48 variants, normalized local and owner
  receipts, contextual blockers, and catalog/gallery/preset completeness that
  fails closed on missing, duplicate, null, unknown, or stale identifiers.
- Unified Create, History, Recipes, Workflows, Distribute, and Tools operator
  views with explicit execution, prompt-to-artifact traceability, registry-backed
  reusable starting points, exact executed composite-workflow evidence,
  specialized runtime continuations, safe public-field prefill for Brand Reel
  and Forge, deduplicated brief-owned artifacts, and the complete legacy Content
  Studio toolset.
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
