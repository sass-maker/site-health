# Fleet Runbook

This is the operating guide for the projects in the Fleet workspace.

The Fleet root owns shared infrastructure under `foundry/ops/`. Immediate child
directories with their own `.git/` remain independent product repositories.
Reel Pipeline, Drank, PSI Swarm, Mobile Dev Cockpit, Content Factory, and the
Ops Console are Fleet components and are maintained directly in this repository.

## Operating Model

Use this order when working on the Fleet:

1. Check the project root `PROJECT_STATUS.md`, its active OpenSpec change, and GitHub.
2. Enter the independent project checkout or canonical `foundry/ops/` component.
3. Read the Fleet `AGENTS.md` and the project `AGENTS.md` or `agents.md`.
4. Run the smallest relevant local verification before editing.
5. Make the change.
6. Run the project verification commands.
7. Commit and push the owning repository.
8. Close the corresponding OpenSpec/GitHub work item with verification evidence.

`PROJECT_STATUS.md` is product-status truth, OpenSpec is feature-lifecycle
truth, and GitHub is code/review truth. Cloudflare, Vercel, Postiz, and other
hosts are runtime targets, not task stores.

## Portfolio Attention Model

Project membership, attention, lifecycle, repository paths, deploy posture, and
public-listing posture live only in
[`../config/projects.json`](../config/projects.json). The generated human
inventory is [`project-catalog.md`](project-catalog.md); `project-tiers.md`
defines treatment without duplicating membership.

- **My Work:** CodeVetter, HeyPace, PostTrainLLM, and High Signal. Sarthak leads
  their product direction.
- **Toolbox:** mostly finished utilities kept usable, discoverable, and quietly
  marketed for bounded experiments.
- **Foundry + Helpers:** the shared post-ship system that measures verified
  products, markets them, and turns feedback into evidence-backed
  recommendations.
- **Ignored / inactive:** frozen or retired projects with no routine
  obligation.

Do not infer attention from repository count, custom-domain ownership, or the
legacy `focus` / `active` / `secondary` deployment tiers. Edit
`projects.json`, then run `npm run generate:projects`; check mode fails when an
active or inactive Git checkout is missing from the catalog.

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

The private owner loop is local-first and remains useful without external AI:

```sh
node foundry/ops/scripts/founder-control.mjs status
node foundry/ops/scripts/founder-control.mjs brief
node foundry/ops/scripts/founder-control.mjs notifications
node foundry/ops/scripts/ai-visibility-canary.mjs \
  --project pace \
  --fixture foundry/ops/test/fixtures/ai-visibility/providers-v1.json
```

Current provider proof and marketing-stage receipts may be attached only to an
existing canonical mission through the bounded commands documented in
`foundry/ops/docs/founder-control.md`. Raw logs, traces, prompts, credentials,
and provider payloads remain outside the ledger. Recurring AI visibility and
notification schedules remain inert until the designated host and explicit
activation gates pass.

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
maintained source is already present under `foundry/apps/`,
`foundry/services/`, `foundry/packages/`, and `foundry/tools/`;
`foundry/ops/` contains shared operations only.

```bash
gh auth status
wrangler whoami
gh repo clone sass-maker/fleet-workspace fleet
cd fleet
./foundry/ops/scripts/agent-stack.sh install-skills
cd fleet

while read -r repo directory; do
  test -d "$directory/.git" || gh repo clone "$repo" "$directory"
done <<'REPOS'
Significant-Hobbies/anime-list anime-list
Significant-Hobbies/chess chess
Codevetter/codevetter codevetter
sarthakagrawal927/app-health app-health
sass-maker/email-manager email-manager
sass-maker/free-ai free-ai
High-Signal-App/high-signal high-signal
Significant-Hobbies/karte karte
sass-maker/knowledge-base knowledge-base
Significant-Hobbies/looptv looptv
sarthakagrawal927/motion motion
HeyPace/pace pace
PostTrainLLM/posttrainllm posttrainllm
Significant-Hobbies/reader reader
High-Signal-App/research-papers research-papers
sass-maker/rolepatch rolepatch
Significant-Hobbies/significanthobbies significanthobbies
Codevetter/starboard starboard
Significant-Hobbies/swe-interview-prep swe-interview-prep
REPOS

./foundry/ops/scripts/agent-stack.sh install-skills
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
bash foundry/ops/scripts/fleet-health.sh --no-fetch
bash foundry/ops/scripts/deploy-health.sh
```

