# Why current public Fleet products are not getting visitors

Working diagnosis, 2026-09-28. Scope: 42 public active/primary identities in the canonical catalog; inactive and internal products are excluded. This is a distribution diagnosis, not a claim that each product has a measured conversion problem. Do not use Hacker News or LinkedIn for this campaign.

## Latest approved execution — 2026-10-02

This section supersedes the earlier same-day release/configuration status below.
SaaS Maker PR #169 and Site Health PR #503 are merged and exact-main push
checks passed. The Clarity three-day host schedule is installed with RunAtLoad
enabled, and one automatic collection completed. Two bounded provider timeouts
recovered in individual follow-ups. Current catalog/source coverage is 45
eligible products, not the earlier 43: 35 fresh, ten unavailable, zero failed,
12 intentional unwired and 19 inactive. Latest fresh three-day snapshots report
111 sessions and 2,895 bot sessions separately, not verified external people.
Google sign-in is open but unauthenticated; no missing token was created/stored.

Anime List PR #116 merged at `4e6179db784926c6ebadc42765248b1c1f41602d`.
The approved Axios 1.20.0 upgrade and narrow lockfile update passed the complete
quality gate, 196 unit tests and zero high/critical dependency advisories. Both
exact-main push workflows and all six deploy gates passed. The Pages-only
production deployment is `decbbbf5.anime-list-9lk.pages.dev`. Anonymous custom
domain checks verified home/search/detail, llms and sitemap 200; invalid
backtick/arbitrary paths GET/HEAD 404/noindex; detail Markdown 200 text/markdown.
Synthetic Chromium checks with analytics intercepted found no overflow at
1280/390 pixels and CLS 0.000345/0.000688. This is not field CWV or search
recrawl proof. No API Worker deployment or D1 migration was run.

The weekly root GEO scope remains complete (44/44). Monthly reporting remains
incomplete: ten unusable frozen-query observations (132/142 union), ten missing
Clarity tokens, and stale/failed domain-strength evidence. Unknown coverage
must not be fabricated as zero, class C, or a successful portfolio trend.

## Earlier 2026-10-02 public-search follow-up

This section is current anonymous public-search evidence plus the authorized
2026-10-02 Search Console refresh. The signed-in September baseline below remains
historical. No Hacker News or LinkedIn submission was made. The measurement
repairs and public-search ledger have been published through SaaS Maker PR #166
and Site Health PR #501; a merged source change is not a live product deployment.

Search Console refreshed successfully at 2026-10-02T11:25:15.514Z: 49 products,
11 accessible properties, and no unavailable products. Its complete final-data
window is 2026-09-02 through 2026-09-29. **35/49 products had zero search clicks
and 13/49 had zero impressions.** Results are not uniformly absent: AliveVille
recorded 202 clicks, Open Historia 52, and Paths 39. For example, the paired
`ai world simulator` query and AliveVille's `/ai-world-simulator` page recorded
12 clicks / 85 impressions. Paths' returned query subset has no clicked terms,
so its aggregate clicks cannot yet support a query-specific rewrite.

These are provider search clicks, not verified external-human sessions or product
activations. The collector uses project page-URL filters on the closest accessible
property, bounded query/page rows, and separate aggregate requests. It does not
exclude `site:` or developer searches; hidden/omitted queries and the bounded
returned subset limit conclusions. Do not report these totals as ordinary
non-brand demand or attribute them to this exercise's unshipped changes.

The GEO skill ran the remaining frozen queries verbatim. The existing recorder
accepted **88 new active observations**, bringing the local 2026-10-02 ledger to
**132/142 active queries**, including **44/44 root-contract queries**. Eight
legacy qids were excluded because root amendments retire them; the preflight now
uses the recorder's merged statuses rather than demanding rejected observations.
The broad run is **incomplete**: ten collections remained unusable after an
individual retry. They are not class C and must not enter a portfolio rate.
Evidence and URLs: [generated report](../apps/backend/docs/geo-observatory-latest.md)
and its source ledger. Results reflect returned public WebSearch ordering, not
an authenticated Google rank tracker or a consumer AI-answer capture.

