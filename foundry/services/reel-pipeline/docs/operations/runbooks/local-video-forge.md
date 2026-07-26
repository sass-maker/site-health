# Local Video Forge

Local Video Forge turns one explicitly approved keyframe into three
seed-controlled LTX-2.3 video variants. Generation runs on an Apple Silicon
Mac; the existing authenticated Cloudflare Worker and R2 bucket can coordinate
tasks created from either the Mac or the permanently hosted machine.

## Topology

```text
Mac CLI ───────────────┐
                      ├─ POST task + keyframe ─> Worker/R2 queue
Hosted-machine CLI ───┘                              │
                                                    │ pull + lease
Apple Silicon Mac worker <──────────────────────────┘
        │
        └─ generate three variants sequentially ─> upload MP4s + metadata
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
npm run forge:setup
npm run forge:readiness
```

The setup command refuses an unexpected runtime checkout instead of replacing
it. Model and engine payloads live under ignored `.reel-pipeline/` paths.

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
conditional lease, downloads the approved keyframe, renders one variant at a
time, reports progress, uploads MP4s, and completes the job. A failed job is
released to the queue once; the second failure becomes terminal. Expired
leases can be reclaimed after a crashed worker.

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
