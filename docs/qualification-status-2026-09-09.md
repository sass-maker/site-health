---
title: Portfolio qualification status — 9 September 2026
---

# Portfolio qualification status

Read-only reconciliation of the [canonical catalog](../apps/backend/config/projects.json),
[qualification evidence](shareability-verification-2026-09-07.json),
[condensed owner intent](portfolio-condensed-2026-08-23.md), and the owning receipts
linked below. This is a dated decision aid, not a lifecycle or readiness update.
Native work and other agent tasks may continue after this snapshot.

## Denominator and meaning

Both catalog and evidence contain **57 unique identities**. Excluding Nomad Data
Adventure, Chess and Journal gives **54: 25 scoped shareable surfaces and 29
nonshareable identities**. Twenty-five is not a count of complete products:
it includes public guest surfaces, developer previews and parked experiments.
Authentication, device, provider and whole-product claims retain their own gates.

| Nonshareable disposition | Count | Scope |
| --- | ---: | --- |
| Intended usable products awaiting qualification | 18 | Blocker table below; includes replacement recommendations that do not authorize retirement. |
| Internal infrastructure without an independent public-product requirement | 2 | Site Health and iOS Landings. |
| Explicitly retained, unpromoted experiments | 6 | Reel Pipeline, AliveVille, Motion, Open Historia, Companion Robot, Forecast Lab. |
| Historical references | 2 | Mobile Dev Cockpit and TrueHire. |
| Held storefront prototype | 1 | Verified Bases. |
| **Total nonshareable** | **29** | No automatic reactivation or new release requirement is implied. |

These are qualification-work dispositions, not replacement lifecycle fields.
The condensed owner review explicitly preserves completed tools, keeps native
and shared infrastructure useful, and assigns reopen conditions to held work.
It explicitly retains Reel/Forecast without a sharing requirement and identifies
Cockpit/TrueHire as predecessors or retirements. Verified Bases remains a held
demand/economics experiment. Later owner steering says to keep Office OS and
Local AI Video Studio for now; replacement recommendations remain advisory.
The 25 passes also contain parked artifacts, including Web Playables, so even
subtracting the nine nonshareable held/reference identities does not produce
an “actively maintained consumer products” count.

`inRegistry=true` counts **41**, a separate inclusion flag. The canonical
lifecycle snapshot is **2 primary / 20 active / 35 inactive**; the excluded
54 are **2 / 19 / 33**. The condensed summary now matches the canonical **2 / 20 / 35** totals.
Legacy `portfolio.status` counts **44 active / 13 archived** and must not be
used interchangeably with lifecycle. Catalog and evidence shareability booleans
agree at this snapshot; their descriptive narratives are not equally current.

## Remaining intended-product qualification

