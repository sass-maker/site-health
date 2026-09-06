Method: Bounded live browser pass (headless Chromium via Playwright), one
navigation + one safe interaction per product, against the canonical origin
from the `public-product-smoke` manifest. Read-only. No load testing, no
repeated hits on any rate-limited endpoint.

# Public product smoke — repair queue

Generated: 2026-09-05

## Scope and method

- 45 products from the `public-product-smoke` manifest
  (`saas-maker/tooling/skills/public-product-smoke/scripts/build-audit-manifest.mjs`),
  not the six SAR-2 baseline surfaces only.
- One page load to `networkidle` (or 8s timeout) plus one safe interaction
  (search box, else a non-mutating nav/CTA click) per product.
- Verdicts: `fail` / `degraded` / `pass` / `not_verified`, per the skill's
  rubric. Console-error counts alone were **not** treated as evidence of a
  defect unless corroborated by a slow load, a failed interaction, a failed
  second-surface navigation, or the shared PostHog defect below — raw error
  counts are noisy and several products log benign third-party warnings.

## Results: 0 fail, 7 degraded, 38 pass

No product returned a blank page, a 5xx, or a genuine rate-limit/challenge
block. `free-ai` (ai-gateway.sassmaker.com) tripped the automated "rate limit"
text marker, but that's the product's own marketing copy about its gateway
rate limits — not an actual block. Reclassified `pass`.

### Degraded — ranked by impact

1. **Shared PostHog analytics defect (fleet-wide, 8 products)** —
   `codevetter`, `chatgpt-memory-insights`, `knowledge-base`, `setline`,
   `veg-protein-food`, `app-health`, `local-ai-video-studio`, `field-track`.
   Console shows `t.posthog.init is not a function` plus a CORS block
   fetching `us.i.posthog.com/array.js`. Not customer-visible, but it's a
   fleet-wide analytics blind spot — traffic/behavior data isn't landing for
   these 8. Likely one shared snippet/version, not 8 separate bugs.
   **Next action:** check the common PostHog loader used by these products for
   a breaking change; fix once, verify it clears across all 8.

2. **Primary CTA unreachable — `agent-office`
   (office-os.sassmaker.com)** — automated click on the landing page's
   primary control failed 3 retries over ~1.6s; Playwright reported the
   element "outside of the viewport." **Next action:** manually confirm the
   CTA is reachable without extra scroll/interaction; re-run the automated
   pass once to rule out a script timing artifact before treating as a real
   defect.

3. **Primary CTA unreachable — `local-ai-video-studio`
   (local-ai-video-studio.sassmaker.com)** — identical "outside of the
   viewport" click-timeout signature as `agent-office`. **Next action:** same
   as above; worth checking whether both share a layout component.

4. **Search input present but not interactable — `chatgpt-memory-insights`
   (chatgpt.significanthobbies.com)** — selector matched a search input in
   the DOM, but Playwright reported it "not visible" after retries.
   **Next action:** confirm whether search is intentionally hidden until a
   toggle/scroll (benign) or is an orphaned/broken input.

5. **Search input present but not interactable — `reddit-insights`
   (reddit-insights.highsignal.app)** — same "not visible" search signature;
   page also logs a 404 resource load. **Next action:** confirm search
   affordance and investigate the console 404.

6. **Slow load — `india-standards`
   (india-standards.significanthobbies.com)** — 13.6s to `networkidle`. Page
   itself renders correctly and the interaction succeeded; page also logs
   404s. **Next action:** profile network-idle stragglers.

7. **Slow load — `research-papers` (papers.highsignal.app)** — 12.2s to
   `networkidle`. Renders and interacts correctly. **Next action:** profile
   stragglers; console also shows an unrelated Clarity/undefined-property
   error worth a separate look.

8. **Slow load — `veg-protein-food`
   (veg-protein-food.significanthobbies.com)** — 13.2s to `networkidle`.
   Renders and interacts correctly; also one of the 8 PostHog-defect
   products above.

### Passing (38)

`ai-game`, `anchor`, `anime-list`, `calorie`, `chess`, `drank`, `free-ai`,
`gitstat`, `journal`, `kith`, `looptv`, `motion`, `on-record`,
`open-historia`, `pace`, `posttrainllm`, `psi-swarm`, `reader`, `rolepatch`,
`saas-maker`, `significanthobbies`, `what-it-takes-to-win`, and the remaining
console-error-only products where the error did not corroborate any
user-visible symptom (`karte`, `mashup`, `materia`, `setline`, `starboard`,
`swe-interview-prep`, `sarthakagrawal-personal`, `issue-pages`, `email-manager`,
`everythingrated`, `field-track`, `high-signal`, `knowledge-base`, `live`,
`app-health`, `codevetter`) — see the JSON report for per-product detail
including which of these also carry the shared PostHog defect.

## Not covered this pass

- Deep multi-surface journeys (this pass tests one load + one interaction per
  product, not the full 6-surface walk the skill allows for a manual audit).
- Any `required-user` / `required-service` authenticated core — guest-only
  pass, consistent with the skill's read-only, no-sign-in contract.

Full per-product JSON: `public-product-smoke-latest.json` in this directory.
