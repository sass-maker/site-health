---
title: Testing
description: The current test and quality checks.
---

# Testing

## Current state

- The root `package.json` has no `test` or `lint` script.
- The `cli` package has a narrow Node test suite for the external trace-insight
  adapter boundary. Run it with `pnpm --filter psi-swarm test`.
- The `web` package has no test script; its build is `astro build`.
- `.github/workflows/psi-swarm-ci.yml` runs the CLI suite, CLI/web builds, and
  docs checks for helper pull requests and pushes to `main`. See
  [operations → deploy](../operations/deploy.md).

## What stands in for tests

- **Type-check by build.** `pnpm run build:cli` and `pnpm run build:web`
  catch type regressions.
- **Docs validation.** `pnpm docs:check` validates frontmatter and internal
  links (see [workflow](./workflow.md)).
- **Smoke checks in deploy CI.** The deploy workflow curls `/` and
  `/projects/` against the production URL after a Pages deploy.
- **Trace regression fixtures.** The external adapter suite is correlated to
  controlled Chrome DevTools MCP traces; see
  [external trace-insight validation](./trace-insight-validation.md).
- **Manual runs.** Broader measurement correctness is still validated by
  running swarms against known URLs and reading the percentile tables.

## Remaining gap

Most of the codebase still has no automated coverage. Core math (percentile
interpolation in `cli/src/stats.ts`, preset resolution in `cli/src/presets.ts`)
is the next highest-value unit-test surface.

## If you add tests

- Put a `test` script on the package that owns the code (`cli` or `web`),
  not the root.
- Prefer `node --test` (built-in, no dependency) for the CLI's pure
  functions (`stats.ts`, `presets.ts`, `watchlist.ts` queue sort).
- Add a `ci.yml` workflow that runs the suite on push — note that
  `scripts/manual-deploy.mjs` already references `ci.yml` as the
  green-gate, but **no `ci.yml` exists yet** (see
  [operations → deploy](../operations/deploy.md#path-scoped-ci-and-deploy-gate)).
