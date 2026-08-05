## Context

See `proposal.md` for motivation and the capability specs for observable behavior. Reel Pipeline already has the pieces of a strong local path: Kokoro synthesis, a timed coherent-scene manifest, browser/canvas frame rendering, captions, FFmpeg H.264/AAC output, sound-bed ducking, loudness normalization, hashes, and per-scene review frames. They are not yet composed behind one production command or one review receipt.

On this host, FFmpeg and Playwright Chromium are ready in the isolated worktree. Kokoro and the LTX 2 MLX runtime are ready in the primary checkout's ignored runtime directories, while the isolated worktree does not contain those large local files. The command therefore needs explicit runtime-root options instead of assuming models live inside the current checkout.

## Goals / Non-Goals

**Goals:**

- Make one 20–35 second, 1080×1920, 30 fps production preset the reliable path.
- Make a single timed plan authoritative across narration, captions, visuals, transitions, music, and effects.
- Prefer existing local engines and media utilities, adding only the orchestration and quality evidence that are missing.
- Make technical completion and human editorial approval visibly different states.
- Produce a real reference reel and inspect the entire result, not only its cover frame.

**Non-Goals:**

- Selecting among every gallery variant or exposing the preset in Fleet Console.
- Social scheduling, upload, or publication.
- Requiring LTX, Blender, or another expensive generator for every scene.
- Treating a fixture, silent video, single animated card, test tone, or unreviewed render as post-ready.
- Adding a hosted service, dependency, or job system.

## Decisions

### 1. Add an orchestration layer over the coherent-film renderer

A new versioned post-ready input normalizes an approved brief into the existing coherent-scene timeline, then runs four explicit stages: source preparation, visual render, audio master, and review. The orchestration command owns stage state and the final receipt; the coherent renderer remains responsible for deterministic frames and encoding.

This reuses a proven timeline and avoids creating another renderer. Extending the broad gallery execution path was rejected because its job is variant coverage, not editorial quality.

### 2. Resolve heavyweight local runtimes explicitly

The command accepts optional Kokoro and video-model runtime roots. Defaults remain repository-local, but a worktree can safely point at ignored model/runtime directories in another checkout. Readiness is evaluated before generation and the resolved engine revisions are written to the receipt.

Copying large models into each worktree was rejected because it wastes disk and makes readiness drift. Silent fallback voice and relabelled fixture media are forbidden.

### 3. Treat voiceover as authored audio, not a scene side effect

The preset synthesizes narration scene-by-scene with Kokoro or accepts one approved narration file. It then assembles a single narration master with intentional pauses and applies a conservative speech chain before mixing: high-pass filtering, light compression, peak limiting, and measurement. Voice identity, speed, timings, source hashes, and measurements are recorded.

The first reference render will compare the installed English voices on the actual script and select one by listening; the default constant alone is not evidence of quality. macOS `say` and fake audio are not post-ready fallbacks.

### 4. Support approved music and one credible original fallback

An operator-supplied track is preferred when its provenance is explicit. For a zero-input local run, a Fleet-owned procedural music recipe creates a short arranged bed with chords, bass, pulse/percussion, tonal variation, and an ending rather than a single oscillator tone. The recipe and its parameters are recorded as provenance.

The final mixer uses speech-driven sidechain compression, planned intro/outro fades, and integrated loudness normalization. Static volume reduction for the entire narration interval was rejected because it makes the music feel pasted underneath the reel.

### 5. Enforce one dominant visual idea and real motion per scene

Each scene has one dominant asset, one narrative role, one principal action, one camera move, and at most one supporting layer unless an exception is approved. Still sources receive a composed move such as push, pull, mask reveal, depth/parallax, or evidence-path animation. Approved video sources are trimmed and reframed around their principal action. Generated atmosphere may support a claim but cannot serve as product evidence.

The reference reel will combine coherent image assets, typography/data motion, and at least one genuinely time-varying visual source when the local video runtime passes readiness. A video-model failure degrades to a deliberately animated still scene and is recorded as such; it never becomes a placeholder card.

### 6. Use one final FFmpeg master with measurable output

The final stage combines the frame-rendered picture, narration, music, effects, and burned captions into H.264/AAC with BT.709 tags and fast-start metadata. It emits separate narration, music, final-mix, and SRT sidecars so a weak edit can be revised without regenerating every source.

The existing coherent renderer's audio assembly will be extracted or extended instead of shelling through multiple opaque intermediate commands. The receipt records each filter plan, duration, codec, dimensions, frame rate, loudness result, and output hash.

### 7. Make a one-frame-per-second contact sheet part of the gate

After encoding, the reviewer stage runs a full decode, probes both streams, extracts one evenly timed frame per second, and creates a contact sheet plus JSON findings. Automated checks can establish technical validity, continuity coverage, non-empty audio, safe caption regions, and expected duration. They cannot establish taste.

The receipt has separate `technicalStatus` and `editorialStatus` fields. Only an explicit `approved` editorial review with no critical issue yields `post-ready`; otherwise the result remains `review-only` with actionable notes.

## Risks / Trade-offs

- **Local voice can sound synthetic on the wrong copy or cadence** → compare installed voices on the final script, tune punctuation/speed, and keep voice approval in the human gate.
- **Procedural music can still feel generic** → make it an arranged fallback, preserve a clean approved-track input, and reject the sample if the bed distracts or sounds like a test tone.
- **Video-model generation can be slow or inconsistent** → use it selectively for one or two atmosphere shots, cache sources by hash, and retain a designed animated-still fallback.
- **One-frame-per-second review can miss short glitches** → pair it with a full decode and require a normal-speed human playback before approval.
- **Worktree-local readiness can disagree with host readiness** → accept explicit runtime roots and record resolved paths without copying or committing heavyweight files.
- **The new preset could become a second general-purpose engine** → keep the schema narrow and delegate frame rendering, synthesis, and encoding to existing modules.

## Migration Plan

1. Add the post-ready schema, readiness checks, and receipt tests without changing existing commands.
2. Add voice assembly, original-bed generation, improved mix, and review utilities with focused tests.
3. Add the single production command and one rights-safe reference brief.
4. Render and review the reference reel; revise until the receipt can honestly be marked post-ready.
5. Keep the preset opt-in. Rollback removes the new command and modules; no data or production migration is involved.
