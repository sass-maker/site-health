# Architecture

Reel Pipeline has one responsibility: convert approved source material into
reviewable media artifacts and receipts.

## System boundary

```text
source archive / source project / approved content package
                  ↓
 podcast edit / VideoBrief / package contract
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

## Podcast editorial flow

```text
owned/licensed archive
  → editorial/ Python runtime
  → fleet.podcast-edit.v1
  → src/podcast-edit.js
  → src/adapters/podcast-edit.js
  → editorial multi-clip renderer
  → hashed MP4/captions receipt
```

This path preserves the complete source EDL rather than flattening it into a
VideoBrief body. The Python runtime is an implementation module of Reel
Pipeline, not a separate product.

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
| `editorial/src/mashup/*` | Source-aware transcription, planning, EDL editing, and multi-clip rendering |
| `src/podcast-edit.js` | Validate the canonical source-backed podcast edit |
| `src/adapters/podcast-edit.js` | Verify source bytes and render approved podcast edits |
| `src/pipeline.js` | Node render orchestration for local/browser/package surfaces |
| `reel/src/watcher.rs` | Poll approved Worker reels and invoke render-pro |
| `src/adapters/*` | Render-engine adapters |
| `src/artifact-publisher.js` | Local/R2 artifact publication |
| `foundry/marketing/content-factory/src/manifest.js` | Artifact manifest and provenance contract |
| `src/postiz-client.js` | Upload media and create draft-only Postiz requests |
| `src/distribution.js` | Allow only manual or Postiz handoff |

## Safety properties

- Credentials remain external and are never stored in integration maps.
- A completed render must have a verifiable artifact manifest.
- Source approval and artifact review are separate evidence stages.
- Postiz requests are drafts; this repository does not set schedules.
- Direct YouTube/Instagram adapters and token-refresh jobs are absent.
- Live Rust render/watch paths default to dry-run unless `--execute` is used.
