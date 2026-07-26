# Generation Readiness

The executable source of truth is `config/live-generation-readiness.json`.

## Local evidence

```bash
npm run smoke:generation-cases
npm run smoke:render-modes
npm run smoke:lesson-local
npm run smoke:postiz
npm run ready:local
```

The direct render-mode smoke verifies local VideoBrief adapters. Optional
services may be reported as skipped when they are not installed.

Local Video Forge has a separate approved-keyframe gate because it is an
editor-ready shot pipeline rather than a `VideoBrief` render mode:

```bash
npm run forge:readiness
npm run forge:variants -- \
  --project examples/local-video-forge/project.json \
  --shot s01 \
  --output .reel-pipeline/first-deliverable
```

Verify three MP4s, `run.json`, and `review.html`. See the
[`Local Video Forge runbook`](./local-video-forge.md).

## Live render proof

```bash
MONEYPRINTER_API_URL=http://127.0.0.1:18080 npm run canary:moneyprinter
npm run smoke:reel-maker
npm run render:pro -- <approved-reel-id>
npm run smoke:artifact
```

Verify that the Worker record, R2 object, manifest, and byte-range playback all
refer to the same output.

## Postiz proof

```bash
npm run check:social -- --strict
npm run distribution -- \
  --file <approved-package.json> \
  --receipt <media-receipt.json> \
  --provider postiz
```

Confirm the result is an unscheduled Postiz draft with the correct media,
copy, and destination integration.

## Final gate

```bash
npm run ready:proofs
npm run ready:target
```

Only `targetHostReady: true` means the prepared host has every required proof.
