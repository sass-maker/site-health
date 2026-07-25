## Context

CodeVetter has two operational classes: an Astro landing page on Cloudflare and
a local Tauri 2 application with React/TypeScript, Rust, SQLite, user-supplied
LLM keys, GitHub Releases/updater, benchmarks and a scheduled canary. Central
web analytics cannot prove desktop activation, while desktop telemetry must not
capture reviewed code or repositories.

## Goals / Non-Goals

**Goals:** prove landing/release health, privacy-safe activation, updater/crash
visibility, scheduled freshness and evidence-backed release readiness.

**Non-Goals:** server-side review, raw-code telemetry, a new analytics vendor,
feature work, automatic release or changing review behavior.

## Decisions

- Use existing Cloudflare/GitHub evidence for landing and releases.
- Define desktop events as aggregate lifecycle counters/receipts: install/update
  success, first completed review, local failure class and return usage. Never
  include file paths, diffs, prompts, findings, API keys or repository identity.
- Treat CI, `tsc --noEmit`, Rust checks, unit/e2e, updater manifest validation,
  release artifact checks and weekly-canary freshness as separate contracts.
- Keep local SQLite authoritative for private product history; Foundry receives
  sanitized aggregate/status evidence only when explicitly supported.
- Prepare PRs and release evidence automatically; production release remains
  explicit.

## Risks / Trade-offs

- **Desktop activation is invisible centrally** → Prefer opt-in aggregate receipt
  or explicit not-applicable over invasive tracking.
- **Release appears green but updater is broken** → Validate signed artifacts
  and `latest.json` linkage separately.
- **Large existing test surface slows maintenance** → Run smallest required
  checks on PRs and preserve deeper release gates.
