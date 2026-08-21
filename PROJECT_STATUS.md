# Dashboard — PROJECT STATUS

## Why / What

Dashboard is the private owner view for projects, domain strength, web
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

- **2026-08-21:** Reduced the historical Fleet Workspace repository to the
  Dashboard web app, Dashboard backend, internal AI Visibility engine, and
  required catalog/evidence contracts. Fleet operations, skills, marketing,
  templates, historical design evidence, and the Workflows submodule were
  removed from the product repository; scripts and skills were preserved in
  `sass-maker/workflows-and-skills`.

## Products

| Product | Surface | Purpose |
| --- | --- | --- |
| Dashboard | `foundry/apps/dashboard/web/` | Private owner-facing UI |
| Dashboard backend | `foundry/apps/dashboard/backend/` | Internal implementation supporting Dashboard |

## Features (shipped)

- Projects directory and project detail pages.
- DRANK/domain-strength view.
- PSI and field-performance view.
- Google Search evidence view.
- GEO/AI-awareness view with a private provider-independent analysis engine.

## Work queue

[GitHub Issues](https://github.com/sass-maker/fleet-workspace/issues)
