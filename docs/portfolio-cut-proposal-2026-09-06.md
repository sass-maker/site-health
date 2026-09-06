# Portfolio cut proposal — 55 → 12

Date: 2026-09-06. **Proposal only — nothing has been changed.** No catalog edit,
no repo change, no board edit, not committed.

Sources: `apps/backend/config/projects.json` (56 identities),
`portfolio-condensed-2026-08-23.md` (decision layer),
`clarity-traffic-baseline-latest.md`, `ai-visibility-baseline-latest.md`,
`d1-read-concentration-latest.md`, per-repo git activity, GitHub REST issue counts.

## The gate applied above scoring

A product survives only if **(a)** no materially better free/OSS alternative exists,
**or (b)** it is heavily personalized to your data, routines, or taste. Momentum does
not rescue a project that fails this gate — that is why several high-commit repos are
in PAUSE. Score components below are `T` traction (0-3), `S` strategic fit (0-3),
`M` 90-day *substantive* momentum (0-3), `C` cost-to-keep penalty (0 to -3).

**Momentum caveat:** raw commit counts are inflated fleet-wide by agent fan-outs
(footer, landing-audit, biome, app-health log client). `M` uses commit counts with those
subjects filtered out. Three parked repos (materia, web-playables, everythingrated) have
recent commits that are *entirely* fan-out. Spending agent time across 55 repos is itself
the cost this cut removes.

**Demand reality (3-day window, 2026-09-05):** 24 human sessions across the entire
portfolio; bots outnumber humans 2:1; 16 of 26 measured products at absolute zero —
including CodeVetter and saas-maker. AI-visibility: 8/74 answers cited us, 0 recommendations.
There is no traction to protect anywhere except CodeVetter's revenue path. This cut costs
you almost no users.

## 1. INFRA — kept, not counted against product slots

Exempt only because kept products depend on them. Two do not clear the free-alternative
gate and I say so.

| Infra | Role | Best free/OSS alternative | Verdict |
|---|---|---|---|
| `saas-maker` | Shared packages, board sync, public directory, skills | Backstage, Port | **Keep, shrink.** Events hub `/v1/events` + `@saas-maker/sdk` have zero live consumers — cut those, keep tooling. Tear down `container-image-repository: box` and the `assistant-mac-server` tunnel unless still used. |
| `site-health` | Private canonical catalog + evidence dashboard | Backstage, Port | **Keep.** Heavily personalized: your five questions, your Clarity/Ahrefs/PSI adapters. This document is its output. Local-only, zero CF cost. |
| `significanthobbies` (Hub) | Auth + typed sync for the native apps | none equivalent | **Keep** while Anchor and Live are kept. 1 D1. |
| `ios-landings` | Landing factory for native apps | any static template | **Keep.** Local-only, near-zero cost, one repo instead of six. |
| `knowledge-base` | Private cited RAG for fleet consumers | RAGFlow, LlamaIndex | **Keep, downsize.** Delete `rag-bge-768`, `rag-bge-small-384`, `rag-voyage-1024` (0-3 vectors between them). `rag-gemini-1536` (2.55M dims) is a rollback decision, not a cost one. |
| `free-ai` | Model fallback gateway | OpenRouter free tier | **Keep, hands-off** (another product owns it). Flag only: 3 Durable Objects + D1 + 2 KV is the largest always-on DO footprint in the fleet. |
| `app-health` | Fleet observability + Slack log alerts | Sentry free, Better Stack free | **Your call.** At 12 kept products, Better Stack's free tier (10 monitors) plus Sentry free covers this. It exists, works, costs 1 D1 + one hourly cron — but it is the one infra piece a free tool does about as well. |
| `psi-swarm` | Repeated-Lighthouse evidence | **Unlighthouse, Lighthouse CI** | **Freeze, don't develop.** The free tools are better maintained; only the distributional/repeat-run framing is yours. Leave deployed as a site-health input, no roadmap. |
| `drank` | Domain Rating adapter | Ahrefs Webmaster Tools (free) | **Freeze.** Thin adapter, Pages only. Stop its weekly workflow if DR stops mattering. |
| `chatgpt-connections` | Read-only MCP gateway | any MCP server template | **Freeze.** 1 KV, no roadmap. Keep only while a ChatGPT consumer exists. |

