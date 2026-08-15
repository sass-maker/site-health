## Why

Fleet has no owner-visible analytics page. Product evidence is fragmented across
three incompatible PostHog integrations (Drank: error monitoring only; RolePatch:
isomorphic 4-event taxonomy; Karte: browser-only 4-event taxonomy) and a dozen
authoritative D1 databases that are never aggregated. The owner cannot answer
"how many people used my products this week" without opening each product
individually. Issue #348 is the operational umbrella for closing this gap with
grounded, privacy-safe, portfolio-wide user metrics.

## What Changes

- Extend the existing provider-outcome pattern with a new `user-metrics` family
  in `visibility-outcome-store.mjs` so PostHog aggregates and D1-derived counts
  land in the same private JSONL ledger as Cloudflare and Search Console
  evidence.
- Add a PostHog aggregate collector (`posthog-outcomes-collect.mjs`) that reads
  the shared PostHog project via the Insights API and emits normalized
  visitor, identified-user, account, activation, retention, and core-action
  observations per product.
- Add D1 aggregate collectors for products with authoritative databases
  (rolepatch, karte, calorie, setline, starboard, significanthobbies, reader,
  swe-interview-prep, knowledge-base, email-manager, free-ai, high-signal) that
  emit signup, activated, core_action, and returned counts without exposing PII.
- Codify a shared 5-event taxonomy (`page_view`, `signup`, `activated`,
  `core_action`, `returned`) with a `project_id` property on every event so one
  cross-fleet funnel and retention insight works without custom dashboards.
- Add a new Fleet Console page at `product-analytics.astro` under the Metrics
  group that projects the user-metrics ledger as a per-product directory with
  visitors, identified users, accounts, activation rate, D1/D7 retention, and
  core-action counts, each with observation date and provider boundary.
- Pilot five products first (RolePatch, Karte, Drank, one static site, one
  local-first product), then roll out in attention order: P1 products, active
  P2, remaining maintained.

## Capabilities

### New Capabilities

- `portfolio-product-analytics`: Defines the shared event contract, PostHog
  aggregate collector, D1 database collectors, Fleet Console Product Analytics
  page, and privacy validation that together produce grounded portfolio-wide
  user metrics.

### Modified Capabilities

- `portfolio-strength-console`: Adds Product Analytics as a fifth view under the
  Metrics group, alongside Domains, Google Search, AI Awareness, and
  Performance.

## Impact

This adds a new outcome family to `visibility-outcome-store.mjs`, a new
collector script under `foundry/ops/scripts/`, a new library under
`foundry/ops/lib/`, a new Fleet Console page, and updates to product-side
PostHog instrumentation where the 5-event taxonomy is not yet complete. It uses
the existing shared PostHog project key (already shared across RolePatch,
Karte, and Drank), the existing private JSONL ledger at
`~/.fleet/visibility-outcomes/ledger.jsonl`, and the existing Founder Control
local JSON API. It introduces no new production dependency, no new secrets in
tracked files, no PII in the ledger, and no automatic recurring schedule. The
PostHog project key remains a public client-side key (already embedded in
shipped products); the collector uses the same key with the read-only Insights
API. D1 collectors use existing Wrangler OAuth or `wrangler d1 execute` with
read-only aggregate queries.
