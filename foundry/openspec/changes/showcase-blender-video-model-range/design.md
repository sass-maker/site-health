## Context

Reel Pipeline already has a bounded Blender 5.2 adapter and a pinned Apple Silicon LTX-2.3 forge. The Explore Gallery currently routes both families through the generic SVG fixture renderer, so the UI is technically complete but visually untruthful.

## Goals / Non-Goals

**Goals:**

- Make every Blender card visibly prove its named 3D scene language.
- Show local video generation across controlled cinematic motion, product/object motion, and more experimental transformation.
- Keep proofs reproducible, rights-safe, compact, and correctly attributed.
- Preserve the simple existing gallery interaction.

**Non-Goals:**

- Add more catalog variants or expose model controls in the UI.
- Claim that three short proofs exhaust Blender or video-model capability.
- Generate deceptive testimonials or represent synthetic people as real customers.
- Add cloud generation, credentials, dependencies, or publishing.

## Decisions

### Build a gallery-specific Blender animation proof pack

A repository-owned Blender script will construct and animate the eight registered styles at preview resolution. Each style will use different geometry, material, lighting, and movement: orbiting celestial structures, architectural camera movement, refractive product staging, a low-poly fly-through, procedural growth, kinetic rotation, tunnel travel, and layered paper motion.

Alternative considered: reuse the existing still plates with FFmpeg zoom. That remains a valid literal-scene fallback, but it does not demonstrate Blender animation range.

### Use real local LTX proofs for the three coherent-film cards

The gallery pack will accept three repository-owned real-proof MP4 inputs generated from explicitly approved original keyframes. The strict, balanced, and experimental cards will demonstrate controlled cinematic continuity, object/product motion, and stylized transformation respectively. Their manifests retain keyframe hashes, prompts, model revision, and output hashes.

Alternative considered: label three seeds of one prompt as range. That demonstrates variation, not capability range, so it is insufficient.

### Keep optional heavyweight regeneration separate from the base fixture build

The normal 48-preview build will consume committed, validated real proofs. Explicit Blender and LTX proof commands regenerate the heavyweight sources on a prepared host. This keeps a fresh clone playable without requiring Blender, a 30 GB model, or several minutes of rendering.

## Risks / Trade-offs

- [Real proofs increase repository size] -> Transcode short 360x640 H.264 gallery derivatives and retain the existing 8 MB aggregate budget.
- [Heavy renders are not available on every clone] -> Commit portable derivatives and evidence while keeping regeneration commands explicit and fail-closed.
- [Model output quality varies] -> Use approved keyframes, bounded prompts, one reviewed selected output per capability, and truthful local-model labels.
- [A short demo can overstate completeness] -> Describe the cards as examples and keep the broader capability list in supporting copy, not as unsupported proof claims.

## Migration Plan

Generate and inspect the Blender and LTX source proofs, rebuild the portable pack from those proofs, refresh hashes and metadata, then run strict gallery validation and browser playback. Rollback restores the previous preview builder and generated artifacts together.
