---
name: fleet-deploy-parity
description: Check whether every live Fleet product is deployed to its latest origin/main — Cloudflare Pages deployments match the current main SHA, Workers are at 100% traffic, and GitHub Actions for the current main are green. Use when the user asks "is everything deployed to the latest?", "are all sites live?", "is production in sync with main?", "what's not deployed yet?", or wants a fleet-wide deploy parity snapshot before a release or audit pass.
---

# fleet-deploy-parity — is production in sync with main?

Answers one focused question: **does the live Cloudflare deployment for every
Fleet product match the latest `origin/main`?** This is a read-only fleet-wide
parity check, not a single-project deploy gate (use `fleet-deploy-guard` for
that) and not a full audit (use `fleet-audit` for that).

## When to invoke

- "Is everything deployed to the latest?"
- "Is production in sync with main?"
- "Are all sites live / up to date?"
- "What's not deployed yet?"
- "Did the last commit on each project ship?"
- Before a release pass or after a batch of merges to confirm nothing is left
  behind on `main` but not on Cloudflare.

## What it checks

For each live project in `foundry/ops/config/projects.json` with
`deployKind` of `pages` or `worker`:

1. **Pages** — the latest production deployment's source commit matches
   `origin/main` of the project repo. Reports `OK` when the deployment source
   SHA is a prefix of (or equal to) `origin/main`, `FAIL` when it is not, and
   `WARN` when the commit source is unavailable.
2. **Workers** — the latest deployment is at 100% traffic. Reports `OK` when
   the active version is at 100%, `WARN` otherwise. Worker commit parity is
   not exposed by `wrangler deployments list`, so traffic percentage is the
   proxy.
3. **GitHub Actions** — the latest workflow run at the current `origin/main`
   SHA is green. Reports `FAIL` on a failing/running latest run, `WARN` on
   skipped or stale-only failures, `OK` otherwise.

Local-only and out-of-fleet projects are skipped.

## How to invoke

Run the Fleet-owned deploy health script from the Fleet root:

```bash
cd ~/Desktop/fleet
./foundry/ops/scripts/deploy-health.sh
```

Flags (all optional):

```bash
./foundry/ops/scripts/deploy-health.sh --no-github      # skip Actions parity
./foundry/ops/scripts/deploy-health.sh --no-cloudflare  # skip Cloudflare parity
./foundry/ops/scripts/deploy-health.sh --no-standards   # skip deploy-entrypoint checks
./foundry/ops/scripts/deploy-health.sh --targets path.json
```

The script exits non-zero if any `FAIL` is recorded. Requires `gh` (authed),
`jq`, and `wrangler` (authed) on PATH.

## Output format

The script prints three sections — Project Deploy Standards, GitHub Actions,
Cloudflare Deployments — then a summary:

```
== Cloudflare Deployments ==
OK    rolepatch Pages rolepatch deployed <sha> from main (https://...)
FAIL  karte Pages karte is not at origin/main <sha>; latest deployment source <other-sha> (https://...)
OK    pace Worker pace has active deployment id=... created=...; commit sync unknown
...
== Summary ==
Failures: 1
Warnings: 0
```

### How to interpret

- `OK` — deployed to latest (Pages) or at 100% traffic (Worker); no action.
- `WARN` — deployed but commit source unavailable, Worker not at 100%, or
  Actions skipped/stale-only failure. Investigate; not automatically broken.
- `FAIL` — production is behind `main`, deployment list failed, or Actions is
  red at the current `origin/main` SHA. This is the "not deployed to latest"
  signal the user is asking about.

### Reporting back

Summarize as a fleet-wide parity table:

| Project | Kind | Target | Deployed SHA / traffic | origin/main | Status |
|---|---|---|---|---|---|
| rolepatch | pages | rolepatch | `<sha>` | `<sha>` | OK |
| karte | pages | karte | `<other-sha>` | `<sha>` | BEHIND |
| pace | worker | pace | 100% | `<sha>` | OK |

Then list the behind/non-100% projects explicitly so the user knows what to
redeploy. Do not redeploy anything from this skill — it is read-only. If the
user wants to redeploy, hand off to `fleet-deploy-guard` per project.

## What this skill does NOT cover

- Single-project deploy readiness gate → `fleet-deploy-guard`
- Full fleet audit (git health, PROJECT_STATUS sync, resilience) → `fleet-audit`
- Cloudflare/Turso spend → `cloudflare-spend-guard`
- Public product browser journeys → `public-product-smoke`
- Actually deploying anything → this skill is read-only
