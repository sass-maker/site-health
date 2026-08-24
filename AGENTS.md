# Site Health Agent Instructions

This repository contains one product: Site Health and its backend.

## Product boundary

- The five product areas are Projects, Domains, Performance, Google Search,
  and AI Awareness.
- Keep the UI under `apps/web/`.
- Keep its backend, catalog, evidence adapters, storage, and internal AI engine
  under `apps/backend/`.
- Drank and PSI Swarm are independent repositories. Fleet-owned reusable workflows,
  skills, and operator scripts live under `saas-maker/tooling/`.
- `docs/portfolio-owner-narratives-2026-08-22.md` is the verbatim owner archive;
  never delete, condense, or rewrite it. `docs/portfolio-condensed-2026-08-23.md`
  is the separate derived 54-project decision view.
- `docs/project-dossiers/<project-id>.yaml` is the generated private operational
  record for each canonical project. Its verification block and `ownerVoice`
  must remain at the top, and verbatim owner fields must never be paraphrased.
  Refresh all dossiers with `pnpm docs:projects:refresh` from the Fleet workspace
  and verify them with `pnpm docs:projects:check`.
- Before changing or reasoning about a project's domains, deployment targets,
  provider resources, GitHub Actions, repository location, or material tooling,
  read its YAML dossier and then verify drift-prone facts in the owning
  checkout or provider. Update the catalog and refresh the dossier in the same
  task when any of those facts change.
- Every Cloudflare deployment and resource must be attributed to a canonical
  project or an explicit shared operational steward. Never add an unattributed
  Cloudflare item; unknown runtime consumption remains explicit in its state
  and attribution reason.
- Do not add Fleet-wide skills, marketing, media, mobile, feedback, generic
  workflows, or unrelated portfolio tooling here.

## Working rules

- Preserve unrelated dirty work.
- Do not touch secrets, credentials, environment files, or production config.
- Do not deploy, migrate, or release without explicit approval.
- Prefer small diffs and existing scripts.
- Run `pnpm run check` before handoff when the complete dependency toolchain is
  available; otherwise run the smallest affected command and report omissions.
