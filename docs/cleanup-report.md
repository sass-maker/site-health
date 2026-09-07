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

All54 projects remain accounted for:17 verified sharing scopes,8 non-shareable
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

**22 scoped sharing passes + 8 retained without adoption + 24 remaining = 54.** The public projection has21 entries because ChatGPT Connections retains its separate hidden listing. Five newly qualified surfaces are EverythingRated's early opinion comparison, Memory Map's browser-local experiment, Reddit Insights' dated archive, Mashup's finished public examples and Protein Index's dated food-label reference. These do not claim full-product or logged-in qualification.

Nine products received approved runtime releases: LoopTV, EverythingRated, Memory Map, Reddit Insights, Mashup, Protein Index, Karte, SaaS Maker and the personal portfolio. Exact source/provider receipts and rollback evidence are linked in the release record. Karte remains nonshareable: public links are repaired, but the real Turnstile challenge failed in the isolated browser and no chat or lead was created. EverythingRated's local release succeeded while its Actions deployment authentication remains open (#18).

SaaS Maker's actual ordinary-domain desktop/mobile directory contains exactly21 expected IDs; shared footer assets match the build and omit Chess/Journal and held experiments. The personal site now uses the same projection and correct primary-focus copy. This verifies deployed public changes, not only generated source.

A fresh computer-use initialization still fails with `Sky Computer Use native pipe startup failed`. Native and owner-profile signed-in acceptance therefore remain blocked; headless public journeys do not substitute for them. The private Site Health audit used real local services and file-backed evidence with a temporary database, navigated all five areas at desktop/mobile sizes, and made no collection/provider writes. The repaired lifecycle filters, exact rationale and truthful freshness state pass actual 390/768/1440 browser checks; [before/after evidence](verification/2026-09-07-lifecycle-ui/README.md) is retained. The full Site Health check passes, including all57 dossier contracts, web build, backend and AI/packed-consumer tests.

## Final task scan (14:22 UTC snapshot)

The fresh54-project inventory records43 open issues, one newly opened personal-site image-optimization PR, zero missing owning README issue references and zero query errors. The PR is under separate review. Ten local non-default branches contain work absent from their local main (nine CodeVetter, one What It Takes to Win); High Signal and Anchor each retain one stash. These histories are preserved, not discarded for a clean count.

Three local/remote differences were observed: High Signal had a concurrent scheduled artifact commit during its repair, SWE Prep had a newer remote revision, and Protein Index intentionally retains a historical alias checkout distinct from the canonical resilience repository. Exact revisions and timestamps are recorded per row. No exact remote-head failed run was observed, but two heads had no runs, one cancelled ingestion run and12 older failures across nine repositories remain. This is not an all-Actions-green claim. Worktree snapshots during integration include this task's Site Health/High Signal edits alongside pre-existing CodeVetter/SaaS Maker work.
