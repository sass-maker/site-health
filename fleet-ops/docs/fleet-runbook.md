# Fleet Runbook

This is the operating guide for the projects in the Fleet workspace.

The Fleet root owns shared infrastructure under `fleet-ops/`. Immediate child
directories with their own `.git/` remain independent product repositories.
Reel Pipeline, Drank, PSI Swarm, Mobile Dev Cockpit, Content Factory, and the
Ops Console are Fleet components and are maintained directly in this repository.

## Operating Model

Use this order when working on the Fleet:

1. Check the project root `PROJECT_STATUS.md`, its active OpenSpec change, and GitHub.
2. Enter the independent project checkout or canonical `fleet-ops/` component.
3. Read the Fleet `AGENTS.md` and the project `AGENTS.md` or `agents.md`.
4. Run the smallest relevant local verification before editing.
5. Make the change.
6. Run the project verification commands.
7. Commit and push the owning repository.
8. Close the corresponding OpenSpec/GitHub work item with verification evidence.

`PROJECT_STATUS.md` is product-status truth, OpenSpec is feature-lifecycle
truth, and GitHub is code/review truth. Cloudflare, Vercel, Postiz, and other
hosts are runtime targets, not task stores.

## Portfolio Attention Model (2026-07-19)

The canonical human allocation model lives in
[`project-tiers.md`](project-tiers.md). It has five attention classes:

- **My Work:** CodeVetter, HeyPace, PostTrainLLM, and High Signal. Sarthak leads
  their product direction.
- **Toolbox:** mostly finished utilities kept usable, discoverable, and quietly
  marketed for bounded experiments.
- **Foundry + Helpers:** the shared post-ship system that measures verified
  products, markets them, and turns feedback into evidence-backed
  recommendations.
- **Ignored:** frozen or retired projects with no routine obligation.
- **Removed:** attribution-only records excluded from operations.

Do not infer attention from repository count, custom-domain ownership, or the
legacy `focus` / `active` / `secondary` deployment tiers. Use
`project-tiers.md` for attention and `fleet-ops/config/projects.json` for deploy
and domain reality.

### Foundry handoff boundary

Foundry begins after product work is complete and verified:

1. The change is merged into the product's stable branch.
2. Required CI checks pass.
3. The intended artifact is deployed.
4. Production smoke verification passes.

After handoff, Foundry measures product and API outcomes, runs approved or
bounded marketing, and synthesizes user feedback and behavioral evidence. It
may recommend the next action or create a reviewable task, but it does not own
product direction or autonomously implement product features. The product owner
decides whether evidence becomes new product work.

Local checkout aliases:

| Canonical project | Local checkout |
| --- | --- |

## Owned Domain Map

The ten owned root domains are:

| Domain | Project |
| --- | --- |
| `posttrainllm.com` | PostTrainLLM |
| `heypace.app` | Pace |
| `codevetter.com` | codevetter |
| `aliveville.com` | aliveville |
| `rolepatch.com` | RolePatch |
| `highsignal.app` | High Signal |
| `karte.cc` | Karte |
| `significanthobbies.com` | Significant Hobbies |
| `sarthakagrawal.dev` | Portfolio |

Eight root domains map to active Fleet products. `sarthakagrawal.dev` is the
portfolio domain and is included in the ownership count, but not the product
count.

Subdomains and `www.*` variants belong to their parent projects and are not
separate Fleet products.

## Fresh Machine Setup

Prerequisites: Git, GitHub CLI, Node 22, pnpm, and Wrangler. Authenticate once,
then clone the Fleet root and its active child repositories:

The historical repositories `saas-maker`, `reel-pipeline`, `drank`,
`mobile-dev-cockpit`, and `psi-swarm` have been merged into Fleet and moved to
Sarthak's personal GitHub account. Do not clone them during setup. Their
maintained source is already present under `fleet-ops/`.

