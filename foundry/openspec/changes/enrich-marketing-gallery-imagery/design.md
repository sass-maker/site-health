## Context

See `proposal.md` for motivation. Reel Pipeline currently rasterizes one SVG per variant and applies the same zoom-and-wobble filter to every preview. That mechanism cannot truthfully prove any of the six image-slideshow variants because no preview ever changes image.

## Goals / Non-Goals

**Goals:**

- Make all six slideshow artifacts genuinely multi-image and visibly style-specific.
- Keep the source pack portable, rights-safe, deterministic, and inexpensive to regenerate.
- Preserve the current card, filter, mix, provenance, and maker-handoff behavior.

**Non-Goals:**

- Change the 48-variant registry or public Reel Pipeline response shape.
- Generate images at runtime or require provider credentials.
- Add a new image library, CDN, production dependency, or visual identity.

## Decisions

### Move original artwork into the preview pack as source material

Six original portrait images will live beside the video-gallery fixtures and be rotated into every image-slideshow artifact. Each slideshow will use at least three images; the assets contain no text, logos, or third-party intellectual property.

Alternative considered: retain the images only as native video posters. The user correctly rejected that because a poster cannot prove a slideshow or its motion treatment.

### Render six explicit FFmpeg compositions

The preview-pack builder will route image-slideshow variants to a dedicated multi-input renderer. Each style gets an explicit filter composition: slow crossfades and camera motion for cinematic, lateral cutout wipes for editorial, a moving contact strip for filmstrip, paired panels for split-frame, accumulating framed images for polaroid stack, and independently moving layers for parallax.

Alternative considered: one generic crossfade template for all six. That would satisfy image count but repeat the same original failure: selectable options that do not look different.

### Thumbnail the artifact itself

Fleet Console will remove the presentation-only poster mapping and restore its existing metadata-frame thumbnail. The gallery's still state will therefore come from the exact MP4 that plays.

## Risks / Trade-offs

- [FFmpeg filter graphs can drift across versions] → Keep dimensions, duration, audio, hashes, and byte budget under the existing strict preview-pack check.
- [Six source images repeat across the six variants] → Rotate ordering and use substantially different spatial and transition treatments; the preview proves motion style rather than unique story content.
- [Richer artifacts increase repository size] → Retain the existing 8 MB total video budget and use optimized WebP sources plus efficient H.264 settings.

## Migration Plan

Move the generated artwork into Reel Pipeline, rebuild only through the repository-owned preview command, refresh hashes/config, and remove the misleading client poster mapping. Rollback restores the previous builder and generated pack together.
