# Deployment Matrix — Build, Deploy, Preview, and Rollback Safety

Generated: 2026-07-18
Owner: Devin 3 (PRD 03)
Validation: `node foundry/ops/scripts/cloudflare-resilience-audit.mjs --no-live --json` → exit 0 (no blocking findings); `git diff --check` → clean; all 21 workflow YAML files parse.

## Columns

- **Repo / Workflow** — repository and workflow file
- **Trigger** — event that starts the deploy
- **Source SHA** — `${{ github.sha }}` (checkout) for all paths
- **Timeout** — `timeout-minutes` on the deploy job
- **Build cmd** — build command before deploy
- **Pkg mgr / Lockfile** — package manager and frozen-lockfile mode
- **CF project/Worker** — Cloudflare target name
- **Smoke URL / Exception** — post-deploy check with bounded `--max-time`
- **Preview policy** — how PR previews are handled
- **Rollback target** — documented rollback mechanism
- **Concurrency** — overlap protection group
- **Validation** — result

## Pages surfaces

| Repo | Workflow | Trigger | Timeout | Build cmd | Pkg mgr/Lockfile | CF project | Smoke URL | Preview policy | Rollback target | Concurrency | Validation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| codevetter | deploy-landing.yml | workflow_dispatch | 20m | `pnpm run build` (landing) + `npm run build` (docs) | pnpm/npm, frozen (`pnpm install --frozen-lockfile`, `npm ci`) | codevetter (Pages) + codevetter.com Worker | `https://codevetter.com` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback; Worker `wrangler versions rollback` | `deploy-landing-${{ github.ref }}` | YAML OK |
| pace | deploy.yml | workflow_dispatch | 20m | `npm run build` | npm, frozen (`npm ci`) | pace | `https://heypace.app/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| posttrainllm | deploy.yml | workflow_dispatch | 20m | `pnpm run build` | pnpm, frozen | tinygpt | `https://posttrainllm.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback (project: tinygpt) | `deploy-${{ github.ref }}` | YAML OK |
| chess | deploy.yml | workflow_dispatch | 20m | `pnpm build` | pnpm, frozen | chess-9a0 | `https://chess.significanthobbies.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| research-papers | deploy.yml | workflow_dispatch | 20m | `pnpm build` | pnpm, frozen | research-papers | `https://papers.highsignal.app/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}` | YAML OK |
| materia | deploy.yml | workflow_dispatch | 20m | `npm run build` | npm, frozen (`npm ci`) | materia | `https://materia.significanthobbies.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| anime-list | deploy.yml | workflow_dispatch | 20m | `pnpm build` | pnpm, frozen | anime-list | `https://anime.significanthobbies.com/` + `/anime/1` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| looptv | deploy.yml | workflow_dispatch + pull_request | 20m | `pnpm cf:build` | pnpm, frozen | looptv | `https://tv.significanthobbies.com` (curl --fail --max-time 20) | Pages previews (pr-\<n\>.looptv.pages.dev) — no persistent Worker | Pages dashboard rollback | `${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}` | YAML OK |
| swe-interview-prep | deploy.yml | workflow_dispatch | 20m | `pnpm build` | pnpm, frozen | swe-interview-prep | `https://learn.significanthobbies.com` + API 405/401/200 contract (curl --fail --max-time 20) | Pages previews — no persistent Worker | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| ai-game | deploy-aliveville.yml | workflow_dispatch | 20m | `npm run build` | npm, frozen (`npm ci`) | aliveville | `https://aliveville.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| web-playables | deploy.yml (NEW) | workflow_dispatch | 20m | `pnpm run check` + `pnpm build` | pnpm, frozen | web-playables | `https://idle.aliveville.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| saas-ideas | deploy.yml (NEW) | workflow_dispatch | 15m | `python3 scripts/build.py` | Python stdlib (no npm) | saas-ideas | `https://ideas.sassmaker.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| drank | ci.yml (deploy job) | push to main | 20m | `pnpm run build` | pnpm, frozen | drank | `https://domains.sassmaker.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `deploy-drank-production` (cancel: false) | YAML OK |
| saas-maker | ci.yml (deploy-landing) | push to main | 20m | `pnpm build:showcase` | pnpm, frozen | saas-maker-home | `https://sassmaker.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | workflow-level `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| saas-maker | ci.yml (deploy-docs) | push to main | 20m | `pnpm build:docs` | pnpm, frozen | saas-maker-docs | `https://docs.sassmaker.com/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | workflow-level | YAML OK |
| psi-swarm | deploy.yml | workflow_dispatch | 20m | `pnpm --filter psi-swarm-web run build` | pnpm, frozen | psi-swarm-web | `https://psi-swarm-web.pages.dev/` + `/projects/` (curl --fail --max-time 20) | No PR preview | Pages dashboard rollback | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |

