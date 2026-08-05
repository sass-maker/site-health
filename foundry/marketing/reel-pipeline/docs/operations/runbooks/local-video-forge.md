# Local Video Forge

Local Video Forge turns an explicitly approved source into a reviewable video:
either three seed-controlled LTX-2.3 variants from a keyframe or one
deterministic MP4 from a real app capture. Generation and final encoding run on
an Apple Silicon Mac; the existing authenticated Cloudflare Worker and R2
bucket coordinate tasks created from either the Mac or the permanently hosted
machine.

## Topology

```text
Mac CLI ───────────────┐
                      ├─ POST task + keyframe ─> Worker/R2 queue
Hosted console / CLI ─┘                              │
                                                    │ pull + lease
Apple Silicon Mac worker <──────────────────────────┘
        │
        └─ generate variants or encode capture ─> upload MP4s + metadata
```

The Mac makes outbound requests only. It does not need a public IP, open port,
SSH tunnel, or permanent process on the hosted machine.

## Phase 0

Install and launch LTX Desktop once for manual model validation. The automated
path is pinned separately and uses `ltx-2-mlx` with the LTX-2.3 int4 model.

Prerequisites:

- Apple Silicon macOS;
- `git`, `uv`, and `ffmpeg`;
- at least 200 GB reserved for model caches and outputs;
- 12–16 GB of usable memory headroom before generation.

Install the pinned runtime and selected model files:

```bash
bash scripts/setup-local-video-forge.sh --check
npm run forge:setup
npm run forge:readiness
```

Run the read-only preflight first. It confirms Apple Silicon, required host
commands, pinned upstream availability, and projected storage without creating
runtime or model files. Setup refuses projected disk use at or above 85
percent and refuses an unexpected runtime checkout instead of replacing it.
The full LTX 2.3 final lane, including its runtime, prompt model, and download
safety margin, reserves 45 GiB. Model and engine payloads live under ignored `.reel-pipeline/`
paths.

## Studio workflow recipes

Marketing Studio's **Coherent local film** flow wraps the existing runtimes in
small versioned recipes. It does not add another workflow framework or expose
the Comfy graph editor.

- **LTX 2.3 final** uses the pinned MLX Local Video Forge runner for accepted
  final and hero shots. It remains blocked until all pinned runtime and model
  paths are present and their exact hashes match.
- **LTX 2B preview** uses official ComfyUI core nodes for fast image-to-video
  planning. Its real local canary passed the resource limits, but operator
  review classified the output as preview-only.
- **MiniMax H3 specialist** remains visible but blocked on this Mac. Native MPS
  execution needs `aten::_int_mm`; CPU fallback completed no sampling step in
  178 seconds and is not a practical local factory path.

The UI exposes only prompt, reference image, bounded size/duration/motion,
seed, and quality lane. Unknown nodes and arbitrary uploaded graphs fail
closed; Comfy Manager and custom-node installers are never invoked. Every
execution is serial, refuses projected disk use at 85 percent, interrupts at
90 percent RAM, and returns an MP4 plus graph, model, timing, memory, and hash
evidence.

Episode mode turns one concept into an editable 20- to 60-shot manifest. It
resolves reusable cast through the character directory, generates one shot at
a time, reuses accepted shots by content signature, and requires every final
shot to be accepted before deterministic FFmpeg assembly. Kokoro supplies
fixed character voices. Final assembly accepts only owned/licensed local music
with evidence or a selected generated cue with runtime/seed evidence;
procedural drafts and platform playback cannot silently become final audio.

Generated receipts and videos stay under `tmp/studio/` or ignored
`.reel-pipeline/` directories. Cleanup is an explicit operator action; setup
and generation never delete earlier experiments automatically.

## Direct mode

The example manifest uses the approved synthetic presenter keyframe and three
fixed seeds:

```bash
npm run forge:variants -- \
  --project examples/local-video-forge/project.json \
  --shot s01 \
  --output .reel-pipeline/first-deliverable
```

Each shot output contains:

```text
<output>/s01/
├── run.json
├── review.html
├── s01-seed-41.mp4
├── s01-seed-42.mp4
└── s01-seed-43.mp4
```

`run.json` preserves prompts, negative prompt, seeds, dimensions, frame count,
model revisions, command arguments, hashes, file sizes, timing, and host
metadata. Completed variants are skipped on rerun and never overwritten.
`review.html` plays all three local variants side by side.

The manifest must set `keyframeApproved: true`. The command fails before
generation if the approval is absent, the keyframe is missing, memory pressure
is critical, usable headroom is too low, or disk headroom is insufficient.

## Shared coordinator mode

The `/forge/*` endpoints use the existing Worker authentication and
`REEL_ARTIFACTS` R2 binding. A Worker deployment is an explicit operator action;
local implementation and tests do not deploy it.

On each machine, provide the same coordinator URL and internal token through
the machine's existing secret-management mechanism. Do not save the token in
the project manifest.

Create a task from either machine with the same command:

```bash
npm run forge:enqueue -- \
  --project examples/local-video-forge/project.json \
  --shot s01 \
  --coordinator https://<worker-host>
```

Inspect the shared queue from either place:

