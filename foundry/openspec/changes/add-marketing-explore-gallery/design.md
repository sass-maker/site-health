## Context

See `proposal.md` for motivation. Fleet Console already owns `/marketing`, its prompt-first maker, the quiet Foundry shell, and a local Reel Pipeline origin. Reel Pipeline now exposes a secret-free registry of 18 playable samples across 11 visual families plus stable-id byte-range media URLs. The gallery must preserve the existing Console design and must not become another editor.

## Goals / Non-Goals

**Goals:**

- Make visual capability legible before the operator starts a render.
- Let the artifact lead while keeping provenance and readiness honest.
- Return a selected stable variant to the existing maker rather than duplicating settings.
- Load many local videos without eagerly downloading every asset.
- Preserve keyboard access, reduced motion, mobile structure, and the current Fleet design language.

**Non-Goals:**

- Rendering, approving, publishing, editing, or importing media from the gallery.
- A new top-level sidebar destination or a replacement for Marketing.
- Ranking backend brands as a proxy for visual quality.
- Bundling sample MP4s into the Fleet Console build.

## Decisions

### Keep the gallery inside the existing Marketing shell

Add an Astro child route and retain `active="market"`. Link to it from the existing maker header and provide a simple return link. This keeps navigation stable and makes the gallery a supporting decision surface rather than a new product.

Alternative: add a sidebar item. Rejected because the gallery is not a separate owner question.

### Treat the route as an Experience surface inside an Operate product

The first viewport leads with playable work and quiet family filters; provenance follows each artifact. The incumbent canvas, type, spacing, borders, focus treatment, and responsive shell remain fixed. Equal-sized generic capability cards are avoided: strong samples receive wider spans and baseline entries remain visually quieter.

Alternative: reproduce the standalone capability-showcase page. Rejected because it would introduce a second visual language and backend-first taxonomy.

### Fetch the registry in the browser and lazy-attach media

The route reads `GET /studio/explore-gallery`, renders honest loading/error/empty states, and attaches each video `src` only near the viewport. Only one video plays at a time. The existing local service origin convention is reused.

Alternative: copy videos into Astro public assets. Rejected because generated media is local evidence, not application source.

### Hand off stable variants through the URL

Reproducible cards link to `/marketing?variant=<stable-id>#marketing-create-title`. The existing maker reads the query after the arsenal loads, selects the exact option if present, then reports live readiness. Unknown or stale ids fall back to Auto without hiding the mismatch.

Alternative: duplicate the maker settings in the gallery. Rejected because it creates two selection contracts.

## Risks / Trade-offs

- **Many videos compete for bandwidth** → Use `preload="none"`, IntersectionObserver source attachment, byte-range media, and pause sibling players.
- **Local evidence disappears on another machine** → Keep unavailable samples in the registry response and show their state instead of broken video controls.
- **A polished baseline is mistaken for supported generation** → Keep engine, source posture, and quality tier visible and only show “Use this style” for stable variants.
- **The route drifts from Marketing selection state** → Use the same stable variant id returned by the arsenal and validate the query against loaded options.
- **The local service is offline** → Render a bounded recovery state and keep Fleet Console navigation functional.

## Migration Plan

1. Add the child route and gallery component without changing the main route contract.
2. Add the gallery link and query-driven preset restoration.
3. Verify local registry loading, range playback, keyboard filters, and responsive layouts.
4. Roll back by removing the child route/link; the Reel Pipeline gallery registry remains read-only and independently usable.
