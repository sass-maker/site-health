# Fleet footer compliance ledger

Public baseline generated: 2026-08-27. Source and live qualification updated:
2026-09-01.

## Required footer contract

Every Fleet browser product ends with one shared footer extension beneath any
authored product footer:

1. **Ask AI** — a product-aware prompt launcher for supported AI providers.
2. **Explore more projects** — the Fleet project strip, with the current product
   excluded.

Consumers load the project-strip script first and the Ask AI script second. The
Ask AI loader owns the final `fleet-footer-extension` composition, so the two
features read as one intentional footer rather than two unrelated widgets. An
authored product footer remains above the extension. Embedded pages and
non-browser products are excluded.

## Portfolio result

- **56 / 56 canonical records classified:** 52 visual product identities, 3
  non-applicable identities, and 1 shared landing factory.
- **51 / 52 visual identities source-ready for unified composition.** Every
  active visual identity has one project strip followed by one Ask AI
  integration on its owning surface, either directly or through the iOS
  landing factory. Retired Protein Index is the sole exception: its source
  retains the former composition opt-out, and its repository requires explicit
  reactivation before edits.
- **1 / 1 shared factory source-ready.** `ios-landings` supplies the contract to
  Setline, Journal, Kith, Motion, and Anchor. Calorie carries a checked-in Worker
  snapshot of the same factory output.
- **3 / 3 exclusions are explicit:** ChatGPT Connections and Companion Robot do
  not have browser surfaces; Mobile Dev Cockpit is a retired native app.
- **45 / 45 applicable active public visual origins are live-qualified.** Each
  returned HTTP 200, mounted exactly one project strip and one Ask AI surface
  with open shadow roots, and added no horizontal overflow at 390, 768, or
  1440 px. Six slower applications passed on their single permitted retry
  after full app load.
- The current catalog exposes 47 URLs across the included live-product
  manifest. Two are not footer targets: `search.sassmaker.com` is the
  Cloudflare Access-protected Knowledge Base service surface, and
  `aliveville.com` belongs to parked AliveVille, which the owner asked to
  leave unchanged and which has no required footer-surface record.
- Both hosted loader assets return HTTP 200 JavaScript from `sassmaker.com`;
  the Ask AI loader owns the composed-extension runtime used by compatible
  consumers, while consumers that intentionally opt out of wrapper composition
  still render the two adjacent shared surfaces.
- No active Fleet consumer retains the former `data-compose="false"` opt-out.
  The only source occurrence is Protein Index's retired landing.
- The exact source claim is repeatable from SaaS Maker with
  `pnpm tooling:footers`. The generic public audit reads the private
  `apps/backend/config/footer-surfaces.json` receipt here, so Tooling does not
  duplicate Site Health's project inventory.

### Pre-rollout public HTML baseline (2026-08-27)

This table is retained as the historical starting point. The live production
receipt below supersedes these counts.

| Public state | Origins | Meaning |
| --- | ---: | --- |
| Project strip only | 17 | The live page has no Ask AI loader. |
| Ask AI only | 1 | SaaS Maker loads only its current AI footer. |
| Both tags; current AI loader suppresses the strip | 7 | Both scripts exist in HTML, but only Ask AI remains rendered. |
| Legacy split; both remain visible | 2 | Email Manager and What It Takes to Win still use the old opt-out live. |
| Neither integration | 19 | Neither shared footer feature is present in live HTML. |
| **Unified composition** | **0** | Requires the shared loader release and consumer releases. |

### Current live production receipt (2026-09-01)

All rows below passed the same bounded read-only journey: fetch the canonical
page, allow normal hydration, verify one mounted `portfolio-project-strip` and
one mounted `ai-chat-footer`, confirm both custom elements have rendered shadow
roots and positive height, then resize the same page to 390, 768, and 1440 px
and confirm that the shared surfaces add no horizontal overflow.

