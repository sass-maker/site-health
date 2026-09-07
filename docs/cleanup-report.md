# Portfolio Cleanup Report

Updated 2026-09-07. Tracking: [Site Health #491](https://github.com/sass-maker/site-health/issues/491).
Original requirements: `/Users/sarthak/Downloads/PORTFOLIO_CLEANUP_PRD_FINAL.md`.

## Current outcome

The lifecycle migration is implemented; the requested shareability exercise is
**not complete**. A direct catalog check found 57 unique retained identities,
with exactly the three required lifecycle fields on every record: 2 primary,
19 active and 36 inactive. Every `shareable` is a JSON boolean and every
`resumeCondition` is null. These fields do not authorize automatic reactivation.

The owner subsequently added Nomad as active, excluded it from this exercise,
and removed Chess and Journal from the Fleet lineup. Their source, data and
identity history remain preserved. The resulting goal covers **54 projects**:
**22 have scoped hands-on sharing evidence, eight are retained without an
adoption push, and 24 still require qualification or a product decision**. This is
not 22 fully tested products: each pass applies only to its recorded experience.
The public projection contains 21 identities because ChatGPT Connections keeps
its separate hidden-listing choice despite its scoped sharing pass.

The original migration copied 32 sharing flags from recorded metadata without
fresh verification. Those flags are superseded. The untouched migration body
is retained in [the historical baseline](cleanup-baseline-2026-09-06.md).

## Authoritative records

The catalog remains [projects.json](../apps/backend/config/projects.json).
No second editable lifecycle registry was created. Existing operational
infrastructure statuses are distinct from lifecycle status.

- [Hands-on sharing evidence](shareability-verification-2026-09-07.json): per-project tested surface, evidence and limits.
- [Leading blockers and checked repairs](portfolio-biggest-blockers-2026-09-07.json): remaining qualification and source/deployment distinctions.
- [Verification and replacement decisions](portfolio-verification-2026-09-07.md): retained experiences and products better replaced than expanded.
- [Task inventory](portfolio-task-inventory-2026-09-07.json): timestamped owning issues, PRs and local state. CI rows retain their own revision and observation time.
- [Checked source candidates](portfolio-release-candidates-2026-09-07.md): exact commits/checks and required post-deployment journeys; not release authorization.
- [Operational inventory](portfolio-operational-inventory-2026-09-07.json): provider/repository observations with their original timestamps.
- [Project dossiers](project-dossiers/): catalog-derived ownership, dependencies and verbatim owner decisions, with dated operational snapshots.
- [Verification checklist](portfolio-shareability-checklist-2026-09-07.md): chronological progress and explicit limits.

The immutable [owner narrative archive](portfolio-owner-narratives-2026-08-22.md)
and separate [condensed intent](portfolio-condensed-2026-08-23.md) remain distinct.

## Completed source work versus remaining acceptance

| Requirement | Current evidence and limit |
| --- | --- |
| Exact lifecycle schema and allocation | Directly checked all 57 current records; 54 remain in goal scope after the owner's later decisions. No invented resume conditions. |
| Independent shareability | Public/lifecycle tests and catalog validation exist; current promotion uses recorded hands-on evidence, not the old flags. Each pass still has a bounded scope. |
| Public projection | 21 qualified public identities deployed and verified on SaaS Maker and the personal site at desktop/mobile sizes; shared footer assets match the released build. |
| Project tasks | The 54-repository scan at 11:34:09Z found 43 open issues, zero PRs and every issue referenced in its README. Exact-revision runs were refreshed too: High Signal retains a failed cron monitor, Anchor subsequently passed its repaired exact-head native run34118659206 after an earlier failed gate, and Mobile Dev Cockpit has Actions disabled with no current-head run. Later repairs and new findings change these counts; this snapshot is not a completed-task claim. Publication drafts and unfinished requirements remain open. |
| Source checks | Checked repairs have per-commit receipts in the linked records. Local build/CI success does not prove hosted authentication, real providers, device behavior or deployment. |
| Clean repositories | Owned temporary installations, databases, browser instances and worktrees are cleaned after each bounded task. Unrelated edits, unique branch history and pre-existing stashes remain preserved; the portfolio is not universally single-branch or clean. |
| Automation | Dashboard `ignored` policy is an attention setting, not an execution lock. Dispatcher, local scheduler and provider-trigger enforcement require their own evidence; the historical claim that 82 workflows were gated is insufficient. Required consumer operations must survive. |
| Full sharing objective | Not met: native installation/device gates, hosted authentication/persistence, provider access, source/data rights, distribution and some core workflows remain unresolved. |

## Authorization, safety and rollback

The owner authorized checked source work, commits/pushes and task cleanup, then
approved the prepared releases and corresponding synthetic verification. Every
release still requires a checked exact revision, known target and rollback.
Credential provisioning and unreviewed data changes are not inferred from that approval. No new approval is inferred from a green check or an
active lifecycle value. No marketing messages, application submissions or paid
generation are implied.

No irreversible offboarding is represented as completed. Retained resources
remain attributed to their owning project or shared steward. A future cutover
must identify exact revisions/resources, preserve required data, verify restore
and dependents, and include a concrete rollback before execution. For source
repairs, preserve their commit receipts and reverse a reviewed change through a
normal follow-up commit; do not erase history or discard unrelated working data.
Additive migrations, including SWE Prep's pending receipt table, must be handled
with their owning repository's rollout and rollback requirements.

## Next work

Continue complete core journeys with authorized synthetic inputs, repair actual
failures, then verify the intended distribution surface. Ongoing work includes
Reader hosted acceptance and concurrency limits after its cached-note repair,
Knowledge Base legacy migration/live qualification after its gated isolation repair,
and Anchor signed-account/installed acceptance after the repaired hosted gate passed.
Drank live personal tracking and 45/45 fresh proxy reads now pass; scheduled direct
collection, distribution terms and source deployment remain separate gates. Keep every unfinished requirement actionable in its owning
README/issue. Do not mark the overall goal achieved until all 54 projects have an evidence-backed
sharing or retention outcome and the required operational reconciliation is verified.
The owner explicitly permits retaining experiments without making them shareable.

## Earlier cleanup checkpoint

The subsequent fresh 54-repository scan found 44 open issues and zero PRs, with
all issues referenced in owning READMEs. LoopTV #51 is the new hosted release
acceptance task. Seven redundant local branch names were removed only after
proving their commits remain reachable from main and no worktree uses them;
[exact restore receipts](merged-branch-cleanup-2026-09-07.json) are retained.
Unique branches in CodeVetter and What It Takes to Win remain, as do two stashes
(High Signal/Anchor) and unrelated working changes (CodeVetter/SaaS Maker).
This does not claim the requested single-branch/no-stash state is complete.

## Earlier source-tool qualification checkpoint

PSI Swarm now passes as a source-installed local developer tool under PRD §5:
clean public setup, actual audits/save/history/controller/restart and MIT rights
were verified. Exact CI 34123793244 is green. At that checkpoint this raised the scoped
count to **17 of 54, with 37 unqualified**; prior counts above are historical.
Old package defects and hosted/controller/AI variants are not part of this pass.
Reel Pipeline has a useful local example but still needs a source license;
its setup-command/runtime mismatch is corrected at4027d5f with green CI. Memory Map's real local
semantic workflow passes at 3417cca with green CI, but deployment remains a gate.

## Owner-approved release and experiment scope

The owner approved the prepared release/verification work and explicitly retained
Reel Pipeline and Forecast Lab as experiments without a sharing requirement.
Their source-license decisions are no longer prerequisites to this cleanup.
Under the accompanying permission to classify other experiments, recorded owner
intent supports holding Companion Robot, AliveVille, Open Historia and Motion,
and preserving retired TrueHire/Mobile Dev Cockpit as historical work. None is
made shareable by that classification. Web Playables keeps its existing verified
experiment pass. Office OS and Local AI Video Studio remain reconsideration items.

All 54 projects remain accounted for:17 verified sharing scopes,8 non-shareable
retention outcomes without an adoption push,29 remaining verification/decision
items before the current release wave. These replace the former requirement to
force every retained experiment into adoption. Active/primary allocation is unchanged.

## Fresh task and organization check

A fresh 54-repository scan found 44 open issues, zero open PRs and no missing
owning README references; all requests succeeded and no HEAD changed during its
row observation. Subsequent issue closures retain their own receipts. The live
`Significant-Hobbies/.github` profile README (blob
`911a00704c54846290f3002ce72cf2cabe892671`) has no Chess or Journal project links.
This verifies removal from the organization profile, not deletion of source repositories.

## Current approved release checkpoint

**23 scoped sharing passes + 8 retained without adoption + 23 remaining = 54.** The public projection has 22 entries because ChatGPT Connections retains its separate hidden listing. Five newly qualified surfaces are EverythingRated's early opinion comparison, Memory Map's browser-local experiment, Reddit Insights' dated archive, Mashup's finished public examples and Protein Index's dated food-label reference. These do not claim full-product or logged-in qualification.

Ten products received approved runtime releases: LoopTV, EverythingRated, Memory Map, Reddit Insights, Mashup, Protein Index, Karte, SaaS Maker, the personal portfolio and High Signal. Exact source/provider receipts and rollback evidence are linked in the release record. Karte remains nonshareable: public links are repaired, but the real Turnstile challenge failed in the isolated browser and no chat or lead was created. EverythingRated's local release succeeded while its Actions deployment authentication remains open (#18).

SaaS Maker's actual ordinary-domain desktop/mobile directory contains exactly 21 expected IDs; shared footer assets match the build and omit Chess/Journal and held experiments. The personal site now uses the same projection and correct primary-focus copy. This verifies deployed public changes, not only generated source.

A fresh computer-use initialization still fails with `Sky Computer Use native pipe startup failed`. Native and owner-profile signed-in acceptance therefore remain blocked; headless public journeys do not substitute for them. The private Site Health audit used real local services and file-backed evidence with a temporary database, navigated all five areas at desktop/mobile sizes, and made no collection/provider writes. The repaired lifecycle filters, exact rationale and truthful freshness state pass actual 390/768/1440 browser checks; [before/after evidence](verification/2026-09-07-lifecycle-ui/README.md) is retained. The full Site Health check passes, including all 57 dossier contracts, web build, backend and AI/packed-consumer tests.

## Final task scan (14:22 UTC snapshot)

The fresh 54-project inventory records 43 open issues, one newly opened personal-site image-optimization PR, zero missing owning README issue references and zero query errors. The PR is under separate review. Ten local non-default branches contain work absent from their local main (nine CodeVetter, one What It Takes to Win); High Signal and Anchor each retain one stash. These histories are preserved, not discarded for a clean count.

Three local/remote differences were observed: High Signal had a concurrent scheduled artifact commit during its repair, SWE Prep had a newer remote revision, and Protein Index intentionally retains a historical alias checkout distinct from the canonical resilience repository. Exact revisions and timestamps are recorded per row. No exact remote-head failed run was observed, but two heads had no runs, one cancelled ingestion run and 12 older failures across nine repositories remain. This is not an all-Actions-green claim. Worktree snapshots during integration include this task's Site Health/High Signal edits alongside pre-existing CodeVetter/SaaS Maker work.

The personal-site image PR#35 was subsequently closed unmerged after exact diff/pixel review because it rewrote original release-evidence file bytes for small savings. Originals and their receipts remain intact; the refreshed PR row now records zero open PRs. SWE Prep's newer `4b0f613` is a scheduled seven-file library refresh only; no handler or migration change. Its default-token bot push did not trigger downstream checks, so the newest content revision remains explicitly unvalidated rather than inheriting the older candidate's CI.

Site Health catalog/UI integration `11aade1cbf8616a5494c7d52199f43288d4c414c` is pushed; exact CI34132857049 passed. Completed release/audit tasks removed their owned temporary deployment clones, browser sessions, local databases and redundant scratch artifacts after retaining compact owning-repository evidence. High Signal also completed its own cleanup after hosted acceptance; its pre-existing stash remains untouched. Existing Nomads server and unrelated source/history remain untouched.

SWE Prep was subsequently fast-forwarded cleanly to exact source `4b0f613929e7ec84cf04e2516950ac21d1ba8741`. Fourteen focused library checks and the full local quality gate (608 tests, coverage, types, docs, production build and all size budgets) passed. Its workflow has no manual CI trigger; local Node 26 differs from hosted CI 22, so the report keeps hosted CI absent. No migration, deployment or content refresh was run; #97 remains the hosted acceptance gate.

## High Signal qualification correction

High Signal's web-only repair is deployed at `ddefa8dd` / Worker`950432b9-68e9-466d-8c19-78e00ee19e5c`,100%, with exact CI34133353634 green. Ordinary desktop/mobile acceptance passes after a real region-dependent stale Worker cache was reproduced and affected HTML/RSC keys versioned. Six selected app reviews are now accurately presented as a sample; unsupported surge/adoption claims and stored99/low diagnostics remain historical disclosures. Original sources are retained. The query requested 100 but returned 3 records, all review-only; no full-corpus inference is made. Broader calibration, API/MCP/Daily Brief and provider recovery remain open under #133, so shareability stays false. No API deployment, data write, publication/generation run or cache purge occurred.

High Signal's final receipt `83d16d6fb9a1c7cda0c6a485a53e6f693032ebb9` is pushed with exact CI34134003102 green. A concurrent scheduled API-label artifact commit was preserved; the deployed web remains exact `ddefa8dd`. The inventory now records its clean/synced source separately from that web release and preserves the earlier observation.

## Shared release guard repair

Follow-up `54e932c8` fixes recognition of valid `&&` package-script chains,
which the initial guard incorrectly rejected as background execution. Twenty-one
focused regressions pass, including rejection of single/background `&` and
malformed `&&&`; exact Tooling CI34135760697 and CI34135760698 passed.
The real RolePatch preflight then passed all six gates without a bypass.

The wave exposed a shared guard defect: one green Docs run could mask pending or failed build/test CI at the same source. SaaS Maker now contains the repair in source commit `882317ae`, integrated with an unrelated automated performance report at `1d4061ea27e1fa8cb521004e4640b0eea4c9b146`. It queries all exact-head push runs, uses the latest attempt per workflow, requires all observed runs to succeed and requires a source-backed build/test definition. Unsupported, conditional or error-masked validators fail closed; it does not execute scripts while discovering their meaning. No new bypass or production dependency was added.

Twenty focused regressions cover Docs-only/pending/red CI, identity/pagination/rerun handling, disabled or error-masked validators, informational commands and Bash 3 portability. Exact Tooling CI34135064744 passed all 222 tests and script/skill validation. The corresponding main CI34135064770 also passed all validation and build stages. A real read-only guard run against clean High Signal `83d16d6f` independently confirms two completed push workflows and a build/test definition; no deployment ran. Monorepo target selection still requires explicit inspection: the project-level guard discovers the API config, while the actual authorized High Signal release used the separately verified web target and rollback.

Seven unrelated SaaS Maker working paths were preserved exactly. Guard test fixtures and logs were removed; public-directory runtime remains its separately recorded release.

## Sequential RolePatch qualification

RolePatch is the eleventh project in this approved runtime release wave. Source
`18c041f4` passed all 467 tests, full local quality and exact hosted CI;
[deployment 34143940332](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34143940332)
succeeded with Worker `fe163417-64ed-462a-80c5-a4b8d7cf99f5` at 100% and the exact tag.
The old Workers AI model had been retired. Its replacement initially timed out;
bounded generation now succeeds in 6.4 seconds on the synthetic guest workflow.
Candidate facts and metrics survived, unsupported skills were omitted, and
Accept & Save retained byte-exact output after reload. The lower mobile diff
was clipped; source `1cf2c875` restores internal scrolling. Its exact CI and
[deployment 34144865225](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34144865225)
pass; Worker `f5303141-f245-4ad7-aa39-2ae208ea0cb2` serves that tag at 100%.
A fresh 390px reload, without the diagnostic style override, scrolled the diff
to the final Skills section with no horizontal overflow or page errors.

The earlier export diagnosis was corrected: the guest editor deliberately offered
Print and did not call the protected endpoint. The actual gap was exporting a
tailored result. Source `d28b05a3` adds safe browser-local document export while
retaining signed-in server export. All 473 tests/full local quality and exact CI
pass; [deployment 34146632823](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34146632823)
serves Worker `faaa3a1f-da95-4009-967c-0f3c3091dda1` at 100% with the exact tag.

A fresh UI-created guest workflow now passes generation in 5.229 seconds,
reviewed synthetic facts, byte-exact save/reload and text download, HTML/.doc
downloads, and one-/two-page print-to-PDF with all content retained. Desktop/mobile
controls and all PDF pages were visually inspected. RolePatch is now a scoped
shareable guest experiment, with medium confidence and explicit account, import,
URL-scraping and broader AI limitations in [#68](https://github.com/Significant-Hobbies/rolepatch/issues/68).
[The receipt](qualification/rolepatch-2026-09-07/export/README.md) preserves the
print-engine versus native-dialog verification distinction and the browser crash.
The owning README links remaining work. All 57 repository Actions inventories
were refreshed (56 verified, excluded unversioned Nomad unverifiable); task/issue
inventory is only freshly re-observed for RolePatch. Unrelated local changes remain preserved.

The owner experiment decision is retained for both Reel Pipeline and Forecast
Lab; Reel Pipeline now also uses `portfolio.kind: experiment`. The 54-project
sharing accounting is unchanged: 23 scoped passes, 8 retention outcomes, 23
remaining qualification/decision items. No other project was promoted.
