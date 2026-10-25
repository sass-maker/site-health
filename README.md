# Site Health

Private portfolio health dashboard for answering five owner questions:

1. Which projects exist and what state are they in?
2. How strong are their domains?
3. How fast are their public sites?
4. How are they performing in Google Search?
5. Are they visible in AI answers?

This repository contains one product and its backend:

- `apps/web/` — Astro UI.
- `../saas-maker/catalog/projects.json` — the single editable owner-local project,
  repository classification and infrastructure catalog. The local
  `apps/backend/config/projects.json` path links to the generated private
  `catalog/generated/operations.json` compatibility view. Never edit that output.
- `docs/project-dossiers/` — one verified private YAML dossier per project,
  beginning with provenance and the owner's verbatim why, followed by decisions,
  its reviewed public maker note, repositories, tooling, live GitHub Actions
  health, domains, deployments, and attributed provider resources.
- `docs/portfolio-owner-narratives-2026-08-22.md` — preserved verbatim owner
  review source; never replaced by derived project summaries.
- `apps/backend/` — evidence adapters, API, storage,
  metric runners, and the internal AI Visibility engine.

Drank and PSI Swarm remain independent repositories. The backend reads or
invokes them through explicit adapters. Reusable GitHub Actions, Fleet-owned
scripts, and agent skills live under `sass-maker/saas-maker/tooling`.

## Native brand awareness

Open `http://127.0.0.1:4321/ai-awareness`, select a project and paste its public
HTTPS website. Site Health reads the page, identifies relevant subreddits,
retrieves discussion context, and saves editable post and comment drafts with
source links. Drafts stay private; posting is manual. Current community rules
and thread availability must be reviewed before posting. Dated public Reddit
Insights captures retain their timestamp, revision and sampled coverage; missing
or expired sources remain unavailable rather than zero mentions.

The same area configures brand aliases, competitors, keywords, communities,
buyer prompts and daily/weekly cadence. API model answers, consumer-assistant
captures and community findings remain separate. Schedules run while the local
backend is running. Imported MentionPilot evidence and review states are retained.

The collection engine is the public `@saas-maker/collect` package from SaaS Maker;
`vendor/README.md` records the reproducible source revision and packed artifact.
AI requests use the AI SDK with free-ai model `auto` and project `site-health`.
The backend reuses `AI_GATEWAY_API_KEY` / `GATEWAY_API_KEY`, or retrieves only
`Free_ai` from the existing Fleet Infisical Development root into process memory.
The local Infisical login must already be available; no key is saved in the app,
LaunchAgent, source or logs.

`pnpm dashboard` starts the owner app from the authorized terminal. Background
startup uses a signed native Site Health app so macOS can attribute Desktop
folder access to this app. The canonical catalog stays at its existing symlink.
Prepare from the reviewed source and keep that checkout available at the same
path while the service runs.

```bash
pnpm owner:service prepare 'Developer ID Application: YOUR IDENTITY'
pnpm owner:service permission
# Stop the manual dashboard only when ready to switch.
pnpm owner:service install
```

`prepare` compiles and signs an app under `.fleet-local/owner-host`, records its
source revision and host-source digest, and prepares the LaunchAgent plist.
`permission` stages it at `~/Applications/Fleet/Site Health.app` and opens a
standard native consent window. Continue requests macOS Desktop folder access
for Site Health. This grants access to the Desktop folder, including the Fleet
catalog and evidence there. Do not grant Full Disk Access to Node. This step
starts no services. An existing staged app is backed up before replacement.

Before activation, run `pnpm test:owner:native` through the managed workspace.
It compiles a temporary Swift host and exercises native signal forwarding,
catalog failure, and the actual foreground Astro server. It requests no macOS
permissions and starts no owner service.

`install` requires both service ports to be free, retains the previous plist,
and starts the native host through launchd. It confirms the host is running and
both backend and dashboard are ready; a failed activation is stopped and
disabled. `status` and `stop` inspect or stop the agent. Logs and retained
recovery plists live under `~/Library/Logs/Fleet/Site Health` and
`~/Library/LaunchAgents` respectively. `pnpm dashboard` remains the manual
recovery path. Only the host's own child processes are stopped; reused services
remain owned by their original launcher.
Managed checkouts can set `SITE_HEALTH_OWNER_REPOSITORY` to the canonical owner
checkout so private databases, generated policy and sibling collectors retain
their normal home. `pnpm brand --help` exposes the project-scoped CLI.

## Commands

```bash
pnpm run build
pnpm run test
pnpm run check
pnpm run backend
pnpm run docs:projects:refresh
pnpm run docs:projects:refresh-local
pnpm run docs:projects:check
```

Managed workspace builds can set `SITE_HEALTH_CATALOG_PATH` to the absolute
path of the owner-local generated operations catalog when the adjacent SaaS
Maker checkout is outside the managed workspace. Normal local builds keep
using `apps/backend/config/projects.json`.

Run `docs:projects:refresh` from the complete Fleet workspace after a project's
repository, material tooling, GitHub Actions, domains, deployment targets, or
provider resources change. It refreshes repository evidence and live Actions
health. Every Cloudflare object must remain attributed to a canonical project
or an explicit shared operational steward.

Edit classifications in SaaS Maker's `catalog/projects.json` only. The original
82-repository review is `repositoryReview.repositories` in that same file; rows
linked to products inherit their classifications. Generate the full table with
`pnpm catalog:sync` in SaaS Maker; this also refreshes the compatibility view. Historical review documents and dossiers are
read-only evidence/views, not independent decision stores. The raw catalog is
gitignored in SaaS Maker and required locally; only its filtered public export
is intended for public repositories and sites.

The repository preserves the historical Fleet Workspace Git history, but owns
only Site Health. The Fleet directory itself is an unversioned container for
independent project repositories.

<!-- portfolio-retained-work:2026-09-07 -->
## Retained work from the portfolio review

These are unresolved requirements retained at the owner’s request. They are not completed features. Work should follow a concrete need and fresh evidence.

### Portfolio lifecycle cleanup: three-field model (2 primary, 19 active, 36 inactive)

Finish live shareability verification, lifecycle consumers, public projections, task retirement, Git cleanup and deployment/CI receipts. Local catalog changes alone do not complete the rollout.

Original requirements and discussion: [#491](https://github.com/sass-maker/site-health/issues/491).

### Adopt Microsoft Clarity capabilities across Fleet site health

Distinguish Clarity source wiring, provider settings and measured traffic; preserve unavailable states and privacy.

Original requirements and discussion: [#485](https://github.com/sass-maker/site-health/issues/485).
