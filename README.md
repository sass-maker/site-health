<p align="center">
  <img src="assets/logo.svg" alt="sarthak-fleet" width="150"/>
</p>

<h1 align="center">Fleet</h1>

<p align="center"><em>One hub, many products — the sarthak-fleet workspace.</em></p>

This directory is the local workspace for the personal project fleet.

This root is its own lightweight repository for Fleet-wide policy and docs. Each
child project remains its own separate repository.

## Products

Projects are classified by purpose (a project can appear in more than one):
**support** · **personal** · **learning** · **saas** · **data** · **research**.
Some products have an **umbrella** relationship with a sub-product (separate repo,
worked on together as one effort).

**Support** — infrastructure serving other fleet projects

- [saas-maker](https://github.com/sarthak-fleet/saas-maker) — the Foundry: system-of-record, SDKs, widgets, CF API + cockpit ([sassmaker.com](https://sassmaker.com))
- [free-ai](https://github.com/sarthak-fleet/free-ai) — OpenAI-compatible LLM gateway fronting 30+ free-tier models across 8 providers
- [reel-pipeline](https://github.com/sarthak-fleet/reel-pipeline) — AI short-form video generation pipeline (feeds SaaS Maker marketing queue)
- [drank](https://github.com/sarthak-fleet/drank) — Ahrefs Domain Rating tracker (feeds High Signal /domains)

**Support + SaaS** — support infra that is also a public product

- [codevetter](https://github.com/sarthak-fleet/codevetter) — desktop AI code review ([codevetter.com](https://codevetter.com)) — **umbrella for code quality and repo intelligence**
  - [starboard](https://github.com/sarthak-fleet/starboard) — GitHub stars organizer + semantic search (sub-product of codevetter, separate repo)
- [knowledge-base](https://github.com/sarthak-fleet/knowledge-base) — Private Agent Search: cited search over project-scoped private corpora
- [high-signal](https://github.com/sarthak-fleet/high-signal) — daily synthesized intelligence brief ([highsignal.app](https://highsignal.app))

**Research** — experimental, the bet is a research question

- [ai-game](https://github.com/sarthak-fleet/ai-game) — 3D AI world simulator with NPC agents ([aliveville.com](https://aliveville.com)) — **umbrella for the AI-game research line**
  - [open-historia](https://github.com/sarthak-fleet/open-historia) — AI grand-strategy history game (sub-product of ai-game, separate repo)
- [pace](https://github.com/sarthak-fleet/pace) — on-device Mac voice agent that reads your screen
- [tinygpt](https://github.com/sarthak-fleet/tinygpt) — local LLM factory + runtime (Mac/MLX) + WebGPU playground

**Personal + free-tool** — built for personal use, free public tool

- [significanthobbies](https://github.com/sarthak-fleet/significanthobbies) — life planner: private daily rituals + public living (hobbies, bucket lists, side quests) ([significanthobbies.com](https://significanthobbies.com))
- [reader](https://github.com/sarthak-fleet/reader) — research library: capture, annotate, AI-chat
- [anime-list](https://github.com/sarthak-fleet/anime-list) — anime/manga discovery with multi-axis filtering + watchlists
- [swe-interview-prep](https://github.com/sarthak-fleet/swe-interview-prep) — SWE learning OS with FSRS spaced repetition
- [email-manager](https://github.com/sarthak-fleet/email-manager) — Gmail workspace with local semantic search
- [looptv](https://github.com/sarthak-fleet/looptv) — TV-style random video player
- [games](https://github.com/sarthak-fleet/games) — HTML5 games hub: gamekit framework + idle games, web-embeddable and YouTube Playables-ready

**Personal + SaaS** — personal-use thesis, public SaaS surface

- [rolepatch](https://github.com/sarthak-fleet/rolepatch) — AI resume tailoring + job-application assistant (cover letters, company research, role-fit scoring, STAR prep) ([rolepatch.com](https://rolepatch.com)) — **umbrella for the hiring line**
  - [truehire](https://github.com/sarthak-fleet/truehire) — verified-candidate GitHub scoring (sub-product of rolepatch, separate repo)
- [karte](https://github.com/sarthak-fleet/karte) — AI link-in-bio: chat, encyclopedia, roast modes ([karte.cc](https://karte.cc))

**Data** — the data is the asset, public surface is the product

- [everythingrated](https://github.com/sarthak-fleet/everythingrated) — multi-axis ratings platform (AI dev-tool adoption)
- [materia](https://github.com/sarthak-fleet/materia) — evidence-graded herbs/supplements/drugs by body part
- [research-papers](https://github.com/sarthak-fleet/research-papers) — academic paper platform (488k papers, semantic search)

> Personal/parked out-of-fleet repos live on [github.com/sarthakagrawal927](https://github.com/sarthakagrawal927) or locally: pinpoint, portfolio, local-ai, today-little-log (archived), verified-bases (archived), taste/ShipRank (retired into CodeVetter), companion-robot (delayed), forecast-lab (delayed), elves-hq (parked). psi-swarm code lives under `fleet-ops/psi-swarm/` as a fleet-ops skill + tool; the standalone `sarthak-fleet/psi-swarm` repo remains for history.

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
