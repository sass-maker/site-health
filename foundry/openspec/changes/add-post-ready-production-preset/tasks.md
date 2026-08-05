## 1. Production contract

- [x] 1.1 Add a normalized post-ready input and timed production-plan schema with focused validation tests for required narration, visuals, captions, music intent, transitions, duration coverage, and source provenance.
- [x] 1.2 Add stage and receipt schemas that keep technical completion, editorial approval, blockers, engine revisions, hashes, audio evidence, and review evidence distinct.
- [x] 1.3 Add explicit runtime-root resolution and readiness reporting for FFmpeg, Chromium, Kokoro, and optional local video generation.

## 2. Voice and music sources

- [x] 2.1 Add narration synthesis and approved-file intake that produce one timed narration master and record voice/source metadata, duration, levels, and hashes.
- [x] 2.2 Add a Fleet-owned arranged music-bed generator plus approved music-file intake with rights validation and deterministic provenance.
- [x] 2.3 Add focused tests proving absent voice readiness and absent music rights fail before a post-ready master is created.
- [x] 2.4 Expose a curated local voice catalog through Marketing and the production CLI, and preserve the selected voice through real execution.

## 3. Motion and final edit

- [x] 3.1 Map each planned scene onto the existing coherent-scene renderer and reject scenes without purposeful visual motion.
- [x] 3.2 Add selective approved video-source support with a designed animated-still fallback whose use is explicit in the receipt.
- [x] 3.3 Upgrade the final audio assembly to use speech-driven ducking, planned fades, speech processing, and integrated loudness normalization while preserving separate audio sidecars.
- [x] 3.4 Emit the final 1080×1920 H.264/AAC BT.709 MP4, burned and sidecar captions, normalized plan, engine revisions, hashes, and stage diagnostics in one run directory.

## 4. Review gate

- [x] 4.1 Add full-duration decode and media-probe checks for the final MP4, including expected streams, format, duration, dimensions, frame rate, and non-empty audio.
- [x] 4.2 Extract one frame per second, build a contact sheet, and write machine-readable review findings.
- [x] 4.3 Add an explicit editorial review input that keeps failed or unreviewed work `review-only` and marks a render `post-ready` only after approval with no critical issue.

## 5. Single-command reference production

- [x] 5.1 Add one package command that executes readiness, source preparation, visual render, audio master, media validation, and review packaging from an approved brief.
- [x] 5.2 Add one rights-safe 20–35 second reference brief and coherent source package that exercises multiple scenes, narration, music, transitions, animation, captions, and at least one time-varying visual source when its runtime is ready.
- [x] 5.3 Compare installed Kokoro voices on the reference script, select and record the best-performing voice, then generate the reference video.
- [ ] 5.4 Review the full video and one-frame-per-second contact sheet, revise any critical voice, music, motion, caption, pacing, or transition issue, and record the final editorial verdict.

## 6. Verification and handoff

- [x] 6.1 Run the focused post-ready tests, then the smallest relevant Reel Pipeline test command and strict OpenSpec validation.
- [x] 6.2 Document the exact local command, input contract, output locations, runtime-root options, review step, and known quality limits without claiming social publication occurred.