Cloudflare Pages showing `Git Provider: No` is expected for direct-upload
projects. Do not connect them to GitHub in Cloudflare: the guarded deploy
workflow and its recorded Git commit provide repository provenance without
turning `main` into an automatic production deploy.

## Daily Fleet Checks

Check child repository cleanliness:

```bash
cd /path/to/fleet
bash foundry/ops/scripts/fleet-health.sh
```

Check GitHub Actions and Cloudflare deployment health:

```bash
bash foundry/ops/scripts/deploy-health.sh
```

The deploy health script is read-only. It checks GitHub Actions for immediate
child repositories and checks Cloudflare deployments listed in
`foundry/ops/config/projects.json`. Pages deployments can usually be compared
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

The active production fleet is listed in `foundry/ops/config/projects.json`.

| Project | Purpose | Local run | Verify before push | Deploy |
| --- | --- | --- | --- | --- |
| `anime-list` | MAL Explorer for anime/manga discovery and watchlists | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm pages:build` | `pnpm deploy` |
| `app-health` | Independent application-health ingestion and evidence product | see project README | see project README / CI | see project README / CI |
| `codevetter` | Desktop-first AI code review platform | see project README | see project README / CI | see project README / CI |
| `drank` | Domain rating tracker | `cd foundry/services/drank && pnpm dev` | root `Drank CI` | `cd foundry/services/drank && pnpm deploy` |
| `email-manager` | Gmail/email triage and automation | `pnpm dev` | `pnpm lint`, `pnpm cf:build` | `pnpm deploy` |
| `everythingrated` | Multi-axis ratings for High Signal directories | `pnpm dev` | see project README / CI | project workflows |
| `free-ai` | OpenAI-compatible gateway for free LLM providers | `pnpm dev` | `pnpm check`, `pnpm test:e2e` when relevant | `pnpm deploy` |
| `high-signal` | Signal intelligence and collections | `pnpm dev` | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` | project workflows |
| `karte` | AI-enhanced public profiles and chat/contact analytics | `pnpm dev` | `pnpm lint`, `pnpm build`, `pnpm cf:build` | `pnpm deploy:cf` |
| `knowledge-base` | Private Agent Search over project corpora | see project README | see project README / CI | see project README / CI |
| `looptv` | Lean-back YouTube station player | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm build` | `pnpm deploy` |
| `motion` | Native motion/productivity client | see project README | see project README / CI | see project README / CI |
| `pace` | Local macOS voice agent | see project README | see project README / CI | see project README / CI |
| `posttrainllm` | Local LLM factory/runtime | see project README | see project README / CI | see project README / CI |
| `reader` | Article/PDF reader, annotation, and research workspace | `pnpm dev` | `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm cf:build` | `pnpm deploy` |
| `reel-pipeline` | AI short-form video generation pipeline | `cd foundry/services/reel-pipeline && npm run dev` | root `Reel Pipeline CI` | `cd foundry/services/reel-pipeline && npm run deploy` |
| `research-papers` | Academic paper platform and search asset | see project README | see project README / CI | see project README / CI |
| `rolepatch` | RolePatch resume tailoring and interview prep | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm cf:build` | `pnpm deploy` |
| `Fleet public directory` | Static SaaS Maker product directory maintained at `foundry/apps/public-directory/` | `npm --prefix foundry/apps/public-directory run dev` | `npm run check:public` | guarded Fleet workflow |
| `significanthobbies` | Hobby journeys and discovery | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm cf:build` | `pnpm deploy` |
| `starboard` | GitHub stars organization and stack discovery | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm cf:build` | `pnpm deploy:cf` |
| `swe-interview-prep` | Interview Coder prep app | `pnpm dev` | `pnpm lint`, `pnpm test`, `pnpm build` | `pnpm deploy` |

## Local-Only Or Non-Fleet Repositories

These are not part of the active production fleet and should be excluded from
fresh-machine clones and fleet-wide sweeps unless explicitly reactivated:

- `aliveville` / `ai-game`
- `companion-robot`
- `elves-hq`
- `everythingrated`
- `forecast-lab`
- `materia`
- `open-historia`
- `protein-index`
- `saas-ideas`
- `personalsite`: removed from the active fleet. Do not create new Fleet tasks
  for it unless it is explicitly re-added.
- `today-little-log`
- `truehire`
- `web-playables`

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
- Project `PROJECT_STATUS.md`: durable current/shipped product truth.
- Project GitHub Issues: all open, deferred, and blocked work.