| Product | Public origin | HTTP | 390 / 768 / 1440 |
| --- | --- | ---: | --- |
| CodeVetter | `codevetter.com` | 200 | Pass |
| HeyPace | `heypace.app` | 200 | Pass |
| PostTrainLLM | `posttrainllm.com` | 200 | Pass |
| Live | `live.significanthobbies.com` | 200 | Pass |
| SaaS Maker | `sassmaker.com` | 200 | Pass |
| GitStat | `git.significanthobbies.com` | 200 | Pass |
| Email Manager | `mail.significanthobbies.com` | 200 | Pass |
| Memory Map | `chatgpt.significanthobbies.com` | 200 | Pass |
| Free AI | `ai-gateway.sassmaker.com` | 200 | Pass |
| PSI Swarm | `performance.sassmaker.com` | 200 | Pass |
| High Signal | `highsignal.app` | 200 | Pass |
| High Signal Podcasts | `podcasts.highsignal.app` | 200 | Pass |
| IssuePages | `issues.sarthakagrawal.dev` | 200 | Pass |
| EverythingRated | `ratings.highsignal.app` | 200 | Pass |
| Research Papers | `papers.highsignal.app` | 200 | Pass |
| Materia | `materia.significanthobbies.com` | 200 | Pass |
| Knowledge Base | `knowledgebase.sassmaker.com` | 200 | Pass |
| Significant Hobbies | `significanthobbies.com` | 200 | Pass |
| India Standards | `india-standards.significanthobbies.com` | 200 | Pass |
| India Numbers | `india-numbers.significanthobbies.com` | 200 | Pass |
| Anime List | `anime.significanthobbies.com` | 200 | Pass |
| Chess | `chess.significanthobbies.com` | 200 | Pass |
| LoopTV | `tv.significanthobbies.com` | 200 | Pass |
| Reader | `read.significanthobbies.com` | 200 | Pass |
| SWE Interview Prep | `learn.significanthobbies.com` | 200 | Pass |
| Calorie | `calorie.significanthobbies.com` | 200 | Pass |
| Setline | `setline.significanthobbies.com` | 200 | Pass |
| Journal | `journal.significanthobbies.com` | 200 | Pass |
| Kith | `kith.significanthobbies.com` | 200 | Pass |
| RolePatch | `rolepatch.com` | 200 | Pass |
| Karte | `karte.cc` | 200 | Pass |
| Starboard | `starboard.codevetter.com` | 200 | Pass |
| Recipe Index | `veg-protein-food.significanthobbies.com` | 200 | Pass |
| App Health | `health.sassmaker.com` | 200 | Pass |
| App Health ingest surface | `ingest.sassmaker.com` | 200 | Pass |
| Mashup | `mashup.highsignal.app` | 200 | Pass |
| Motion | `motion.significanthobbies.com` | 200 | Pass |
| Open Historia | `historia.aliveville.com` | 200 | Pass |
| What It Takes to Win | `paths.significanthobbies.com` | 200 | Pass |
| Sarthak Agrawal | `sarthakagrawal.dev` | 200 | Pass |
| Office OS | `office-os.sassmaker.com` | 200 | Pass |
| Local AI Video Studio | `local-ai-video-studio.sassmaker.com` | 200 | Pass |
| Field Track | `field-track.sassmaker.com` | 200 | Pass |
| Reddit Insights | `reddit-insights.highsignal.app` | 200 | Pass |
| Anchor | `anchor.significanthobbies.com` | 200 | Pass |

The hosted `project-strip.js` asset returned 200 `text/javascript` (23,055
bytes) and the hosted `ai-chat-footer.js` asset returned 200 `text/javascript`
(48,483 bytes). CodeVetter emitted an unrelated PostHog initialization error;
both footer surfaces still mounted and passed all three responsive widths.

## Complete canonical ledger

“Source-ready” means the checked-out source satisfies the new contract. It does
not by itself claim that the linked public page has been released. The
per-product live-state descriptions below preserve the 2026-08-27 baseline;
the dated production receipt above is the current live authority.

