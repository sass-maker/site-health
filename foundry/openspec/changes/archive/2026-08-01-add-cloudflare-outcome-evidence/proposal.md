# Add Cloudflare outcome evidence

## Why

Fleet Console already records Google Search outcomes and synthetic PSI runs,
but Cloudflare's existing provider-native traffic, AI-crawl, referral, and
real-user performance evidence is not collected. The owner must leave the
Console to determine whether products are visited, crawled, or fast for real
users, and current provider links do not open the relevant project property.

## What changes

- Add one read-only, portfolio-wide Cloudflare GraphQL collector driven by the
  canonical public-project registry and the account's live zone inventory.
- Retain bounded Web Analytics traffic/referrer aggregates, AI crawl/referral
  aggregates, and p75 real-user Web Vitals in the existing private outcome
  ledger.
- Show the latest compatible evidence inside AI Awareness, Performance, and
  Marketing, with progressive project detail rather than a new page.
- Add one shared Cloudflare Update action to those pages and direct provider
  links to the relevant Cloudflare zone surface.
- Link each Google Search project to its exact Search Console property.

## Boundaries

- No credentials, raw request logs, IPs, provider payloads, or arbitrary user
  agents are retained.
- No Cloudflare or Google configuration is changed.
- Crawls and referrals remain discovery evidence; they do not count as model
  mentions, recommendations, rankings, or citations.
- Search terms and rankings remain Google Search Console evidence. Domain
  authority remains D-Rank evidence.
- No schedule or deployment is introduced.

## Impact

- Issue: `sass-maker/fleet-workspace#108`
- Runtime: Founder Control local API and Fleet Console only.
- Storage: the existing machine-local visibility outcome ledger.
- Deploy impact: none in this change.
