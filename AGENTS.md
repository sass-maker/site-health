# Fleet Agent Instructions

This file is the always-loaded fleet entrypoint. Keep it compact.

Full standards live in `fleet-ops/docs/fleet-agent-standards.md`; read that file
only when the task touches fleet policy, deploys, tooling architecture, new
projects, learning tracks, or cross-project standards.

## Hard Rules

- Do not run destructive commands.
- Do not touch secrets, env files, SSH keys, cloud credentials, kube configs, or
  production configs unless explicitly asked.
- Do not deploy, migrate, release, rotate credentials, or make irreversible
  public changes unless explicitly asked.
- Do not add production dependencies, broad rewrites, data migrations, or
  behavior-changing rate limits without explicit approval.
- Prefer small diffs, existing repo scripts, and the smallest relevant check.
- Preserve unrelated dirty work.

## Default Workflow

1. Read the nearest project `AGENTS.md` or `agents.md`.
2. For non-trivial project work, read root `PROJECT_STATUS.md` before broad
   edits. Also read `docs/PROJECT_RECOMMENDATION_CONTEXT.md` when the task is
   about recommendations, stack, dependency choices, product scope, or repo
   selection.
3. Inspect git state and branch before editing.
4. Search narrowly for the exact file, symbol, route, script, or config first.
5. Make the smallest coherent change.
6. Run the smallest relevant test/check first.
7. Surface failed checks, skipped validation, blockers, and residual risk.

Safe completed repo changes may be committed and pushed once scope is understood,
secrets/local scratch files are excluded, and the relevant checks pass. This
standing approval does not cover deploys, migrations, releases, credentials, or
production config.

## Project Status

Each fleet product has one durable status file at project root:
`PROJECT_STATUS.md`.

Required sections, in order:

1. **Why / What**
2. **Dependencies**
3. **Timeline**
4. **Products**
5. **Features (shipped)**
6. **Todo / Planned / Deferred / Blocked**

When PR-sized work is completed, merged, superseded, or abandoned, close/delete/
park the matching tracker item and update only the project root
`PROJECT_STATUS.md`. Do not create extra completion notes or status ledgers for
ordinary PR closure.

## Feature Work

Use the `spec-driven` skill before non-trivial new fleet features: new surfaces,
routes, commands, capabilities, cross-repo behavior, or multi-file behavior
changes.

Skip OpenSpec for bug fixes, cleanup, dependency bumps, copy edits, tests for
existing behavior, and config/CI tweaks.

## Fleet Tooling

All shared fleet tooling lives under `fleet-ops/`: skills, scripts, docs,
templates, teammates, and psi-swarm. Edit skills in `fleet-ops/`, not in agent
profile dirs.

Current fleet skills exposed to agents:

| Skill | Type | Notes |
|---|---|---|
| `fleet-ops` | parent | routes to audit/init/deploy/workspace subskills |
| `call-teammate` | parent | routes to Codex, Grok, and Hermes |
| `name-domains` | standalone | domain naming pipeline |
| `spec-driven` | standalone | OpenSpec workflow |
| `psi-swarm` | standalone | Lighthouse performance audits |
| `agent-ready` | standalone | AI crawler readiness |
| `seo-audit` | standalone | on-page SEO audit |
| `token-budget` | standalone | Codex context/token audit |

Use repo-local scripts before manual fleet inspection:

```bash
./fleet-ops/scripts/git-health.sh --all --no-fetch
./fleet-ops/scripts/deploy-health.sh
```

## Fleet Standards Snapshot

- Prefer less code. Remove dead, duplicated, shelved, or unused paths before
  adding abstractions.
- Keep docs, code, tests, and plans in sync.
- Treat repeated drift across projects as fleet-standards work.
- Be conservative with rate limiters; stale or unused limiter config is usually
  cleanup, not a reason to tighten limits.
- Operational/admin UI should be dense, scannable, accessible, and fast.
- Marketing surfaces should follow `LANDING_STANDARD.md`.
- New web projects default to Astro for content/marketing/docs and Vite + React
  for app shells. Keep existing Next.js on Cloudflare only when it needs SSR,
  server actions, or per-route caching.
- Production deploys are manual. `main` should stay releasable and green, but it
  is not an automatic production trigger.
- Cloudflare account hygiene: one Worker or Pages project per product surface;
  avoid persistent preview/PR Workers.

## Secrets And Email

AgentMail and Infisical details are in the full standards file. Do not read or
print API keys unless the task explicitly requires it; never commit or paste
secret values into tracked files.

## Out Of Fleet

Exclude these from fleet-wide sweeps unless explicitly asked:

- `today-little-log`
- `verified-bases`
- `companion-robot`
- `forecast-lab`
- `elves-hq`
