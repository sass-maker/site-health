# Ahrefs email triage — 2026-10-02

Owner-local evidence. The initial diagnostic sections below reflect the local-only state through 13:38 UTC; the authorized release follow-up records subsequent production changes. No raw email bodies, tokens, cookies or sign-in URLs are retained here.

## Access

- Personal Gmail connector access works. The ten latest relevant Ahrefs audit alerts were read, covering Significant Hobbies, CodeVetter, SaaS Maker, PostTrainLLM, High Signal, RolePatch, the portfolio, AliveVille, Pace and Karte.
- Clarity Google sign-in was attempted with the personal Gmail identity. Google rejected the automated browser: “This browser or app may not be secure.” Authentication did not complete. Native browser control is unavailable in this session. Email access is not a Clarity login or export-token grant.
- Ahrefs' report URL remains at a Cloudflare browser challenge. Its per-issue URL lists and crawl failure diagnostics are unavailable. The API audit reports `missing-api-key`; no provider score is substituted with zero.

## Confirmed causes and local remediation

| Finding | Current evidence | Local fix and verification | Release state |
|---|---|---|---|
| RolePatch stale HTML / removed assets | `/pricing` and `/tools`: 15 distinct script URLs return 404; `x-edge-cache: HIT`, with Age values 27,664 and 56,727 seconds. Fresh query URLs return another build; all 15 pricing scripts return 200. | Existing assets `BUILD_ID` namespaces the cache key. Missing metadata bypasses cache. One-day edge storage is retained; browser documents must revalidate. RSC, prefetch, authorization and session requests bypass it; cookie-setting responses are not stored. Focused tests and typecheck pass. | Local only; [#78](https://github.com/Significant-Hobbies/rolepatch/issues/78). |
| RolePatch docs placeholder hyperlink | `/api/public/v1/surfaces/%7Bid%7D` returns 404 from the docs link. `/api/ai` identifies `home` as a real surface. | Link retains the documented template label but points to the concrete home example. Seven routes are labelled correctly. Seven agent-surface tests and Astro build pass; built HTML has no placeholder href. | Local only; same issue. |
| Portfolio Cloudflare email rewrite | The same `/cdn-cgi/l/email-protection` 404 is linked from all 13 sitemap pages. | Documented `email_off` comments protect the public footer, privacy and resume contacts. All 13 built HTML/Markdown/catalog routes pass the strengthened build check; 9 Node tests pass. Existing public JSON already publishes the address. | Local only; [#39](https://github.com/Significant-Hobbies/portfolio/issues/39). |
| SaaS Maker plaintext email rewrite | The link-graph check found the same 404 on directory pages. A specific live example is the plaintext contact in `/launchdesk/360quadrants.com`, not just a mailto anchor. | The public Layout slot has one exclusion pair, protecting public catalog content without nested markers or a zone-setting change. The 1,196-page build has 286 protected address occurrences and four protected mailto links; the plaintext example survives. 13 focused showcase tests pass. | Local only; [#171](https://github.com/sass-maker/saas-maker/issues/171). |
| Empty-success audit gap | A nonexistent SaaS Maker sitemap-index route returns HTML with status 200; the old link-graph audit parsed no URLs and reported no error. | The audit now requires a sitemap document before parsing. Regression plus existing local/link-graph tests pass (6). | Local tooling only; same issue. |

Cloudflare's [email exclusion documentation](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/) guided the source markers. The [Cache API documentation](https://developers.cloudflare.com/workers/runtime-apis/cache/) guided separate cache storage and client response policies. The cache change has unit/build-artifact evidence, not deployed Workers-runtime proof.

## Findings not yet closed

| Provider alert | Current first-party check | Disposition |
|---|---|---|
| CodeVetter: 16 broken JavaScript resources | Homepage assets and 13 distinct assets from four selected docs/marketing/unpack pages return 200 with JavaScript MIME types. | Not reproduced in that sample; exact provider URL list remains necessary. Do not call all 16 fixed. |
| RolePatch: robots inaccessible | Initial 12-second timeout; a later request returns 200 and valid text. | Intermittent availability is possible; exact provider error and repeated geographically representative checks are still needed. |
| SaaS Maker: robots inaccessible | Canonical `/robots.txt` returns 200; provider reports four affected resources but email has no URL list. | Root success does not clear other hosts or historical failures. |
| High Signal: crawl failed to start | Canonical homepage, robots and advertised sitemap return 200. | Failure reason absent from email; no evidence for disabling security or changing crawl settings. |
| Significant Hobbies: partial crawl | Canonical homepage, robots and advertised `/sitemap.xml` return 200. `/hub` redirects to the maintained app; the unadvertised sitemap-index route redirects as well. | Root reachability alone cannot explain the partial crawl. Preserve private Hub access boundaries. |
| Portfolio: older sitemap redirects/noncanonical/noindex rows | All 13 current sitemap pages return directly, with no sitemap-page redirect in this sample. | Exact historical URLs and recrawl are still needed. |
| PostTrainLLM and AliveVille: orphan pages; other products' metadata/link notices | The emails contain counts but not the necessary per-page lists. | Unverified. The existing link-graph tool's “orphan candidates” means linked URLs absent from the sampled sitemap, not Ahrefs' no-incoming-link definition. |

The standard canonical-root on-page audit crawled 280 URLs across 11 roots and returned zero on-page actions. It does not check JavaScript integrity, all internal links, all hosts or provider crawl settings; the targeted checks above demonstrate why that zero is not an all-clear.

Production clearance requires an explicitly authorized clean release, anonymous canonical-page and referenced-asset checks, cache warm-hit and signed-in/RSC bypass checks, and a provider recrawl after dashboard access is restored. Google authentication remains a user/browser handoff; repeated automated attempts or security workarounds are not part of this fix.

## Workspace verification

- RolePatch: 16 focused tests, TypeScript typecheck, affected-file Biome checks and syntax checks pass; Astro overlay builds successfully. Cache-key construction also reads the existing OpenNext build artifact successfully. Full Workers release qualification is still pending.
- Portfolio: build, 13-route strengthened agent/contact check, and 9 Node tests pass.
- SaaS Maker: 13 focused showcase tests, 6 local/link-graph tests, affected test-file Biome check, build and the 1,196-page contact-exclusion inspection pass.
- Site Health: build, 167 backend tests, 11 AI visibility tests and the clean packed-consumer test pass separately. The combined `pnpm check` stops at the current stale-dossier gate (76 generated dossiers); it is **not** fully green. This pass does not regenerate unrelated portfolio observations or change catalog history to force that gate green.
- Diff whitespace checks pass. Unrelated dirty source, catalog and generated observations remain preserved. These are bounded regression fixes, not a new feature/spec or visual redesign.

## Authorized release follow-up — 14:10 UTC

The owner explicitly requested implementation and release. Three narrow PRs were
merged and deployed from independent clean current-main clones, preserving all
unrelated dirty checkout changes. No dependency, migration, secret, DNS, zone,
Cloudflare setting, API Worker or inbox deployment change was made.

| Public surface | Merged source | Exact-main CI and release | Provider receipt |
|---|---|---|---|
| RolePatch | [PR #79](https://github.com/Significant-Hobbies/rolepatch/pull/79), `e44d5e00b7b875e4ed6085fc2726aca677e949a3` | [CI 37016649132](https://github.com/Significant-Hobbies/rolepatch/actions/runs/37016649132), Docs 37016649121, six Fleet gates, [production 37017144734](https://github.com/Significant-Hobbies/rolepatch/actions/runs/37017144734), including production smoke: success | Deployment `b2ef5475-1680-43cb-a0ca-6bb0590fb39f`; version `ae147357-27a3-460a-8fb8-2ea48cfb13aa`; exact full-SHA tag at 100% |
| Personal portfolio | [PR #40](https://github.com/Significant-Hobbies/portfolio/pull/40), `41c6dc094947d6b62f43c6fe1bfda68b30263619` | [CI 37016576647](https://github.com/Significant-Hobbies/portfolio/actions/runs/37016576647), six Fleet gates, [production 37016720796](https://github.com/Significant-Hobbies/portfolio/actions/runs/37016720796): success, deploy step executed | Pages production/main `3acac738-4a96-4f03-a14c-38752727e99d`; provider source prefix matches workflow full SHA |
| SaaS Maker directory | [PR #173](https://github.com/sass-maker/saas-maker/pull/173), `05cb10ee2239d8dab517dc5ad5dd7dc7f099db65` | [CI 37016579338](https://github.com/sass-maker/saas-maker/actions/runs/37016579338), [Tooling CI 37016579336](https://github.com/sass-maker/saas-maker/actions/runs/37016579336), six Fleet gates, existing `deploy:directory` pipeline and all 4 production smokes: success | Pages production/main `e3327bda-0772-43f8-9855-78be64744ff2`; provider source prefix matches clean main |

### Live qualification

- Canonical RolePatch pricing and tools pages return HTTP 200, transition MISS
  to HIT within the current build, and send
  `public, max-age=0, must-revalidate` to clients. Every referenced Next.js
  script returns 200 with JavaScript MIME type: 15 pricing references and 14
  tools references. Both pages render in a real browser with healthy Next assets.
- Synthetic RSC, router-prefetch, authorization and session-cookie requests
  bypass custom document caching on both routes. The synthetic incomplete RSC
  request receives a framework 307, not cached HTML; real browser router
  prefetches to six tools return 200. This is not a real signed-in session test.
- RolePatch docs now link to the real home example, whose JSON endpoint returns
  200 with id `home`; the literal template href is absent.
- Every contact-bearing built/public page was checked: all 13 portfolio pages
  and all 107 directory pages return directly with HTTP 200, public contact text
  retained, and zero `/cdn-cgi/l/email-protection` links. The release directory
  builds 1,193 HTML pages, protecting all 286 human-content address occurrences
  and four mailto anchors. Cloudflare consumes the exclusion comments on delivery;
  their presence is verified in compiled output, not asserted on delivered HTML.
- RolePatch full local quality passes 501 tests; portfolio full local quality
  and 9 tests pass. SaaS Maker's 45 showcase tests, three link-graph tests and
  public tooling validation pass. RolePatch's separate standalone release script
  stops at `/jobs` without its D1 binding; production Workers smoke passes.
- The canonical catalog now records all three attributed release receipts.
  Catalog sync and four schema tests pass. All 76 dossiers regenerate from the
  existing observation state; every ownerVoice block remains byte-exact. The
  previous generated copies were backed up before regeneration. Full Site Health
  `pnpm check` now passes: dossier validation, build, 167 backend tests,
  11 AI visibility tests and packed-consumer qualification. Historical Git
  drift/unavailable checkouts remain explicit advisories, not silently rewritten.

### Still open

Ahrefs recrawl, exact provider issue lists and Google/Clarity authentication are
still blocked by the provider/browser access described above. These releases
resolve the reproduced source defects, not every alert across the portfolio.
Real browser verification also found RolePatch's legacy Web Vitals collector
returning POST 404. This separate tracking gap is recorded in
[#80](https://github.com/Significant-Hobbies/rolepatch/issues/80); no collector
configuration was changed. The Clarity tag and PostHog configuration load in the
same browser sample, which does not prove complete collection or export access.
