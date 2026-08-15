# Public Product Smoke — Fleet

Generated: 2026-08-11T15:20:06Z

Scope: the 31-product Fleet audit from 2026-07-29 plus targeted post-deployment
spot checks for Office OS and Local AI Video Studio on 2026-08-11. The older
product evidence was retained rather than represented as newly tested.
Excluded by Fleet policy: TrueHire, Open Historia, the personal website,
API-only origins, duplicate domains, and private operational consoles.

Method: at most six distinct surfaces per product, with one safe meaningful
interaction per surface where possible. The audit did not sign in or out,
create accounts, enter credentials, submit messages or forms, save user state,
purchase, upload private data, trigger production jobs, or probe rate limits.

## Targeted follow-up — portfolio project strip

Generated: 2026-08-15

The shared project strip was checked after deployment on all 28 maintained
public roots selected by the canonical Fleet registry. Every root returned 200,
loaded the current strip, identified its own source project, and rendered
outbound destinations with `ref=<source-project-id>`. Representative browser
checks on SaaS Maker, Email Manager, Motion, RolePatch, and Starboard also
confirmed a 44px link target, no visible author or pause controls, working
hover/focus descriptions, and static touch/reduced-motion behavior. Result:
**28/28 pass, with no strip-specific findings.** This is a focused component
smoke test and does not replace the broader product verdicts below.

## Customer-visible failures

### CodeVetter

- **Status:** fail
- **Authentication:** public-persistent; guest
- **Surfaces tested:** 5
- **Failure:** Landing, FAQ, docs, and the external release target worked, but
  ordinary landing → FAQ → docs → benchmark navigation triggered Cloudflare
  Error 1015. The page said the visitor was temporarily banned and provided no
  recovery path or `Retry-After`.
- **Evidence:** Ray ID `a22decef2a64b15f`; `2026-07-29 17:43:22 UTC`.
- **Next diagnostic:** identify the exact hostname rule, scope, and identity key
  that blocks ordinary navigation.
