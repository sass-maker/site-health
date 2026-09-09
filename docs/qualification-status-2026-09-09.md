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
| Pace | Physical voice/screen/action workflow and distribution qualification remain. The ad-hoc preview is available; macOS opening-instruction/dependency correction PR 187 merged with green PR CI and awaits exact-main release gates. It is not a notarization or hardware pass. | [Status](https://github.com/HeyPace/pace/blob/main/PROJECT_STATUS.md), [PR 187](https://github.com/HeyPace/pace/pull/187) |
| Drank | Scheduled collector authentication, fresh shared observations and raw redistribution scope. Personal lookup/reload passed; shared history remains dated. | [#18](https://github.com/sass-maker/drank/issues/18) |
| Email Manager | Real account → mailbox → search/reindex → reload/account switch. Real local model/IndexedDB migration and deployed mobile guest UI pass; the tiny synthetic ranking diagnostic is not mailbox acceptance. | [#54 receipt](https://github.com/Significant-Hobbies/email-manager/issues/54#issuecomment-5597898024) |
| Free AI | Sustained protected inference and consumer recovery. One post-release consumer run had zero operational errors but published no signal. | [#65](https://github.com/sass-maker/free-ai/issues/65) |
| High Signal | Useful evidence-qualified daily publication and sustained generation reliability. Successful infrastructure jobs and an editorially rejected candidate do not establish a useful daily edition. | [#133](https://github.com/High-Signal-App/high-signal/issues/133) |
| Knowledge Base | Legacy provenance backfill/recovery, controlled activation and real private document workflow. Offline staging and synthetic ownership tests do not prove live D1/R2/Vectorize convergence. | [#48 fresh receipt](https://github.com/sass-maker/knowledge-base/issues/48#issuecomment-5597534921) |
| Significant Hobbies Hub | Google rejects the Live callback registration. Real hosted Hub session, account isolation and native continuity remain unqualified despite deployed routing repairs. | [#154](https://github.com/Significant-Hobbies/significanthobbies/issues/154), [Live #14](https://github.com/Significant-Hobbies/live/issues/14) |
| India Standards | A normal visible Turnstile click still fails in the isolated browser; no hosted default/sparse/unsupported calculation completed. This does not establish a MotherDuck outage. Usage/NFHS gates remain separate. | [#35 fresh receipt](https://github.com/Significant-Hobbies/india-standards/issues/35#issuecomment-5598017386), [#36](https://github.com/Significant-Hobbies/india-standards/issues/36) |
| Anime List | Real authenticated tracking, reload, account isolation and expiry/write recovery. Fresh mobile guest search → detail → reload passes without overflow. | [#89 fresh receipt](https://github.com/Significant-Hobbies/anime-list/issues/89#issuecomment-5598081800) |
| Calorie | Unlocked physical use, approved account/sync isolation and distribution. Installed build 14 has not completed that acceptance; later checked changes do not alter its native source. | [#88 fresh receipt](https://github.com/Significant-Hobbies/calorie/issues/88#issuecomment-5598061379) |
| Setline | Real workout/restart/account recovery and distribution. Build 10 installed, deliberately not launched; tests do not replace physical exercise. | [#77 receipt](https://github.com/Significant-Hobbies/setline/issues/77#issuecomment-5597955994) |
| Kith | Physical relationship workflow, account replay/recovery, sync and distribution. Build 12 installed, deliberately not launched. | [#27 receipt](https://github.com/Significant-Hobbies/kith/issues/27#issuecomment-5597955713) |
| Karte | Protected profile workflow and real AI answer. A visible Turnstile attempt failed; Send stayed disabled and no synthetic conversation was created. | [#82](https://github.com/Significant-Hobbies/karte/issues/82) |
| App Health | Owner-key onboarding, origin-allowlisted ingest and real production aggregates. Published SDK installation/release parity are verified. | [#55](https://github.com/sass-maker/app-health/issues/55) |
| Anchor | End/surrender failed-save inconsistency is repaired at309a3ff with actual disk rollback/retry tests; see below. Build 25 privacy work still needs hosted native acceptance after billing/spending blocked the run before steps. Signed/device, historical CloudKit copies and distribution gates remain. | [#52](https://github.com/Significant-Hobbies/anchor/issues/52), [#40](https://github.com/Significant-Hobbies/anchor/issues/40) |
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

## Internal, held and reference boundaries

Site Health's five-area local UI is qualified; provider collection/history and
independent operator onboarding are not. It is intentionally a private owner
dashboard. iOS Landings is a shared factory, not a missing consumer app. Their
false shareability flags must not create invented standalone launch tasks.

Held experiments retain specific evidence without becoming launch queues:
AliveVille now has local scripted talk/memory/save and font resilience proof,
but its latest mobile hosted check reaches only world selection, with model
downloads deliberately blocked. Open Historia now has a live three-turn
rewind/save/reload proof; historical campaign coherence, authenticated saves
and remaining panel/branch crowding are still open. Motion needs physical
camera/control evidence; Companion Robot has no working hardware product.
Reel Pipeline and Forecast Lab do not require licensing/release decisions merely
to remain experiments. Cockpit and TrueHire remain historical references.

## Record reconciliation

This round updates stale Anchor, Calorie, Reader, Knowledge Base, AliveVille and
Open Historia qualification narratives from their owning receipts. Scope and
readiness flags remain unchanged. Anchor source-only acceptance is separated
from older installed builds; Reader's deployed concurrent note merge is no
longer described as missing; Open Historia's repaired persistence is separated
from campaign coherence and current layout work.

Reel/Forecast licensing language now preserves their explicit retention without
a release requirement. Old deployment-pending paragraphs in issue/status
histories must be read alongside later receipts.
The condensed summary now includes Journal in its explicit removals and matches
the canonical lifecycle totals; individual lifecycle assignments are unchanged.