| Query intent | Collected / expected | A | B | C |
| --- | --- | --- | --- | --- |
| Brand | 45/52 | 27 | 10 | 8 |
| Exact domain | 11/12 | 6 | 0 | 5 |
| Category | 48/50 | 13 | 11 | 24 |
| Problem | 28/28 | 1 | 6 | 21 |

The concrete signal is weaker **problem discovery** than brand discovery: 21 of
28 collected problem queries do not return an owned first-page result. This is
not proof of low demand, poor conversion, or absent product value. Specific
category queries do reach owned results, including StorageDaddy's developer-cache
analyzer, Anime List's multi-field filters, Knowledge Base's cited retrieval, and
Formula Calculator's batch composition. Name collisions affect MentionPilot
and ContextDaddy; do not mistake another company's similarly named domain for
the configured owned origin. One-run moves remain unconfirmed.

### Collection failures, not visibility failures

Every row below was attempted twice with its frozen query unchanged. Some return
one relevant owned page, but still fail the skill's two-plausible-results gate.

| Product / query id | Collection failure |
| --- | --- |
| anchor / anchor-brand | Exact brand query returns generic anchor/hobby documents and a related-family page, not two plausible product-intent results. Individual retry remained unusable. |
| anime-list / anime-longtail-1 | Site-restricted retry returns the filter homepage and unrelated titles, not two plausible Fullmetal Alchemist Brotherhood results. |
| app-health / app-health-brand | Exact-domain retry returns generic health and SAS/SASS medical services, not product-intent results. |
| calorie / calorie-category | Retry returns academic food/water/weight papers rather than app or journal intent; collection remains unusable. |
| reader / reader-brand | Retry returns one Reader directory entry plus unrelated family/language pages, not two plausible product-intent results. |
| what-it-takes-to-win / what-it-takes-to-win-brand | Retry returns one owned Paths page plus unrelated family/movement pages, not two plausible product-intent results. |
| email-manager / email-manager-brand | Retry returns generic email-address and hobby mailing-list pages, not product-intent results. |
| looptv / looptv-brand | Retry returns generic TV/domain and related-family pages, not product-intent results. |
| field-track / field-track-brand | Retry returns athletics/track-field construction results rather than employee-location tracking. |
| mashup / mashup-brand | Retry returns one Mashup page plus generic High Signal family pages, not two plausible Mashup-intent results. |

### Meaningful repair found in the searches

