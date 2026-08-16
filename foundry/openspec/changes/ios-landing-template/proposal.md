# iOS landing template

## Why

Significant Hobbies iOS apps keep reinventing the same public surface
(Indulge, Setline, now Kith). Indulge already has the right page set and
story shape. Copying it by hand drifts. A fill-in template keeps structure
stable and lets each app keep its own tokens and copy.

## What

- A copyable Astro site at `foundry/ops/templates/ios-landing`
- One `site.config.ts` owns name, tokens, copy, screenshots, legal, and
  TestFlight gating
- Same routes as Indulge: home, privacy, support, terms, accessibility,
  TestFlight, `llms.txt`, `/index.md`, `/api/ai`, robots, sitemap
- Kith is the first consumer (`kith/site`)

## Out

- Rewriting Indulge in place
- Deploying Kith to Cloudflare
- App Store buttons or a paid pricing page
