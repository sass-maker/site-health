# Design

## Canonical contract

Add `fleet-ops/config/spotlight-products.json` as the durable, reviewable
contract. It is intentionally small and static so it can be consumed by shell,
Node, Markdown generation, and independent Astro repositories without a shared
runtime dependency.

Each item has:

- `id`
- `name`
- `url`
- `organizationUrl`
- `repositoryUrl`
- `description`

## Surface strategy

- Portfolio: replace the broad primary taxonomy on the homepage with the four
  products plus SaaS Maker; keep `/projects` as the full archive and add a clear
  SaaS Maker directory handoff.
- SaaS Maker: keep the full `foundry.projects.json` directory, but mark the five
  spotlight entries consistently and make the public showcase explain the
  spotlight-versus-directory relationship.
- GitHub profiles: retain each organization's own product identity, add the
  canonical product URL, and add a short SaaS Maker directory link.
- Personal README: preserve the existing five-item `Start here` model and
  replace wording that implies every organization is a general portfolio.

## Synchronization

Keep the contract in `fleet-ops/config/spotlight-products.json` and the target
repository/file map in `fleet-ops/config/spotlight-sync.json`. The
`sync-spotlight-products.mjs` tool has two modes:

- `--write` regenerates the machine-owned portfolio TypeScript and spotlight
  flags in the SaaS Maker foundry/showcase registries.
- `--check` validates those consumers plus the personal and organization profile
  README links. `--strict` turns unavailable checked-out profile repositories
  into failures.

The fleet root runs the check on relevant pull requests, pushes to `main`, and
on a daily schedule. The workflow checks out the public consumer repositories
and profile repositories, so a stale remote README or catalog fails with the
specific target name. Product application deployments remain independent; this
workflow guards metadata and public directory sync rather than creating a
second deployment pipeline.

No production dependency or runtime service is needed.

## Deployment tracking

The Knowledgebase landing remains a separate Git-connected Cloudflare Pages
project named `knowledgebase-landing`, built from `sass-maker/knowledge-base`
with `pnpm build` from `landing-astro/` and served at
`knowledgebase.sassmaker.com`. The existing app remains at
`search.sassmaker.com`.
