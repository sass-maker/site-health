## Why

Reel Pipeline can demonstrate many isolated engines, but it does not yet offer one deliberately constrained path whose output is ready for a human to post today. A useful reel must make narration, music, animation, captions, and the final audio/video edit work as one coherent piece rather than expose them as disconnected capabilities.

## What Changes

- Add one post-ready vertical-video preset that turns an approved brief into a finished MP4 through a single local command.
- Require a complete timed production plan covering narration, visual beats, music intent, captions, and transitions before rendering.
- Produce or accept a high-quality voice track, use a rights-safe music bed, render purposeful animated scenes, and merge them with explicit voice/music balancing.
- Emit the final MP4 together with captions, intermediate audio, provenance, validation results, and a production receipt.
- Add a repeatable sample and review gate that checks the full render plus one frame per second before the preset is described as post-ready.
- Keep social publishing, scheduling, the marketing gallery, and broad engine coverage outside this change.

## Capabilities

### New Capabilities

- `post-ready-video-production`: Defines the single-command local production path and its quality, provenance, output, and review contract.

### Modified Capabilities

- `marketing-video-execution`: Requires the shared execution envelope to preserve the post-ready preset's production plan, mix evidence, and review result.

## Impact

- Primary code: `foundry/marketing/reel-pipeline` production scripts, adapters, media utilities, schemas, and tests.
- Outputs: a vertical H.264/AAC MP4 plus sidecar captions, audio, receipt, and review artifacts under an ignored local output directory.
- Runtime: existing local FFmpeg, browser/HTML composition, voice, and optional approved image/video generation paths; no publishing integration and no new production dependency is proposed.
- Rights: music, imagery, video, and voice inputs must be generated locally, repository-owned, or supplied with explicit provenance; missing evidence blocks a post-ready result.