- **Tracking:** [CodeVetter issue #63](https://github.com/Codevetter/codevetter/issues/63).

### Pace

- **Status:** fail
- **Authentication:** public-persistent; guest
- **Surfaces tested:** 5
- **Failure:** The primary `Download Pace 0.3.19` ZIP target returned 404 on the
  initial read-only check and the single permitted retry.
- **Working surfaces:** landing, pricing, comparisons, and docs.
- **Next diagnostic:** reconcile the deployed download-page version with the
  assets published under `HeyPace/pace`.
- **Tracking:** [Pace issue #116](https://github.com/HeyPace/pace/issues/116).

### Starboard

- **Status:** fail
- **Authentication:** public-personalized; guest
- **Surfaces tested:** 2
- **Failure:** `/discover` rendered `0 repos`, `No languages yet`, and
  `Couldn't load discover results`. The built-in Retry reproduced the failure.
  Auth.js attempted to parse an HTML document as JSON.
- **Next diagnostic:** inspect the deployed auth-session response and guest
  discover endpoint content type before UI rendering.
- **Tracking:** [Starboard issue #42](https://github.com/Codevetter/starboard/issues/42).

### Anime List

- **Status:** fail
- **Authentication:** public-persistent; authenticated session, guest behavior
  not verified
- **Surfaces tested:** 2
- **Failure:** `/search` rendered its controls but no results and showed
  `Couldn't reach the search service`. The built-in Retry reproduced the
  failure after another 12 seconds.
- **Next diagnostic:** capture the failed production search request/status and
  inspect the owning API or Worker logs and live bindings.
- **Tracking:** [Anime List issue #26](https://github.com/Significant-Hobbies/anime-list/issues/26).

## Degraded

### High Signal

- **Status:** degraded
- **Authentication:** public-persistent; guest
- **Surfaces tested:** 6
- Filtering, signal details, and track record worked.
- `/history` publicly says `History is being worked on`.
- The production sign-in surface visibly displays `Development mode`, and the
  console reports development-key limits.
- **Next diagnostic:** confirm the intended History contract and production
  Clerk key configuration.
- **Tracking:** [History issue #54](https://github.com/High-Signal-App/high-signal/issues/54)
  and [Clerk issue #53](https://github.com/High-Signal-App/high-signal/issues/53).

### Drank

- **Status:** degraded
- **Authentication:** public-persistent; guest
- **Surfaces tested:** 3
- Domain filtering and `/data` worked, including 45 domains and 315 snapshots.
- `/changelog` returned the Next.js 404 twice.
- **Next diagnostic:** compare the production route manifest/build artifact
  with the expected changelog route.
- **Tracking:** [Fleet issue #60](https://github.com/sass-maker/fleet-workspace/issues/60).

### Materia

- **Status:** degraded
- **Authentication:** public-persistent; guest
- **Surfaces tested:** 5
- Search, remedy details, checker, and condition browsing worked.
- The primary 3D body explorer remained on `Loading 3D body…` after 12 seconds,
  a reload, and another 12 seconds, without an error fallback.
- **Next diagnostic:** inspect deployed model loading, GLTF/WebGL
  initialization, and add an explicit failure state.
- **Tracking:** [Materia issue #4](https://github.com/Significant-Hobbies/materia/issues/4).

### India Standards

- **Status:** degraded
- **Authentication:** public-persistent; guest
- **Surfaces tested:** 1 calculator with multiple cohort states
- Final estimates were coherent, but changing Men → Women briefly displayed the
  previous 17,200 estimate under the new cohort label before correcting to
  4,620.
- **Next diagnostic:** clear or cover the prior estimate atomically when a
  cohort change starts.
- **Tracking:** [India Standards issue #6](https://github.com/Significant-Hobbies/india-standards/issues/6).

### LoopTV

- **Status:** degraded
- **Authentication:** public-persistent; guest
- **Surfaces tested:** 3
- Channel browse and YouTube playback worked.
- The Science station reported catalog data 14–17 days stale.
- **Next diagnostic:** inspect the catalog build job and deployed timestamp.
- **Tracking:** [LoopTV issue #19](https://github.com/Significant-Hobbies/looptv/issues/19).

## Not verified

### Email Manager

- **Authentication:** required-user; anonymous
- **Surfaces tested:** 4
- The landing, About, Privacy, and `/app` sign-in handoff rendered. OAuth was
  not invoked.
- Public copy conflicts: the landing says `0 bytes on our servers`, while the
  Privacy page says encrypted OAuth tokens, aggregate fingerprints, and
  suggestion state are stored.
- **Next diagnostic:** reconcile public trust copy with the deployed data flow,
  then run the mailbox flow in an approved read-only account.

### ChatGPT Memory Insights

- **Authentication:** public-persistent; anonymous/local-only
- **Surfaces tested:** 2
- Configuration controls worked, including language, preset, and threshold.
- Import, parsing, atlas, map, Story, Chat, and recovery states require a safe
  synthetic archive and were not exercised.

### Free AI

- **Authentication:** required-service; public docs/observability only
- **Surfaces tested:** 5
- Landing, getting started, health, and dashboard rendered. Health reported 138
  snapshots, 5 available providers, 64 degraded, and 96 needing attention.
- No service key was entered and no inference request was made.

### PSI Swarm

- **Authentication:** local companion required
- **Surfaces tested:** 5
- Gallery worked. Runner, projects, compare, and watchlist presented a clear
  local-agent boundary.
- A disposable local companion was not started.

### Knowledge Base

- **Authentication:** required-service; anonymous
- **Surfaces tested:** 2
- Public landing worked; the operator dashboard correctly redirected to
  Cloudflare Access. No sign-in or service token was used.

### Calorie

- **Authentication:** public-persistent; existing authenticated session
- **Surfaces tested:** 2
- Today and Progress worked without mutation.
- A clean guest proof would require changing browser state, so the guest
  contract remains not verified.

### AliveVille

- **Authentication:** public-persistent; anonymous with pre-existing local save
- **Surfaces tested:** 2
- Landing and game chooser worked; six worlds rendered.
- Kokoro voice reported fallback mode and the local AI brain required WebGPU.
  No world was entered because that could mutate the existing save.

### App Health

- **Authentication:** required-service/owner key; anonymous
- **Surfaces tested:** 1
- The public explanation and unlock boundary worked. No owner key was entered,
  so the private dashboard remains not verified.

## Passing

### PostTrainLLM

- **Surfaces tested:** 5
- Landing, artifact browse/detail, leaderboard, and local playground corpus
  loading worked. No training or generation job was triggered.

### Fleet Public Directory

- **Surfaces tested:** 4
- Product directory, product detail, learning index, and learning article
  worked. The private Fleet Console was not bypassed.

### RolePatch

- **Surfaces tested:** 6
- Guest dashboard, 732-job browse, tools, local bullet checker, and blog detail
  worked. The checker analyzed sample text and returned `100/100`.

### Karte

- **Surfaces tested:** 6
- Landing, public profile, public chat opening, encyclopedia mode, FAQ, and the
  create/sign-in boundary worked. No message, draft, import, or save occurred.

### Significant Hobbies

- **Surfaces tested:** 4
- Hub, Life in Weeks, bucket-list browse, and sourced public list detail worked.

### Chess

- **Surfaces tested:** 3
- Board, Flip Board, Best Move Hint/Clear Arrow, and FAQ worked.

### Reader

- **Surfaces tested:** 4
- Landing, guest-local library, sample article, and extension auth boundary
  worked. Library hydration took roughly 12 seconds.

### SWE Interview Prep

- **Surfaces tested:** 3
- Today, Learn, and a complete public runtime-roadmap lesson worked. No progress
  or AI-grading mutation was invoked.

### Setline

- **Surfaces tested:** 4
- Today, Programme, History empty state, and optional sync boundary worked. No
  workout was started or saved.

### Protein Index

- **Surfaces tested:** 3
- The catalog reached `Source-complete` with 19,016 records. Searching `Amul`
  narrowed 1,732 discovery records to 17, and product evidence detail opened.

### What It Takes to Win

- **Surfaces tested:** 5
- Landing, Explore, Bill Gates search/detail, and the unsubmitted comparison
  questionnaire worked across the public journey.

### EverythingRated

- **Surfaces tested:** 5
- Directory browse, Aider detail, shared comparison, and empty My Ratings state
  worked without a rating mutation.

### Research Papers

- **Surfaces tested:** 4
- Semantic search returned ranked OpenReview results. Digest, reading paths,
  and corpus data worked. Paid RAG was not invoked.

### SaaS Ideas

- **Surfaces tested:** 1
- Filtering `construction daily report` reduced the live catalog from 140
  records to the expected single matching row.

### Office OS

- **Surfaces tested:** 2
- Canonical landing and release-status navigation worked as a guest at
  `https://office-os.pages.dev/`.
- The page had no console errors or binary links. Public `release.json`
  reported version `0.1.0 (1)`, arm64, `preparing`, and all four trust gates
  false, matching the intended fail-closed distribution posture.

### Local AI Video Studio

- **Surfaces tested:** 2
- Canonical landing and release-status navigation worked as a guest at
  `https://local-ai-video-studio.pages.dev/`; both real native product images
  loaded at their expected dimensions.
- The page had no console errors or binary links. Public `release.json`
  reported version `0.1.0 (1)`, arm64, `preparing`, and all four trust gates
  false, matching the intended fail-closed distribution posture.

## Summary

| Verdict | Count |
|---|---:|
| Fail | 4 |
| Degraded | 5 |
| Pass | 16 |
| Not verified | 8 |
| **Total** | **33** |

Only one blocking rate-limit event occurred: CodeVetter Cloudflare 1015 during
ordinary navigation. No product was load-tested or probed for thresholds.
