# Site Health — PROJECT STATUS

## Why / What

Site Health is the private owner view for projects, domain strength, web
performance, Google Search, and AI awareness. It is one product with one local
backend.

## Dependencies

- Drank provides domain-rating evidence.
- PSI Swarm provides web-performance evidence.
- Google Search Console provides search evidence.
- Configured model providers supply bounded AI Visibility observations.
- `sass-maker/workflows-and-skills` owns reusable GitHub Actions, Fleet-owned
  scripts, and agent skills.

## Timeline

- **2026-08-21:** Extracted Site Health into its own repository while
  preserving the historical Fleet Workspace Git history. Simplified the
  repository layout to `apps/web` and `apps/backend`; the Fleet directory is
  no longer the product repository.
- **2026-08-21:** Reduced the historical Fleet Workspace repository to the
  Dashboard web app, Dashboard backend, internal AI Visibility engine, and
  required catalog/evidence contracts. Fleet operations, skills, marketing,
  templates, historical design evidence, and the Workflows submodule were
  removed from the product repository; scripts and skills were preserved in
  `sass-maker/workflows-and-skills`.

## Products

| Product | Surface | Purpose |
| --- | --- | --- |
| Site Health | `apps/web/` | Private owner-facing UI |
| Site Health backend | `apps/backend/` | Internal implementation supporting Site Health |

## Features (shipped)

- Projects directory and project detail pages.
- DRANK/domain-strength view.
- PSI and field-performance view.
- Google Search evidence view.
- GEO/AI-awareness view with a private provider-independent analysis engine.

## Work queue

[GitHub Issues](https://github.com/sass-maker/site-health/issues)
