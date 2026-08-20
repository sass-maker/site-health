
<p align="center">
  <img src="foundry/assets/logo.svg" alt="Foundry" width="150"/>
</p>

<h1 align="center">Foundry</h1>

<p align="center"><em>Shared systems for operating a portfolio of independent products.</em></p>

This repository currently contains Foundry, the shared operational project for
the Fleet portfolio. Independent products remain separate repositories and are
only cataloged, measured, or invoked through explicit contracts.

All Fleet-owned source is nested under `foundry/` and organized by the
operator-facing product model: evidence helpers, skills, workflows, operations,
reusable packages, and the private Foundry dashboard.
`foundry/ops/` is the shared operational
substrate beneath those buckets. This workspace root remains the agent and
independent-project entrypoint; independent products remain separately
versioned and deployed unless explicitly imported as Fleet infrastructure.

The single internal project catalog is
[`foundry/ops/config/projects.json`](foundry/ops/config/projects.json). It owns
project identity, attention, lifecycle, repository location, deployment, and
public-listing posture. Automation and marketing registries are policy overlays;
generated internal and public views come from the catalog with
`npm run generate:projects`.

## Canonical Foundry components

- **Helpers:** `foundry/helpers/ai-visibility/` and other Fleet-owned focused helpers.
- **Skills:** `foundry/ops/skills/` and `foundry/ops/teammates/skills/`.
- **Foundry dashboard:** `foundry/apps/dashboard/fleet-console/`.
- **Operational substrate:** `foundry/ops/`, including its pinned public,
  credential-free `workflows/` module.

The detailed ownership and connection map is in
[`foundry/README.md`](foundry/README.md). SaaS Maker owns the public directory
and the complete Feedback package, service, and private inbox.

The orchestration boundary is one-way: Fleet may catalog, inspect, monitor, and
invoke a standalone product's repo-local commands, but standalone products must
not require private Fleet files or instructions to build, test, migrate, or
deploy. Run `npm run check:independence` after fetching child repositories to
audit their canonical `origin/main` revisions; unavailable checkouts are
reported as skipped.

## Independent sibling repositories

These products have their own source histories, issue queues, checks, and
release boundaries. Fleet may catalog or inspect them, but they are not Fleet
source dependencies:

