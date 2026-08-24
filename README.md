# Site Health

Private portfolio health dashboard for answering five owner questions:

1. Which projects exist and what state are they in?
2. How strong are their domains?
3. How fast are their public sites?
4. How are they performing in Google Search?
5. Are they visible in AI answers?

This repository contains one product and its backend:

- `apps/web/` — Astro UI.
- `apps/backend/config/projects.json` — canonical private project and
  infrastructure catalog.
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

Run `docs:projects:refresh` from the complete Fleet workspace after a project's
repository, material tooling, GitHub Actions, domains, deployment targets, or
provider resources change. It refreshes repository evidence and live Actions
health. Every Cloudflare object must remain attributed to a canonical project
or an explicit shared operational steward.

The repository preserves the historical Fleet Workspace Git history, but owns
only Site Health. The Fleet directory itself is an unversioned container for
independent project repositories.
