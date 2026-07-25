## Baseline evidence (task 1.1 / 1.2 / 1.3)

Captured 2026-07-19 from clean `main` of each repo. No private payloads
recorded — only runtime, domain, indexing, analytics, and CTA/activation
evidence.

### Personal website — `sarthakagrawal.dev`

| Field | Value |
| --- | --- |
| Repo | `/Users/sarthak/Desktop/portfolio` |
| Runtime | Astro 5 static · React 19 islands · Tailwind v4 · MDX |
| Deploy | Cloudflare Pages project `sarthakagrawal` (`pages_build_output_dir: dist`) |
| Canonical | `https://sarthakagrawal.dev` (`astro.config.mjs` `site` + `src/data/site.ts` `url`) |
| Indexing | `public/llms.txt`, `public/robots.txt` (Allow + Sitemap), `@astrojs/sitemap` |
| Headers | `public/_headers` (nosniff, DENY frame, referrer-policy, permissions-policy, HTML/asset caching) |
| Errors | N/A — fully static, no server runtime |
| Analytics | None — static site, no PostHog/Plausible/GA |
| Privacy data | None collected (no backend, no auth, no DB) |
| Spotlight sync | `node fleet-ops/scripts/sync-spotlight-products.mjs --check` → OK (5 products) |
| Four-product presentation | `src/data/spotlight-products.ts` lists CodeVetter, PostTrainLLM, HeyPace, HiSignal, SaaS Maker; `src/pages/index.astro` renders all 5 with SaaS Maker labeled "open the directory →" |
| SaaS Maker directory link | Present (`https://sassmaker.com`, distinct CTA copy) |
| Meaningful CTA | Hero: "See what I'm building" → `#focus`; per-product cards: "view product →" / "open the directory →" (SaaS Maker) |
| Activation evidence | GAP — no server-side activation event possible on a static site; outbound click is the activation. No analytics instrumentation records it. |

### RolePatch — `rolepatch.com`

| Field | Value |
| --- | --- |
| Repo | `/Users/sarthak/Desktop/fleet/rolepatch` |
| Runtime | Next.js 16 (App Router) · React 19 · Cloudflare Workers via `@opennextjs/cloudflare` · D1 · better-auth |
| Deploy | Cloudflare Worker `resume-tailor` (manual `pnpm deploy`) |
| Canonical | `https://rolepatch.com` (`agent-edge.mjs` surface) |
| Indexing | `public/llms.txt`, `public/llms-full.txt`, `public/robots.txt`, `src/app/sitemap.ts`, `/api/ai` via `agent-edge.mjs` |
| Errors | `src/app/error.tsx`, `src/app/global-error.tsx`, `src/lib/foundry-monitoring.ts` (captureError, capturePageCrash, captureAuthFailure) |
| Analytics | 4-event taxonomy (`src/lib/analytics.ts`): `signup`, `activated`, `core_action` (`tailor_completed` / `cover_letter_generated` / `fit_score_run`), `returned`. PostHog project `phc_qgiAarw4…`. Server-side capture for server actions. |
| Foundry link | `foundry.json` linked (`slug: resume-tailor-modh3a5j`, `projectId: 565ea478…`) |
| Privacy data | Resume, JD, stash, cover-letter, apply packets stored in D1 per user (`WHERE user_id = ?`); guest mode writes to localStorage only. Activation events carry `project_id` + `action` only — no resume/JD text. |
| Meaningful CTA | Marketing program CTA: "Tailor a resume or browse jobs" |
| Activation | First successful privacy-safe tailor: `tailor-action.ts` calls `trackCoreAction('tailor_completed')` then `trackActivated(userId)` only if no prior `tailored_resumes` row. No resume/JD content in either event. |
| Activation evidence | Present — `trackActivated` + `trackCoreAction` wired. GAP: no contract test asserting private payloads never enter activation events. |

### Karte — `karte.cc`

| Field | Value |
| --- | --- |
| Repo | `/Users/sarthak/Desktop/fleet/karte` |
| Runtime | Next.js 16 (App Router, React Compiler ON) · Cloudflare Workers via `@opennextjs/cloudflare` · Turso (libSQL) + D1 (auth) · R2 · Analytics Engine |
| Deploy | Cloudflare Worker `linkchat` (manual `pnpm deploy:cf`) |
| Canonical | `https://karte.cc` (`agent-edge.mjs` surface) |
| Indexing | `public/llms-full.txt`, `public/robots.txt`, `src/app/sitemap.ts`, `/api/ai` + `llms.txt` + `index.md` via `agent-edge.mjs` |
| Errors | `src/app/error.tsx`, `src/app/global-error.tsx`, `src/lib/foundry-monitoring.ts` (captureError, capturePageCrash) |
| Analytics | 4-event taxonomy (`src/lib/analytics-events.ts`): `signup`, `activated`, `core_action` (`page_published` / `mode_generated`), `returned`. Browser-only via `posthog-js`. |
| Foundry link | `foundry.json` linked (`slug: linkchat-modh35vp`, `projectId: 6a73cf70…`) |
| Privacy data | Profile fields, links, chat/contact bodies, AI mode generations stored in Turso/D1/R2 per user. Activation events carry `project_id` + `action` only — no profile/chat content. |
| Meaningful CTA | Marketing program CTA: "Create an AI profile" |
| Activation | First published profile: `page-settings.tsx` calls `trackCoreAction('page_published')` + `trackActivated()`. Mode generations: `page-toggles.tsx` and `encyclopedia-editor.tsx` call `trackCoreAction('mode_generated')`. No profile/chat content in any event. |
| Activation evidence | Present — `trackActivated` + `trackCoreAction` wired. GAP: no contract test asserting private payloads never enter activation events. |

### Foundry umbrella evidence schema

| Field | Value |
| --- | --- |
| Exists | No — no named umbrella evidence schema for sanitized aggregate status from these 3 repos. |
| Closest | `fleet-ops/lib/marketing-snapshot.mjs` (marketing-program snapshot) + PostHog 4-event taxonomy. |
| GAP | Define a minimal umbrella evidence schema for sanitized aggregate status (build/live/indexing/CTA/activation/error) from portfolio + rolepatch + karte, with a validator. No deploy. |

### Quiet experiments

| Field | Value |
| --- | --- |
| Registry | `fleet-ops/config/marketing-program.json` — rolepatch + karte are `evergreen` mode with instagram/youtube channels. |
| Campaigns | `reel-pipeline/config/project-campaigns.json` — 2 karte + 2 rolepatch campaigns with brandSlug, canonicalUrl, destinationUrl, cta, seoKeywords. |
| Bounded fields | GAP — campaigns do NOT declare `expiry`, `budget`, `metric`, `stopRule`, `approvalState`. No validator enforces them. |
| Launch state | Nothing launched from this change. |

### Cross-cutting gaps to close

1. **Portfolio**: contract test for 4-product + SaaS Maker directory presentation (no analytics instrumentation — static site, out of scope to add).
2. **RolePatch**: privacy contract test for tailor activation events.
3. **Karte**: privacy contract test for profile/trust-card activation events.
4. **fleet-ops**: umbrella evidence schema + validator (config + lib, no deploy).
5. **fleet-ops**: bounded quiet experiment definitions + validator (config + lib, no launch).
