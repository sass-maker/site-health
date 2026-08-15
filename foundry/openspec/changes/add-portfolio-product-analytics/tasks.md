## 1. Shared event contract

- [ ] 1.1 Define the 5-event taxonomy (`page_view`, `signup`, `activated`, `core_action`, `returned`) with `project_id` property and `action` sub-property for `core_action`.
- [ ] 1.2 Document the event contract in `foundry/ops/docs/` so every product can implement it consistently.
- [ ] 1.3 Audit existing PostHog instrumentation in RolePatch, Karte, and Drank against the 5-event contract and record gaps.
- [ ] 1.4 Upgrade RolePatch to emit `page_view` (currently emits 4 of 5 events).
- [ ] 1.5 Upgrade Karte to emit `page_view` (currently emits 4 of 5 events).
- [ ] 1.6 Upgrade Drank from error-monitoring-only to the full 5-event taxonomy.

## 2. Outcome store extension

- [ ] 2.1 Add `user-metrics` family to `FAMILY_CONTRACTS` in `visibility-outcome-store.mjs` with providers `posthog-insights` and `d1-aggregate`.
- [ ] 2.2 Define metric contracts for Visitors, Identified users, Accounts, Activation rate, D1 retention, D7 retention, and Core actions.
- [ ] 2.3 Add validation tests for the new family covering valid observations, unknown metrics, out-of-range percents, and duplicate ids.
- [ ] 2.4 Verify existing families (search, ai-crawl, ai-referral, web-traffic, web-vitals) remain unaffected.

## 3. PostHog aggregate collector

- [ ] 3.1 Create `foundry/ops/lib/posthog-outcomes.mjs` with an Insights API reader that groups by `project_id` property over a 7-day window.
- [ ] 3.2 Create `foundry/ops/scripts/posthog-outcomes-collect.mjs` following the `cloudflare-outcomes-collect.mjs` shape (read canonical projects, collect, validate, append to ledger).
- [ ] 3.3 Map PostHog Insights results to the `user-metrics` metric labels (Visitors, Identified users, Activation rate, D1/D7 retention, Core actions).
- [ ] 3.4 Add bounded failure handling for rate limits, missing project key, and products with no PostHog events.
- [ ] 3.5 Add focused tests for the collector with fixture PostHog API responses.

## 4. D1 aggregate collectors

- [ ] 4.1 Create `foundry/ops/lib/d1-outcomes.mjs` with a shared aggregate-query template (signup, activated, core_action, returned counts).
- [ ] 4.2 Create `foundry/ops/scripts/d1-outcomes-collect.mjs` that runs read-only aggregate SQL via `wrangler d1 execute` or the D1 REST API.
- [ ] 4.3 Add per-product query mappings for the 12 D1-backed products (rolepatch, karte, calorie, setline, starboard, significanthobbies, reader, swe-interview-prep, knowledge-base, email-manager, free-ai, high-signal).
- [ ] 4.4 Map D1 aggregate results to the `user-metrics` metric labels (Accounts, Activation rate, D1/D7 retention, Core actions).
- [ ] 4.5 Add bounded failure handling for missing D1 access, unknown tables, and products without a D1 database.
- [ ] 4.6 Add focused tests for the collector with fixture D1 query results.

## 5. Fleet Console Product Analytics page

- [ ] 5.1 Add `product-analytics.astro` to the Fleet Console pages under the Metrics group.
- [ ] 5.2 Extend Founder Control (`founder-control.mjs`) to project `user-metrics` observations from the ledger.
- [ ] 5.3 Render a per-product directory with visitors, identified users, accounts, activation rate, D1/D7 retention, core actions, observation date, and provider boundary.
- [ ] 5.4 Show "Not measured" explicitly for products with no `user-metrics` evidence; never infer zero.
- [ ] 5.5 Add an Update control that triggers the PostHog and D1 collectors.
- [ ] 5.6 Ensure the page is keyboard operable and readable at 390, 768, and 1,440 CSS pixels.
- [ ] 5.7 Add the Product Analytics link to the Metrics navigation group.

## 6. Privacy validation

- [ ] 6.1 Verify no PII enters the ledger: PostHog distinct IDs are opaque hashes, D1 queries return counts only.
- [ ] 6.2 Verify bundles are credential-free: no API tokens, cookies, or raw provider payloads stored.
- [ ] 6.3 Verify the PostHog project key used by the collector is the same public client-side key already shipped in products.
- [ ] 6.4 Add a validation check that rejects any `user-metrics` observation containing free-text user content.
- [ ] 6.5 Document the privacy model in the event contract doc.

## 7. Pilot and rollout

- [ ] 7.1 Pilot: collect and project RolePatch (authenticated, server-confirmed events + D1).
- [ ] 7.2 Pilot: collect and project Karte (authenticated, D1-backed).
- [ ] 7.3 Pilot: collect and project Drank (existing PostHog, taxonomy upgraded).
- [ ] 7.4 Pilot: collect and project one static site (page_view only via PostHog).
- [ ] 7.5 Pilot: collect and project one local-first product (D1-only or opt-in PostHog).
- [ ] 7.6 Roll out to P1 products (codevetter, pace, posttrainllm).
- [ ] 7.7 Roll out to active P2 products with PostHog or D1 evidence.
- [ ] 7.8 Roll out to remaining maintained products; show "Not measured" until instrumented.

## 8. Closure

- [ ] 8.1 Run focused collector, store, Founder Control, and Console checks.
- [ ] 8.2 Run strict OpenSpec validation and the Fleet Console build.
- [ ] 8.3 Verify no secrets or PostHog API keys are committed in proposal or implementation artifacts.
- [ ] 8.4 Close issue #348 and update `PROJECT_STATUS.md` with shipped product truth.
