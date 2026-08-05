## Context

See `proposal.md` for motivation. Studio already has saved briefs, registered execution adapters, local artifact serving, production playback, a procedural Night Out soundtrack, platform-sound references, and a browser microphone implementation elsewhere in the package. The manual planner exists but is hidden, model selection can still resolve to a continuation owner instead of an executable adapter, and character descriptions are prompt fragments rather than reusable records.

The local host is Apple silicon with sufficient memory for the current visual model. No new audio, transcription, or video weights may be downloaded until its intended runtime is proven runnable, and local experiments must not weaken the existing distribution boundary.

## Goals / Non-Goals

**Goals:**

- Use one persisted workflow representation for talk, type, quick, and manual creation.
- Make every generation decision inspectable, rerunnable, and attributable to exact inputs and runtimes.
- Give cast and sound the same first-class status as scenes and visuals.
- Produce one reviewable mature fictional-adult video proof using the already runnable local visual lane before evaluating another video model.
- Preflight music and speech runtimes independently from heavyweight model installation.

**Non-Goals:**

- A general-purpose agent that can execute prompt-authored shell commands.
- Downloading, ripping, or embedding commercial recordings without a cleared local master.
- Automatic publishing, new provider credentials, or changes to Postiz ownership.
- Sexualized real-person likenesses or any ambiguous-age or non-consensual content.
- Installing ACE-Step, Whisper, Stable Audio, MiniMax, or another large model as part of this proposal.

## Decisions

### 1. Persist a registered stage graph, not an expanded prompt

Each workflow is a versioned record with `brief`, `cast`, `scenes`, `generation`, `edit`, `sound`, `export`, and `review` stages. A stage stores normalized inputs, dependency revisions, status, registered action identifier, selected runtime/model, outputs, evidence, and error. Prompts compile into this record but can never introduce executable action identifiers.

The executor checks a static registry, stage dependencies, current input hashes, and capability readiness immediately before each run. Changing an upstream revision marks only transitive dependents stale. Completed independent outputs remain usable.

This is preferable to a monolithic recipe prompt because it gives the operator manual control, supports retries, and makes quick mode a convenience rather than a separate execution path. A free-form agent loop was rejected because its behavior and side effects would be harder to make truthful and reproducible.

### 2. Treat voice as an input adapter

The browser captures audio only after an explicit Talk action and displays recording state. The server passes the captured file to a local transcription adapter with ordered providers: an already available WhisperKit CLI, then the repository-supported MLX Whisper path. The adapter returns transcript text, timing where available, model/runtime evidence, and the retained local source path. Typed text then enters the identical normalizer.

No remote transcription fallback is implicit. If no local runtime is ready, the captured audio can be retained for retry and the UI directs the operator to typed input. This keeps voice optional and avoids coupling workflow planning to one speech package.

### 3. Separate directory characters from workflow cast instances

Directory records are reusable project data. A workflow stores immutable references to character revision identifiers plus local overrides. The minimum record is:

```json
{
  "id": "character_...",
  "revision": 1,
  "name": "Rhea",
  "role": "host",
  "fictional": true,
  "age": 28,
  "adultConfirmed": true,
  "appearance": {},
  "wardrobe": [],
  "palette": [],
  "promptTokens": [],
  "negativeConstraints": [],
  "continuityNotes": "",
  "references": [{"path": "...", "sha256": "..."}],
  "sourcePosture": "original",
  "likenessEvidence": null
}
```

Compilers materialize the relevant character identity block in each scene request and record the revision and reference hashes. This does not itself solve temporal character consistency; it establishes the stable inputs needed for reference-image, seed, identity-adapter, or future video-model controls.

Named-IP private concepts are stored as a distinct source posture. They can remain available for local experimentation while distribution is blocked. A real-person posture is never eligible for the mature lane.

### 4. Make soundtrack sources separate adapters

The sound stage has four mutually exclusive source adapters:

1. `owned-local` accepts a supported local master, records its hash and operator-provided rights posture, and permits embedding.
2. `platform-sound` stores an official platform reference and timing plan, exports a silent upload master, and never downloads or embeds the commercial sound.
3. `generated` calls a registered local music runtime and retains variations plus generation evidence.
4. `procedural-draft` preserves the current deterministic bed only as a visibly non-final fallback.

After selection, all embeddable sources enter the existing compositor through one normalized mix specification: trim, offset, loop, fades, gain, and narration ducking. The export receipt includes the selected source hash, mix settings, and `ffprobe` evidence.

### 5. Canary ACE-Step before installing its weights

ACE-Step is the first music candidate because the official ACE-Step 1.5 repository provides an Apple-silicon MLX launcher and local HTTP API, permissive source licensing, short-duration control, and audio editing features useful for reels. Use the pinned official MLX route first; do not make a third-party C++ port the product dependency merely to avoid an isolated Python runtime.