The [backtick URL](https://anime.significanthobbies.com/%60) appeared as an Anime
List homepage result. An anonymous GET on 2026-10-02 confirmed **HTTP 200** and a
homepage canonical for that invalid route. A local middleware repair now returns
404/noindex for unknown HTML SPA fallbacks (including HEAD), preserves known
app/API/assets, and stops intercepting valid anime/manga detail Markdown before
their route handlers. Five regression cases failed before the repair and pass
after it. Anime List's unit tests, typecheck and production build pass. The
source is **not deployed**; search recrawl/removal and hosted status remain open.
The candidate is preserved in
[draft PR #116](https://github.com/Significant-Hobbies/anime-list/pull/116), with
the existing dependency release gate explicitly documented.

PH Catalog's safe static discovery/analytics repair was merged in
[PR #4](https://github.com/Significant-Hobbies/ph-catalog/pull/4), passed the exact
main CI and six deployment gates, and deployed to its existing Pages project
from `aeae0dbbda0c9b22afb35d283577a56f8d7870a8`. Production deployment
`515b0268-6b73-4138-b398-544d32d444b1` was verified on the custom domain:
18 on-page/site checks passed, no internal/external HTTP errors or redirects,
and GET/HEAD unknown URLs return 404. The three fictional fixture pages are
intentional noindex/sitemap exclusions, not orphan repairs to force into Google.
Live browser checks at 1280 and 390 pixels show no horizontal overflow and queue
`sample_opened` and `source_repository_opened` with the correct project tag.
Analytics requests were intercepted during that test, so this proves live source
execution without inflating Clarity sessions. After Infisical reauthentication,
PH Catalog still has no resolvable project-scoped Data Export token; its provider
collection remains unavailable.

### Measurement and next-action boundary

Post-publication preflight confirms that the weekly root scope is complete
(44/44). The monthly scorecard still fails on the incomplete 132/142 GEO union,
partial Clarity coverage, and historical failed/stale domain-strength
receipts. Search Console and the performance collector pass their freshness
gates. Restoring an archived collector source does not repair its data-quality
defect or establish a fresh, successful provider measurement.

The [performance baseline](performance-baseline-latest.md) now contains 49 targets
and 98 desktop lab samples, with no failed collection. It is not mobile or field
CWV, nor proof that Cloudflare optimization caused traffic growth. The
[Clarity baseline](clarity-traffic-baseline-latest.md) distinguishes current source
wiring from provider data and unknown human sessions. After the owner's
Infisical reauthentication and bounded follow-up qualification, Clarity has
fresh three-day data for 35/43 eligible products: 110 sessions and 2,536 bot
sessions in separate provider fields. All seven original request failures
cleared; closed sockets were observed in two and a tested no-retry connection
mitigation was applied locally. Eight projects still lack resolvable tokens.
Overlapping refreshes were not summed. These counts do not
establish external-human attention or engagement, and the failures are not zero
traffic. Search Console's
latest successful receipt is 2026-10-02. The frozen manual-Claude citation panel
still has only its 2026-09-05 capture; WebSearch was not substituted into that
engine column.

Recommendation: qualify and publish the existing local source repairs under the
release boundary, then test one real StorageDaddy developer-cache walkthrough
against its working category discovery. Measure external human arrivals,
attributed downloads and repository referrals separately from requests and
directory placement. Do not expand generic content across every product on the
basis of these partial observations. Authenticated provider refresh and release
actions are now authorized. Infisical login is restored; Clarity's remaining
gap is eight unresolved tokens, not a fleet-wide login failure. The private
dashboard and read-only API are running locally
without an automatic second provider refresh.
Anime List's release remains gated by seven high-severity Axios advisories and
the requested explicit approval for the narrow 1.20.0 production-dependency fix.

### 2026-10-02 completion boundary after credential recovery

- Clarity: all 35 resolvable projects have fresh provider aggregates; the eight
  unconfigured projects remain unavailable. The source audit has zero blocking
  findings and 43 ready journeys. Provider capability settings remain separate
  and are not established by these exports.
- Validation: all 76 dossiers were regenerated from existing observations and
  the current canonical catalog, preserving verbatim owner material. Tracked
  infrastructure summary counts were corrected from canonical rows; provider
  observations and cloud resources were not changed. The full Site Health
  check passes, including build, backend tests and AI-package checks.
- Automation: the scheduler's token preflight no longer calls empty Infisical
  output a success; it emits no token values and fails closed. Its existing
  three-day launchd job is loaded but still has `RunAtLoad=false`; no persistent
  job was installed or replaced during this continuation.
- GEO: ten frozen-query observations remain unmeasurable under the relevance
  gate, not class C. Another exact Anchor check returned one owned journal page
  plus unrelated/related-family results; that does not satisfy two plausible
  product-intent results. The 132/142 broad run remains incomplete.
- Domain strength: the public courtesy API failed DNS resolution in a bounded
  curl check (`HTTP 000`, exit 6). The public ranks snapshot is dated
  2026-09-07 and is not current DR evidence. No bulk lookups, paid provider,
  archival collector run or fabricated DR readings were introduced.
- Release: Anime List's draft PR remains gated by its existing dependency
  findings and explicit dependency-upgrade approval. No new commit, push,
  deployment, migration, production config or credential mutation was made in
  this continuation. Local source fixes are verified, not published.

Credential-free implementation tracking:
[Site Health #502](https://github.com/sass-maker/site-health/issues/502) and
[SaaS Maker #168](https://github.com/sass-maker/saas-maker/issues/168).
Private traffic aggregates and token availability are not included in those
public issue bodies.

## Main constraint (2026-09-28 baseline)

There is no repeatable path from a specific audience need to a useful product result at meaningful scale. Technical crawlability is comparatively healthy: the 2026-09-27 Site Health homepage audit found zero critical findings on 36 of 42 public products, and the agent-index audit graded 29 S, 12 A, one B. Those are readiness checks, not discovery. The first live Search Console cohort shows very little ordinary-search traffic even on substantial sites. More metadata, sitemaps, AI files, or directory submissions alone will not create audience demand or authority.

The evidence does not establish that the products lack value or that visitors fail to activate. Most products lack enough measured qualified visits to test those hypotheses. Several products also lack a current human-traffic dashboard; do not interpret missing data as zero users.

## Live baseline read on 2026-09-28

Search Console: Web search, last 28 days, **2026-08-29 through 2026-09-25**. Domain properties include their subdomains; filters below isolate the stated product where possible. Totals and query rows can differ because Search Console hides some queries. Search impressions are not human visits.

| Product/surface | Search evidence | Interpretation |
| --- | --- | --- |
| SWE Interview Prep, `learn.significanthobbies.com` | 2 clicks / 7.23K impressions with page-host filter. After excluding queries containing `site:`, 0 clicks / 495 impressions, average position 63.2. Ordinary query examples: `covariance correlation` (30 impressions), `trie` (20). | The large raw impression count overstates ordinary demand. Pages are appearing for relevant queries but mostly far below click range. The site is also marked maintenance-only in its own `AGENTS.md`, so growth edits need a scoped product decision. |
| Meme Lab, `memes.significanthobbies.com` | 0 clicks / 0 impressions, including after excluding `site:` queries. | No observed Google reach in this period. Rights and useful reaction-result pages must precede a content expansion. Another agent is editing this repository. |
| Research Papers, `papers.highsignal.app` | 0 clicks / 0 impressions. | No observed Google reach in this period. The local AI-catalog fix has not been pushed or deployed and is not a traffic result. |
| CodeVetter, whole `codevetter.com` property | 9 clicks / 10.2K impressions, 0.1% CTR, average position 22. Query `ai code validation` had 29 impressions / 0 clicks at average position 80.9 on the existing comparison page. `/coding-agent-verification` had 1 click / 37 impressions and appeared for `verify code in agent loop` (13 impressions). | The domain aggregate includes Starboard. The highest-impression Repo Unpack pages were mostly surfaced for third-party file/URL searches and had no clicks; raw impressions overstate buyer reach. The verification page has a relevant query but weak position. A real public receipt and developer distribution are stronger next tests than another general comparison page. |
| PostTrainLLM, whole `posttrainllm.com` property | 4 clicks / 1.83K impressions. `/playground` had 246 impressions / 0 clicks, average position 9, but only one visible query with 2 impressions. | The apparently promising page has too little query detail for a confident content or title change. Verify query intent through more data before editing. |
| Significant Hobbies / Live | Old apex journey URL had 2 clicks / 117 impressions; its current `live.significanthobbies.com` canonical had 0 clicks / 4 impressions. The old URL redirects to the current canonical. | Do not count old-host impressions as current Live demand or treat that page as an established winner. |

Clarity: SWE Interview Prep dashboard set to last 28 days showed 67 sessions after excluding 1,059 bot sessions, 46 unique users, 2.12 pages/session, and 1.1 minutes active time. Only two sessions listed `www.google.com` and one listed `bing.com` as referrers. The session total includes local/developer referrers, so it is not a clean external-human count. The canonical Research Papers and Meme Lab Clarity project IDs from the catalog opened to Getting Started with the Dashboard disabled; their current Clarity traffic is **unavailable**, not zero. Clarity's rolling window is not necessarily the exact Search Console date range.

OpenSEO, US keyword estimates read 2026-09-28: `mac storage analyzer` had estimated 50 monthly searches and difficulty 12; `mac disk space analyzer` 210 / 15; `free up disk space mac` 1,000 / 10; `system data mac storage` 1,900 / 1. These are provider estimates, not measured visits or guaranteed opportunities. The `coding agent verification` expansion returned many unrelated certification terms, so its raw suggestion list is not a CodeVetter demand map. Its live SERP did show relevant developer articles, but CodeVetter was absent from the first ten results shown. Two hosted research searches reduced the free-trial balance from $0.50 to $0.40; the detailed usage display lagged. The official OpenSEO source was downloaded to a temporary checkout for inspection. Self-hosting still requires a DataForSEO API key and provider charges, so it does not make keyword data free. The Codex plugin is installed but its MCP is not signed in for this session; research above came from the signed-in web UI.

CodeVetter receipt gate: `pnpm bench:readiness` found all 20 public Copilot PR corpus cases schema-ready, but publication remains blocked by 60 external reviewer/comparator captures. These cases are candidates for a reproducible receipt, not completed verification results. Its SEO sprint now gates further comparison pages on one real-repository receipt and paired demand evidence.

StorageDaddy: the `daddyrad.com` Search Console property's available performance window started 2026-09-24 and showed 0 clicks / 0 impressions through 2026-09-25. URL Inspection reported `https://storage.daddyrad.com/` **on Google and indexed**. The disk-space title and description, sourced System Data answer, and download link were published from `04bf98a` and are live. A CI tooling-pin repair brought `main` to `1787f76`; CI passed and Worker version `ec8217d8-015a-49a8-a368-b6aecacef5d8` serves that exact commit at 100% traffic. Live `/download` and the update URL now return the qualified 7,124,560-byte build 110 DMG matching `site/release.json`; both had returned 404 before this deploy. The existing Product Hunt launch's website and GitHub links were changed from redirecting old hosts to the current canonical URLs. The next growth asset is a measured developer-cache scan walkthrough. Check recrawl, query impressions, Product Hunt referrals, and qualified downloads over the following weeks.

Release-tooling follow-up: `.github/workflows/release.yml` still pins the older SaaS Maker revision whose StorageDaddy repository allowlist uses the former GitHub owner. Its next protected release preflight would fail until that production workflow pin is updated under separate release-config authorization. This does not affect the now-live site, qualified build 110 download, or green candidate CI.

Account-submission check, 2026-09-28: the owner's existing StorageDaddy Product Hunt launch was updated to use `storage.daddyrad.com` and `Significant-Hobbies/storagedaddy` directly. MacUpdate search had no StorageDaddy result, but Add App requires a signed-in account; AlternativeTo was also signed out. The live r/macapps rules require 10 local karma before posting, limit developer self-promotion to one post per 30 days, and route developers without its trust/template approval to the monthly megathread. Its ready-to-post draft is therefore not yet an approved main-feed post. Product Hunt already has a different company's `MentionPilot` at the exact product slug, so that draft needs distinct naming and claim review before a submission.

## Product-specific first bottleneck hypotheses

These are hypotheses from the current product surfaces and limited traffic evidence. A product's first measurement or proof artifact may change its ranking. The corresponding exact next action is in `../../saas-maker/catalog/discovery-actions-2026-09-27.md` (a working review); keep public claims distinct from local drafts.

| Product | First limiting factor to test |
| --- | --- |
| CodeVetter | Relevant developer queries lack ranking and a reproducible verification receipt. |
| PostTrainLLM | Learning material has little search traffic; query intent behind visible impressions is unclear. |
| Live | Current canonical journeys have little search reach after the host move; quiz discovery needs a clear entry question. |
| SaaS Maker | A large catalog needs a selected, useful collection that a maker would seek or share. |
| GitStat | No proven public analysis example gives users a reason to share an outcome. |
| Kinetic | Gmail access/privacy concerns need a demonstrated, safe workflow. |
| Memory Map | Export value is hard to judge without a privacy-safe sample result. |
| High Signal | Repeated, dated predictions and outcomes are needed to earn trust and referrals. |
| High Signal Podcasts | Episode content needs source-linked answers to searchable questions. |
| IssuePages | External publisher supply is the gate before visitor demand can compound. |
| Research Papers | No observed search exposure; test one source-linked collection and indexing. |
| Significant Hobbies | Separate apps need a user-need guide that routes visitors to the right product. |
| Anime List | The best ordinary-query/page pair is unmeasured; choose it before adding content. |
| LoopTV | A distinct curated channel must be useful enough to seek and share. |
| Reader | A crowded category needs one clear capture-to-revisit proof. |
| SWE Interview Prep | Ordinary queries show weak ranking and no clicks in the measured period; pick one complete exercise if maintenance scope permits. |
| Calorie | A real logging walkthrough and confirmed store/public availability must precede app discovery. |
| Setline | A real session demo must show the workout loop and progress result. |
| Kith | Privacy-safe, concrete relationship-memory proof is missing. |
| RolePatch | A reviewable tailoring before/after example is needed for buyer-intent searches. |
| Karte | A real public profile and contextual handoff must demonstrate the result. |
| Starboard | A concrete useful alternative found from stars is the missing shareable proof. |
| AliveVille | Gameplay needs one visible persistent decision and consequence before venue promotion. |
| App Health | A reproducible integration-to-resolution example is needed for developer trust. |
| Mashup | A finished, rights-cleared edit is needed before video distribution. |
| Motion | A visible phone-to-screen play session is needed before game distribution. |
| Open Historia | An anonymous working campaign needs verification before a game listing. |
| Web Playables | One finished game needs a verified playable venue-native listing. |
| Paths | Original, cited career case studies need to answer specific questions; host migration affects measurement. |
| Sarthak Agrawal | Flagship case study and live proof are needed for referral authority. |
| Reddit Insights | A distinctive dated comparison needs source attribution and rights review. |
| Anchor | A complete, synthetic planner loop and current release proof are needed. |
| Nomad Data Adventure | Dataset reuse rights and value beyond its source must be established. |
| storagedaddy | The indexed site and qualified public download now work; it needs a measured scan/cleanup walkthrough and audience-fit distribution. |
| BrowserDaddy | A current-release cross-browser result and download are needed. |
| PerformanceDaddy | A measured diagnosis/action/outcome from the qualified release is needed. |
| Meme Lab | Usage rights and a genuinely useful result page come before scaling; current search exposure is zero. |
| Formula Composition Engine | Accuracy and assumptions need reviewed example proof before specialist promotion. |
| Every Song Is a Website | Lyrics/media rights and one original world walkthrough gate promotion. |
| ContextDaddy | A real conflict diagnosis and current-release proof are needed. |
| MentionPilot | A permitted brand's source-to-action report is needed to show value. |
| DaddyRad | Cross-discovery needs a current-release guide to the right utility for each Mac problem. |

## Decision from this baseline

Start with one audience-product loop rather than spreading content across all 42. For an organic-search test, SWE's ordinary-query rows show interest but weak ranking; its maintenance-only status means content work needs to be deliberately scoped. For a developer-channel test, CodeVetter needs one reproducible public receipt. For a native utility, StorageDaddy now has a live search answer and qualified download; its next asset is a measured scan walkthrough shared with a suitable Mac audience. Track publication, index recrawl, distribution placement, external human sessions, Google non-brand clicks, qualified downloads, and referral source over the following weeks. Keep cross-platform video plays, impressions, sessions, and owned-site pageviews as separate measures.

Sources: signed-in Google Search Console, Microsoft Clarity and OpenSEO dashboards read 2026-09-28; canonical `../../saas-maker/catalog/projects.json`; Site Health `apps/backend/data/seo-audit/latest.json` and `apps/backend/data/agent-index/latest.json` dated 2026-09-27; `../../swe-interview-prep/AGENTS.md`; live redirect and canonical check for the Simone Biles journey; [Apple's description of System Data](https://support.apple.com/en-us/102624); [OpenSEO self-hosting requirements](https://github.com/every-app/open-seo#self-hosting).
