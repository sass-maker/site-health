## Why

Marketing Studio can plan and render several video formats, but it cannot yet
turn a rights-cleared song into a timed, literal lyric video or use Blender as
a deterministic visual engine. Adding both capabilities makes the Studio useful
for music-led storytelling without weakening its provenance, review, or social
distribution boundaries.

## What Changes

- Add a `lyric-video` workflow to conversational intake, editable briefs,
  Productions, and Distribute.
- Require explicit composition/lyrics and master-recording rights posture,
  source attribution, audio evidence, and timed lyrics before a lyric video can
  render or reach distribution.
- Accept operator-supplied LRC, SRT, or structured timed-lyric data; do not
  scrape or generate copyrighted commercial lyrics.
- Generate a literal visual plan that maps every lyric cue to an attributable
  scene description and approved asset plan.
- Add deterministic local lyric-video composition with readable kinetic text,
  audio preservation, captions, artifact hashes, quality evidence, and a
  reduced-motion fallback.
- Add Blender as an optional headless renderer and asset generator behind the
  existing VideoBrief and Content Factory manifest contracts.
- Pin the Blender runtime contract, disable automatic execution for untrusted
  `.blend` files, constrain generated scene input to validated JSON, and add
  request-to-artifact smoke coverage.
- Expose lyric-video and Blender readiness in the existing preserve-lane
  Marketing Studio UI.
- Produce a real local canary using the recognizable public-domain
  “Twinkle, Twinkle, Little Star” composition/lyrics with a newly generated
  recording and explicit attribution.
- Keep live social publication outside automated verification; Postiz draft
  and future scheduling reuse the existing evidence-gated path.

## Capabilities

### New Capabilities

- `lyric-video-production`: Rights-gated timed lyrics, literal scene planning,
  local lyric-video rendering, review evidence, and distribution eligibility.
- `blender-rendering`: Deterministic headless Blender scene generation,
  capability checks, artifact manifests, safety gates, and smoke canaries.

### Modified Capabilities

- `marketing-video-studio`: Add lyric video to conversational workflow
  selection, editing, readiness, execution, Productions, and Distribute.
- `studio-web-ui`: Show lyric-specific inputs, Blender readiness, rights
  blockers, rendering state, playback, and safe continuation actions.

## Impact

- Affects `src/studio/*`, `src/pipeline.js`, `src/video-brief.js`,
  `src/adapters/*`, renderer configuration, fixtures, tests, docs, and design
  evidence.
- Adds Blender 5.2 as an external local runtime for real Blender rendering; it
  does not add a Node production dependency.
- Adds a new rights and timed-lyrics contract. Existing video workflows and
  render modes remain backward compatible.
- Does not fetch lyrics, acquire music licences, publish directly to social
  providers, or treat attribution as permission.