## Worker surfaces

| Repo | Workflow | Trigger | Timeout | Build cmd | Pkg mgr/Lockfile | Worker name | Smoke URL / Exception | Preview policy | Rollback target | Concurrency | Validation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| codevetter | deploy-landing.yml | workflow_dispatch | 20m | (same job as Pages) | pnpm, frozen | codevetter-landing-proxy | `https://codevetter.com` (shared with Pages smoke) | No PR preview | `wrangler versions rollback --config wrangler.worker.jsonc` | `deploy-landing-${{ github.ref }}` | YAML OK |
| saas-maker | ci.yml (deploy-api) | push to main | 15m | (uses build-and-test) | pnpm, frozen | saasmaker-api | `pnpm smoke` (api.sassmaker.com + app.sassmaker.com) | No PR preview | `wrangler versions rollback` from workers/api/ | workflow-level | YAML OK |
| saas-maker | ci.yml (deploy-droid) | push to main | 15m | (uses build-and-test) | pnpm, frozen | saasmaker-droid | **Artifact-only exception** — internal Worker, no public domain | No PR preview | `wrangler versions rollback` from workers/droid/ | workflow-level | YAML OK |
| saas-maker | ci.yml (deploy-cockpit) | push to main | 20m | (uses build-and-test) | pnpm, frozen | saasmaker-dashboard | `https://app.sassmaker.com/` (curl --fail --max-time 30) | No PR preview | `wrangler versions rollback` from apps/cockpit/ | workflow-level | YAML OK |
| saas-maker | foundry-cf-deploy.yml | workflow_call / workflow_dispatch | 15m | configurable `build_command` input | pnpm, frozen | configurable `worker_name` input | configurable `smoke_url` input (bounded --max-time 15, retry loop) | No PR preview | `wrangler versions rollback` (per caller) | N/A (reusable) | YAML OK |
| significanthobbies | deploy.yml | workflow_dispatch | 20m | `node scripts/cf-build.mjs` | pnpm, frozen | significanthobbies | `https://significanthobbies.com/` (custom HTML check, --max-time 20) | No PR preview | `wrangler versions rollback` | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| rolepatch | deploy.yml | push to main + PR + workflow_dispatch | 20m | `pnpm cf:build` | pnpm, frozen | resume-tailor | `pnpm smoke:prod` (rolepatch.com) | PR: build-only (no deploy, no persistent Worker) | `wrangler versions rollback` | `${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}` | YAML OK |
| karte | deploy.yml | workflow_dispatch | 20m | `pnpm cf:build` | pnpm, frozen | linkchat | `https://linkchat.sarthakagrawal927.workers.dev` (curl --fail --max-time 30) | No PR preview | `wrangler versions rollback` | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| starboard | deploy.yml | workflow_dispatch | 20m | `pnpm cf:build` | pnpm, frozen | starboard | `https://starboard.codevetter.com/` (curl --fail --max-time 20) | No PR preview | `wrangler versions rollback` | `${{ github.workflow }}-${{ github.ref }}` | YAML OK |
| reel-pipeline | deploy.yml | workflow_dispatch | 15m | None (config-only deploy) | N/A | reel-pipeline-artifacts | **Artifact-only exception** — internal Worker, no public domain | No PR preview | `wrangler versions rollback --config wrangler.jsonc` | `deploy-artifacts-${{ github.ref }}` (cancel: false) | YAML OK |

## Out-of-scope repos (owned by PRD 01 or PRD 2)

These repos' deploy workflows are not edited by PRD 03 to avoid collision with
runtime-file ownership:

- **PRD 01 (Devin 1)**: knowledge-base, reader, email-manager
- **PRD 02 (Devin 2)**: high-signal, everythingrated, protein-index, free-ai

## Changes made

### Pages deploy workflows (12 files)

