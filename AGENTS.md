# Fleet Agent Instructions

This file is the always-loaded fleet entrypoint. Keep it compact.

Full standards live in `foundry/ops/docs/fleet-agent-standards.md`; read that file
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
- Use `$code-cleanup` before dependency manifest or lockfile changes and for
  unused-code, unused-package, native quality, outdated-package, vulnerability,
  and guarded package-upgrade work.
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
8. Record completed Fleet-owned skill runs through the installed
   `fleet-skill-run` boundary so private output and explicit numeric
   observations remain available for audit and future project graphs.

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
6. **Work queue** — a link to the repository's GitHub Issues; no task list

GitHub is the only operational tracker:

- An open issue is a to-do.
- An open issue with a linked pull request is in progress.
- A merged pull request plus a closed issue is done.

Create an issue before starting independently shippable work and use
`Closes #<issue>` in the pull request body. Immediately after creating any
issue, add its original URL to the private priority Project by running
`node foundry/ops/scripts/github-priority-queue.mjs --owner
sarthakagrawal927 --project 3 --author sarthakagrawal927 --apply` from the
Fleet root. Leave Priority and Reasoning complexity unset until the issue body
and state have been reviewed; then place it intentionally in its band.
Planned, deferred, blocked, bug, cleanup, and follow-up work belongs in issues,
not `PROJECT_STATUS.md`, `STATUS.md`, plan documents, or another task database.
When work ships, close
the issue and update `PROJECT_STATUS.md` only with the completed product truth:
the timeline, products, dependencies, and shipped features affected by the
change. Do not copy closed issue histories into the status file.

## Fleet Inventory

`foundry/ops/config/projects.json` is the only portfolio, priority, deployment,
and cloud-resource source of truth. Its generated human view is
`foundry/ops/docs/project-catalog.md`.

- Add every active, local-only, parked, past, out-of-fleet, and non-product
  identity. Never hide a checkout under another project merely to pass checks.
- Whenever a deployment, domain, release channel, Cloudflare/Turso resource,
  lifecycle, attention class, or owner priority changes, update the catalog's
  project and infrastructure rows in the same task.
- Every provider object must be owned by one project or remain explicit under
  `infrastructure.unownedResources`; never silently drop an unknown resource.
- P1 is reserved for CodeVetter, Pace, PostTrainLLM, and Office OS. P2 is the
  eligible active-work pool. Choose immediate P2 work only from open GitHub
  Issues and name at most five P2 projects in one work cycle; do not create a
  replacement tier or task tracker. P4 is for owner-finished or archived work;
  new active identities start at P2 until Sarthak decides otherwise. Every
  identity requires an explicit product/platform/experiment kind,
  active/archive status, deployed and ready-to-share values, plus a dated
  sharing-readiness reason supported by live public evidence or a named blocker.
- Run `npm run generate:projects` after edits and `npm run check:projects`
  before handoff. The check fails on missing checkouts, priorities,
  infrastructure rows, Cloudflare coverage classes, or stale generated views.

## Feature Work

Use the `spec-driven` skill before non-trivial new fleet features: new surfaces,
routes, commands, capabilities, cross-repo behavior, or multi-file behavior
changes.

Skip the spec workflow for bug fixes, cleanup, dependency bumps, copy edits,
tests for existing behavior, and config/CI tweaks.

Specs live in GitHub Issues, not on disk. The spec-driven workflow creates one
tracking issue per feature; the issue body holds the proposal (why/what/how),
design notes, requirements/scenarios, and the task checklist. Check off tasks
in the issue as work lands. There is no local `openspec/` directory, no local
spec files, and no `openspec` CLI — the GitHub Issue is the single source of
truth for both design and tasks. When the feature ships, close the issue and
record the shipped outcome in `PROJECT_STATUS.md`.

## Fleet Tooling

All Fleet-owned source lives under `foundry/`. Operational tooling is under
`foundry/ops/`: skills, scripts, registries, automation, host setup, docs,
templates, and teammates. Focused Fleet helpers live under
`foundry/helpers/`, and Fleet Console interfaces live under `foundry/apps/`.
SaaS Maker and Feedback, Drank, and PSI Swarm are standalone repositories at
the workspace root. Fleet-owned orchestration
skills remain canonical under `foundry/ops/skills/`; a helper-specific skill
may remain canonical beside its helper and be exposed through a thin link in
that directory. Edit Fleet sources in the repo, not in agent profile dirs.
Approved third-party skills may be
installed as ignored, machine-local payloads when their installer is pinned in
Fleet scripts.

Maintained Fleet repositories live under a product or portfolio organization,
not Sarthak's personal GitHub namespace. The personal namespace is reserved for
profile/personal work and historical or absorbed repositories.

The workspace root remains the agent entrypoint. Run
`./foundry/ops/scripts/agent-stack.sh install-skills` after cloning to link
root `.agents/skills/*` entries to their canonical implementations inside
`foundry/ops/`.

Current Fleet-owned and approved external skills exposed to agents:

| Skill | Type | Notes |
|---|---|---|
| `fleet-ops` | parent | routes to audit/init/deploy/parity/workspace/Cloudflare and Turso spend subskills |
| `fleet-deploy-parity` | standalone | fleet-wide "is everything deployed to the latest?" — Cloudflare Pages deployments match current main SHA, Workers at 100% traffic, Actions green at HEAD |
| `call-teammate` | parent | routes to Codex, Grok, and Hermes |
| `name-domains` | standalone | domain naming pipeline |
| `spec-driven` | standalone | GitHub-issue spec workflow for new features |
| `code-cleanup` | standalone | Knip/native quality orchestration, dependency health, guarded upgrades, and advisory Bundlephobia evidence |
| `site-health` | parent | routes to agent-ready (GEO surfaces), seo-audit (on-page), content-coverage (search-intent pages), psi-swarm (perf), geo-observatory (trends), public-product-smoke (guest journeys); combined scorecard via site-health-scorecard.mjs |
| `analyze-storage` | standalone | read-only disk analysis with ignored workspace-local JSON and static HTML reports; never deletes or moves data |
| `token-budget` | standalone | Codex context/token audit |
| `local-ports-cleanup` | standalone | safety-first local port and development-process cleanup through `ports` |
| `mobile-task-control` | standalone | durable chat-requested task control |
| `daily-learning` | standalone | private adaptive learning sessions |
| `design-engineering` | parent | routes existing UI design and transformation workflows plus inspiration, component patterns, web 3D, creative effects, and evidence interfaces |
| `design-workflow` | standalone | Fleet preserve/overhaul design gates, review receipts, and owner feedback |
| `cloudflare-spend-guard` | fleet-ops subskill | read-only Cloudflare/Turso spend, quota, necessity, and optimization |
| `impeccable` | external standalone | underlying design craft, critique, polish, and audit engine |

Local Fleet skill history lives outside git under
`~/Library/Application Support/Fleet Ops/skill-runs/`. Retain output through
the wrapper or host receipt; never infer numeric metrics from prose.

Use repo-local scripts before manual fleet inspection:

```bash
./foundry/ops/scripts/git-health.sh --all --no-fetch
./foundry/ops/scripts/deploy-health.sh
```

## Fleet Standards Snapshot

- Prefer less code. Remove dead, duplicated, shelved, or unused paths before
  adding abstractions.
- Fleet code-health decisions follow
  `foundry/ops/docs/fleet-code-health-standard.md`. Use
  `npm run report:code-health` for the deterministic inventory and
  `npm run check:code-health` for policy/profile validation. Adopt the standard
  one maintained project at a time in focus → active → secondary order; do not
  advance past unresolved findings without a valid repository-owned baseline.
- Keep docs, code, tests, and plans in sync.
- Treat repeated drift across projects as fleet-standards work.
- Be conservative with rate limiters; stale or unused limiter config is usually
  cleanup, not a reason to tighten limits.
- Operational/admin UI should be dense, scannable, accessible, and fast.
- Marketing surfaces should follow `foundry/LANDING_STANDARD.md`.
- Meaningful visual work uses `$design-workflow`, with Impeccable underneath.
  Classify `preserve` or `overhaul` before code. Overhaul requires owner-approved
  or explicitly delegated direction evidence.
- Do not claim meaningful visual work complete until its design-review receipt
  passes: tracked context, browser evidence at required widths, critique and
  audit floors, zero unresolved P0/P1, a passing project check, and owner
  `keep` or `delegated` feedback.
- Unless explicitly approved, keep routes and anchors, primary navigation
  labels, form field names and order, analytics identifiers, the wordmark, and
  legal/consent copy.
- Treat generated comps as north stars, not screenshots to trace. If a comp
  hides text, spacing, or component detail, generate a fresh section-specific
  reference instead of cropping an old board or generating every section by
  default.
- Public agent/LLM indexing (llms.txt, page markdown, `/api/ai`) follows
  `foundry/ops/docs/agent-indexing-standard.md`.
- New web projects default to Astro for content/marketing/docs and Vite + React
  for app shells. Keep existing Next.js on Cloudflare only when it needs SSR,
  server actions, or per-route caching.
- Production deploys are manual. `main` should stay releasable and green, but it
  is not an automatic production trigger.
- Every Cloudflare Worker production deploy must tag the uploaded version with
  the exact 40-character Git SHA. Package scripts should use
  `wrangler deploy --tag "$(git rev-parse HEAD)"`; GitHub Actions should use
  `--tag ${{ github.sha }}`. OpenNext deploy commands pass this flag through to
  Wrangler. Untagged Worker deployments are unverifiable and must never be
  reported as current.
- Cloudflare account hygiene: one Worker or Pages project per product surface;
  avoid persistent preview/PR Workers.

## Secrets And Email

AgentMail and Infisical details are in the full standards file. Do not read or
print API keys unless the task explicitly requires it; never commit or paste
secret values into tracked files.

## Out Of Fleet

Exclude these from fleet-wide sweeps unless explicitly asked:

- `open-historia`
- `today-little-log`
- `truehire`
- `companion-robot`
- `device-net-test`
- `forecast-lab`
- `elves-hq`
- `saas-maker-ci-fix`
