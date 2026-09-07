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
**16 have scoped hands-on sharing evidence; 38 remain unqualified**. This is
not 16 fully tested products: each pass applies only to its recorded experience.
The public projection contains 15 identities because ChatGPT Connections keeps
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
| Public projection | Regenerated from Site Health after catalog changes; 15 public identities. A source projection does not prove deployed footers and pages have changed. |
| Project tasks | The 54-repository scan at 11:34:09Z found 43 open issues, zero PRs and every issue referenced in its README. Exact-revision runs were refreshed too: High Signal retains a failed cron monitor, Anchor subsequently passed its repaired exact-head native run34118659206 after an earlier failed gate, and Mobile Dev Cockpit has Actions disabled with no current-head run. Later repairs and new findings change these counts; this snapshot is not a completed-task claim. Publication drafts and unfinished requirements remain open. |
| Source checks | Checked repairs have per-commit receipts in the linked records. Local build/CI success does not prove hosted authentication, real providers, device behavior or deployment. |
| Clean repositories | Owned temporary installations, databases, browser instances and worktrees are cleaned after each bounded task. Unrelated edits, unique branch history and pre-existing stashes remain preserved; the portfolio is not universally single-branch or clean. |
| Automation | Dashboard `ignored` policy is an attention setting, not an execution lock. Dispatcher, local scheduler and provider-trigger enforcement require their own evidence; the historical claim that 82 workflows were gated is insufficient. Required consumer operations must survive. |
| Full sharing objective | Not met: native installation/device gates, hosted authentication/persistence, provider access, source/data rights, distribution and some core workflows remain unresolved. |

## Authorization, safety and rollback

The owner authorized checked source work, commits/pushes and task cleanup.
Production deployments, migrations, releases and credential provisioning remain
separate approval gates. No new approval is inferred from a green check or an
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
README/issue. Do not mark the overall goal achieved until all 54 intended
experiences satisfy their applicable access, value, presentation and evidence
gates, and the required operational reconciliation is verified.

## Latest cleanup checkpoint

The subsequent fresh 54-repository scan found 44 open issues and zero PRs, with
all issues referenced in owning READMEs. LoopTV #51 is the new hosted release
acceptance task. Seven redundant local branch names were removed only after
proving their commits remain reachable from main and no worktree uses them;
[exact restore receipts](merged-branch-cleanup-2026-09-07.json) are retained.
Unique branches in CodeVetter and What It Takes to Win remain, as do two stashes
(High Signal/Anchor) and unrelated working changes (CodeVetter/SaaS Maker).
This does not claim the requested single-branch/no-stash state is complete.

## Source-tool qualification checkpoint

PSI Swarm now passes as a source-installed local developer tool under PRD §5:
clean public setup, actual audits/save/history/controller/restart and MIT rights
were verified. Exact CI 34123793244 is green. This raises the current scoped
count to **17 of 54, with 37 unqualified**; prior counts above are historical.
Old package defects and hosted/controller/AI variants are not part of this pass.
Reel Pipeline has a useful local example but still needs a source license;
its setup-command/runtime mismatch is corrected at4027d5f with green CI. Memory Map's real local
semantic workflow passes at 3417cca with green CI, but deployment remains a gate.