## 2. KEEP — 7 pass the gate outright

Ceiling is 12 with your borderline calls in §4. I am deliberately handing you 7 rather
than padding to 12: five more products would each fail the gate.

| # | Project | T/S/M/C | Best free/OSS alternative | Why it still exists |
|---|---|---|---|---|
| 1 | **CodeVetter** (flagship) | 3/3/3/-1 | CodeRabbit free tier, Semgrep OSS, Dependabot, Claude Code review | The only product with a revenue path and the only brand that is findable. Alternatives give *opinions* on a diff; CodeVetter runs the change and produces an execution receipt, locally and offline. Nothing free does execution-backed verification. 3 open issues, 922 substantive commits/90d. |
| 2 | **PostTrainLLM** | 1/3/3/0 | nanoGPT, TinyGrad, MLX examples, Karpathy's videos | Your AI-infra positioning artifact and the fleet's second-best AI-visibility surface (2/16 answers cited). The free repos teach training; this publishes *reproducible browser- and Mac-local specialist-model recipes* — the artifact, not the tutorial. Personalized to your own curriculum. |
| 3 | **Live** | 2/2/3/-1 | Notion templates, Goodreads-style bucket lists | Highest human traffic in the portfolio (8 of the fleet's 24 sessions). Heavily personalized: it owns the `significanthobbies` apex, D1 and the original SH data. A generic list app cannot inherit that. |
| 4 | **On Record** (High Signal Podcasts) | 2/3/2/-2 | Podscan, Snipd free tier, YouTube transcripts | 30,562 evidence-linked claims across 139 episodes that no free tool produces — nobody indexes *what notable people actually recommended, with receipts*. Live reviewed beta. **Cost is real:** 29.4M D1 rows/day, 57% of fleet reads. Fix before scaling: cache `/api/people`, `/api/sources`, `/api/search`; the `publishers` query alone burns 3.03M rows/day to return 25 constant values. |
| 5 | **Look Sideways** (`what-it-takes-to-win`) | 1/3/3/0 | Wikipedia, Perplexity, biographies | Highest AI-visibility score in the panel (34). Source-linked comparative life-history dataset — Perplexity answers a question, this builds a corpus you own. Same asset class as On Record, Pages-only, zero billable resources. |
| 6 | **Anchor** | 0/3/3/0 | Forest, Flow, Apple Screen Time, Session | Heavily personalized: plans your day, then compares planned vs. *observed* time, preserves interruption evidence, and offers non-moralizing replacements. Free timers count minutes; none reconcile intent against reality. Sole successor to Indulge/Habits; signed build installed, TestFlight processed. |
| 7 | **SWE Interview Prep** | 2/2/3/-1 | Anki, LeetCode, Excalidraw | Second-highest human traffic (6 sessions). Heavily personalized: your own concept graph including the `ml-*` TinyGPT track, wired into a Pomodoro/Feynman/retrieval loop. Anki has better SRS; it does not have your curriculum. **Downsize:** 2 D1 + 2 R2 + 2 queues (`war-jobs`, `war-jobs-dlq`) for a single user. |

## 3. PAUSE — grouped by what pause means

**"Pause" never means delete.** Deployed sites stay up and stay usable. It means:
`status: paused` in the catalog, crons and scheduled workflows off, excluded from the
board sync, no roadmap, no agent fan-out.

### 3a. Finished and still used — freeze in place, keep the site up
No roadmap, no CI, still yours to use daily. `anime-list`, `looptv`, `email-manager`,
`calorie`, `gitstat`, `research-papers`, `portfolio` (sarthakagrawal.dev), `india-standards`,
`chatgpt-memory-insights` (Memory Map), `veg-protein-food`.
Alternatives that beat them, for the record: AniList, YouTube playlists, Cronometer/MacroFactor,
GitHub Insights, Zotero. They survive as *frozen conveniences*, not as products.

### 3b. Built but unused — the gate fails on a free alternative
| Project | Loses to | Pause action |
|---|---|---|
| `rolepatch` | Teal free, any LLM prompt | **Stop hourly + weekly crons** (`wrangler.toml`); browser-rendering bills per session |
| `reader` | Raindrop free, Readwise Reader, Pocket | Freeze; keep D1 |
| `karte` | Linktree free, Bento free | **Heaviest paused footprint:** D1 + 2 R2 + 2 Durable Objects + Analytics Engine + email worker. Downsize the DOs. |
| `setline` | **Hevy free** — genuinely better | Freeze despite 70 commits/30d. The gate outranks momentum. |
| `kith` | Monica OSS, Dex free | Freeze |
| `issue-pages` | GitHub Pages, Gist | **Stop the `*/15 * * * *` cron** on a one-user pilot |
| `agent-office` | crowded category, many free | Freeze |
| `field-track` | Google Timeline, free GPS trackers | Freeze the synthetic demo |
| `forecast-lab` | **Nixtla StatsForecast, Darts, Kaggle** | Freeze. Your demand-forecasting goal is real — pursue it *on Nixtla*, not by maintaining a repo. |
| `journal` | Apple Journal, Day One | Already decided: discard/inactive |
| `motion`, `mashup`, `reel-pipeline`, `local-ai-video-studio`, `reddit-insights`, `web-playables`, `open-historia`, `companion-robot`, `everythingrated`, `protein-index`, `chess`, `mobile-dev-cockpit`, `truehire`, `verified-bases` | various | Already Hold/Dropped/archived — formalize as `paused` |

### 3c. Billable Cloudflare resources to tear down or downsize
| Resource | Owner | Why | Action |
|---|---|---|---|
| D1 `protein-index` | archived product | **1.37M rows/day** from 12 dashboard runs, on a retired project with no Clarity tag | Bound the completion CTEs or delete the D1 — highest waste-to-value in the fleet |
| Worker + D1 + R2 + KV `verified-bases-*` | retained-resources, **no live route** | Paying for an unrouted worker | Tear down all four |
| Worker + D1 `truehire` | archived | Archival landing only | Replace with a static Pages redirect, delete D1 |
| Worker + D1 `everythingrated` | archived | Same | Same |
| D1 + Workers AI `open-historia` | archived | Retained | Freeze; drop the AI binding |
| Tunnel `fleet-postiz` | `reel-pipeline` | Tunnel for a product that never shipped | Tear down |
| Container repo `box` + tunnel `assistant-mac-server` | `saas-maker` | Deleting a Worker leaves containers + registry images **billable** (known trap) | Verify and tear down all three layers |
| 2 queues `swe-interview-prep-war-jobs[-dlq]` | kept product | Single-user | Downsize |
| 3 Durable Objects | `free-ai` | Always-on DO duration billing | Flag to the owning product; hands-off here |

### 3d. GitHub archiving — the rule cannot fire yet
Your rule archives repos untouched 6+ weeks. **Zero product repos qualify today.** The
most recent push on every fleet repo is within ~2 weeks, because agent fan-outs
(footer, landing audit, biome) touch all 55. The only repos past the line are org
`.github` profiles and `protein-index-resilience`. **Recommendation: stop the fan-out
first, then re-run the archive rule on 2026-10-20.** Archiving is otherwise permanently
blocked by our own automation.

### 3e. Crons and scheduled workflows to stop
Worker crons: `rolepatch` (hourly + weekly), `issue-pages` (*/15), `reddit-insights`
daily-collector (configured, not deployed — leave). Keep `app-health` (17 * * * *).
`high-signal` (*/30 + daily) stops only if §4 pauses it.
Scheduled GitHub workflows on paused repos: `anime-list` 3, `high-signal` 8, `drank` 1,
`everythingrated` 1, `looptv` 1, `open-historia` 1, `starboard` 1, `free-ai` 1,
`chatgpt-connections` 1. Delete the `schedule:` trigger, keep `workflow_dispatch`.

## 4. Borderline — five calls I want from you

Two of these were in your stated top-5 (`pace`, `high-signal`); `saas-maker` and
`tinygpt`/PostTrainLLM from that list are already handled above.

| Project | The case for | The case against | Best free/OSS alternative |
|---|---|---|---|
| **High Signal** | 3rd-highest traffic (5 sessions), 561 substantive commits, your own brand, and On Record lives under it | The 2026-08 review says you are not using it; a free reader answers the same need better | **Feedly free, Perplexity.** Keeping On Record does not require keeping the aggregator. |
| **HeyPace** | You called it top-5; technically broad and well made | **Raycast free is decisively better** with a real extension ecosystem; you never formed the habit; Clarity token was never even installed | **Raycast (free).** Fails gate (a) outright. My read: pause. |
| **Materia** | The one *new* serious bet; anatomy→evidence-graded-remedy graph genuinely has no free equivalent; embeddings-not-generative is a defensible design | 41 commits/90d and most are fan-out; catalog says archived; the cost is an editorial/evidence budget you have not committed | Examine.com (partly free), Cochrane, Perplexity. **Passes gate (a) if you fund the evidence standard.** Decide the standard, or pause. |
| **AliveVille** | Your stated long-term moat (world-sim fidelity from fandom ingest); 199 substantive commits | **a16z's AI Town and Stanford's Smallville are free and OSS**, and no UI you tried was fun enough. Progress here is what frustrates you. | **AI Town, Smallville.** Fails gate (a) unless the fandom-ingest fidelity is the whole product. |
| **Starboard** | 180 substantive commits, 90 in 30 days; vector search over your own stars | **Astral is free** and does GitHub star organization; 3.19M D1 rows/day for one user, 41.5% of it from 20 dashboard runs | **Astral, GitHub Lists.** Passes only on gate (b) — your stars, your tags. |

If you keep all five, the product count is 12 — exactly the target. If you keep none, it is 7.
My own recommendation: keep **Materia** (fund the evidence standard) and **Starboard**;
pause **HeyPace**, **High Signal** (keep On Record), and **AliveVille**. That lands at 9.

## 5. Mechanics an agent runs once you approve

1. **Add `paused` to the status enum.** It does not exist today. Edit the doc string in
   `site-health/apps/backend/config/projects.json` (`_meta`, line ~24) to
   `live | paused | local-only | undeployed | orphan | deleted | archived | retired | retained-resources | unverified`.
2. **Update every consumer that enumerates status.** Each currently filters only on
   `status !== 'orphan'`, so `paused` would silently behave like `live`. Decide explicitly
   per site: `paused` **stays** in domain scope and the directory (site stays up), but is
   **excluded** from active-work projections.
   - `site-health/apps/web/src/lib/project-directory.mjs` (lines 2, 21)
   - `site-health/apps/web/src/lib/fleet-data.ts` (line 36)
   - `site-health/apps/backend/lib/dashboard-backend/registry.mjs` (line 34)
   - `site-health/apps/backend/lib/dashboard-backend/domain-scope.mjs` (line 13)
   - `site-health/apps/backend/test/catalog-boundary.test.mjs` (line 292) — add a `paused` case
3. **Set `status: "paused"`** on the §3 projects, and add a matching `portfolio.status`
   value. Leave `deployed: true` — pause does not undeploy.
4. **Board sync skip list.** In `saas-maker/tooling/scripts/github-priority-queue.mjs`,
   `planQueueSync(discoveredUrls, projectUrls)` is the chokepoint: filter `discovered` by
   `owner/repo` parsed from the issue URL against the set of catalog entries with
   `status === 'paused'`. Add a `--skip-repos` flag plus a catalog-derived default, and
   cover it in the script's tests. Note the script only *adds* missing issues — items already
   on the board for paused repos need a **separate one-time move** to a `Paused` status
   option, which requires raw GraphQL against Project 3 (502-prone; retry, do not batch).
5. **Stop crons** (§3e): remove the `[triggers] crons` block and redeploy the Worker —
   removing the config alone does not clear the trigger.
6. **Delete `schedule:` triggers** on paused repos' workflows; keep `workflow_dispatch`.
7. **Tear down §3c resources** with `wrangler`, checking all three layers per Worker
   (worker, container, registry images).
8. **Do not archive any GitHub repo yet** (§3d). Re-evaluate 2026-10-20 after the fan-out stops.
9. **Stop the fleet-wide fan-out** — the footer/landing-audit/biome sweeps should target the
   KEEP + INFRA set only. This is the single change that makes the cut real; without it,
   paused projects keep consuming agent time and keep resetting the archive clock.