```bash
gh auth status
wrangler whoami
gh repo clone sass-maker/fleet-workspace fleet
cd fleet

while read -r repo directory; do
  test -d "$directory/.git" || gh repo clone "$repo" "$directory"
done <<'REPOS'
sarthakagrawal927/aliveville aliveville
Significant-Hobbies/anime-list anime-list
Significant-Hobbies/chess chess
Codevetter/codevetter codevetter
sarthakagrawal927/email-manager email-manager
High-Signal-App/everythingrated everythingrated
sass-maker/free-ai free-ai
High-Signal-App/high-signal high-signal
sarthakagrawal927/karte karte
sass-maker/knowledge-base knowledge-base
Significant-Hobbies/looptv looptv
Significant-Hobbies/materia materia
HeyPace/pace pace
PostTrainLLM/posttrainllm posttrainllm
Significant-Hobbies/protein-index protein-index
Significant-Hobbies/reader reader
High-Signal-App/research-papers research-papers
sarthakagrawal927/rolepatch rolepatch
sarthakagrawal927/web-playables web-playables
Significant-Hobbies/significanthobbies significanthobbies
Codevetter/starboard starboard
Significant-Hobbies/swe-interview-prep swe-interview-prep
REPOS

./fleet-ops/scripts/agent-stack.sh install-skills
git status --short --branch
cd /path/to/fleet
npm run check:registry
```

Cloudflare-backed projects require a working Wrangler login. GitHub Actions
deploys additionally require the repository's Cloudflare secrets; local
Wrangler auth is intentionally not copied between machines:

```bash
wrangler whoami
```

GitHub-backed checks require a working GitHub CLI login:

```bash
gh auth status
```

Return to the Fleet root and validate the installation:

```bash
cd ..
bash fleet-ops/scripts/fleet-health.sh --no-fetch
bash fleet-ops/scripts/deploy-health.sh
```

Cloudflare Pages showing `Git Provider: No` is expected for direct-upload
projects. Do not connect them to GitHub in Cloudflare: the guarded deploy
workflow and its recorded Git commit provide repository provenance without
turning `main` into an automatic production deploy.

## Daily Fleet Checks

Check child repository cleanliness:

```bash
cd /path/to/fleet
bash fleet-ops/scripts/fleet-health.sh
```

Check GitHub Actions and Cloudflare deployment health:

```bash
bash fleet-ops/scripts/deploy-health.sh
```

The deploy health script is read-only. It checks GitHub Actions for immediate
child repositories and checks Cloudflare deployments listed in
`fleet-ops/config/projects.json`. Pages deployments can usually be compared
to `origin/main` by commit prefix; Workers deployments confirm active
deployment state but do not always expose a Git commit.

Branch/deploy posture:

- `main` is the long-lived stable code line, not an automatic production
  trigger.
- Deploys are manual and should happen only after the project is clean, synced
  to `main`, green in GitHub Actions, and ready to ship as a batch.
- Every fleet project should have GitHub Actions and a repo-local deploy command
  such as `pnpm deploy`, `npm run deploy`, or `bun run deploy`.
- Deploy commands should fail closed if the repo is not on clean/synced `main`
  or if the latest `main` CI signal is not green.

## Active Projects

The active production fleet is listed in `fleet-ops/config/projects.json`.

