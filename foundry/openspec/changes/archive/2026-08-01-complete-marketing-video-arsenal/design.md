## Context

Fleet Console already owns `/marketing` and `/marketing/explore-gallery` through
`MarketingMaker.astro` and `MarketingExploreGallery.astro`. These components
consume Reel Pipeline's `/studio/arsenal`, brief, execution, gallery, and media
APIs. Reel Pipeline also serves an internal `/studio` control page, but that is
not the user-facing product boundary. The catalog exposes 48 stable variants;
the current gallery has 41 machine-local records, only 35 exact mappings, and
no tracked MP4s.

## Goals / Non-Goals

**Goals:**

- Keep all video selection, preview, execution, playback, and blockers in Fleet
  Console Marketing.
- Make the stable variant ID the shared key across catalog, inputs, adapters,
  previews, and maker presets.
- Reuse owning runtime modules and evidence while normalizing their result.
- Ship a compact rights-safe preview for every stable variant.
- Turn the gallery into reusable visual vocabulary by supporting ordered mixes
  of two or three exact variant previews.

**Non-Goals:**

- Replacing specialized renderers or making Reel Pipeline's internal control
  page into another product.
- Bundling model weights, commercial media/lyrics, private capture, provider
  exports, licence evidence, credentials, posting, or deployment.

## Decisions

### 1. Fleet Console is the only product UI

The Astro components in Fleet Console remain the visible maker and gallery.
Reel Pipeline exposes service APIs only to this journey. The internal `/studio`
page is neither linked nor required.

```mermaid
flowchart LR
  A[Fleet Console /marketing] --> B[Prompt + exact variant + inputs]
  B --> C[Reel Pipeline execution API]
  C --> D[Adapter registry]
  D --> E[Existing local renderers]
  D --> F[Brand Reel]
  D --> G[Forge and Three.js]
  D --> H[Editorial]
  D --> I[Lyric and Blender]
  E & F & G & H & I --> J[Normalized production envelope]
  J --> A
  K[48-preview fixture pack] --> L[/marketing/explore-gallery]
  L --> A
  L --> M[2-3 style mix]
  M --> B
```

Alternative: enhance the internal `/studio` UI. Rejected because it creates the
different product surface the owner explicitly rejected.

### 2. Thin owner adapters and explicit fixture/real modes

One registry keyed by recipe ID declares required inputs and an adapter. In
fixture mode the adapter returns that exact variant's committed preview. In
real mode it calls the current owner module and preserves the owner manifest.
Missing sources or runtimes return structured blockers; fixtures never satisfy
real readiness.

### 3. Catalog-derived completeness

A validator derives the expected set from `listRecipeVariants()` and requires
one adapter, input schema, gallery record, preview, and preset per ID. Null,
duplicate, unknown, stale, or missing mappings fail closed.

### 4. Compact tracked fixture pack

A repository script uses existing FFmpeg and deterministic SVG/source fixtures
to produce short 360x640 H.264/AAC previews. Each preview carries visibly
different palette, composition, motion, and copy derived from its variant,
while optional runtime styles are labelled fixture demonstrations. A manifest
records hashes, dimensions, duration, audio, renderer, source, and prompt. The
tracked pack makes a fresh-clone gallery immediately playable; regeneration and
validation remain authoritative.

### 5. Preserve the current Fleet Console visual system

This is a preserve lane. Keep existing navigation, route, tokens, prompt-first
hierarchy, field names, and gallery language. Settings progressively reveal
mode and contextual inputs. Each exact gallery card links back to the maker.
Evidence is required at 390, 768, and 1440 pixels with keyboard, reduced-motion,
blocked-real, fixture, filtering, playback, and seeking states.

### 6. Ordered mixes preserve an exact base and named influences

The gallery exposes a compact selection tray for two or three styles. The first
selection is the base structure; later selections are ordered visual
influences. Fleet Console carries all component variant IDs in the URL and
saved brief, shows removable chips, and asks Reel Pipeline for a deterministic
mixed fixture. The fixture compositor combines only the registered rights-safe
previews, records every component hash and ID, and labels the result `mix`.
Single-style gallery cards and their 48 exact previews remain unchanged.

## Risks / Trade-offs

- [Tracked MP4 size] -> Enforce a small aggregate byte budget and short previews.
- [Fixture confused with production quality] -> Label posture in manifest, API,
  card, maker, and production envelope.
- [Runtime interface differences] -> Translate only at the thin adapter boundary
  and keep owner-native receipts authoritative.
- [48 choices become dense] -> Keep Auto first, group exact choices, and reveal
  contextual fields only after selection.
- [Mix could imply unsupported arbitrary generation] -> Limit mixes to two or
  three registered previews, name the base/influence order, and return a mix
  receipt rather than claiming another exact catalog variant.
- [Real runs are host-dependent] -> Probe readiness and return exact blockers;
  portability applies to demos, not private sources or model weights.

## Migration Plan

1. Add the execution/input registries and completeness tests.
2. Generate, track, and validate the 48-preview fixture pack.
3. Route Fleet Console maker execution through fixture/real modes and normalized
   results, retaining owner evidence links.
4. Add ordered gallery selection and deterministic mixed-fixture execution.
5. Update the Fleet Console gallery and capture preserve-mode evidence.
6. Run full checks, update product truth, reconcile issues, and ship a reviewed
   PR without deploying.

Rollback is a code/config revert; no production state or data migration exists.
