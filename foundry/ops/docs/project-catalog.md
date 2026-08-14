# Fleet project catalog

> Generated from `foundry/ops/config/projects.json`. Edit the catalog, then run `npm run generate:projects`.
> Maintenance contract: `foundry/ops/config/README.md`.

Generated from 47 internal project identities.

## Operating model

Priority is an owner decision, not a completion percentage or task tracker. GitHub Issues remains the only operational queue.

| Signal | Meaning | Next action |
| --- | --- | --- |
| P1 | Continuously improved owner-built core | Preserve owner direction; maintain deploy, quality, and visibility evidence. |
| P2 | Eligible active agent-work pool | Select open GitHub Issues in work cycles spanning at most five P2 projects. |
| P4 + active | Owner-finished but still operating | Keep healthy and consider evergreen distribution; avoid speculative feature work. |
| P4 + archived | Historical or retired | Preserve history and review retained deployments/resources; do not publish as active. |
| Ready to share: yes | Dated evidence supports an active public surface | Include in the product-specific SEO/GEO and distribution plan. |
| Ready to share: no | The dated reason names the current blocker | Resolve that blocker before publication or authenticated browser work. |

## Cloudflare account coverage

Provider inventory checked 2026-08-11. A resource is not considered accounted for unless it is assigned to a project or listed under unowned resources.
`provider-complete` rows come from account enumeration. `known-name-probed`, `config-derived`, and similar rows cover recorded names or bindings but do not prove that no unknown provider object exists.

| Kind | Coverage | Provider observed | Tracked | Evidence |
| --- | --- | ---: | ---: | --- |
| pages | provider-complete | 25 | 26 | Wrangler account list; 25 live plus one deleted historical target. |
| worker | known-name-probed | 26 | 28 | All 26 known live names were probed; reddit-insights-daily-collector and fleet-chatgpt-connections are configured but not deployed. Account-wide Worker listing still requires API or dashboard evidence. |
| d1 | provider-complete | 23 | 23 | Wrangler account list. |
| r2 | provider-complete | 8 | 9 | Wrangler account list; reddit-insights-archive is configured but not provisioned. |
| kv | provider-complete | 4 | 4 | Wrangler account list; OAUTH_KV is reserved by the merged Fleet ChatGPT gateway and RATELIMIT is actively bound to verified-bases-api. |
| vectorize | provider-complete | 8 | 8 | Wrangler account list. |
| queue | provider-complete | 1 | 1 | Wrangler account list. |
| workflow | provider-complete | 1 | 1 | Wrangler account list. |
| tunnel | provider-complete | 2 | 2 | Wrangler account list; one tunnel remains owner-unverified. |
| container | provider-complete | 1 | 1 | Wrangler account list. |
| turnstile | provider-complete | 6 | 6 | Wrangler widget list. |
| hyperdrive | provider-complete-empty | 0 | 0 | Wrangler account list. |
| pipeline | provider-complete-empty | 0 | 0 | Wrangler account list. |
| ai-search | provider-complete-empty | 0 | 0 | Wrangler account list. |
| vpc | provider-complete-empty | 0 | 0 | Wrangler account list. |
| dispatch-namespace | not-entitled | 0 | 0 | Cloudflare API returned no product access. |
| artifacts | feature-gated | — | — | Cloudflare API denied the private-beta inventory endpoint. |
| durable-object | config-derived | — | 5 | Tracked Wrangler bindings; no account-wide Wrangler list exists. |
| analytics-engine | config-derived | — | 3 | Tracked Wrangler bindings; provider dataset list not available through current CLI. |
| workers-ai | config-derived | — | 4 | Tracked Worker bindings; models are usage surfaces, not persistent per-project objects. |
| browser-rendering | config-derived | — | 1 | Tracked Worker binding. |
| service-binding | config-derived | — | 4 | Tracked Worker bindings. |
| access-application | config-and-live-redirect-derived | — | 2 | Tracked product docs plus live Cloudflare Access redirects; dashboard/API enumeration remains unavailable. |
| zone | catalog-derived | — | 10 | Canonical root-domain ownership; provider zone enumeration remains unavailable. |
| email-routing | config-derived | — | 1 | Karte Email Worker and routing requirement in tracked configuration; dashboard rule not independently enumerated. |

## P1 — 4

### Products — 4

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| CodeVetter | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `codevetter` | cloudflare pages `codevetter` (git-connected; live)<br>cloudflare worker `codevetter-landing-proxy` (legacy-worker; live-purpose-review) | cloudflare zone `codevetter.com` (active-config-derived) | 2026-08-11 |
| HeyPace | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `pace` | cloudflare pages `pace` (wrangler-direct; live) | cloudflare zone `heypace.app` (active-config-derived) | 2026-08-11 |
| PostTrainLLM | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `posttrainllm` | cloudflare pages `tinygpt` (wrangler-direct; live) | cloudflare zone `posttrainllm.com` (active-config-derived) | 2026-08-11 |
| Office OS | active | yes | no | No maintained public listing is currently approved. (verified 2026-08-11) | `agent-office` | cloudflare pages `office-os` (wrangler-direct; live)<br>local macos-app `AgentOffice.app` (local-package; local-only) | — | 2026-08-11 |