The gate is deliberately split:

1. Preflight architecture, memory, disk, Python, source revision, and license without installing source or weights.
2. After the host preflight passes, install the pinned official runtime in the ignored engine directory and verify its HTTP server in forced-offline, no-model mode.
3. Show the operator the exact revision, MIT license, official 28-file model download (10.1 GB at the verified Hub revision), hashes, and local paths.
4. Download weights only after explicit confirmation.
5. Generate a 10–15 second instrumental canary, probe the output, listen-review it, and save a sanitized runtime receipt.
6. Register the adapter only if the canary passes; otherwise keep `generated` blocked and leave existing lanes usable.

Stable Audio 3 is retained as the next candidate because its publisher describes open weights trained on licensed data with commercially useful Community License terms. It is not selected now because an official local Apple-silicon execution path has not yet been proven in this repository. MusicGen is excluded from the product default because its official weights are non-commercial. YuE remains a later full-song option rather than the first short instrumental-bed runtime.

### 6. Make model selection exact and fail closed

The selected profile identifier is stored on the generation stage. Readiness requires the profile, installed artifact, compatible host probe, and registered adapter for that exact stage type. A missing adapter returns a pre-execution blocker and never resolves to Forge or substitutes another model.

This preserves the current useful distinction between planning and execution while preventing the misleading “Forge owns execution” outcome after the operator explicitly chose a local model.

### 7. Bound mature generation at workflow and cast levels

`contentScope: "mature-enabled"` triggers validation of every cast record and scene before prompt compilation. Eligible records are fictional, age 25 or older, affirmative-consent compatible, and not real-person likenesses. The compiler adds the recorded age and adult/consent constraints to relevant scene prompts and includes them in the manifest. It rejects ambiguous inputs instead of trying to repair them silently.

The first proof uses the already runnable WAI visual profile and the local carousel/compositor path. It must produce an actual playable artifact with exact model hash, cast revisions, prompt/negative prompt, source images, encode receipt, and local review state. This proves the product lane; it does not claim that every model will accept every eligible mature request.

### 8. Keep private and publish evidence as independent readiness calculations

Private execution checks creative inputs, content scope, runtime, and technical prerequisites. Distribution additionally checks model/output license, character/source/likeness rights, brand posture, creative acceptance, channel, and stable public media. Private outputs are served only through the existing known-artifact boundary and never make a network call automatically.

### 9. Add UI through the preserve design workflow

Create retains the existing primary navigation and adds a prominent Talk/Type composer followed by a visible workflow stage rail. Cast and soundtrack editors live inside their stages; advanced evidence stays progressive. Quick mode shows active auto-advance and a pause action. Manual mode uses the same controls without automation.

Implementation must start with a preserve-mode design classification, then capture before/after browser evidence at 390, 768, and 1440 pixels. Existing routes, labels, analytics identifiers, legal copy, and the improved single-player Productions view remain intact.

## Risks / Trade-offs

- [ACE-Step runtime builds but inference is too slow or unstable on this Mac] → Stop after the canary, retain its receipt, and keep owned/platform/procedural lanes available while evaluating Stable Audio.
- [No-weight runtime probes cannot prove model compatibility] → Treat the build only as permission to offer the model download, not as proof of usable generation; registration still requires an audio canary.
- [Generated music quality varies strongly by prompt and seed] → Generate small variation sets, expose musical controls, retain previews, and require explicit selection.
- [Character identity drifts between independently generated frames] → Record deterministic identity inputs now and evaluate reference/seed adapters separately; do not describe metadata consistency as visual consistency.
- [Voice transcription misinterprets creative or safety-critical details] → Require editable transcript review and revalidate the normalized cast/content scope before generation.
- [Mature-capable becomes confused with unrestricted] → Use the label `mature-enabled`, display the exact boundary, and keep rejection reasons explicit.
- [Large workflow UI becomes overwhelming on mobile] → Default to a compact stage summary and expand one stage at a time while keeping state and blockers visible.

## Migration Plan

1. Add workflow, character, soundtrack, and evidence schemas with version fields and fixture-backed validation.
2. Compile existing briefs and Night Out recipes into the new workflow graph while retaining existing brief and production identifiers.
3. Expose manual stages and typed quick creation before enabling microphone or generated music.
4. Add the voice adapter and character directory behind capability readiness.
5. Add owned/platform soundtrack adapters, then the ACE-Step preflight boundary; require a separate operator confirmation before weights.
6. Produce and review one bounded mature local artifact using the already runnable model lane.
7. Preserve legacy productions as read-only compatible records; rollback disables new stage execution without deleting artifacts or directory data.

## Open Questions

- The first ACE-Step canary uses the official MLX launcher and HTTP server. A native third-party port remains an optional later optimization only if measured results justify it.
- Character reference strategy can progress from prompt/revision consistency to model-specific reference conditioning after the directory ships.
