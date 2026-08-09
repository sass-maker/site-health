## Why

SaaS Maker's product catalog is generated from current Fleet truth, but the
homepage does not clearly show what changed recently. Its single “Latest
learning” card is also physically attached to the catalog wall, making an
editorial note look like a permanent product-category sidebar. The newly
released Three.js globe is visually successful but currently ships in the
initial client bundle even when a visitor never reaches it.

## What Changes

- Keep the maintained and past-product inventory generated only from Fleet's
  canonical privacy-checked public projection; do not expose unpublished dirty
  workspace state.
- Add the token-world release and other current public SaaS Maker truth to the
  product-owned changelog so “latest” means something verifiable and dated.
- Detach the latest learning from the catalog wall and rebuild it as a
  full-width editorial workshop chapter with publication date, reading time,
  description, and a clear route into the learning.
- Lazy-load Three.js only when the globe approaches the viewport. Semantic
  metrics and the CSS globe fallback remain immediate; reduced-motion,
  save-data, missing-WebGL, and no-script paths remain truthful.
- Preserve the current wordmark, routes, anchors, catalog grouping, legal copy,
  token accounting, and steel-and-glass design language.

## Capabilities

### New Capabilities

- `saasmaker-homepage-freshness`: Defines how the homepage and changelog expose
  current public product truth and how the learning chapter is composed.

### Modified Capabilities

- `public-token-impact`: Requires the decorative Three.js globe runtime to load
  near the viewport instead of entering the initial execution path.

## Impact

- **Public site:** `foundry/apps/public/public-directory/` changes the catalog/
  learning composition, adds a current changelog entry, and splits the globe
  runtime behind viewport-driven enhancement.
- **Data:** the catalog remains generated from `foundry/ops/public/products.json`;
  no private registry fields or unpublished milestones become public.
- **Performance:** the initial page keeps semantic token content and CSS
  fallback but defers the approximately 130 KiB gzip Three.js scene until it is
  near the viewport.
- **Dependencies and deployment:** no new dependency, API, storage, route, or
  Cloudflare project. Release remains a manual static Pages deployment.
