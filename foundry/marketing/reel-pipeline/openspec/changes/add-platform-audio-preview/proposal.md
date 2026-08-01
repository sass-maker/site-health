## Why

Creators need to judge a silent visual reel against the real platform-licensed song before publishing, but downloading or embedding that copyrighted master in the exported artifact would violate the product's rights gates. Reel Pipeline needs a review-only synchronization path that streams an official platform source locally and proves that the upload master remains silent.

## What Changes

- Add a platform-audio reference contract containing an embeddable YouTube source, display metadata, excerpt offset, preview duration, and rights posture.
- Add a synchronized local preview that keeps the official YouTube player visible and controls the silent generated video from the player's play, pause, and seek state.
- Add an explicit silent-master export and verification receipt that fails if the exported upload artifact contains an audio stream.
- Add a platform handoff note with the intended song, excerpt start, duration, and instruction to attach the official sound inside Shorts, Reels, or TikTok.
- Preserve the existing provider-neutral render and Postiz boundaries; this change does not download music, store masters, add a social-provider adapter, or publish content.

## Capabilities

### New Capabilities

- `platform-audio-preview`: Review-only synchronization of a silent reel with an official embeddable platform track, plus fail-closed silent export evidence.

### Modified Capabilities

- `studio-web-ui`: Add compact reference-audio playback and silent-export evidence to the existing production review pattern.

## Impact

- Affects the Studio brief/API/UI, local artifact metadata, and focused Node tests.
- Uses the existing YouTube IFrame Player API in the browser and FFmpeg/FFprobe locally; no new production dependency is required.
- Does not change production deployment, credentials, Postiz ownership, or social publishing behavior.
