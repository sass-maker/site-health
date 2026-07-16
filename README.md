<p align="center">
  <img src="assets/logo.svg" alt="Fleet" width="150"/>
</p>

<h1 align="center">Fleet</h1>

<p align="center"><em>One workspace, several focused product organizations.</em></p>

This directory is the local workspace for the personal project fleet.

This root is its own lightweight repository for Fleet-wide policy and docs. Each
child project remains its own separate repository.

## Products

Projects are classified by purpose (a project can appear in more than one):
**support** · **personal** · **learning** · **saas** · **data** · **research**.
Some products have an **umbrella** relationship with a sub-product (separate repo,
worked on together as one effort).

**Support** — infrastructure serving other fleet projects

- [saas-maker](https://github.com/sass-maker/saas-maker) — the Foundry: system-of-record, SDKs, widgets, CF API + cockpit ([sassmaker.com](https://sassmaker.com))
- [free-ai](https://github.com/sass-maker/free-ai) — OpenAI-compatible LLM gateway fronting 30+ free-tier models across 8 providers
- [reel-pipeline](https://github.com/sass-maker/reel-pipeline) — AI short-form video generation pipeline (feeds SaaS Maker marketing queue)
- [drank](https://github.com/High-Signal-App/drank) — Ahrefs Domain Rating tracker (feeds High Signal /domains)

**Support + SaaS** — support infra that is also a public product

- [codevetter](https://github.com/Codevetter/codevetter) — desktop AI code review ([codevetter.com](https://codevetter.com)) — **umbrella for code quality and repo intelligence**
  - [starboard](https://github.com/Codevetter/starboard) — GitHub stars organizer + semantic search (sub-product of codevetter, separate repo)
- [knowledge-base](https://github.com/sass-maker/knowledge-base) — Private Agent Search: cited search over project-scoped private corpora
- [high-signal](https://github.com/High-Signal-App/high-signal) — daily synthesized intelligence brief ([highsignal.app](https://highsignal.app))

**Research** — experimental, the bet is a research question

- [aliveville](https://github.com/sarthakagrawal927/aliveville) — 3D AI world simulator with NPC agents ([aliveville.com](https://aliveville.com))
- [pace](https://github.com/HeyPace/pace) — on-device Mac voice agent that reads your screen
- [posttrainllm](https://github.com/PostTrainLLM/posttrainllm) — local LLM factory + runtime (Mac/MLX) + WebGPU playground

**Personal + free-tool** — built for personal use, free public tool

- [significanthobbies](https://github.com/Significant-Hobbies/significanthobbies) — life planner: private daily rituals + public living (hobbies, bucket lists, side quests) ([significanthobbies.com](https://significanthobbies.com))
- [reader](https://github.com/Significant-Hobbies/reader) — research library: capture, annotate, AI-chat
- [anime-list](https://github.com/Significant-Hobbies/anime-list) — anime/manga discovery with multi-axis filtering + watchlists
- [swe-interview-prep](https://github.com/Significant-Hobbies/swe-interview-prep) — SWE learning OS with FSRS spaced repetition
- [email-manager](https://github.com/sarthakagrawal927/email-manager) — Gmail workspace with local semantic search
- [looptv](https://github.com/Significant-Hobbies/looptv) — TV-style random video player
- [mobile-dev-cockpit](https://github.com/sass-maker/mobile-dev-cockpit) — native iPhone cockpit for supervising coding agents, mobile previews, Git review, and guarded deploys over Tailscale

**Personal + SaaS** — personal-use thesis, public SaaS surface

- [rolepatch](https://github.com/sarthakagrawal927/rolepatch) — AI resume tailoring + job-application assistant (cover letters, company research, role-fit scoring, STAR prep) ([rolepatch.com](https://rolepatch.com))
- [karte](https://github.com/sarthakagrawal927/karte) — AI link-in-bio: chat, encyclopedia, roast modes ([karte.cc](https://karte.cc))

**Data** — the data is the asset, public surface is the product

- [research-papers](https://github.com/High-Signal-App/research-papers) — academic paper platform (488k papers, semantic search)
- [protein-index](https://github.com/sarthakagrawal927/protein-index) — normalized Indian protein-product intelligence with source-aware nutrition, offers, and ratings

> Personal/parked out-of-fleet repos live on [github.com/sarthakagrawal927](https://github.com/sarthakagrawal927) or locally: pinpoint, portfolio, local-ai, today-little-log (archived), verified-bases (archived), forecast-lab (delayed), and [web-playables](https://github.com/sarthakagrawal927/web-playables). Companion Robot now lives under `HeyPace`; Elves HQ and the standalone psi-swarm repository live under `sass-maker`.

## Work Tracking

Use Symphony tasks as the default place to capture work. A task can be an
investigation, a bug fix, a deploy check, cleanup, a code change, or a deferred
follow-up. It does not need to imply that code must change.

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
- Symphony tasks: operational source of truth for active and deferred work.
- Symphony memory: standing instructions for how agents should behave.

When a plan creates execution work, split that work into Symphony tasks. When
work is done, mark the task done and record evidence on the task instead of
creating another plan doc.

Agent-facing instructions live in the fleet-level `AGENTS.md`, which applies to
projects below this directory unless a project has a more specific `AGENTS.md`.

## Repository Boundary

The Fleet root repo tracks only workspace-level control files and shared
tooling. Its `.gitignore` ignores every child project (`/*`) and allowlists:

- `README.md`, `AGENTS.md`, `CLAUDE.md`, `LANDING_STANDARD.md`, `.gitignore`
- `assets/` — workspace logo + shared art
- `fleet-ops/` — all fleet tooling: scripts, skills, teammates, docs, templates, psi-swarm, retired-project archives

Child project directories are intentionally ignored here because they are
independent repositories with their own histories, branches, and deploy flows.
