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
- `docs/portfolio-condensed-2026-08-23.md` is the compressed 56-project owner
  intent and decision view. Preserve the owner's decisions and meaning without
  retaining transcript wording.
- Do not add Fleet-wide skills, marketing, media, mobile, feedback, generic
  workflows, or unrelated portfolio tooling here.

## Working rules

- Preserve unrelated dirty work.
- Do not touch secrets, credentials, environment files, or production config.
- Do not deploy, migrate, or release without explicit approval.
- Prefer small diffs and existing scripts.
- Run `pnpm run check` before handoff when the complete dependency toolchain is
  available; otherwise run the smallest affected command and report omissions.
