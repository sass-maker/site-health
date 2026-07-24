---
name: fleet-audit
description: Audit the fleet — git/CI health, PROJECT_STATUS sync, or full recurring audit. Use when the user asks "is the fleet healthy?", "what's the fleet status?", "what's everyone working on?", "audit the fleet", "check all projects", "what's broken?", or wants a fleet-wide snapshot before a deploy or audit pass.
metadata:
  short-description: Audit the Foundry project fleet
---

# Fleet Audit

Three modes, one skill. The user's question determines which mode to run.

## Mode: health

**Trigger:** "Is the fleet healthy?", "check all projects", "what's broken?", "can I deploy everything?"

Updates safe repositories, then checks git state, CI signal, and branch status
across the fleet workspace plus active projects listed in
`~/Desktop/fleet/README.md`.

```bash
bash ~/Desktop/fleet/fleet-ops/scripts/fleet-health.sh
bash ~/Desktop/fleet/fleet-ops/scripts/fleet-health.sh --no-fetch     # skip git fetch and pull
bash ~/Desktop/fleet/fleet-ops/scripts/fleet-health.sh --only saas-maker,aliveville
```

The script reads the project list from the fleet README, so it stays in sync
automatically, and includes the fleet workspace repository itself. By default
it fetches each repository and fast-forward-pulls a behind branch only when the
worktree is clean, the branch has an upstream, and there are no local-only
commits. Dirty, detached, ahead, and diverged repositories are left untouched
and reported. For each repository it then checks:

1. **Update** — safely pulled, already current, or intentionally skipped?
2. **Git state** — clean? dirty?
3. **Branch** — on main?
4. **Remote sync** — ahead/behind?
5. **CI signal** — latest GitHub Actions run on main

Output a compact table:

```
PROJECT          BRANCH  GIT    CI     NOTES
saas-maker       main    clean  green  —
aliveville       main    dirty  green  2 uncommitted files
anime-list       main    clean  red    ci.yml failing
```

Summary: N clean, N dirty, N CI-red, N unknown.

**Act on results:**
- CI-red → investigate the failing workflow, fix or track
- Dirty → commit or stash before fleet operations
- Not on main → flag if deploy planned

## Mode: status

**Trigger:** "What's the fleet status?", "what's everyone working on?", "what shipped recently?", "what's blocked?"

Reads each project's `PROJECT_STATUS.md` (first 40 lines is enough for thesis +
timeline + scope). For each project extract:

- **Last updated** date
- **Thesis** (one line)
- **Latest timeline entry** (most recent ship)
- **Active scope** (what's IN scope)
- **Blockers** (if any)

Output:

```
## Fleet Status — YYYY-MM-DD

### Recently shipped (last 7 days)
- project-name: what shipped

### Active work
- project-name: current focus

### Blocked / deferred
- project-name: what's blocked and why

### Stale (PROJECT_STATUS.md not updated in 30+ days)
- project-name: last updated YYYY-MM-DD
```

Don't fabricate status — if a PROJECT_STATUS.md is missing or unreadable, report
that explicitly. This is read-only; it doesn't modify any files.

## Mode: full

**Trigger:** "Audit the fleet", "run the fleet audit", "prepare a fleet report", "triage fleet regressions"

Runs the Fleet-owned audit stack from the Fleet root:

```bash
cd ~/Desktop/fleet
./fleet-ops/scripts/git-health.sh --all --no-fetch
./fleet-ops/scripts/deploy-health.sh
node fleet-ops/scripts/cloudflare-resilience-audit.mjs
```

Writes to:
- `.symphony/cloudflare-resilience/latest.md`
- `.symphony/cloudflare-resilience/latest.json`

Variations:

```bash
node fleet-ops/scripts/cloudflare-resilience-audit.mjs --no-live
node fleet-ops/scripts/site-health-scorecard.mjs --all
bash fleet-ops/scripts/fleet-perf-weekly.sh --runs 3 --concurrency 2
```

### How to interpret

- `ok`: no open PRs, failed workflows, failed smoke checks, dirty state, or check failures.
- `watch`: open PRs or perf budget warnings; don't create urgent tasks unless stale or regressed.
- `fail`: real regression candidate; read details before creating tasks.

Expected non-issues:
- `mal-api...workers.dev/` root may be `404`.
- First-run perf budget warnings are baselines, not regressions.

### GitHub Actions evidence rules

Treat workflow state as versioned project configuration, not an append-only
history of equally relevant runs:

1. Only workflows that still exist on the remote default branch contribute to
   current CI health. Ignore the final run of a deleted workflow.
2. A failed latest run at the current `origin/main` SHA is a `fail`.
3. A failed latest run only on an older SHA is a `watch`; inspect whether the
   workflow or failing code changed before creating a task.
4. Distinguish product CI, deploy, scheduled data pipelines, and maintenance
   automation. A failed bot PR or optional data refresh is not automatically a
   broken user-facing product.
5. Explicitly retired or local-only projects do not need Actions or a deploy
   script. Static Git-connected Pages sites may have only a lightweight content
   check; do not infer that a deleted manual deploy workflow is missing.
6. Unpublished local workflow edits do not change remote health. Report the
   remote failure until the change is committed and pushed.

When aggregate output is red, open the failing job and identify the exact
failed step before assigning severity.

### Workflow

1. Run the Fleet-owned audit stack unless the user asks for a quick pass.
2. Read `.symphony/cloudflare-resilience/latest.md`.
3. Summarize: open PRs, failed workflows, failed smoke checks, local failures, perf issues, dirty repos.
4. Record real regressions in the owning project's `PROJECT_STATUS.md` or an
   existing repository-native tracker.
5. Do not auto-merge, deploy, delete Cloudflare projects, rotate secrets, or clean worktrees unless explicitly asked.

### Follow-up rules

Record follow-up for:
- latest main workflow failures
- failed production smoke checks
- local build/test/typecheck failures
- broken deploy pipeline

Do not create tasks for:
- known open PRs unless stale or blocking
- expected API-root 404s
- local dirty state in saas-maker during active work
- missing local OAuth credentials when builds pass

## Output style (all modes)

Keep reports compact:
- lead with overall status
- list real regressions first
- list watch items separately
- include links for PRs/actions when available
- include the report path (for full mode)
