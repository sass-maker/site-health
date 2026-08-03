# Command Reference

`package.json` is authoritative. This page groups the supported operator
commands.

## Develop and verify

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local control API and browser surfaces |
| `npm test` | Node and Rust regression suites |
| `npm run smoke:render-modes` | Direct VideoBrief fixture checks for render modes |
| `npm run smoke:postiz` | Postiz adapter, mapping, and draft contract tests |
| `npm run ready:local` | Local generation-case readiness |
| `npm run ready:proofs` | Refresh required readiness evidence |
| `npm run ready:target` | Target-host acceptance; requires prepared live services |
| `npm run docs:validate` | Documentation structure and link validation |
| `npm run docs:build` | Build the Blume documentation site |
| `npm run editorial:test` | Nested podcast editorial Python suite |
| `npm run editorial:check` | Nested podcast editorial Ruff checks |

## Render

| Command | Purpose |
| --- | --- |
| `npm run render:pro -- <reel-id>` | Canonical Worker/R2 production render |
| `npm run render:pro:rs -- <reel-id>` | Rust wrapper around production render |
| `npm run render:fixture -- --mode <mode>` | Direct local VideoBrief fixture render |
| `npm run render:html -- --brief <file>` | Export HTML composition artifacts |
| `npm run render:package -- --file <package>` | Render an approved content package |
| `npm run render:podcast-edit -- --file <podcast-edit>` | Render an approved `fleet.podcast-edit.v1` document |
| `npm run render:post-ready -- --brief <brief.json>` | Produce one review-gated 9:16 master with narration, music, motion, captions, provenance, and one-frame-per-second evidence |
| `npm run probe:engines` | Inspect renderer prerequisites without rendering |

### Post-ready local preset

The post-ready preset accepts `fleet.post-ready-video.v1`. The brief must be
owner-approved and include a 20–35 second scene plan, narration, music intent,
rights-safe visual sources, purposeful motion, captions, transitions, and a
closing beat. A generated music bed is available as the rights-safe default;
approved narration or music files require explicit source and license fields.

From a worktree, point at shared ignored model directories instead of copying
them:

```bash
npm run render:post-ready -- \
  --brief fixtures/post-ready/reference-protected-hour/brief.json \
  --voice af_bella \
  --voice-speed 1.04 \
  --kokoro-dir /path/to/shared/tools/kokoro \
  --video-runtime-root /path/to/shared/ltx-2-mlx \
  --video-model-root /path/to/shared/ltx-model
```

Run `npm run render:post-ready -- --list-voices` to inspect the curated voice
catalog. The current friendly/poppy choices are Bella, Heart, Nova, and Puck;
the same brief can be rerendered with any catalog id through `--voice` without
editing the source JSON.

Each timestamped run under `.reel-pipeline/post-ready/` contains `final.mp4`,
`captions.srt`, the narration, music and final-mix WAV files, normalized plans,
source and output hashes, engine readiness, stage diagnostics, a complete
technical review, one JPEG per second, a contact sheet, and
`production-receipt.json`.

Technical completion remains `review-only`. To mark the receipt post-ready,
pass an explicit review document with `--review <review.json>`. It must approve
voice, music, animation, captions, pacing, and transitions and contain no
critical issue. The command never uploads or publishes the result.

## Podcast editorial

| Command | Purpose |
| --- | --- |
| `npm run editorial -- --help` | Run the incorporated Mashup compatibility CLI |
| `npm run editorial -- export-podcast-edit <edl> --output <file> --provenance <file>` | Wrap an EDL in the canonical podcast-edit contract |
| `npm run editorial:test` | Run Python editorial tests |
| `npm run editorial:check` | Run editorial lint and format checks |

## Source packages and Postiz

| Command | Purpose |
| --- | --- |
| `npm run content` | Extract or inspect content packages |
| `npm run draft:signal` | Convert a High Signal brief into a draft bundle |
| `npm run significant-content -- <command>` | Significant Content intake/receipt/report tooling |
| `npm run check:social` | Validate Postiz base URL, key presence, and integration mapping |
| `npm run distribution -- --file <package> --receipt <receipt> --provider postiz` | Create a Postiz draft from approved inputs |

Distribution supports only `manual` and `postiz`. Native YouTube/Instagram
publishing is intentionally rejected.

## Studio and generation tools

| Command | Purpose |
| --- | --- |
| `npm run studio -- <tool>` | Content studio tools |
| `npm run faceless -- --topic "..."` | Topic-to-video workflow |
| `npm run factory -- <command>` | Local backlog-to-artifact conveyor |
| `npm run factory -- arsenal [filters]` | Read-only machine inventory of projects, tools, workflows, recipes, engines, policies, readiness, guardrails, and next actions |
| `npm run factory -- autopilot --policy <id> --dry-run` | Discover one automation policy without writes, rendering, upload, or Postiz calls |
| `npm run factory -- autopilot --all --execute --count <n>` | Execute bounded enabled policies with persisted retries and evidence gates |
| `npm run factory -- status` | Show backlog stages plus content-lane, policy, run, and recovery status |
| `npm run lesson:render -- ...` | Tutoring lesson renderer |
| `npm run setup:kokoro` | Install the optional local Kokoro model |
| `npm run forge:setup` | Install the pinned Local Video Forge runtime and selected LTX-2.3 model files |
| `npm run forge:readiness` | Check Apple Silicon, memory, disk, runtime, and model prerequisites |
| `npm run forge:variants -- --project <json> --shot <id>` | Turn one approved keyframe into three resumable local variants |
| `npm run forge:enqueue -- --project <json> --shot <id> --coordinator <url>` | Create a shared forge task from either machine |
| `npm run forge:tasks -- --coordinator <url>` | Inspect the shared forge queue |
| `npm run forge:work -- --coordinator <url>` | Poll, claim, render, and upload forge tasks from the Mac |
| `npm run forge:demo` | Build the local Kokoro-narrated mixed-media proof from the approved presenter and three variants |
| `npm run forge:coherent -- --manifest <json> --output <dir>` | Render an approved skill-bound coherent film with reproducibility and review metadata |

Add `--reduced-motion` to `forge:coherent` to render the same manifest with
fixed source frames and direct scene changes.

## Worker and watcher

| Command | Purpose |
| --- | --- |
| `npm run watch:render` | Poll and render approved Worker reels |
| `npm run watch:render:once` | Execute one watcher tick |
| `npm run watch:render:dry` | Print watcher actions without mutation |
| `npm run bootstrap:cloudflare` | Prepare Worker/R2 resources; explicit operator action |
| `npm run check:cloudflare` | Check Cloudflare prerequisites |
| `npm run worker:dry-run` | Wrangler deployment dry run |

Local Video Forge coordinator commands require the existing Worker internal
token outside git. See
[`operations/runbooks/local-video-forge.md`](../operations/runbooks/local-video-forge.md).

## Rust CLI

```text
reel render <reel-id...> [--variant-count N] [--execute]
reel watch [--once] [--execute]
reel plan <brief.json> [--variant-count N]
reel validate-brief <brief.json>
reel score <brief.json>
reel config project-urls
```

Rust render/watch commands default to dry-run and require `--execute` for live
work.