## P2 — 19

### Products — 15

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Memory Map | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `chatgpt-memory-insights` | cloudflare pages `chatgpt-memory-insights` (wrangler-direct; live) | — | 2026-08-11 |
| High Signal | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `high-signal` | cloudflare worker `high-signal-web` (wrangler-direct; live)<br>cloudflare worker `high-signal-api` (wrangler-direct; live) | cloudflare d1 `high-signal-db` (active)<br>cloudflare service-binding `high-signal-api` (active)<br>cloudflare turnstile `high-signal (Spin)` (active)<br>cloudflare zone `highsignal.app` (active-config-derived) | 2026-08-11 |
| Research Papers | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `research-papers` | cloudflare pages `research-papers` (wrangler-direct; live) | cloudflare turnstile `research-papers (Spin)` (active) | 2026-08-11 |
| Significant Hobbies | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `significanthobbies` | cloudflare worker `significanthobbies` (wrangler-direct; live) | cloudflare d1 `significanthobbies` (active)<br>cloudflare d1 `significanthobbies-preview` (preview)<br>cloudflare workers-ai `AI` (active)<br>cloudflare zone `significanthobbies.com` (active-config-derived)<br>turso database `significanthobbies` (rollback-held-unverified) | 2026-08-11 |
| Reader | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `reader` | cloudflare worker `reader` (wrangler-direct; live) | cloudflare d1 `reader` (active)<br>cloudflare d1 `reader-preview` (preview-unreferenced)<br>cloudflare r2 `reader-pdfs` (active)<br>turso database `reader` (rollback-held-unverified) | 2026-08-11 |
| SWE Interview Prep | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `swe-interview-prep` | cloudflare pages `swe-interview-prep` (git-connected; live) | cloudflare d1 `swe-interview-prep` (active)<br>cloudflare d1 `swe-interview-prep-preview` (preview)<br>cloudflare r2 `swe-interview-prep-assets` (active-unreferenced)<br>turso database `swe-interview-prep` (rollback-held-unverified) | 2026-08-11 |
| Calorie | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `calorie` | cloudflare worker `calorie` (wrangler-direct; live) | cloudflare d1 `calorie` (active) | 2026-08-11 |
| Setline | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `setline` | cloudflare worker `setline` (wrangler-direct; live) | cloudflare d1 `setline` (active) | 2026-08-11 |
| RolePatch | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `rolepatch` | cloudflare worker `resume-tailor` (wrangler-direct; live) | cloudflare d1 `rolepatch` (active)<br>cloudflare browser-rendering `BROWSER` (active)<br>cloudflare turnstile `rolepatch (Spin)` (active)<br>cloudflare zone `rolepatch.com` (active-config-derived) | 2026-08-11 |
| Karte | active | yes | no | The public runtime and all 30 sitemap URLs are verified live; sharing remains held for the documented name-collision risk. (verified 2026-08-14) | `karte` | cloudflare worker `linkchat` (wrangler-direct; live)<br>cloudflare email-worker `karte-email` (wrangler-direct; live) | cloudflare d1 `linkchat-auth` (active)<br>cloudflare r2 `linkchat-images` (active)<br>cloudflare r2 `linkchat-cache` (active)<br>cloudflare durable-object `DOQueueHandler` (active)<br>cloudflare durable-object `RateLimiterDO` (active)<br>cloudflare analytics-engine `ANALYTICS` (active)<br>cloudflare service-binding `knowledgebase` (active)<br>cloudflare turnstile `Karte contact (Spin)` (active)<br>cloudflare email-routing `*@karte.cc catch-all` (configured-dashboard-unverified)<br>cloudflare zone `karte.cc` (active-config-derived) | 2026-08-11 |
| Starboard | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `starboard` | cloudflare worker `starboard` (wrangler-direct; live) | cloudflare d1 `starboard` (active)<br>cloudflare vectorize `starboard-repos` (active)<br>cloudflare workers-ai `AI` (active)<br>cloudflare service-binding `knowledgebase` (active)<br>turso database `starboard` (rollback-held-unverified) | 2026-08-11 |
| App Health | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `app-health` | cloudflare worker `app-health-worker` (wrangler-direct; live) | cloudflare d1 `app-health-control-plane` (active)<br>cloudflare analytics-engine `app_health_endpoint_v1` (active) | 2026-08-11 |
| Motion | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `motion` | cloudflare pages `motion` (wrangler-direct; live) | — | 2026-08-11 |
| Indulge | active | yes | no | The product-owned public site and all nine sitemap URLs are verified live; no maintained public listing is currently approved. (verified 2026-08-14) | `induldge` | cloudflare pages `indulge` (wrangler-direct; live)<br>apple app-store-connect `Indulge` (manual-xcode; blocked-on-app-record) | — | 2026-08-11 |
| Field Track | active | no | no | The private MVP has no verified production deployment or approved public surface. (verified 2026-08-14) | `field-track` | — | — | 2026-08-14 |