| Product | Strongest blocker and verified boundary | Owning evidence |
| --- | --- | --- |
| Pace | Physical voice/screen/action workflow and distribution qualification remain. PR 187's website corrections passed exact-main CI and six deployment gates; deployment34329542452 succeeded. Public home/download checks at390/1440 pass with corrected opening guidance. The v0.3.19 ad-hoc Mac preview is unchanged; this is not a notarization or hardware pass. | [Status](https://github.com/HeyPace/pace/blob/main/PROJECT_STATUS.md), [Deployment](https://github.com/HeyPace/pace/actions/runs/34329542452) |
| Drank | Scheduled collector authentication, fresh shared observations and raw redistribution scope. Personal lookup/reload passed; shared history remains dated. | [#18](https://github.com/sass-maker/drank/issues/18) |
| Email Manager | Real account → mailbox → search/reindex → reload/account switch. Real local model/IndexedDB migration and deployed mobile guest UI pass; the tiny synthetic ranking diagnostic is not mailbox acceptance. | [#54 receipt](https://github.com/Significant-Hobbies/email-manager/issues/54#issuecomment-5597898024) |
| Free AI | Sustained protected inference and consumer recovery. One post-release consumer run had zero operational errors but published no signal. | [#65](https://github.com/sass-maker/free-ai/issues/65) |
| High Signal | Useful evidence-qualified daily publication and sustained generation reliability. Successful infrastructure jobs and an editorially rejected candidate do not establish a useful daily edition. | [#133](https://github.com/High-Signal-App/high-signal/issues/133) |
| Knowledge Base | Legacy provenance backfill/recovery, controlled activation and real private document workflow. Offline parse staging and gated never-dispatched recovery are verified in source/tests; migration0010 is unapplied and live D1/R2/Vectorize convergence remains unproven. | [#48 fresh receipt](https://github.com/sass-maker/knowledge-base/issues/48#issuecomment-5598850769) |
| Significant Hobbies Hub | Google rejects the Live callback registration. Real hosted Hub session, account isolation and native continuity remain unqualified despite deployed routing repairs. | [#154](https://github.com/Significant-Hobbies/significanthobbies/issues/154), [Live #14](https://github.com/Significant-Hobbies/live/issues/14) |
| India Standards | A normal visible Turnstile click still fails in the isolated browser; no hosted default/sparse/unsupported calculation completed. This does not establish a MotherDuck outage. Usage/NFHS gates remain separate. | [#35 fresh receipt](https://github.com/Significant-Hobbies/india-standards/issues/35#issuecomment-5598017386), [#36](https://github.com/Significant-Hobbies/india-standards/issues/36) |
| Anime List | Real authenticated tracking, reload, account isolation and expiry/write recovery. Fresh mobile guest search → detail → reload passes without overflow. | [#89 fresh receipt](https://github.com/Significant-Hobbies/anime-list/issues/89#issuecomment-5598081800) |
| Calorie | Unlocked physical use, approved account/sync isolation and distribution. Installed build14 has not completed that acceptance; the newer no-target/status-bar repair passed exact CI and installed without launching or syncing the app. | [#88 fresh receipt](https://github.com/Significant-Hobbies/calorie/issues/88#issuecomment-5598061379) |
| Setline | Real workout/restart/account recovery and distribution. Build 10 installed, deliberately not launched; tests do not replace physical exercise. | [#77 receipt](https://github.com/Significant-Hobbies/setline/issues/77#issuecomment-5597955994) |
| Kith | Physical relationship workflow, account replay/recovery, sync and distribution. Build 12 installed, deliberately not launched. | [#27 receipt](https://github.com/Significant-Hobbies/kith/issues/27#issuecomment-5597955713) |
| Karte | Protected profile workflow and real AI answer. A visible Turnstile attempt failed; Send stayed disabled and no synthetic conversation was created. | [#82](https://github.com/Significant-Hobbies/karte/issues/82) |
| App Health | Owner-key onboarding, origin-allowlisted ingest and real production aggregates. Published SDK installation/release parity are verified. | [#55](https://github.com/sass-maker/app-health/issues/55) |
| Anchor | Failed-save repairs now include resume, start/extend and atomic scheduled starts at b7f1e99, with 219 tests and three platform compilation checks; see below. Build 25 still needs hosted native acceptance after billing/spending blocked the prior run before steps. Signed/device, historical CloudKit copies and distribution gates remain. | [#52](https://github.com/Significant-Hobbies/anchor/issues/52), [#40](https://github.com/Significant-Hobbies/anchor/issues/40) |
| Reader | Real Google/D1/R2 capture → read → annotate → reopen. Google reaches credential entry; concurrent note repair is deployed, but real account/cloud acceptance remains absent. | [#55 fresh receipt](https://github.com/Significant-Hobbies/reader/issues/55#issuecomment-5597460215) |
| Office OS | No recurring native outcome workflow or public distribution qualified; due-work dispatch is foreground-only. Compare existing assistants before expansion; keep the project under current owner instructions. | [README](https://github.com/sass-maker/agent-office/blob/main/README.md) |
| Local AI Video Studio | No complete creator workflow or supported public installation qualified. Actual local export/catalog evidence exists, but effects retain disclosed approximations/fallbacks. Compare established editors; do not retire autonomously. | [#33](https://github.com/sass-maker/local-ai-video-studio/issues/33), [README](https://github.com/sass-maker/local-ai-video-studio/blob/main/README.md) |

Anchor's additional end/surrender failure was reproduced with actual SwiftData
disk storage against `1c628ea`: one test failed three assertions after a simulated
out-of-space save, leaving a running disk session and a prematurely committed
capture while the UI cleared its session. Fix `309a3ff` commits once, preserves
the active session and draft on failure, and delays observable finish effects
until success. All 208 package tests and Mac/iOS compile-only checks pass.
Hosted run34325826905 failed before steps due to GitHub payment/spending limits.
Build25 remains uninstalled and unreleased. [Owning receipt](https://github.com/Significant-Hobbies/anchor/issues/52#issuecomment-5598218479).

Later source `b7f1e999d25e2c643a3a58ba5656923aead51952` also repairs resume,
start/extend and scheduled-start persistence. Session, schedule link and deliberate
replan now commit together; failed writes restore state and exact retries do not
duplicate sessions. An intentional changed activity still starts a new session.
All 219 package tests pass in owning and isolated pinned-Hub copies, with
Mac/iOS/Watch compile-only checks passing. The dispatch-only hosted workflow has
no exact-head run; the prior billing failure remains the latest hosted evidence.
[Scheduled-start receipt](https://github.com/Significant-Hobbies/anchor/issues/51#issuecomment-5599058806).

Kith source `f812595eb132c8c3f678e168c20914702cdcd7d1` passed exact
[CI34330034379](https://github.com/Significant-Hobbies/kith/actions/runs/34330034379):
43 native tests and Release compilation. Actual AppModel callers now have proof
for late account responses, failed-import cursor preservation and retry/reopen.
Setline source `168a5544f7801fb28ea2b9316a525bf9b8773980` passes 234 local
native tests (17 UI, one existing credential skip), Release compilation and
81.2483% coverage. Its caller tests preserve detailed workout history during
delayed Hub pulls and account changes. Exact
[CI34331558029](https://github.com/Significant-Hobbies/setline/actions/runs/34331558029)
is running at this snapshot. These changes add tests and a shared composition
seam; the installed builds are unchanged. Complete rendered persistence loops
and real-device/provider acceptance remain separate work.

Knowledge Base source `33b0e338d965bd90256b29754a311921d777d811` passed exact
[quality CI34331170867](https://github.com/sass-maker/knowledge-base/actions/runs/34331170867)
and Docs34331170937, with 424 Worker and 6 dashboard tests. Authenticated,
tenant-scoped recovery cancels only operations whose artifact writes never
started. Race proof uses independent ledger instances on one real SQLite
connection, not live D1 concurrency. Migration0010 remains unapplied; started or
uncertain writes, legacy backfill, activation and real document acceptance remain
open. [Recovery receipt](https://github.com/sass-maker/knowledge-base/issues/48#issuecomment-5598937698).

## Latest priority-app evidence

This later wave supersedes the earlier native checkpoints above. Setline has a
new signed installation, as does Calorie; shareability flags retain the outstanding acceptance gates.

| App | Newly verified | Remaining practical gate |
| --- | --- | --- |
| Kith | `03689bf` passed exact CI34333207923: 44 tests, including nine UI, and Release. Actual create/edit/selective-delete/person-delete/relaunch preserves expected records; screenshots were reviewed. | Unlocked physical use, real account approval/recovery and iCloud convergence; current signed distribution remains unqualified. Installed build12/source34a6cae is unchanged. |
| Setline | `af7071d` fixes the reproduced history numbering error. Actual record/rest/relaunch/resume/finish/reopen preserves set segments and authored order. All239 local tests, including18 UI, plus Release pass; one existing credential test is skipped. | Exact CI34334618829 passed239 native tests/Release. Signed af7071d installed as build10 without launch, sync or reset; source/hash receipts and the previous artifact are retained. Physical workout, real account/iCloud and distribution remain open. |
| Calorie | `3739744` removes the invented budget after an explicit no-target choice. Actual food210kcal/water250ml persist after relaunch; the independent journal is empty. Configured-target edit/delete/undo still passes. Final focused UI, Release and87 server checks pass. | Exact CI34335213288 and prior c1ef9d4 CI34332653952 passed. Follow-up15c6aa1 fixes the status-bar collision, with the actual persistence/sheet/tab UI journey passing; exact CI34335890509 passed. Physical use, real account/sync and processed external distribution remain open; signed15c6aa1 installed as version1.0.0/build14 on the first attempt without launch, sync, reset or uninstall. Artifact hashes and source/install receipts are retained. |
| Anchor | `c3704f6` retains219 package-test and three-platform compile evidence and improves test-store isolation. Diagnosis077f856 proves the earlier Gatekeeper rejection. Proper development signing enabled runner connection, but the selected test then timed out initializing automation after62.640s, before any product assertion. | Working macOS XCTest automation initialization or restored hosted capacity, then signed privacy-migration/mixed-version CloudKit acceptance and distribution. No explicit permission denial was evidenced; no security settings were changed. Build25 remains uninstalled and unreleased. |
| Live / Hub | Stale current task descriptions now acknowledge completed source/caller repairs. Live README `2c4fe15` records the earlier verified207f11b deployment; no runtime redeployment occurred. | Google callback registration still blocks real private Hub login. Subsequent login/save/reload/account-isolation acceptance is required. |

Owning evidence: [Kith](https://github.com/Significant-Hobbies/kith/issues/27#issuecomment-5599534717),
[Setline](https://github.com/Significant-Hobbies/setline/tree/af7071d/docs/qualification/workout-relaunch-2026-09-09),
[Calorie](https://github.com/Significant-Hobbies/calorie/blob/3739744/docs/qualification/2026-09-09/native-persistence.md),
[Anchor](https://github.com/Significant-Hobbies/anchor/tree/077f856/docs/qualification/mac-runner-diagnosis-2026-09-09),
[Hub task reconciliation](https://github.com/Significant-Hobbies/significanthobbies/issues/156),
[Live login gate](https://github.com/Significant-Hobbies/live/issues/14).

Hub#156 and Anchor#52 remain open: their current bodies distinguish completed
source work from real native/provider gates, while historical comments are
preserved. Calorie's archive script alone does not upload or establish a
processed App Store Connect build or external invitation. A public guest surface
does not qualify private Hub continuity. Setline and Calorie received install-only signed updates; no owner-store migration, app
launch, account sync or shareability promotion was performed.

## Internal, held and reference boundaries

Site Health's five-area local UI is qualified; provider collection/history and
independent operator onboarding are not. It is intentionally a private owner
dashboard. iOS Landings is a shared factory, not a missing consumer app. Their
false shareability flags must not create invented standalone launch tasks.

Held experiments retain specific evidence without becoming launch queues:
AliveVille now has local scripted talk/memory/save and font resilience proof,
but its latest mobile hosted check reaches only world selection, with model
downloads deliberately blocked. Open Historia now has a live three-turn
rewind/save/reload proof plus deployed panel/branch repairs verified at six sizes;
historical campaign coherence and authenticated saves remain open. Motion needs physical
camera/control evidence; Companion Robot has no working hardware product.
Reel Pipeline and Forecast Lab do not require licensing/release decisions merely
to remain experiments. Cockpit and TrueHire remain historical references.

## Replace rather than expand

These are product-investment recommendations, not additional removals. Chess
and Journal remain the only explicitly removed products in this exercise.

| Fleet project | Recommendation | Preserve only if it proves a recurring advantage |
| --- | --- | --- |
| Local AI Video Studio | **Stop building general video-editor parity. Use DaVinci Resolve for finished creator work.** The native audit found titles/captions not rendered, missing crossfades and approximated audio/subject effects; its successful synthetic export proves a bounded effects pipeline. Resolve documents actual timeline editing, titles and rendered/exported subtitles. | Local validated effect graphs, reproducible variant comparison and native rendering. Reopen for a concrete job where these beat the established editor; broad editor features are not the objective. |
| Office OS | **Replace ordinary assistant/research/recurring-summary work with an existing assistant; evaluate Claude Cowork first.** Its documented file workflows and scheduled tasks overlap this generic use case. An illustrated employee workspace alone does not justify another product. | Named employee identity, revisioned contracts and inspectable authority. Require one recurring duty to show better delivery correctness, recovery and owner effort before expanding. |

Evidence: [native video audit](https://github.com/sass-maker/local-ai-video-studio/blob/main/docs/shareability-assessment-2026-09-07.md),
[Office OS audit](https://github.com/sass-maker/agent-office/blob/main/docs/shareability-review-2026-09-07.md).
Official alternatives rechecked September9: [Resolve editing and subtitles](https://www.blackmagicdesign.com/products/davinciresolve/edit),
[Cowork product guide](https://claude.com/blog/the-claude-cowork-product-guide) and
[scheduled tasks](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork).
These vendor capabilities are not a hands-on comparison on the owner's Mac.
Cowork is not qualified as equivalent to Office OS's local execution and
permission model; tasks requiring local files/apps require local execution.
No replacement was installed, purchased or given private data, and lifecycle
assignments remain unchanged.

## Record reconciliation

This round updates stale Anchor, Calorie, Reader, Knowledge Base, AliveVille and
Open Historia qualification narratives from their owning receipts. Scope and
readiness flags remain unchanged. Anchor source-only acceptance is separated
from older installed builds; Reader's deployed concurrent note merge is no
longer described as missing; Open Historia's repaired persistence is separated
from campaign coherence. Its layout follow-up passed clean first-attempt hosted
CI34327732410 after an explicitly recorded earlier flaky run.

Knowledge Base's offline per-file/page parse staging and dependency repair are
committed separately, with exact CI34329574260 green. Production publication,
recovery and owner-account acceptance remain open; no migration or activation
was performed. High Signal's geographic NNE attribution repair merged with exact
CI34328950533 green; this does not establish a useful new daily edition.

Reel/Forecast licensing language now preserves their explicit retention without
a release requirement. Old deployment-pending paragraphs in issue/status
histories must be read alongside later receipts.
The condensed summary now includes Journal in its explicit removals and matches
the canonical lifecycle totals; individual lifecycle assignments are unchanged.


## Later Calorie test-gate repair

Documentation-head CI34337638142 failed one existing UI check after the installed
15c6aa1 source had passed. The original selector passed a local diagnostic, so
no product navigation defect was reproduced. Actual hierarchy showed duplicate
food text and an offscreen score. Test-only fc1bfce selects the picker button,
asserts Add entry, scrolls to a hittable score and retains the calculation
assertions. The focused check and87 server tests pass; before/after screenshots
were reviewed. [Exact CI34339196137](https://github.com/Significant-Hobbies/calorie/actions/runs/34339196137)
passed on fc1bfce8b7bbb71ec212ccf9e839a5d67d8eb2a1: 82 native tests, Release
and 70.5574% production-line coverage. The installed app remains 15c6aa1;
this test-only repair is not a new installation or public sharing qualification.


## Account access rechecks, 9 September

Reader remains unqualified for real-account capture and annotation persistence.
The fresh hosted session request returned HTTP 200 with no authenticated session;
Google sign-in reached its normal email entry with the Reader callback. The
regular-browser automation channel failed at native-pipe startup. No credentials,
owner records or uploads were accessed. Synthetic account tests do not replace
this gate: a reachable authenticated session, and a second authorized account
for isolation, remain necessary. The task browser tab was closed.

App Health remains unqualified for real owned-service ingestion. Its existing
identity and exact-origin contracts have local positive/negative coverage, but
no accessible owner identity was available for correlating real telemetry with
dashboard aggregates. Anonymous HTTP probes received Cloudflare 1010 responses;
these do not demonstrate an application authentication failure. No telemetry,
keys, allowlist changes or production writes were fabricated for acceptance.


## Fresh High Signal ingestion result

Archive34338300121 completed all 99 communities with immutable run-scoped
objects. Ingestion34341530766 then succeeded on f6654bd: all 4,419 events
were pushed, with 35 clusters reaching generation and three generation-request
failures. The one entity candidate failed independent-origin evidence checks.
One thematic draft was API-persisted, independently read back as548d65290de0c473.
Its six citations combine chip technology, a Qatar lease and unrelated municipal
zoning/retail items; its claim of 58 corroborating sources is unsupported.
No publication was dispatched and shareability remains false.

The ordinary publisher rubric rejects this draft for non-brief-ready prose;
its public structural quality score does not establish semantic publication
approval. Both assigned agents stopped at the account usage limit before source
edits; root subsequently completed the repairs. PR155 merged as995033d with
exact main CI34345130193 green: semantic review uses bounded retained excerpts,
and unavailable text cannot receive verified alignment. PR156 merged as
c9aa099 after all exact-head checks passed: named project/location/event grouping
replaces whole-theme aggregation, and eligible stories use the existing semantic
generator followed by independent-origin proof checks. The old deterministic
corroboration/forecast builder was removed. Title-case paraphrase regression also
passes. Unknown English headline anchors remain research inputs; this discovery
rule is not semantic proof. Live generation/publication is still unqualified.
Evidence remains at80dbf9d under docs/operations/2026-09-09-*.json.
