## Context

See `proposal.md` for motivation. Reel Pipeline already serves a buildless Studio, records render provenance, serves whitelisted local artifacts, and delegates publication to Postiz. The lyric workflow correctly requires cleared audio for embedded-audio exports. Platform libraries create a separate case: the song may be played through an official embedded player for local review, while the uploaded reel must remain silent so the platform can attach its licensed sound.

## Goals / Non-Goals

**Goals:**

- Represent a bounded, review-only platform audio reference.
- Synchronize a visible official platform player with a local silent video.
- Produce and verify a silent upload master with durable evidence.
- Preserve a review starting point and require exact timing confirmation in-platform.
- Match the existing dense Studio production-card visual language.

**Non-Goals:**

- Downloading, caching, extracting, proxying, or redistributing platform audio.
- Displaying or retrieving copyrighted lyrics.
- Direct YouTube, Instagram, or TikTok publishing.
- Hiding the official player or bypassing its controls, ads, availability, or territorial restrictions.
- Guaranteeing that a song available on one platform is available on another.

## Decisions

### Store reference metadata, never reference media

The contract stores a YouTube video identifier, human-readable track metadata, excerpt start, and duration. It accepts no direct audio URL or local audio path. This makes the rights boundary structural rather than dependent on operator discipline.

Alternative considered: accept a temporary local guide track and delete it after export. Rejected as the default because deletion does not cure unauthorized acquisition and makes provenance harder to audit. Separately licensed local guides remain part of the existing cleared-audio workflow.

### Synchronize through visible official-player APIs

The preview uses a normal visible embed. YouTube remains the default and the final Shorts handoff reference. When an official upload blocks embedding, an optional Spotify track identifier selects Spotify's official IFrame API for the local review stream. Player state drives the silent video's play and pause state and corrects material drift by seeking the silent video. The preview does not attempt audio capture or waveform analysis.

Alternative considered: play YouTube in a hidden frame. Rejected because it weakens operator clarity and may violate player presentation requirements.

### Silent export is a separate artifact with a fail-closed probe

FFmpeg maps only the video stream into a new H.264 MP4. FFprobe then verifies that the output has zero audio streams before a receipt marks it ready. The original review render is preserved and never overwritten.

Alternative considered: mute the audio track. Rejected because a muted audio stream is still an audio-bearing artifact and is harder to audit.

### Keep the capability provider-neutral at the contract boundary

The first renderer supports YouTube because it provides a documented embeddable player. Provider is still an explicit enum so future in-product Instagram or TikTok preview mechanisms can be added without treating arbitrary URLs as trusted media.

### Preserve the Studio production-card pattern

The new UI is an evidence section inside the existing production card: song metadata and excerpt first, a two-column player/visual review area at wide widths, then silent-export evidence and one plain-language platform instruction. On narrow widths it stacks without changing navigation or field order.

## Risks / Trade-offs

- **Official video is unavailable, age-gated, region-blocked, or embedding-disabled** → Use an explicitly supplied matching Spotify track for official local review or show the platform error; never substitute a scraped source.
- **Playback drift occurs because the platform player buffers** → Pause the silent visual while buffering and correct drift only above a bounded threshold to avoid visible jitter.
- **The selected sound excerpt differs by platform** → Label timing as a review starting point and require an operator preview inside the target platform before publication.
- **A caller labels an unofficial upload as official** → Present source metadata as operator-supplied and require the visible embed; do not claim rights verification.
- **Autoplay is blocked** → Require an explicit user gesture and make Play preview the primary local action.

## Migration Plan

The new reference fields are optional, so existing briefs and productions remain valid. Rollback removes the optional UI and endpoint while leaving silent masters and receipts as ordinary artifacts. No data migration, deployment, credential, or production configuration change is required.