### Platforms — 2

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Fleet Workspace | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `foundry/ops` | cloudflare pages `saas-maker-home` (wrangler-direct; live)<br>cloudflare worker `reel-pipeline-artifacts` (wrangler-direct; live)<br>cloudflare worker `saasmaker-droid` (legacy-worker; live-purpose-review)<br>cloudflare worker `fleet-chatgpt-connections` (wrangler-direct; configured-not-deployed)<br>cloudflare tunnel `fleet.sassmaker.com` (designated-host; live)<br>github actions `sass-maker/workflows` (repository-workflows; live) | cloudflare d1 `saasmaker-db` (retained)<br>cloudflare r2 `reel-artifacts` (active)<br>cloudflare kv `OAUTH_KV` (configured-for-merged-gateway)<br>cloudflare tunnel `fleet-postiz` (down)<br>cloudflare container `saasmaker-droid-sandbox` (ready-purpose-review)<br>cloudflare access-application `fleet.sassmaker.com` (active-config-derived)<br>cloudflare zone `sassmaker.com` (active-config-derived) | 2026-08-11 |
| Knowledge Base | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `knowledge-base` | cloudflare pages `knowledgebase-landing` (git-connected; live)<br>cloudflare pages `knowledgebase-app` (wrangler-direct; live)<br>cloudflare worker `knowledgebase-app` (legacy-worker; live-purpose-review)<br>cloudflare worker `knowledgebase` (wrangler-direct; live) | cloudflare d1 `rag-db` (active)<br>cloudflare r2 `rag-raw-docs` (active)<br>cloudflare queue `knowledgebase-ingest` (active)<br>cloudflare workflow `knowledgebase-ingest-workflow` (active)<br>cloudflare vectorize `rag-embedding-384` (active)<br>cloudflare vectorize `rag-embedding-768` (active)<br>cloudflare vectorize `rag-embedding-1024` (active)<br>cloudflare vectorize `rag-gemini-1536` (active)<br>cloudflare vectorize `rag-bge-768` (retained-unreferenced)<br>cloudflare vectorize `rag-bge-small-384` (retained-unreferenced)<br>cloudflare vectorize `rag-voyage-1024` (retained-unreferenced)<br>cloudflare analytics-engine `knowledgebase_rag_events` (active)<br>cloudflare workers-ai `AI` (active)<br>cloudflare service-binding `free-ai-gateway` (active)<br>cloudflare access-application `search.sassmaker.com` (active-config-derived) | 2026-08-11 |

### Experiments — 2

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Mashup | active | no | no | No usable distributed or provider-hosted surface is currently deployed. (verified 2026-08-11) | `foundry/helpers/mashup` | — | — | 2026-08-11 |
| Local AI Video Studio | active | yes | no | No maintained public listing is currently approved. (verified 2026-08-11) | `local-ai-video-studio` | cloudflare pages `local-ai-video-studio` (wrangler-direct; live)<br>local macos-app `LocalVideoStudio` (swift-build; local-only) | — | 2026-08-11 |

## P4 — 24

### Finished (active) — 11

#### Products — 7

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Drank | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `foundry/helpers/drank` | cloudflare pages `drank` (wrangler-direct; live) | cloudflare turnstile `drank (Spin)` (active) | 2026-08-11 |
| Email Manager | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `email-manager` | cloudflare worker `email-manager` (wrangler-direct; live) | cloudflare d1 `email-manager-auth` (active) | 2026-08-11 |
| India Standards | active | yes | yes | Verified active, deployed, live canonical calculator and public discovery surfaces with a maintained repository listing. (verified 2026-08-12) | `india-standards` | cloudflare worker `india-numbers` (wrangler-direct; live) | cloudflare turnstile `india-standards (Spin)` (active) | 2026-08-11 |
| Anime List | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `anime-list` | cloudflare pages `anime-list` (git-connected; live)<br>cloudflare worker `mal-api` (wrangler-direct; live) | cloudflare d1 `anime-list` (active)<br>turso database `mal-watchlist` (rollback-held-unverified) | 2026-08-11 |
| LoopTV | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `looptv` | cloudflare pages `looptv` (wrangler-direct; live) | — | 2026-08-11 |
| What It Takes to Win | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `what-it-takes-to-win` | cloudflare pages `success-by-26` (wrangler-direct; live) | — | 2026-08-11 |
| Sarthak Agrawal | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `../portfolio` | cloudflare pages `sarthakagrawal` (wrangler-direct; live) | cloudflare zone `sarthakagrawal.dev` (active-config-derived) | 2026-08-11 |

