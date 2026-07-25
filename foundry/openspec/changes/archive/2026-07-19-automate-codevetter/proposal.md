## Why

CodeVetter is one of four personally directed commercial products and combines
a Cloudflare-hosted landing site with a privacy-sensitive local Tauri desktop
application and GitHub release pipeline. It needs enough evidence to remain
releasable and diagnosable without turning local code, repositories, prompts,
or user API keys into centralized telemetry.

## What Changes

- Inventory landing, desktop, Rust backend, SQLite, MCP/agent, benchmark,
  updater, weekly canary, docs, and release surfaces.
- Define a privacy-safe product funnel covering acquisition, download intent,
  successful installation/update, first meaningful review, and meaningful
  return without transmitting reviewed code or repository content.
- Verify build, typecheck, Rust, release, updater, crash/error, landing deploy,
  weekly job, and source-revision evidence.
- Add only critical missing instrumentation or automation using existing
  GitHub, Cloudflare, Tauri, local aggregate, and Foundry facilities.
- Connect sanitized coverage and release receipts to Foundry while leaving
  product direction and production release approval with Sarthak.

## Capabilities

### New Capabilities

- `codevetter-automation-readiness`: Runtime-specific product, release,
  reliability, privacy, and Foundry evidence contracts for CodeVetter.

### Modified Capabilities

None.

## Impact

- Primary repository: `Codevetter/codevetter`.
- Relevant surfaces: `apps/desktop`, Rust/Tauri backend, Astro landing,
  GitHub Releases/updater, benchmarks, docs and scheduled canary.
- No new analytics vendor, server-side review pipeline, automatic production
  release, user-code collection, credential handling, or product feature work.