- **codevetter/deploy-landing.yml**: added `timeout-minutes: 20`, rollback ref, `npm ci` (was `npm install`), `--max-time 20` on smoke.
- **pace/deploy.yml**: added rollback ref (already had timeout, concurrency, frozen, bounded smoke).
- **posttrainllm/deploy.yml**: added rollback ref (already had timeout, concurrency, frozen, bounded smoke).
- **chess/deploy.yml**: added `concurrency` group, rollback ref (already had timeout, frozen, bounded smoke).
- **research-papers/deploy.yml**: added `timeout-minutes: 20`, rollback ref (already had concurrency, frozen, bounded smoke).
- **materia/deploy.yml**: added `timeout-minutes: 20`, rollback ref, fixed smoke URL from `materia-6bq.pages.dev` to canonical `materia.significanthobbies.com`.
- **anime-list/deploy.yml**: added `timeout-minutes: 20`, rollback ref (already had concurrency, frozen, bounded smoke).
- **looptv/deploy.yml**: added `concurrency` group, `timeout-minutes: 20` on both jobs, `--max-time 20` on smoke, rollback ref, documented Pages preview policy.
- **swe-interview-prep/deploy.yml**: added `concurrency` group, `timeout-minutes: 20`, **fixed smoke condition** (was `if: github.event_name == 'push'` but trigger is `workflow_dispatch` — smoke never ran), added `--max-time 20`, rollback ref.
- **ai-game/deploy-aliveville.yml**: added `concurrency` group, `timeout-minutes: 20`, `--retry 3 --retry-delay 5 --max-time 20` on smoke (was unbounded), rollback ref.
- **drank/ci.yml**: added `concurrency` group on deploy job, rollback ref (already had timeout, frozen, bounded smoke).
- **psi-swarm/deploy.yml**: added `timeout-minutes: 20`, rollback ref (already had concurrency, frozen, bounded smoke).

### Worker deploy workflows (5 files)

- **significanthobbies/deploy.yml**: added `concurrency` group, `timeout-minutes: 20`, rollback ref.
- **rolepatch/deploy.yml**: added `concurrency` group, `timeout-minutes: 20` on both jobs, rollback ref.
- **karte/deploy.yml**: added `concurrency` group, `timeout-minutes: 20`, `--retry 3 --retry-delay 5` on smoke, rollback ref.
- **starboard/deploy.yml**: added `concurrency` group, `timeout-minutes: 20`, rollback ref.
- **reel-pipeline/deploy.yml**: added `timeout-minutes: 15`, documented artifact-only exception (no public domain, no smoke), rollback ref.

### Multi-surface CI (1 file)

- **saas-maker/ci.yml**: added workflow-level `concurrency`, `timeout-minutes` on all 7 jobs, `--frozen-lockfile` on all `pnpm install` (was non-frozen in 7 places), smoke checks on deploy-cockpit/deploy-landing/deploy-docs (were missing), documented droid artifact-only exception, rollback references for all 5 CF targets.

### New deploy workflows (2 files)

- **web-playables/deploy.yml**: new — mirrors manual `pnpm deploy` with `pnpm run check` + `pnpm build`, Pages deploy, smoke `https://idle.aliveville.com/`, timeout 20m, concurrency, frozen lockfile, rollback ref.
- **saas-ideas/deploy.yml**: new — mirrors manual deploy with `python3 scripts/build.py`, doc validation, artifact verification, Pages deploy, smoke `https://ideas.sassmaker.com/`, timeout 15m, concurrency, rollback ref.

## Residual risks

1. **saas-maker `--frozen-lockfile`**: changed from non-frozen `pnpm install` to `pnpm install --frozen-lockfile` across all 7 jobs. If the lockfile has drift, CI will fail. The fix is to sync the lockfile (`pnpm install` locally and commit the updated `pnpm-lock.yaml`), not to revert to non-frozen mode.
2. **rolepatch auto-deploy on push to main**: the existing trigger includes `push: branches: [main]` which auto-deploys on every push. This is pre-existing behavior — PRD 03 does not change triggers. If auto-deploy is undesired, it should be raised separately.
3. **drank auto-deploy on push to main**: same as rolepatch — pre-existing auto-deploy, not changed by this PRD.
4. **`pnpm smoke:prod` in rolepatch**: this is a script-based smoke check, not a bounded curl. If the script lacks an internal timeout, a hung endpoint could stall the job. The `timeout-minutes: 20` on the job provides a backstop.
5. **reel-pipeline and saasmaker-droid**: documented as artifact-only exceptions (no public domain, no smoke). These Workers are exercised by upstream callers; a future PRD could add internal health probes if needed.
6. **No `|| true` on any deploy/smoke step**: all existing `continue-on-error: true` instances are on cache-purge steps with explicit comments explaining why they are non-gating. No new non-gating steps were added.
