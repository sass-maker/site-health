## 1. Confirm source truth and design baseline

- [x] 1.1 Inspect CodeVetter's token-usage persistence and tests; document the authoritative lifetime/day fields and every field excluded to prevent double-counting.
- [x] 1.2 Determine whether CodeVetter stores any release-safe coarse geography; explicitly record baseline-only launch behavior when it does not.
- [x] 1.3 Create the SaaS Maker `preserve` design-review receipt and capture the existing homepage at 390, 768, and 1440 pixels.

## 2. Build the daily snapshot pipeline

- [x] 2.1 Define runtime-validated private seed and public projection schemas with an ISO snapshot date, monotonic totals, per-project sums, country/project counts, pulse buckets, and provenance boundaries.
- [x] 2.2 Implement the guarded Fleet seed/projection command with deterministic output, same-day idempotency, regression rejection, aggregate-floor enforcement, and an explicit audited correction path.
- [x] 2.3 Add fixtures and focused tests for the first seed, CodeVetter-scale totals, daily advancement, estimates, decreasing totals, conflicting dates, inconsistent sums, forbidden fields, sparse geography, and deterministic reruns.
- [x] 2.4 Add the ignored private-seed location and ensure only the privacy-safe projection is tracked or included in builds.

## 3. Establish the CodeVetter baseline

- [x] 3.1 Implement the focused local adapter/export that reads CodeVetter's authoritative usage without modifying its data.
- [x] 3.2 Generate a private launch seed and reconcile its total against CodeVetter's existing product UI or tests.
- [x] 3.3 Generate the initial public projection with accurate CodeVetter coverage wording and only verified geography.

## 4. Build the globe chapter

- [x] 4.1 Add a semantic `TokenWorld` Astro component after the studio hero with the exact title “TOKENS SPENT FOR THE WORLD,” the lifetime counter, today/snapshot total, countries served, projects contributing, and pulse disclosures.
- [x] 4.2 Add the checked-in coarse globe geometry and a dependency-free Canvas 2D renderer with slow rotation, an exact monotonic counter, bounded pulse replay, visibility pausing, teardown, and capped rendering work.
- [x] 4.3 Add static, reduced-motion, missing-Canvas, and missing-snapshot states that preserve the complete information and never display illustrative totals as current data.
- [x] 4.4 Integrate the chapter into the existing steel-and-glass visual system at 390, 768, and 1440 pixels without changing navigation, routes, anchors, legal copy, catalog content, or wordmark.
- [x] 4.5 Update homepage Markdown and agent-readable output with the same metric definition, coverage start, snapshot date, and supporting measures.

## 5. Verify and review

- [x] 5.1 Run the projection tests, public-product boundary tests, public-directory typecheck, and production build.
- [x] 5.2 Exercise baseline-only, multi-project, stale-date, reduced-motion, keyboard, touch/coarse-pointer, missing-WebGL, and no-script behavior through browser and projection-fixture coverage.
- [x] 5.3 Capture after screenshots at 390, 768, and 1440 pixels and measure layout stability and bounded Canvas behavior.
- [x] 5.4 Run Impeccable critique, fix every P0/P1, run polish and audit, run the design detector once, and fill the design-review receipt with passing evidence.
- [x] 5.5 Present the completed section for owner `keep`, `close`, `wrong-lane`, or `delegated` feedback and validate the final receipt.

## 6. Prepare daily operation and release

- [x] 6.1 Document the short daily seed command, required authoritative inputs, privacy checklist, expected generated diff, and correction procedure.
- [x] 6.2 Update the relevant project status/spec surfaces only with shipped truth and validate the OpenSpec change strictly.
- [x] 6.3 Prepare the static release for separate explicit deployment approval; do not deploy as part of implementation unless requested.

## 7. Upgrade the globe presentation

- [x] 7.1 Add pinned `three@0.185.1` after dependency-health and exact-version bundle review; do not add models, textures, post-processing, or another rendering package.
- [x] 7.2 Replace the Canvas 2D implementation with one procedural Three.js scene containing dimensional land points, an ocean shell, steel meridians, atmosphere, and verified pulse markers.
- [x] 7.3 Lift the globe composition slightly toward the heading and add a visible source-derived `Last updated at` label alongside the source snapshot day.
- [x] 7.4 Preserve complete semantic HTML plus reduced-motion, save-data, missing-WebGL, context-loss, offscreen, hidden, and teardown behavior.
- [x] 7.5 Measure the built client payload and browser behavior at 390, 768, and 1440; recapture evidence, run critique/polish/audit, and request fresh owner feedback before release.
