## Context

Reel Pipeline already records a real display source and optional same-session
camera/microphone presenter into one approved browser-canvas capture. The
`guided-app-demo@1` film skill pins the presenter to the bottom-right corner
and binds preview and final output to the same source hash.

The browser capture does not currently preserve a trustworthy pointer timeline
separate from the video. It may also bake the operating-system cursor into the
selected display source. Replacing that cursor therefore requires both a
time-aligned pointer trace and an overlay that covers the captured cursor
without hiding the control being demonstrated.

## Goals / Non-Goals

**Goals:**

- Make the presenter appear to reach out from the corner and point at the real
  interface with a deliberately cartoonish hand.
- Keep the fingertip aligned to the exact interaction hotspot through movement,
  clicks, and drags.
- Preserve the existing permission, local approval, provenance, preview,
  final-render, and publication-rights gates.
- Produce deterministic output from a source capture, trace, film-skill
  version, and rights-cleared style asset.
- Fail safely to the ordinary cursor whenever the treatment is not trustworthy
  or legible.

**Non-Goals:**

- Real-time hand-pose estimation, webcam gesture control, or biometric
  inference.
- Reconstructing pointer activity from video pixels as the authoritative trace.
- A general character-animation system, avatar generator, or nonlinear editor.
- Keystroke logging, DOM inspection, window-title collection, or background
  input monitoring.
- Automatic publishing or any change to the Postiz boundary.

## Decisions

### The pointer is an immutable sidecar, not inferred animation

Each eligible take has a `reel-pipeline.pointer-trace.v1` JSON sidecar
containing a monotonic timebase, normalized capture coordinates, button-state
transitions, capture dimensions, acquisition method, and calibration evidence.
The trace records only pointer facts needed for rendering. It SHALL NOT record
keys, entered text, DOM selectors, window titles, or application content.

The approved capture record stores the trace hash and the source-video hash.
The preview and final render accept the trace only when both hashes and the
duration/timebase binding validate. This is preferred to cursor detection from
pixels because UI backgrounds and pointer shapes make reconstruction
ambiguous.

### Trace acquisition is explicit and capability-gated

The first implementation starts with a proof spike for the prepared Mac:

- scripted browser demos can emit pointer coordinates from the existing
  deterministic action runner;
- manual full-screen demos can use a small local helper, started and stopped by
  the operator, to sample pointer coordinates and button transitions against a
  calibrated display coordinate space.

The helper exposes a visible active state and stops with the recording. It uses
system APIs already available on the Mac and does not add a cloud service or
production package dependency. Window and browser-tab mapping remain
unsupported until the implementation can prove their coordinate transform;
those sources keep the standard cursor.

### The captured cursor is covered, not silently erased

For eligible traces, the renderer places an opaque fingertip cover over the
captured cursor and positions the hand's semantic hotspot at the exact trace
coordinate. A small high-contrast hotspot ring remains visible above the
finger so tiny controls are unambiguous.

Trying to erase an arbitrary cursor from already encoded video would introduce
fragile inpainting and could alter product evidence. If the source cursor
extends beyond the verified cover geometry, changes shape unexpectedly, or
cannot be located at the traced hotspot, the render uses the original cursor
and does not draw the arm.

### The arm is procedural and anchored to the presenter frame

The presenter rectangle provides the shoulder anchor. The renderer draws a
two-segment Bézier arm toward the pointer, chooses the nearer edge of the
presenter frame, and orients a small set of rights-cleared hand poses:
`point`, `tap`, `grab`, `release`, and `retracted`.

The fingertip is the only position-critical point. The rest of the arm may
stretch cartoonishly but fades or retracts after an idle threshold so it does
not become a permanent overlay. The renderer keeps the hand body on the side
of the hotspot opposite the active control and clamps bends away from caption
and title safe areas.

A film-style manifest selects color, outline, handedness, and pose assets. The
operator chooses the appearance explicitly; the system does not sample or
infer skin tone from the presenter.

### The treatment creates `guided-app-demo@2`

`guided-app-demo@1` remains immutable. Version 2 adds the optional
`cartoon-hand-pointer` primitive, trace and presenter requirements, fallback
rules, and review gates. A job records the exact film-skill version, pointer
trace hash, style ID/version, and whether the final used the cartoon hand or
the standard cursor.

The treatment is selectable only when a presenter is included and the trace is
eligible. Operators can disable it after preview without retaking the source.

### Review protects precision and legibility

The Mac worker renders a short proof segment containing representative move,
click, and drag states before the final encode. Review checks:

- fingertip-to-hotspot error at representative frames;
- coverage of the captured cursor;
- visibility of the demonstrated control before, during, and after the click;
- presenter, caption, and arm safe-area collisions;
- reduced-motion behavior; and
- identical source, trace, and style hashes between accepted preview and final.

The standard cursor is the fail-safe outcome, not a failed render, when the
idea-specific gates do not pass.

```mermaid
flowchart LR
  Capture[Approved app and presenter capture] --> Bind[Hash and timebase binding]
  Trace[Approved pointer trace] --> Bind
  Style[guided-app-demo@2 and hand style] --> Render[Deterministic overlay render]
  Bind --> Render
  Render --> Review[Precision and legibility review]
  Review -->|passes| Hand[Cartoon-hand final]
  Review -->|fails or disabled| Cursor[Standard-cursor final]
```

## Risks / Trade-offs

- **Pointer coordinates drift from the encoded capture** → limit the first
  manual path to calibrated full-screen capture, validate representative
  frames, and fall back on any mismatch.
- **The original cursor remains visible beside the hand** → use a verified
  fingertip cover and refuse the treatment when coverage cannot be proven.
- **The arm obscures the UI** → orient the hand away from the target, reserve
  safe areas, retract while idle, and let review disable the treatment without
  a retake.
- **System input capture feels invasive** → require explicit start/stop,
  display a live state, collect only pointer coordinates/buttons/timestamps,
  and store the approved bounded trace with provenance.
- **Animation calls too much attention to itself** → keep one principal
  gesture at a time and use the normal cursor for dense or precision-heavy
  sequences.
- **A hand style implies traits the operator did not choose** → require
  explicit style selection and prohibit appearance inference from camera
  frames.

## Migration Plan

1. Prove pointer-trace acquisition, calibration, cursor coverage, and
   synchronization with a short local full-screen fixture.
2. Add the sidecar schema and validation without changing existing capture
   records or `guided-app-demo@1`.
3. Register `guided-app-demo@2` and implement the opt-in preview renderer.
4. Add review gates and final-render binding, then test a complete local demo.
5. Document supported source types and the standard-cursor fallback.

No data migration or deployment is required. Rollback is selecting
`guided-app-demo@1` or disabling the treatment; existing captures and renders
remain valid.

## Open Questions

- Whether the prepared Mac can provide sufficiently stable click-state events
  without an additional Accessibility permission beyond current screen
  recording permissions must be proven during the spike.
- Window and browser-tab coordinate mapping remains deferred until it can be
  validated without collecting app content or weakening the fallback.

