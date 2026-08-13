# GitHub Priority Queue

The private [Sarthak Priority Queue](https://github.com/users/sarthakagrawal927/projects/3/views/1)
is the personal ordering layer for open GitHub issues authored by
`sarthakagrawal927`. Repository issues remain the operational source of truth;
the Project stores references to those issues rather than copied task content.

## Queue behavior

- The `Queue` table view is filtered with `is:open`, grouped by `Priority`, and
  has no sort applied.
- Priority groups enforce the broad order. Row position inside a group is the
  exact work rank; drag the row number to insert an item anywhere in that band.
- `Priority` is supporting metadata with `P0 — Now`, `P1 — Next`, `P2 — Soon`,
  and `P3 — Later`. It does not replace manual row order.
- The outcome order is **Finish → Market → Measure**:
  - `P0 — Now`: actively in progress or one bounded step from a meaningful
    finish. Keep this as a deliberately small working set.
  - `P1 — Next`: the next unblocked finish, ready marketing action, or
    decision-changing measurement.
  - `P2 — Soon`: aligned work behind a dependency, owner action, measurement
    window, or P1 prerequisite.
  - `P3 — Later`: speculative expansion, broad debt reduction, low-urgency
    maintenance, or explicitly deferred work.
- Read the issue body, labels, linked pull request state, blockers, and explicit
  dependencies before assigning Priority. A title, age, or repository tier is
  not sufficient evidence.
- `blocked` and `deferred` items cannot be P0 unless the queued action itself
  removes the blocker and the operator deliberately selected it as current work.
- Grouping keeps all P0 before P1, and so on, while preserving intentional
  manual order inside each band. Sorting must remain disabled.
- `Reasoning complexity` measures the intelligence needed, not duration or
  volume of work:
  - `R0 — Mechanical`: exact checklist or deterministic edit; no meaningful
    judgment.
  - `R1 — Routine`: known pattern with localized choices and modest diagnosis.
  - `R2 — Judgment`: tradeoffs, synthesis, or ambiguous multi-step decisions.
  - `R3 — Systems`: architecture and cross-system reasoning with interacting
    constraints.
  - `R4 — Novel`: research-heavy or unprecedented work where the solution must
    be discovered.
- A repetitive task can remain `R0` even when it takes days. The field is not
  an effort estimate.
- The existing Project `Status` field is retained.

The initial Project import used this accessible-owner query:

```text
is:issue state:open author:sarthakagrawal927 (org:sass-maker OR org:Codevetter OR org:High-Signal-App OR org:PostTrainLLM OR org:Significant-Hobbies OR org:HeyPace OR user:sarthakagrawal927 OR org:PostHog)
```

The query above is the initial-import query, not a supported built-in auto-add
rule. [GitHub's built-in auto-add workflow](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically)
targets one repository, supports only a limited filter subset, and GitHub Pro
permits at most five auto-add workflows. It cannot cover this fleet's
repositories across multiple organizations.

Creating a task is therefore incomplete until its original issue appears in
this Project. Immediately run the global synchronizer below after creating an
issue, and run it periodically to reconcile human-created issues and newly
accessible repositories. New items intentionally retain empty Priority and
Reasoning complexity fields so that they are visibly unreviewed. Every new item
must then receive an intentional body-and-state review before being inserted at
its exact queue position. Do not infer reasoning complexity from time, issue
size, or the amount of repetitive work.

## Synchronization

The repository command searches all accessible open issues by author and adds
only issue URLs that are missing from the Project. It is read-only unless
`--apply` is supplied, and it leaves existing row order, Priority, and Status
values unchanged. It also preserves Reasoning complexity.

```bash
node foundry/ops/scripts/github-priority-queue.mjs \
  --owner sarthakagrawal927 \
  --project 3 \
  --author sarthakagrawal927

node foundry/ops/scripts/github-priority-queue.mjs \
  --owner sarthakagrawal927 \
  --project 3 \
  --author sarthakagrawal927 \
  --apply
```

The GitHub CLI login needs repository access plus the `project` scope:

```bash
gh auth refresh -h github.com -s project
```

As of 2026-08-14, the local GitHub CLI has the required Project scope. A live
dry run discovered 129 open authored issues with zero missing items. Two
consecutive apply runs reported 129 unchanged items, zero additions, and zero
failures, proving that reconciliation is idempotent when the queue is current.

## Observed boundaries

- The queue contained 129 open authored issues after the 2026-08-14
  reconciliation. This count changes as original issues open and close.
- Cross-organization references render correctly, including repositories owned
  outside `sass-maker`.
- Close/reopen canary
  [`fleet-workspace#354`](https://github.com/sass-maker/fleet-workspace/issues/354)
  retained exactly one original Project item, gained no duplicate on resync,
  and is excluded from the canonical Queue by its `is:open` filter while closed.
- Discovery is permission-bounded: inaccessible private repositories cannot be
  searched or added.
- The Project is private, but visibility still follows both Project and source
  repository permissions. Do not copy private issue text into Project drafts or
  custom fields.