| Project | Purpose | Local run | Verify before push | Deploy |
| --- | --- | --- | --- | --- |
| `aliveville` | AliveVille 3D AI world simulator | `pnpm dev` | `pnpm typecheck`, `pnpm test`, `pnpm build` | project workflows |
| `anime-list` | MAL Explorer for anime/manga discovery and watchlists | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm pages:build` | `pnpm deploy` |
| `codevetter` | Desktop-first AI code review platform | see project README | see project README / CI | see project README / CI |
| `drank` | Domain rating tracker | `cd fleet-ops/services/drank && pnpm dev` | root `Drank CI` | `cd fleet-ops/services/drank && pnpm deploy` |
| `email-manager` | Gmail/email triage and automation | `pnpm dev` | `pnpm lint`, `pnpm cf:build` | `pnpm deploy` |
| `everythingrated` | Multi-axis ratings for High Signal directories | `pnpm dev` | see project README / CI | project workflows |
| `free-ai` | OpenAI-compatible gateway for free LLM providers | `pnpm dev` | `pnpm check`, `pnpm test:e2e` when relevant | `pnpm deploy` |
| `high-signal` | Signal intelligence and collections | `pnpm dev` | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` | project workflows |
| `karte` | AI-enhanced public profiles and chat/contact analytics | `pnpm dev` | `pnpm lint`, `pnpm build`, `pnpm cf:build` | `pnpm deploy:cf` |
| `knowledge-base` | Private Agent Search over project corpora | see project README | see project README / CI | see project README / CI |
| `looptv` | Lean-back YouTube station player | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm build` | `pnpm deploy` |
| `pace` | Local macOS voice agent | see project README | see project README / CI | see project README / CI |
| `posttrainllm` | Local LLM factory/runtime | see project README | see project README / CI | see project README / CI |
| `reader` | Article/PDF reader, annotation, and research workspace | `pnpm dev` | `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm cf:build` | `pnpm deploy` |
| `reel-pipeline` | AI short-form video generation pipeline | `cd fleet-ops/services/reel-pipeline && npm run dev` | root `Reel Pipeline CI` | `cd fleet-ops/services/reel-pipeline && npm run deploy` |
| `research-papers` | Academic paper platform and search asset | see project README | see project README / CI | see project README / CI |
| `rolepatch` | RolePatch resume tailoring and interview prep | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm cf:build` | `pnpm deploy` |
| `saas-maker` | Public product directory, feedback API/inbox, one published feedback package, Blume docs | package-specific dev commands | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm smoke` after deploy | package/workflow deploys |
| `significanthobbies` | Hobby journeys and discovery | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm cf:build` | `pnpm deploy` |
| `starboard` | GitHub stars organization and stack discovery | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm cf:build` | `pnpm deploy:cf` |
| `swe-interview-prep` | Interview Coder prep app | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm build` | `pnpm deploy` |

## Local-Only Or Non-Fleet Repositories

These are not part of the active production fleet and should be excluded from
fleet-wide sweeps unless explicitly re-added:

- `open-historia`
- `personalsite`: removed from the active fleet. Do not create new Fleet tasks
  for it unless it is explicitly re-added.
- `today-little-log`
- `truehire`

## Verification Rules

Use the smallest verification that proves the task:

- UI-only change: lint plus build, and browser smoke when practical.
- API/schema change: unit tests plus typecheck/build, and migration review.
- Deploy fix: local build plus GitHub Actions or deploy smoke.
- Fleet-wide change: verify every affected child repo, not just `saas-maker`.

Before claiming completion, check:

```bash
git status --short --branch
git log --oneline -1
```

After pushing, confirm the branch is not ahead:

```bash
git fetch --quiet
git rev-list --left-right --count @{u}...HEAD
```

Expected output is `0 0`.

## Cleanup Rules

After task completion:

- Stop dev servers and preview servers unless the user asked to keep them open.
- Remove generated temporary folders such as `test-results/`, `tmp/`, and local
  preview output when they are not intended to be committed.
- Keep child repositories on `main` unless a working branch is intentionally
  still active.
- Do not leave unpushed commits.

## Documentation Rules

Do not copy this runbook into every project. Project docs should link back to
the Fleet docs and only add project-specific exceptions.

Use:

- Fleet `README.md`: workspace entrypoint.
- Fleet `docs/fleet-runbook.md`: how to operate and verify the fleet.
- Fleet `docs/project-map.md`: how the systems connect.
- Project `README.md`: project-specific setup and usage.
- Project `AGENTS.md` or `agents.md`: project-specific agent instructions.
- Project `PROJECT_STATUS.md`: active, deferred, and blocked work.
