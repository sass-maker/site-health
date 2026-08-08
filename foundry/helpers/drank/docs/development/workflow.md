# Development workflow

## Prerequisites

- Node.js 22+ (CI uses 22; local 24 also works).
- pnpm 10+ (the repo pins `pnpm@10.33.2` via `packageManager`).

## Setup

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server → http://localhost:3000 |
| `pnpm build` | Production build (`next build --webpack` → `out/`) |
| `pnpm start` | Production server (rarely used; we deploy static `out/`) |
| `pnpm lint` | Biome check (`biome check .`) |
| `pnpm check` | Same as `lint` |
| `pnpm format` | Biome format --write |
| `pnpm format:check` | Biome format (check only) |
| `pnpm size` | size-limit on `out/` bundles |
| `pnpm test:coverage` | Vitest with v8 coverage |
| `pnpm deploy` | Build + `wrangler pages deploy out --project-name=drank` |
| `pnpm docs:check` | Docs link check + Blume build (see below) |
| `pnpm docs:build` | Blume build → `docs-site/dist/` |

> Tests: there is no bare `pnpm test` script. Run vitest directly:
> `pnpm vitest run` (or `pnpm vitest` for watch).

## Testing

- Vitest is configured (`vitest.config.ts`) with v8 coverage and thresholds
  (lines 20%, functions 25%).
- Existing tests: `lib/utils.test.ts`, `lib/dr-advisor.test.ts`,
  `functions/api/advisor.test.ts`.
- Coverage is intentionally light; manual smoke covers add / refresh /
  export flows. When adding logic with parseable contracts (like the
  advisor), add focused unit tests.

## Lint / format

- Biome (`biome.json`) remains the only linter + formatter. The project extends
  the pinned Ultracite React, Next.js, and Vitest presets plus Fleet's shared
  `foundry/ops/templates/biome.base.json` layer.
- The shared Fleet layer keeps single quotes, semicolons, 2-space indentation,
  100-column lines, es5 trailing commas, and the deliberate `a11y`,
  `noExplicitAny`, `useExhaustiveDependencies`, `noImgElement`, and
  `organizeImports` exceptions.
- `public/` and common build/generated directories are force-ignored; unknown
  file types such as SVG are ignored by Biome.
- Generated generic lint guidance lives in `ULTRACITE.md`. Run
  `pnpm generate:lint-context` or `pnpm check:lint-context` from the Fleet
  Workspace root; the nearest `AGENTS.md` remains authoritative.

## Build

- `next build --webpack` (the `--webpack` flag is required because the
  default Turbopack build had a CSS path issue with static export; see
  commit `172daa9`).
- Output is fully static (`output: 'export'`) into `out/`.
- size-limit checks JS ≤ 500 KB gzip and CSS ≤ 50 KB gzip (`.size-limit.json`).

## Type checking

- `tsconfig.json` is strict. There is no dedicated `typecheck` script; the
  production build runs `tsc` as part of `next build`.

## Pre-commit checklist

1. `pnpm lint` passes.
2. `pnpm build` passes (catches type errors + static-export issues).
3. `pnpm size` passes (bundle within limits).
4. `pnpm vitest run` passes (if you touched tested code).
5. `pnpm docs:check` passes (if you touched `docs/` or root `*.md`).

## CI

`.github/workflows/ci.yml` runs on push to `main`/`master` and on PRs:

- `test` job: install, lint, build, size (`pnpm run size`).
- `deploy` job (push to `main` only, `needs: test`): install, build, then
  `npx wrangler pages deploy out` using `CLOUDFLARE_API_TOKEN` from repo
  secrets. See the [deploy runbook](../operations/runbooks/deploy.md).
- `docs` job: `scripts/check_docs_links.py` (internal-link check) + Blume
  build in `docs-site/` — the same gate as `pnpm docs:check`.

## Secrets

None required for local dev. The only secrets are server-side Cloudflare
Pages environment variables for the advisor gateway (see
[the advisor gateway runbook](../operations/runbooks/advisor-gateway.md)).
Never commit secrets or `.env*` (already gitignored).
