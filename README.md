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
- `apps/backend/` — evidence adapters, API, storage,
  metric runners, and the internal AI Visibility engine.

Drank and PSI Swarm remain independent repositories. The backend reads or
invokes them through explicit adapters. Reusable GitHub Actions remain in the
independent `sass-maker/workflows-and-skills` repository, which also preserves
Fleet-owned scripts and agent skills.

## Commands

```bash
pnpm run build
pnpm run test
pnpm run check
pnpm run backend
```

The repository preserves the historical Fleet Workspace Git history, but owns
only Site Health. The Fleet directory itself is an unversioned container for
independent project repositories.
