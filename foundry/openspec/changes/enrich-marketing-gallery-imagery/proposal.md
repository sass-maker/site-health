## Why

The Explore Gallery claims to prove all 48 video variants, but the image-slideshow lane currently vibrates one flattened fixture card instead of demonstrating a slideshow. The generated artwork must become real multi-image source material with motion that distinguishes each selectable slideshow style.

## What Changes

- Add a compact, rights-safe set of original image-story assets.
- Rebuild all six image-slideshow preview artifacts from multiple images rather than a flattened SVG.
- Give cinematic, editorial cutout, filmstrip, split-frame, polaroid-stack, and soft-parallax variants visibly different transitions and compositions.
- Thumbnail the actual preview artifact rather than placing unrelated poster art over it.
- Preserve current filters, ordered style mixing, maker handoff, provenance, and responsive Fleet Console patterns.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `video-demo-gallery`: Require image-slideshow demos to use multiple rights-safe images and visibly demonstrate the selected motion treatment.

## Impact

- Affects Reel Pipeline's committed preview sources and six generated image-slideshow MP4 artifacts, plus the Fleet Console gallery's thumbnail behavior.
- Does not change the 48-variant API contract, credentials, provider spend, publishing, or deployment.
- Adds no production dependency.
