# Creative web effect contract

## Effect brief

Record before implementation:

| Field | Decision |
|---|---|
| Purpose | What the effect communicates or makes easier |
| Trigger | Load, state change, progress, scroll, pointer, or explicit action |
| Completion | Resting state, exit, replay, interruption, and cancellation |
| Rendering | CSS, SVG, Canvas 2D, or existing WebGL runtime and why |
| Input | Keyboard, pointer, touch, coarse pointer, missing hover |
| Fallback | Reduced motion, low capability, disabled script, load failure |
| Budget | Delivered bytes, main-thread work, frame behavior, layout stability |

## Technique guidance

- **CSS:** Prefer transforms and opacity; use layout animation only with
  measured need and evidence.
- **SVG:** Keep semantic content outside decorative SVGs; bound filters, masks,
  and path work to the visible result.
- **Canvas 2D:** Bound pixel ratio and object count; redraw only when needed;
  expose equivalent DOM content and controls.
- **Shaders/WebGL:** Bound resolution, passes, texture reads, branching, and
  allocation; compile deliberately and provide a non-WebGL result.
- **Scroll:** Derive from explicit progress; avoid hijacking native scroll;
  preserve anchor navigation and reading.
- **Pointer:** Coalesce or sample high-frequency input; do not require precise
  pointing or hover for core use.

## Browser evidence

Validate:

- first frame and final resting state;
- activation, interruption, replay, and rapid repeated input;
- 390, 768, and 1440 pixel widths when Fleet design review applies;
- keyboard, touch, coarse pointer, and missing-hover paths that apply;
- reduced-motion and fallback composition;
- hidden/offscreen pause and teardown;
- layout stability, delivered bytes, and the agreed frame or main-thread
  evidence.

The effect passes only when the underlying content and action remain usable
without it.
