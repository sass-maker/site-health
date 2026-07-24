# Architecture

Reel Pipeline has one responsibility: convert approved source material into
reviewable media artifacts and receipts.

## System boundary

```text
source project / approved content package
                  ↓
        VideoBrief or package contract
                  ↓
    render adapter → artifact manifest → quality/review
                  ↓
             media receipt
                  ↓
       Postiz draft adapter (no schedule)
                  ↓
 Postiz review → schedule → publish → provider metrics
```

Reel Pipeline owns the middle generation stages. Source projects own claims and
approval. Postiz owns social accounts and the publication lifecycle.

## Worker production flow

```text
Cloudflare Worker + R2
  → approved reel record
  → Rust watcher
  → scripts/render-pro.js
  → Chrome/voice/FFmpeg render
  → R2 artifact
  → Worker record update
```

The Rust layer handles polling and safe process orchestration. Node and external
tools continue to perform media work.

## Package/Postiz flow

```text
approved fleet.content-package.v1
  → renderer
  → fleet.artifact-manifest.v1
  → fleet.media-receipt.v1
  → src/postiz-client.js
  → Postiz draft
```

The Postiz adapter requires an explicit project/channel integration mapping.
Native provider publishing is rejected by `src/distribution.js`.

## Core modules

| Module | Role |
| --- | --- |
| `src/video-brief.js` / `reel/src/brief.rs` | Validate normalized render input |
| `src/pipeline.js` | Node render orchestration for local/browser/package surfaces |
| `reel/src/watcher.rs` | Poll approved Worker reels and invoke render-pro |
| `src/adapters/*` | Render-engine adapters |
| `src/artifact-publisher.js` | Local/R2 artifact publication |
| `services/content-factory/src/manifest.js` | Artifact manifest and provenance contract |
| `src/postiz-client.js` | Upload media and create draft-only Postiz requests |
| `src/distribution.js` | Allow only manual or Postiz handoff |

## Safety properties

- Credentials remain external and are never stored in integration maps.
- A completed render must have a verifiable artifact manifest.
- Source approval and artifact review are separate evidence stages.
- Postiz requests are drafts; this repository does not set schedules.
- Direct YouTube/Instagram adapters and token-refresh jobs are absent.
- Live Rust render/watch paths default to dry-run unless `--execute` is used.
