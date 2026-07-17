# Proposal: Fleet-wide JSON-LD emission via apply-agent-surfaces

## Why

The 2026-07-17 GEO/SEO audit (`fleet-ops/docs/audit-report-geo-seo-2026-07-17.md`)
found JSON-LD nearly absent fleet-wide: only codevetter, pace (partial),
materia, and the showcase ship meaningful structured data, and rolepatch ships
two *conflicting* SoftwareApplication blocks. Structured data drives rich
results and — increasingly important for this fleet — entity grounding for AI
answer engines. Every product already has the needed facts (name, summary,
url, links) in `fleet-ops/config/agent-surfaces-registry.json`; we are just
not emitting them into HTML.

The distribution mechanism already exists: `apply-agent-surfaces.mjs` writes
llms.txt / api-ai.json / robots per product from the registry. JSON-LD is one
more surface from the same source of truth.

## What changes

- `apply-agent-surfaces.mjs` gains a JSON-LD generation + injection step:
  - Builds one `@graph` per product: `Organization` (the fleet publisher, with
    `sameAs` → sassmaker.com hub + product GitHub repo) + `SoftwareApplication`
    or `WebSite` (per-product `schemaType` registry field, default
    `SoftwareApplication`).
  - Injects it into the product's HTML head as an idempotent marked block
    (`<!-- fleet-jsonld:start/end -->`) in a registry-declared `headFile`
    (Astro base layout, or `index.html` for SPA/static stacks).
  - For `opennext` products (JSX layouts — no safe text injection), emits the
    snippet to `fleet-ops/out/jsonld/<id>.html` for manual/agent-assisted
    insertion; the audit tool closes the loop.
- Registry gains optional per-product fields: `headFile`, `schemaType`,
  `sameAs` (extra links).
- `agent-index-audit.mjs` gains a reported (non-required) `jsonld` check:
  homepage HTML must contain exactly one parseable
  `application/ld+json` block naming the product.

## Out of scope

- Page-level schema (Article/FAQPage/AggregateRating/ScholarlyArticle etc.) —
  per-product editorial work, tracked as separate product tasks.
- Fixing rolepatch's duplicate JSON-LD blocks (covered by this change only in
  that the injected block replaces registry-marked content; removing the
  legacy hand-written blocks is a rolepatch task in apply).
- Deploys. Apply writes files into product repos; each product deploys
  manually per fleet policy.

## Risks

- Head-file injection into 12+ repos echoes the karte worker-patch incident.
  Mitigations: marked-block idempotence, per-file parse check after write
  (block must re-extract as valid JSON; Astro/HTML file must still contain
  balanced head tags), `--dry-run` first, and per-product `--id` rollout.
- Wrong/duplicate entity signals if a product keeps a hand-written block —
  apply tasks include a grep for pre-existing `application/ld+json` per
  product and explicit reconciliation.