#### Platforms — 2

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Free AI | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `free-ai` | cloudflare worker `free-ai-gateway` (wrangler-direct; live) | cloudflare d1 `free-ai-gateway-db` (active)<br>cloudflare kv `free-ai-gateway-HEALTH_KV` (active)<br>cloudflare kv `free-ai-gateway-HEALTH_KV_preview` (preview)<br>cloudflare durable-object `HealthStateDO` (active)<br>cloudflare durable-object `IpRateLimitDO` (active)<br>cloudflare durable-object `NeuronBudgetDO` (active)<br>cloudflare workers-ai `AI` (active) | 2026-08-11 |
| PSI Swarm | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `foundry/helpers/psi-swarm` | cloudflare pages `psi-swarm-web` (wrangler-direct; live) | — | 2026-08-11 |

#### Experiments — 2

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Chess | active | yes | yes | Verified active, deployed, live canonical public surface with a maintained listing. (verified 2026-08-11) | `chess` | cloudflare pages `chess-9a0` (wrangler-direct; live) | — | 2026-08-11 |
| Reddit Insights | active | yes | no | No maintained public listing is currently approved. (verified 2026-08-11) | `reddit-insights` | cloudflare pages `reddit-insights` (wrangler-direct; live)<br>cloudflare worker `reddit-proxy` (wrangler-direct; live)<br>cloudflare worker `reddit-insights-daily-collector` (wrangler-direct; configured-not-deployed) | cloudflare r2 `reddit-insights-archive` (configured-not-provisioned) | 2026-08-11 |

### Archived — 13

#### Products — 1

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| SaaS Ideas | archived | yes | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/saas-ideas` | cloudflare pages `saas-ideas` (git-connected; live-retained) | — | 2026-08-11 |

#### Experiments — 12

| Project | Status | Deployed | Ready to share | Readiness evidence | Repository | Deployment | Cloud resources | Updated |
| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| EverythingRated | archived | yes | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/everythingrated` | cloudflare worker `everythingrated` (wrangler-direct; live-retained) | cloudflare d1 `everythingrated-db` (retained) | 2026-08-11 |
| Materia | archived | yes | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/materia` | cloudflare pages `materia` (wrangler-direct; live-retained) | — | 2026-08-11 |
| AliveVille | archived | yes | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/aliveville` | cloudflare pages `aliveville` (wrangler-direct; live-retained)<br>cloudflare worker `aliveville` (legacy-worker; live-retained-purpose-review) | cloudflare zone `aliveville.com` (active-config-derived) | 2026-08-11 |
| Protein Index | archived | yes | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/protein-index` | cloudflare worker `protein-index` (wrangler-direct; live-retained) | cloudflare d1 `protein-index` (retained)<br>cloudflare r2 `protein-index-labels` (retained) | 2026-08-11 |
| TrueHire | archived | no | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/truehire` | — | cloudflare d1 `truehire` (retained) | 2026-08-11 |
| Today Little Log | archived | no | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/today-little-log` | cloudflare pages `today-little-log` (unknown; deleted) | — | 2026-08-11 |
| Open Historia | archived | yes | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/open-historia` | cloudflare worker `open-historia` (wrangler-direct; live-retained) | cloudflare d1 `open-historia` (retained) | 2026-08-11 |
| Companion Robot | archived | no | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/companion-robot` | — | — | 2026-08-11 |
| Elves HQ | archived | no | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/elves-hq` | — | — | 2026-08-11 |
| Forecast Lab | archived | no | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/forecast-lab` | — | — | 2026-08-11 |
| Web Playables | archived | yes | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `../fleet-inactive-projects/web-playables` | cloudflare pages `web-playables` (git-connected; live-retained) | — | 2026-08-11 |
| Verified Bases | archived | yes | no | Archived projects are not ready for active sharing. (verified 2026-08-11) | `—` | cloudflare worker `verified-bases-api` (legacy-worker; live-retained-unrouted) | cloudflare d1 `verified-bases-db` (retained-unowned-runtime)<br>cloudflare r2 `verified-bases-delivery` (retained-unowned-runtime)<br>cloudflare kv `RATELIMIT` (active-bound) | 2026-08-11 |

## Unowned provider resources

These resources exist in provider inventory but do not yet have a proven Fleet owner.
They must remain explicit until ownership or retirement is verified.

| Provider | Kind | Name | State | Updated |
| --- | --- | --- | --- | --- |
| cloudflare | tunnel | `assistant-mac-server` | owner-unverified-healthy | 2026-08-11 |

