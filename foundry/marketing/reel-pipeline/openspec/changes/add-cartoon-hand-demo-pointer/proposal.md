## Why

Guided app demos already support a real screen recording with a synchronized
presenter in the corner, but the presenter's relationship to the demonstrated
interface is still visually passive. An opt-in cartoon arm and pointing hand
can turn the presenter into the cursor, making an otherwise standard demo more
distinctive without sacrificing exact interaction clarity.

## What Changes

- Add an opt-in cartoon-hand pointer treatment for guided app demos: a
  stylized arm originates at the presenter frame and follows a timestamped
  pointer trace, with the fingertip acting as the interaction hotspot.
- Record or import pointer position and button state as a privacy-bounded
  sidecar tied to the approved screen-capture source and timeline.
- Add clear pointing, click/tap, drag/grab, idle, and off-screen states while
  preserving an exact hotspot marker for small controls.
- Register the treatment in a new `guided-app-demo@2` film-skill version;
  existing `guided-app-demo@1` renders remain reproducible and unchanged.
- Require a standard-cursor fallback when the source cursor cannot be hidden,
  the trace is missing or unsynchronized, or the hand would make an
  interaction materially less legible.
- Keep hand appearance operator-selected and rights-cleared; do not infer skin
  tone or other traits from the presenter image.
- Keep the feature local and review-gated. This proposal does not implement,
  deploy, publish, or alter production dependencies.

## Capabilities

### New Capabilities

- `cartoon-hand-demo-pointer`: Capture, validate, render, and review a
  presenter-anchored cartoon hand as the precise pointer for guided app demos.

### Modified Capabilities

None.

## Impact

- Affected surfaces: the Forge guided-capture workflow, pointer-trace
  contracts, film-skill registry, deterministic Canvas/FFmpeg composition,
  review metadata, tests, and operator documentation.
- Existing screen/camera capture, source-hash provenance, preview/final
  binding, and Postiz handoff boundaries remain unchanged.
- No new production dependency, cloud service, social integration, or
  deployment is required by the proposal.