```bash
npm run forge:tasks -- --coordinator https://<worker-host>
npm run forge:tasks -- --coordinator https://<worker-host> --status queued
```

Run one worker tick on the generation Mac:

```bash
npm run forge:work -- --coordinator https://<worker-host> --once
```

Run the unattended polling worker:

```bash
caffeinate -dimsu npm run forge:work -- \
  --coordinator https://<worker-host> \
  --poll-seconds 30
```

The R2 job record is the durable queue state. A compatible Mac claims a
conditional lease, downloads the approved keyframe or capture, renders one
variant at a time, reports progress, uploads MP4s, and completes the job. A failed job is
released to the queue once; the second failure becomes terminal. Expired
leases can be reclaimed after a crashed worker.

## Hosted operator console

Open `https://<worker-host>/forge` and authenticate with the same internal
Worker credential used by the coordinator CLI. The exact `/forge` route and
every nested `/forge/*` API fail closed when `REEL_INTERNAL_TOKEN` is missing
or invalid.

The console is the shared production control surface for both machines. The UI
calls each repeatable recipe a **Film style**; the durable job record stores
the exact version under `filmSkill`.

1. Paste the film prompt and product context.
2. Choose an exact Film style such as `evidence-beam@1`.
3. Upload an explicitly approved keyframe and record its source revision,
   license, and publication-rights approval.
4. Choose exactly three distinct preview seeds and queue the task.
5. Monitor the durable R2 job state while the Apple Silicon Mac renders.
6. Play completed variants side by side and record `accepted`, `retry`,
   `change-motion`, `change-keyframe`, or `cloud-candidate`.
7. Queue final-render approval only after one completed variant is explicitly
   accepted.

For a real app walkthrough, choose `guided-app-demo@1` instead:

1. Click **Record app** and use Chrome's chooser to select an application
   window, browser tab, or screen.
2. Leave the presenter option enabled to capture camera and microphone in the
   same session. The browser composites that presenter at bottom right before
   recording, so the mouth and voice do not come from unrelated tracks.
3. Stop within 90 seconds, preview the WebM locally, then click **Use this
   take**. Discarding the take uploads nothing.
4. Record the source revision, license, and production-rights approval, then
   queue the captured preview. The browser streams the approved Blob directly
   to R2 rather than embedding it in JSON.
5. The Mac worker downloads that exact source and encodes a 720×1280 review MP4
   at CRF 23. After acceptance, it encodes the 1080×1920 final at CRF 17.
   Both use BT.709, H.264/AAC, fast-start metadata, and a -16 LUFS audio target.

The approved source SHA-256 is fixed in the capture, preview selection, and
final-render record. A changed hash, unrelated presenter track, missing source
revision, or unapproved rights stops the workflow.

The final-render gate also requires an approved source, a pinned film-skill
version, and `production-safe` rights. Queueing the final locks review
decisions so the approved seed and recipe cannot drift. The Mac worker claims
that final phase separately, verifies the stored skill contract against the
exact registered version, applies the `final` preset to the accepted seed, and
uploads one final variant. Contract drift, missing source revision, failed
rights gates, or a changed seed stop execution before generation. The console
does not provide a freeform timeline, arbitrary layer controls, social
publishing, or frame-by-frame editing; use the editor-ready export for those
changes.

Variant playback uses authenticated job-and-variant routes rather than
accepting arbitrary R2 keys. Responses support byte ranges and use
`private, no-store` caching.

## Mixed-media demo preset

After the three direct-mode variants exist, build the editor-ready narrated
proof:

```bash
npm run setup:kokoro
npm run forge:demo
```

The command uses the local `af_heart` Kokoro voice by default. Override it with
`--voice <kokoro-voice>` or change pacing with `--speed <number>`. It creates a
new timestamped folder under:

```text
.reel-pipeline/first-deliverable/s01/mixed-media/
└── demo-<timestamp>/
    ├── local-video-forge-mixed-media.mp4
    ├── narration.wav
    ├── captions.srt
    ├── timeline.json
    ├── manifest.json
    ├── contact-sheet.jpg
    ├── review.html
    └── design-evidence/
```

Narration is synthesized one subtitle phrase at a time, so cue boundaries come
from the real audio durations. The composition combines burned subtitles,
ASCII and Canvas graphics, proof slides, actual variant frames, metadata, and
restrained effects. Each run records hashes and writes to a new directory.

The presenter is deliberately static and only leads the silent intro/outro.
During narration the video uses graphics and static proof cutaways. The
manifest records `lipSync: false`; the preset never presents unrelated mouth
motion as synchronized speech.

## Recovery and safety

- Only one local generation process can hold the global render lock.
- A dead local process lock is reclaimed automatically.
- A rerun resumes from completed output files and `run.json`.
- The worker never overwrites a completed local variant.
- Switching models requires the current process to exit first.
- Quit memory-heavy browsers, indexing, and local LLM inference before hero
  renders.
- Queue records and generated assets stay internal; `/forge/*` fails closed
  without Worker authentication.

This workflow stops at reviewable media and one bounded proof composition.
General-purpose editing, music selection, publishing, and provider analytics
remain outside this vertical slice.