| Priority | Product | Owning browser surface | Source | Public page and 2026-08-27 state |
| --- | --- | --- | --- | --- |
| P1 | CodeVetter | [Astro landing layout](/Users/sarthak/Desktop/fleet/codevetter/apps/landing-page-astro/src/layouts/Layout.astro) | Source-ready | [codevetter.com](https://codevetter.com/) — project strip only |
| P1 | HeyPace | [Website base layout](/Users/sarthak/Desktop/fleet/pace/website/src/layouts/BaseLayout.astro) | Source-ready | [heypace.app](https://heypace.app/) — project strip only |
| P1 | PostTrainLLM | [Browser default layout](/Users/sarthak/Desktop/fleet/posttrainllm/browser/src/layouts/Default.astro) | Source-ready | [posttrainllm.com](https://posttrainllm.com/) — project strip only |
| P2 | Site Health | [Dashboard layout](/Users/sarthak/Desktop/fleet/site-health/apps/web/src/components/DashboardLayout.astro) | Source-ready | No public origin — local application |
| P2 | Live | [Landing layout](/Users/sarthak/Desktop/fleet/live/landing-astro/src/layouts/Layout.astro) | Source-ready | [live.significanthobbies.com](https://live.significanthobbies.com/) — project strip only |
| P2 | ChatGPT Connections | [Repository readme](/Users/sarthak/Desktop/fleet/chatgpt-connections/README.md) | N/A — protocol/API product | No browser surface |
| P2 | SaaS Maker | [Showcase layout](/Users/sarthak/Desktop/fleet/saas-maker/apps/showcase/src/layouts/Layout.astro) | Source-ready; owns shared loaders | [sassmaker.com](https://sassmaker.com/) — Ask AI only |
| P2 | GitStat | [Landing document](/Users/sarthak/Desktop/fleet/gitstat/index.html) | Source-ready | [git.significanthobbies.com](https://git.significanthobbies.com/) — neither live |
| P2 | Reel Pipeline | [Anonymous-video UI](/Users/sarthak/Desktop/fleet/reel-pipeline/src/anonymous-video/ui.js) | Source-ready | No public landing; protected Worker |
| P4 | Mobile Dev Cockpit | [Native app source](/Users/sarthak/Desktop/fleet/mobile-dev-cockpit/apps/mobile/src/app/index.tsx) | N/A — retired native app | No browser surface |
| P4 | Drank | [Application layout](/Users/sarthak/Desktop/fleet/drank/app/layout.tsx) | Source-ready | [domains.sassmaker.com](https://domains.sassmaker.com/) — project strip only |
| P4 | Email Manager | [Landing layout](/Users/sarthak/Desktop/fleet/email-manager/landing-astro/src/layouts/Layout.astro) | Source-ready | [mail.significanthobbies.com](https://mail.significanthobbies.com/) — legacy split; both visible |
| P2 | Memory Map | [Landing page](/Users/sarthak/Desktop/fleet/chatgpt-memory-insights/src/pages/index.astro) | Source-ready: authored product footer plus Ask AI and project-strip loaders on Home, About, and Changelog | [chatgpt.significanthobbies.com](https://chatgpt.significanthobbies.com/) — project strip only until the shared footer runtime and this source are released |
| P4 | Free AI | [Site page](/Users/sarthak/Desktop/fleet/free-ai/site/src/pages/index.astro) | Source-ready | [ai-gateway.sassmaker.com](https://ai-gateway.sassmaker.com/) — project strip only |
| P4 | PSI Swarm | [Web page](/Users/sarthak/Desktop/fleet/psi-swarm/web/src/pages/index.astro) | Source-ready | [performance.sassmaker.com](https://performance.sassmaker.com/) — both tags; strip suppressed |
| P2 | High Signal | [Marketing layout](/Users/sarthak/Desktop/fleet/high-signal/apps/web/landing-astro/src/layouts/Layout.astro) and [application layout](/Users/sarthak/Desktop/fleet/high-signal/apps/web/src/app/layout.tsx) | Source-ready on both surfaces with authored product-state footers and both shared loaders | [highsignal.app](https://highsignal.app/) — project strip only |
| P2 | High Signal Podcasts | [Web base layout](/Users/sarthak/Desktop/fleet/on-record/apps/web/src/layouts/Base.astro) | Source-ready with an authored evidence and product-state footer followed by the project-strip and Ask AI loaders | [podcasts.highsignal.app](https://podcasts.highsignal.app/) — neither live |
| P4 | IssuePages | [HTML templates](/Users/sarthak/Desktop/fleet/issue-pages/src/ui/templates.ts) | Source-ready on full pages; embeds excluded | [issues.sarthakagrawal.dev](https://issues.sarthakagrawal.dev/) — neither live |
| P4 | EverythingRated | [Application layout](/Users/sarthak/Desktop/fleet/everythingrated/apps/web/src/app/layout.tsx) | Source-ready | [ratings.highsignal.app](https://ratings.highsignal.app/) — neither live |
| P2 | Research Papers | [Web page](/Users/sarthak/Desktop/fleet/research-papers/web/src/pages/index.astro) | Source-ready with an authored corpus and product-state footer followed by the project-strip and Ask AI loaders | [papers.highsignal.app](https://papers.highsignal.app/) — project strip only until this source is released |
| P4 | Materia | [Base layout](/Users/sarthak/Desktop/fleet/materia/src/layouts/BaseLayout.astro) | Source-ready | [materia.significanthobbies.com](https://materia.significanthobbies.com/) — neither live |
| P2 | Knowledge Base | [Landing page](/Users/sarthak/Desktop/fleet/knowledge-base/landing-astro/src/pages/index.astro) and [shared layout](/Users/sarthak/Desktop/fleet/knowledge-base/landing-astro/src/layouts/Layout.astro) | Source-ready with an authored access and commercial-state footer followed by the project-strip and Ask AI loaders | [knowledgebase.sassmaker.com](https://knowledgebase.sassmaker.com/) — both tags; strip suppressed until the shared footer runtime is released |
| P2 | Significant Hobbies | [Hub page](/Users/sarthak/Desktop/fleet/significanthobbies/services/hub-backend/src/hub.ts) and [apex agent edge](/Users/sarthak/Desktop/fleet/live/agent-edge.mjs) | Source-ready with an authored owner-state footer followed by the project-strip and Ask AI loaders | [significanthobbies.com](https://significanthobbies.com/) — neither shared footer integration is live |
| P4 | India Standards | [Application layout](/Users/sarthak/Desktop/fleet/india-standards/app/layout.tsx) | Source-ready | [india-standards.significanthobbies.com](https://india-standards.significanthobbies.com/) — project strip only |
| P4 | Anime List | [Landing document](/Users/sarthak/Desktop/fleet/anime-list/index.html) | Source-ready | [anime.significanthobbies.com](https://anime.significanthobbies.com/) — project strip only |
| P4 | Chess | [Landing document](/Users/sarthak/Desktop/fleet/chess/index.html) | Source-ready | [chess.significanthobbies.com](https://chess.significanthobbies.com/) — project strip only |
| P4 | LoopTV | [Base layout](/Users/sarthak/Desktop/fleet/looptv/src/layouts/BaseLayout.astro) | Source-ready | [tv.significanthobbies.com](https://tv.significanthobbies.com/) — project strip only |
| P2 | Reader | [Landing page](/Users/sarthak/Desktop/fleet/reader/landing-astro/src/pages/index.astro) and [shared layout](/Users/sarthak/Desktop/fleet/reader/landing-astro/src/layouts/Layout.astro) | Source-ready with an authored maintenance and commercial-state footer followed by the project-strip and Ask AI loaders | [read.significanthobbies.com](https://read.significanthobbies.com/) — both tags; strip suppressed until the shared footer runtime and this source are released |
| P2 | SWE Interview Prep | [Landing page](/Users/sarthak/Desktop/fleet/swe-interview-prep/src/pages/Login.tsx), [application layout](/Users/sarthak/Desktop/fleet/swe-interview-prep/src/components/Layout.tsx), and [document loaders](/Users/sarthak/Desktop/fleet/swe-interview-prep/index.html) | Source-ready with authored landing and application product-state footers followed by the project-strip and Ask AI loaders | [learn.significanthobbies.com](https://learn.significanthobbies.com/) — both tags; strip suppressed until the shared footer runtime and this source are released |
| P2 | Calorie | [Worker marketing snapshot](/Users/sarthak/Desktop/fleet/calorie/marketing/index.html) and [shared factory layout](/Users/sarthak/Desktop/fleet/ios-landings/src/layouts/SiteLayout.astro) | Source-ready with an authored internal-TestFlight and commercial-state footer followed by the project-strip and Ask AI loaders; the checked-in snapshot is regenerated from the product-specific factory configuration | [calorie.significanthobbies.com](https://calorie.significanthobbies.com/) — neither shared integration is live |
| P2 | Setline | [Shared iOS landing layout](/Users/sarthak/Desktop/fleet/ios-landings/src/layouts/SiteLayout.astro) | Source-ready with an authored internal-TestFlight and commercial-state footer followed by the project-strip and Ask AI loaders; all 19 product-specific public surfaces are validated | [setline.significanthobbies.com](https://setline.significanthobbies.com/) — neither shared integration is live |
| P2 | Journal | [Shared iOS landing layout](/Users/sarthak/Desktop/fleet/ios-landings/src/layouts/SiteLayout.astro) | Source-ready with an authored internal-TestFlight and commercial-state footer followed by the project-strip and Ask AI loaders; all 19 product-specific public surfaces are validated | [journal.significanthobbies.com](https://journal.significanthobbies.com/) — neither shared integration is live |
| P2 | Kith | [Shared iOS landing layout](/Users/sarthak/Desktop/fleet/ios-landings/src/layouts/SiteLayout.astro) | Source-ready with an authored internal-TestFlight and commercial-state footer followed by the project-strip and Ask AI loaders; all 19 product-specific public surfaces are validated | [kith.significanthobbies.com](https://kith.significanthobbies.com/) — neither shared integration is live |
| P2 | iOS landings | [Shared factory layout](/Users/sarthak/Desktop/fleet/ios-landings/src/layouts/SiteLayout.astro) | Source-ready infrastructure | No independent public product origin |
| P2 | RolePatch | [Landing layout](/Users/sarthak/Desktop/fleet/rolepatch/landing-astro/src/layouts/Layout.astro) | Source-ready with an authored maintained-state and commercial-boundary footer followed by the project strip and Ask AI loaders on every landing route | [rolepatch.com](https://rolepatch.com/) — project strip only until this source and the shared footer runtime are released |
| P2 | Karte | [Landing layout](/Users/sarthak/Desktop/fleet/karte/landing-astro/src/layouts/Layout.astro) and [authored footer](/Users/sarthak/Desktop/fleet/karte/landing-astro/src/components/ProductFooter.astro) | Source-ready with an authored product-state and commercial-boundary footer followed by pre-mounted project-strip and Ask AI components on every Astro route; the shared loader now composes them into one extension | [karte.cc](https://karte.cc/) — project strip only until this source is released |
| P2 | Starboard | [Landing layout](/Users/sarthak/Desktop/fleet/starboard/landing-astro/src/layouts/Layout.astro) | Source-ready | [starboard.codevetter.com](https://starboard.codevetter.com/) — project strip only |
| P4 | AliveVille | [Astro landing layout](/Users/sarthak/Desktop/fleet/aliveville/astro-landing/src/layouts/Layout.astro) | Source-ready | [aliveville.com](https://aliveville.com/) — neither live |
| P4 | Protein Index | [Landing document](/Users/sarthak/Desktop/fleet/protein-index/index.html) | Pending explicit reactivation — retired source retains the legacy composition opt-out | [protein.significanthobbies.com](https://protein.significanthobbies.com/) — neither live |
| P4 | Recipe Index | [Dashboard page](/Users/sarthak/Desktop/fleet/recipe-dashboard/src/pages/index.astro) | Source-ready | [veg-protein-food.significanthobbies.com](https://veg-protein-food.significanthobbies.com/) — neither live |
| P2 | App Health | [Web document](/Users/sarthak/Desktop/fleet/app-health/apps/web/index.html) | Source-ready | [health.sassmaker.com](https://health.sassmaker.com/) — project strip only |
| P2 | Mashup | [Web page](/Users/sarthak/Desktop/fleet/mashup/web/src/pages/index.astro) | Source-ready | No public origin — local application |
| P2 | Motion | [Shared iOS landing layout](/Users/sarthak/Desktop/fleet/ios-landings/src/layouts/SiteLayout.astro) | Source-ready via factory | [motion.significanthobbies.com](https://motion.significanthobbies.com/) — neither live |
| P4 | TrueHire | [Landing layout](/Users/sarthak/Desktop/fleet/truehire/apps/web/landing-astro/src/layouts/Layout.astro) | Source-ready | No public origin — archived source |
| P4 | Open Historia | [Landing layout](/Users/sarthak/Desktop/fleet/open-historia/landing-astro/src/layouts/Layout.astro) | Source-ready | [historia.aliveville.com](https://historia.aliveville.com/) — neither live |
| P4 | Companion Robot | [Repository readme](/Users/sarthak/Desktop/fleet/companion-robot/README.md) | N/A — planning/protocol product | No implemented browser surface |
| P4 | Forecast Lab | [Web document](/Users/sarthak/Desktop/fleet/forecast-lab/web/index.html) | Source-ready | No public origin — archived source |
| P4 | Web Playables | [Hub document](/Users/sarthak/Desktop/fleet/web-playables/apps/hub/index.html) | Source-ready | [idle.aliveville.com](https://idle.aliveville.com/) — both tags; strip suppressed |
| P4 | What It Takes to Win | [Base layout](/Users/sarthak/Desktop/fleet/what-it-takes-to-win/src/layouts/Base.astro) | Source-ready | [paths.significanthobbies.com](https://paths.significanthobbies.com/) — legacy split; both visible |
| P4 | Sarthak Agrawal | [Portfolio base layout](/Users/sarthak/Desktop/fleet/portfolio/src/layouts/BaseLayout.astro) | Source-ready | [sarthakagrawal.dev](https://sarthakagrawal.dev/) — both tags; strip suppressed |
| P1 | Office OS | [Site document](/Users/sarthak/Desktop/fleet/agent-office/site/index.html) | Source-ready | [office-os.sassmaker.com](https://office-os.sassmaker.com/) — neither live |
| P2 | Local AI Video Studio | [Site document](/Users/sarthak/Desktop/fleet/local-ai-video-studio/site/index.html) | Source-ready | [local-ai-video-studio.sassmaker.com](https://local-ai-video-studio.sassmaker.com/) — neither live |
| P2 | Field Track | [Application layout](/Users/sarthak/Desktop/fleet/field-track/src/layouts/AppLayout.astro) | Source-ready | [field-track.sassmaker.com](https://field-track.sassmaker.com/) — neither live |
| P4 | Reddit Insights | [Page generator](/Users/sarthak/Desktop/fleet/reddit-insights/scripts/build-pages.mjs) | Source-ready | [reddit-insights.highsignal.app](https://reddit-insights.highsignal.app/) — neither live |
| P4 | Verified Bases | [Web base layout](/Users/sarthak/Desktop/fleet/verified-bases/web/src/layouts/BaseLayout.astro) | Source-ready | No public origin — retained source |
| P2 | Anchor | [Shared iOS landing layout](/Users/sarthak/Desktop/fleet/ios-landings/src/layouts/SiteLayout.astro) | Source-ready via factory | [anchor.significanthobbies.com](https://anchor.significanthobbies.com/) — both tags; strip suppressed |

## Corrections made in this pass

- Made the hosted Ask AI loader wait for and compose a project strip that
  mounts later, while retaining the opt-out only as a non-Fleet escape.
- Removed the obsolete composition opt-out from every active source that still
  carried it, including generated Calorie output refreshed from the shared iOS
  factory. An exact Fleet scan now finds only the retired Protein Index source
  plus explanatory documentation.
- Restored SaaS Maker's shared loader as a single, responsive extension that
  keeps Ask AI first and project discovery second.
- Restored the two-loader contract on SaaS Maker's own showcase and reusable web
  landing template.
- Added the missing Ask AI integration to both High Signal browser layouts.
- Added both integrations to High Signal Podcasts and IssuePages full pages.
- Added both integrations to Calorie's six checked-in marketing documents.
- Removed the legacy composition opt-out from Email Manager.
- Removed What It Takes to Win's hand-built duplicate project rail and moved it
  onto the shared composition.

## Verification receipts

- 2026-09-01 composition repair: shared-package checks passed with 23 Ask AI
  tests and 6 project-strip tests; the 65-page SaaS Maker showcase build passed.
  The footer source audit's five focused tests passed, and the canonical
  receipt reproduced 51/52 visual identities source-ready, 1/1 shared factory
  source-ready, the single dated Protein Index exception, and zero blocking
  findings.
  A delayed-load fixture proved that Ask AI mounted first and was later moved
  beside the project strip inside exactly one extension. Forty consumer
  identities were exercised from built HTML documents or production-equivalent
  local Workers at 390, 768, and 1440 px with the local shared loaders: every
  document had exactly one Ask AI surface, one project strip, one extension,
  shared parentage, and no width added by the shared extension. This controlled
  harness isolates the shared runtime contract; the product-specific responsive
  receipts below remain authoritative for each fully styled host page.
  Product-owned checks also passed for the changed sources. IssuePages'
  aggregate `check` remains
  blocked only by formatting in an unrelated `.impeccable/hook.cache.json`;
  its typecheck, 53 tests, client budgets, and Worker dry-run pass. PostTrainLLM's
  browser Astro build passes, while its aggregate command later fails in the
  unrelated Blume docs build because `@astrojs/mdx` is not resolvable from the
  generated docs config.
- SaaS Maker: targeted public-surface tests, showcase build, design-workflow
  check, and responsive browser inspection at 390, 768, and 1440 px passed.
- High Signal: API typecheck and all 289 API tests passed; the agent-surface contract, web lint, web typecheck, 342-page Next build, and fallback Astro build passed. Responsive inspection at 390, 768, and 1440 px found no overflow.
- High Signal Podcasts: web typecheck/build, API typecheck, 46 API tests, 15/15 SEO, Fleet S-tier agent audit, 20/20 PSI Swarm measurements, and responsive browser inspection at 390, 768, and 1440 px passed with no overflow. The authored footer, access and contact links, Ask AI loader, and project-strip loader were inspected in current source.
- Research Papers: the complete repository quality suite, 206-page production build, 205-route agent-surface validator, JSON catalog checks, 15/15 SEO checks on all five primary routes, 20/20 PSI Swarm measurements, and responsive browser inspection at 390, 768, and 1440 px passed. The authored corpus and commercial-state footer, Ask AI loader, and project-strip loader were inspected in current source; no deployment was performed.
- Knowledge Base: landing typecheck/build/agent checks, 15/15 SEO, live Fleet S-tier agent readiness, 20/20 PSI Swarm measurements, and responsive browser inspection at 390, 768, and 1440 px passed with no overflow. The authored internal-access and commercial-state footer, Ask AI loader, and project-strip loader were inspected in current source. Dashboard checks/build/tests and all remaining repository quality gates pass; the independent Worker suite remains 360/361 because of pre-existing sibling `free-ai` source-contract drift. No deployment was performed.
- Significant Hobbies: the Hub Worker check and 23 tests, Live typecheck, targeted apex-routing tests, complete Cloudflare/OpenNext build, 15/15 SEO checks, 20/20 PSI Swarm measurements, and responsive browser inspection at 390, 768, and 1440 px passed. The composed local service binding and temporary tunnel served the six-app page, authored footer, project strip, Ask AI, Markdown/GEO surfaces, and dedicated social card. No deployment was performed.
- Reader: typecheck, 121 tests, complete application and Astro overlay build, 15/15 SEO checks on Home, FAQ, and Changelog, fresh-tunnel Fleet S-tier agent readiness, a full 20/20 PSI Swarm coverage measurement set, and responsive browser inspection at 390, 768, and 1440 px passed. The temporary tunnel served the authored product-state footer, project strip, Ask AI, Markdown/GEO surfaces, real 404 boundaries, and dedicated social card. Ora's final rerun hit its account-wide daily limit after an earlier clean 96/100 essentials result; Is Agentic accepted the fresh URL and remained pending. No deployment was performed.
- SWE Interview Prep: the complete local quality suite, 551 tests, 315-URL public-curriculum generation, 15/15 SEO checks, live Fleet S-tier agent readiness, two full 20/20 tunnel PSI Swarm measurement sets, a standard mobile Lighthouse control, and responsive browser inspection at 390, 768, and 1440 px completed. The current source contains authored landing and application product-state footers followed by deferred Ask AI and project-strip loaders; delaying those cross-origin bundles prevents them from competing with the initial app module. Ora's fresh scan hit its account-wide daily limit, while Is Agentic accepted the disposable tunnel URL. Slow-network SPA handoff variance remains recorded in the purpose audit. No deployment was performed.
- IssuePages: typecheck and 45 tests passed.
- Calorie: the full repository quality suite passed with 87 tests; the shared landing factory built and validated all eight configured products, including active/unreleased and merged-successor cases, while its typed distribution router retains separate verified TestFlight, App Store, and live-web-app paths. Calorie passed 99/100 independent purpose review, responsive inspection at 390, 768, and 1440 px, all critical SEO checks, direct GEO route probes, and two 20/20 PSI Swarm sets. The current source contains an authored internal-TestFlight and commercial-state footer followed by the project-strip and Ask AI loaders. A disposable Cloudflare Quick Tunnel was used only for external scans; no deployment was performed.
- Setline: the repository check passed with 25 tests, and the native qualification passed 99 core tests, 11 app tests, UI tests, a release simulator build, and 84.21% production-line coverage after correcting simulator discovery for Fleet-prefixed device names. The shared factory built and validated all eight configured products and all 19 Setline surfaces. Setline passed 99/100 independent purpose review, 36/40 visual review, 18/20 usability review, responsive inspection at 390, 768, and 1440 px, all critical SEO checks, and direct GEO route probes. Its authored internal-TestFlight and commercial-state footer is followed by the project-strip and Ask AI loaders. The factory now also routes merged-product footers to the maintained successor rather than presenting a stale TestFlight link. A disposable Cloudflare Quick Tunnel was used only for external scans; no deployment was performed.
- Journal: the native qualification passed 27 tests and a release-simulator build after replacing its stale hard-coded simulator identifier with deterministic iPhone discovery. The shared factory built and validated all eight configured products and all 19 Journal surfaces, including authored HTML and Markdown 404 behavior. Journal passed 99/100 independent purpose review, 36/40 visual review, 18/20 usability review, responsive inspection at 390, 768, and 1440 px, all critical SEO checks, direct GEO route probes, a 71/100 Is Agentic scan, and 20/20 PSI Swarm measurements. Its authored internal-TestFlight and commercial-state footer is followed by the project-strip and Ask AI loaders. A disposable Cloudflare Quick Tunnel was used only for external scans; no deployment was performed.
- Kith: the native qualification passed 20 tests and a Release simulator build from the clean native repository. The shared factory built and validated all eight configured products and all 19 Kith surfaces. Kith passed 100/100 independent purpose review, 37/40 visual review, 18/20 usability review, responsive inspection at 390, 768, and 1440 px, all critical SEO checks, direct GEO route probes, a 71/100 Is Agentic scan, and 20/20 PSI Swarm measurements. The old no-account, iCloud-only, beta-preparation claims and tiny screenshots were replaced by current optional Hub-sync truth, verified build state, and current native evidence. Its authored internal-TestFlight and commercial-state footer is followed by the project-strip and Ask AI loaders. A disposable Cloudflare Quick Tunnel was used only for external scans; no deployment was performed.
- RolePatch: lint, typecheck, all 442 tests, the complete Cloudflare/OpenNext build, 21-surface public contract, focused 22-case desktop/mobile journey suite, 100/100 purpose review, 37/40 visual review, 18/20 usability review, and responsive inspection at 390, 768, and 1440 px passed. The evidence-workbench page now states the claim boundary, review-first apply model, exact token packs, guest-versus-account behavior, maintained hold state, and unverified-live-checkout boundary plainly. Its authored product-state footer is followed by the project strip and Ask AI loaders on every Astro route. Is Agentic scored the disposable tunnel 88/100; PSI Swarm completed 20/20 measurements, with a persisted desktop control at 274 ms p75 LCP, 100 performance, zero CLS, and zero TBT. No deployment was performed.
- Karte: lint, typecheck, all 94 tests, docs checks, the complete Cloudflare/OpenNext build, focused desktop/mobile journeys, 100/100 purpose review, 37/40 visual review, 18/20 usability review, and responsive inspection at 390, 768, and 1440 px passed. The public-inbound-desk page now states person-first purpose, visitor and owner access, current no-billing truth, AI boundaries, and the unshipped company workflow plainly. The authored footer is followed by pre-mounted project-strip and Ask AI components on every Astro route; the repaired shared loader now composes both surfaces into one extension. Is Agentic scored the final disposable tunnel 97/100; PSI Swarm completed 20/20 measurements plus an eight-run post-font-preload stability control. No deployment was performed.
- Email Manager: production build, Astro overlay, and indexing verification
  passed.
- What It Takes to Win: typecheck and production build passed; 7,172 pages were
  generated.
- `git diff --check` passed in every touched repository.

## Rollout result

The active rollout is complete. Source qualification remains 51/52 visual
identities because retired Protein Index is intentionally unchanged; this is a
recorded lifecycle exception, not active release debt. All 45 applicable active
public visual origins have now passed the production render contract at mobile,
tablet, and desktop widths. SaaS Maker issue
[#76](https://github.com/sass-maker/saas-maker/issues/76) carries the release,
CI, and public-render closure receipt.
