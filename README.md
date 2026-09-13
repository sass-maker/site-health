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