| Repository | Maintained source |
| --- | --- |
| [`sass-maker/saas-maker`](https://github.com/sass-maker/saas-maker) | sibling `saas-maker/` checkout |
| [`sass-maker/drank`](https://github.com/sass-maker/drank) | sibling `drank/` checkout |
| [`sass-maker/psi-swarm`](https://github.com/sass-maker/psi-swarm) | sibling `psi-swarm/` checkout |
| [`sarthakagrawal927/reel-pipeline`](https://github.com/sarthakagrawal927/reel-pipeline) | sibling `reel-pipeline/` checkout |
| [`sass-maker/mashup`](https://github.com/sass-maker/mashup) | sibling `mashup/` checkout |
| [`sarthakagrawal927/mobile-dev-cockpit`](https://github.com/sarthakagrawal927/mobile-dev-cockpit) | sibling parked `mobile-dev-cockpit/` checkout |

The current GitHub repository still uses the historical
`sass-maker/fleet-workspace` remote name. After cloning it, initialize the
public automation module:

```bash
git submodule update --init --depth 1 foundry/ops/workflows
```

The module runs only from public inputs. Private Fleet CI and provider inventory
remain in this repository.

<!-- project-catalog:start -->
## Portfolio classification

This is a generated summary of the private Fleet project catalog. The complete
machine-readable source is `foundry/ops/config/projects.json`; the generated
human view is [`foundry/ops/docs/project-catalog.md`](foundry/ops/docs/project-catalog.md).
Maintenance rules live in [`foundry/ops/config/README.md`](foundry/ops/config/README.md).

### P1 — 4

- product: CodeVetter, HeyPace, PostTrainLLM, Office OS

### P2 — 25

- product: SaaS Maker, GitStat, Reel Pipeline, Memory Map, High Signal, Research Papers, Significant Hobbies, Reader, SWE Interview Prep, Calorie, Setline, Kith, RolePatch, Karte, Starboard, App Health, Motion, Indulge, Field Track, Anchor
- platform: Foundry, Knowledge Base, iOS landings
- experiment: Mashup, Local AI Video Studio

### P4 — 26

- product: Mobile Dev Cockpit, Drank, Email Manager, India Standards, Anime List, LoopTV, SaaS Ideas, What It Takes to Win, Sarthak Agrawal
- platform: Free AI, PSI Swarm
- experiment: EverythingRated, Materia, Chess, AliveVille, Protein Index, Recipe Index, TrueHire, Today Little Log, Open Historia, Companion Robot, Elves HQ, Forecast Lab, Web Playables, Reddit Insights, Verified Bases

Priority, kind, status, deployment, and sharing readiness are independent.
Past projects remain preserved without becoming maintenance obligations.
<!-- project-catalog:end -->

## Work Tracking

Use repository-native GitHub issues or OpenSpec changes to capture durable work.
A work item can be an investigation, bug fix, deploy check, cleanup, code
change, or deferred follow-up. Fleet is the operational source of truth.

Create a task for:

- failing CI, broken deploys, and production bugs
- small or medium features
- cleanup and migration work
- TODOs and follow-ups
- research that should lead to a decision or implementation

Use a docs plan only when the document should remain useful after the work is
done. Good examples are architecture decisions, product specs, migration
strategies, runbooks, and research/reference notes.

## Docs Boundary

- Project `README.md`: current human entrypoint.
- Project `docs/`: durable reference, architecture, runbooks, research, and
  product docs.
- Project `docs/plans/`: rare design artifacts, not the task queue.
- GitHub issues: repository-native operational follow-up.
- OpenSpec changes: non-trivial product or cross-repository feature lifecycle.
- `PROJECT_STATUS.md`: durable current product state.

When a plan creates execution work, keep it in the owning repository or
cross-repository OpenSpec store.

The generated cross-project OpenSpec catalog is
[`foundry/ops/docs/openspec-inventory.md`](foundry/ops/docs/openspec-inventory.md).
Refresh it with `npm run generate:openspec-inventory`.

Single-project changes remain authoritative in the owning repository's
`openspec/`. Fleet and cross-project changes live only in the tracked
[`foundry/openspec/`](foundry/openspec/) store; do not create separate Desktop
OpenSpec stores.

Agent-facing instructions live in the fleet-level `AGENTS.md`, which applies to
projects below this directory unless a project has a more specific `AGENTS.md`.

## Repository Boundary

The Fleet root repo tracks workspace-level control files and all shared
infrastructure under `foundry/ops/`. Its `.gitignore` ignores independent child
product checkouts (`/*`) and allowlists:

- `README.md`, `PROJECT_STATUS.md`, `package.json`, agent/policy files, and `.gitignore`
- `foundry/` — all Fleet-owned apps, services, packages, tools, operations,
  specifications, and assets

Child project directories are intentionally ignored here because they are
independent repositories with their own histories, branches, and deploy flows.

Run `npm run test:fleet` for shared infrastructure checks and
`npm run check:components:native` for each imported component's own validation.
The latter preserves each component's package manager and toolchain rather than
imposing a shared deploy cadence.

## Fresh machine

Clone this repository as the workspace root, then follow
[`foundry/ops/docs/fleet-runbook.md`](foundry/ops/docs/fleet-runbook.md#fresh-machine-setup).
The runbook contains the canonical project clone list, agent-skill linking,
authentication checks, and the two read-only fleet health commands. Cloudflare
Pages projects normally show no Git provider because production deploys are
guarded GitHub Actions or Wrangler uploads; the GitHub repository and commit in
the deployment workflow are the source link.
