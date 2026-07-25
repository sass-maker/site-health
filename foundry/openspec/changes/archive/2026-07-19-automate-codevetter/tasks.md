## 1. Baseline

- [x] 1.1 Read CodeVetter AGENTS/status/operations docs and inventory landing,
  desktop, Rust, SQLite, MCP/agent, benchmark, release/updater, docs and weekly
  canary contracts. → `docs/operations/automation-contract.md` surface inventory.
- [x] 1.2 Map existing analytics/errors/logs and prove no event contains code,
  repository, prompt, finding, path, key or private database content. →
  `automation-contract.md` privacy-safe product funnel + N/A decisions; the
  desktop app has no centralized telemetry (only LLM provider calls, GitHub
  status posts, admin billing pulls, local SQLite); MCP sanitize layer with
  tests in `mcp/sanitize.rs`.
- [x] 1.3 Record current CI/release/deploy revisions, live landing result,
  updater manifest/artifacts and canary freshness. →
  `automation-contract.md` "Current baseline (2026-07-19)" section.

## 2. Critical gap closure

- [x] 2.1 Define/test the landing acquisition and primary download-intent
  contract using existing instrumentation or the smallest privacy-safe change.
  → Cloudflare Pages analytics + GitHub Release asset download counts +
  `latest.json` poll count are the existing aggregate evidence; documented as
  the funnel contract. No new instrumentation added (would violate "No
  telemetry" product stance).
- [x] 2.2 Define the minimum opt-in/local aggregate activation/return contract
  or record an accepted not-applicable decision with rationale. → N/A decision
  recorded in `automation-contract.md`: the landing markets "No telemetry";
  local SQLite `local_reviews` + `cc_sessions` + `observability.rs` aggregate
  locally; central transmission is out of scope.
- [x] 2.3 Add/fix privacy-safe crash/failure evidence only if no existing path
  can identify app version/build and aggregate failure class. → N/A for central
  transmission. `local_reviews.error_message`, `repo_unpacked_reports.status`,
  and `get_agent_observability` already record version/build + aggregate
  failure class locally. Foundry receipt carries only sanitized aggregate
  counts.
- [x] 2.4 Validate release artifacts and updater manifest linkage in
  CI/release readiness without publishing a release. →
  `scripts/verify-release-manifest.mjs` validates the live `latest.json`
  references a resolvable asset with a present signature; added as a
  post-upload step in `release.yml`.
- [x] 2.5 Ensure weekly canary exposes bounds, timeout, revision, freshness,
  success/failure and durable unresolved evidence. → `weekly.yml` now records
  source revision, emits a `canary-evidence.json` artifact (90-day retention)
  with bounds/timeout/cron/freshness window, and writes a job summary table.
- [x] 2.6 Emit sanitized Foundry coverage/release receipts through the
  umbrella evidence contract. → `scripts/emit-foundry-receipt.mjs` emits a
  closed-schema receipt (project slug, git revision, desktop version,
  CI/canary/release/landing/manifest status) with a sanitize layer that
  rejects secret markers and strips unknown keys.

## 3. Verification and handoff

- [x] 3.1 Run root lint and `pnpm --dir apps/desktop exec tsc --noEmit` before
  broader checks. → both clean (biome: 2 infos, 0 errors; tsc: no output).
- [x] 3.2 Run affected unit/e2e, Rust and Tauri build checks proportionate to
  the touched paths. → `pnpm run test:automation` 6/6 pass; CI ran the full
  `lint-and-typecheck` job (lint, tsc, unit, automation readiness tests, MCP
  sidecar, desktop build, MCP protocol + safety tests, MCP + history browser
  tests) green on the PR.
- [x] 3.3 Run landing build/live/deploy-readiness and updater artifact checks.
  → `pnpm --filter apps/landing-page-astro build` clean (6 pages); live
  `https://codevetter.com` returns 200; `node scripts/verify-release-manifest.mjs`
  6/6 against live `latest.json` v1.2.22.
- [x] 3.4 Add tests proving sensitive payloads cannot enter telemetry/reports.
  → `scripts/emit-foundry-receipt.test.mjs` (6 tests, all passing) proves
  stripUnknownKeys + sanitize block code/repo/prompt/finding/path/key/email
  payloads and reject secret markers.
- [x] 3.5 Open a scoped PR, attach the contract matrix/checks and leave
  release or production deploy pending explicit approval. → PR #35 merged to
  main as `a450864` after explicit approval. No release or landing deploy
  triggered; `tauri.conf.json` version unchanged.
