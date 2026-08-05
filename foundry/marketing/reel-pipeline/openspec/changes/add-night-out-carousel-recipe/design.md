## Context

The maker already builds its grouped selector from `config/studio-arsenal.json`,
expands stable recipe variants, decorates them with execution inputs, and routes
local final-video recipes through the existing VideoBrief renderer boundary.
The validated Night Out proof currently lives only under the ignored local
artifact directory.

## Goals / Non-Goals

**Goals:**

- Reuse the existing catalog, brief, execution, review, and gallery contracts.
- Make the proof reproducible from an explicit portable image manifest.
- Fail before rendering on unsafe paths, incomplete inputs, or missing rights.
- Keep the render deterministic apart from operator-supplied imagery and copy.

**Non-Goals:**

- Generating images inside the recipe.
- Installing or selecting local diffusion/video models.
- Adding theme-specific recipe ids or a new maker surface.
- Publishing, scheduling, or importing social credentials.

## Decisions

### Add one dedicated local renderer

A `night-out-carousel` renderer owns the exact hook, card animation, end prompt,
and procedural audio contract. It implements the existing renderer interface so
the maker, brief lifecycle, quality checks, and review path do not gain a
special execution system.

Extending the generic HTML renderer was considered, but rejected because its
one-frame-per-scene capture and educational text-card vocabulary would make the
party format a collection of conditional branches. A focused adapter keeps the
format cohesive and testable while still reusing the repository's CDP and
FFmpeg boundaries.

### Use a portable approved-asset manifest

Real execution requires a JSON manifest with schema, theme id/label, at least
four images, per-card labels, source posture, and rights evidence. Relative
image paths resolve from the manifest directory. The adapter accepts files only
under configured approved roots and never fetches remote URLs.

The manifest is an execution input rather than a finite recipe option. This
keeps Night Out at one stable variant and allows arbitrary future themes.

### Generate the music bed locally

The renderer writes a deterministic stereo PCM funk groove and muxes it into the
captured animation. This avoids a music API, copyrighted track, new dependency,
or external license while preserving the intended edit energy.

### Preserve the current maker UI

The arsenal entry and execution registry supply all visible labels and fields.
Fleet Console's existing selector, progressive input area, readiness summary,
and confirmation button render the new recipe without new layout or styling.

### Keep fixtures separate from production evidence

One small deterministic fixture is registered for browsing and demo mode. Real
mode always requires the approved manifest and produces a separate receipt; a
fixture can never satisfy real source or rights evidence.

## Risks / Trade-offs

- **CDP captures at host-dependent frame rates** → derive the encoding input
  rate from captured frame count and target duration, then probe the final MP4.
- **Arbitrary file paths could escape the project** → resolve and validate the
  manifest and every source image against explicit approved roots before launch.
- **Named-IP concepts could look commercially ready** → persist source posture
  and rights evidence and leave distribution under the existing fail-closed
  Postiz gate.
- **Procedural music is less polished than a composed track** → treat it as the
  rights-safe default and leave cleared operator audio as a future extension.

## Migration Plan

Additive only: register the recipe/renderer/fixture and retain all existing ids.
Rollback removes the new entry and adapter; existing briefs and gallery items
remain unchanged.
