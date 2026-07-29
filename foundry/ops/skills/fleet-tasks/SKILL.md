---
name: fleet-tasks
description: Gather all open GitHub issues across Fleet repos in one grouped view, so the operator can see the full fleet workload at a glance.
---

# fleet-tasks — all open issues across the fleet

Answers one question: **what is the open work across every Fleet repo right
now?** After the migration from per-repo `PROJECT_STATUS.md` trackers to GitHub
issues, this is the single read-only view that replaces "scan every
`PROJECT_STATUS.md` Todo section." It does not write, close, or create anything.

## When to invoke

- "What are all my tasks across repos?"
- "Show me the fleet backlog / open issues everywhere"
- "What's open across the fleet?"
- "What's everyone working on?" (when paired with `--assignee me` for your slice)
- Before a planning pass or weekly review to see the full open-work picture

## What it does

1. Reads `foundry/ops/config/projects.json` for the canonical project list.
2. Skips `out-of-fleet` and `non-product` tiers, plus the AGENTS.md exclusion
   list (open-historia, truehire, companion-robot, elves-hq, forecast-lab,
   today-little-log, device-net-test, saas-maker-ci-fix).
3. For each remaining project, resolves the GitHub `owner/repo` from its git
   remote. Projects under `foundry/` (fleet-internal: ops, services, tools,
   apps) map to the `fleet-workspace` remote, so that repo is queried once.
4. Dedupes by `owner/repo` and queries `gh issue list --state open` per repo.
5. Prints issues grouped by repo, then a summary. Optionally emits JSON.

## How to invoke

Run the Fleet-owned script from the Fleet root:

```bash
cd ~/Desktop/fleet
./foundry/ops/scripts/fleet-tasks.mjs
```

Flags (all optional):

```bash
./foundry/ops/scripts/fleet-tasks.mjs --assignee me        # only issues assigned to you
./foundry/ops/scripts/fleet-tasks.mjs --assignee sarthakagrawal927
./foundry/ops/scripts/fleet-tasks.mjs --label bug          # filter by label
./foundry/ops/scripts/fleet-tasks.mjs --repo owner/name    # single repo override
./foundry/ops/scripts/fleet-tasks.mjs --limit 500          # per-repo cap (default 200)
./foundry/ops/scripts/fleet-tasks.mjs --json               # machine-readable output
./foundry/ops/scripts/fleet-tasks.mjs -h                   # help
```

Requires `gh` (authed) and `jq` on PATH. The script exits non-zero only when a
repo query fails (e.g. `gh` not authed, repo removed); empty result sets are not
failures. Projects with no resolvable git remote are reported as warnings on
stderr and skipped, not counted as failures.

## Output format

Grouped text by default:

```
== Codevetter/codevetter  (3) ==
  #42  Add export to CSV [bug]  @sarthakagrawal927  2026-07-21
  #41  Rate limit on /api/score  @—  2026-07-19
  #40  Docs: add architecture diagram  @sarthakagrawal927  2026-07-15

== sass-maker/fleet-workspace  (7) ==
  #128  ...
  ...

== No open issues ==
  HeyPace/pace
  PostTrainLLM/posttrainllm

== Summary ==
Repos queried: 18
Open issues: 23
Assignee filter: me
```

With `--json`, emits `{ generatedAt, total, repos: [{ owner, repo, projectIds, ok, error, issueCount, issues }] }`.

### Reporting back

Summarize as a fleet-wide table first, then the grouped detail:

| Repo | Open issues | Notes |
|---|---|---|
| Codevetter/codevetter | 3 | 2 assigned to you |
| sass-maker/fleet-workspace | 7 | fleet-internal (ops/services/tools/apps) |
| HeyPace/pace | 0 | — |

Call out repos with the most open work, anything assigned to the operator, and
any repo that failed to query (do not silently drop failures). If the user asked
for `--assignee me`, lead with their slice.

## What this skill does NOT cover

- Creating, closing, or editing issues → use `gh` directly per repo.
- Pull requests → issues only; add a `--pr` flag if PR coverage is ever needed.
- Single-project deep status → read that repo's `PROJECT_STATUS.md` or use
  `fleet-audit` for a full fleet audit (git health, deploy parity, resilience).
- Deploy readiness → `fleet-deploy-guard` / `fleet-deploy-parity`.
- "Is the fleet healthy?" broad audit → `fleet-audit`.
