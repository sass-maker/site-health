# Reel Pipeline

> Canonical source: `foundry/marketing/reel-pipeline/` in
> [`sass-maker/fleet-workspace`](https://github.com/sass-maker/fleet-workspace).
> The former standalone repository is historical only; the product itself has
> a standalone boundary while its canonical source remains in the Fleet
> monorepo.

A local-first video-creation product. Its primary loop is request → inspectable
workflow → explicit generation → playable result → reusable history. It also
turns owned or licensed source archives, approved podcast edits, and
source-backed briefs into reviewable vertical-video artifacts and receipts.

Reel Pipeline owns provider-neutral distribution contracts and Fleet's native
YouTube and Instagram publishing adapters. Credentials remain outside the
repository and are referenced only by environment-variable name. The agent
can package, schedule, or publish only for a channel listed in the local policy
manifest as `draft_only`, `approval_required`, or `autonomous`.

## Start here

- [`STATUS.md`](STATUS.md) — short operational view.
- [`PROJECT_STATUS.md`](PROJECT_STATUS.md) — durable scope, dependencies, and
  remaining work.
- [`docs/index.md`](docs/index.md) — documentation map.
- [`AGENTS.md`](AGENTS.md) — repository rules and verification commands.

## Quick start

```bash
gh repo clone sass-maker/fleet-workspace fleet
cd fleet/foundry/marketing/reel-pipeline
npm ci
npm test
npm run dev
```

Agent automation begins with `npm run agent` and a `manifest` request using
`fleet.video-agent-operation.v1`. The manifest is generated from the live
recipe and execution registries, so an agent can discover exact required
inputs and fail closed instead of navigating the browser UI.

Useful checks:

```bash
npm run smoke:render-modes
node --test test/reel-agent.test.js test/internal-publisher.test.js
npm run ready:local
npm run docs:validate
```

## Boundary

```text
owned/licensed source archive or approved source package
        ↓
Reel Pipeline: plan/edit → validate → render → review artifact → media receipt
        ↓
Fleet publisher → configured YouTube/Instagram channel → provider receipt
```

Podcast/archive editorial work belongs to the independent
[`Mashup`](../../helpers/mashup/) helper. Reel Pipeline never imports or starts
that runtime; it can only inspect a finished artifact through a verified
`fleet.mashup-media-receipt.v1` handoff.

The production Worker/R2 render flow remains:

```text
Cloudflare Worker + R2 → Rust watcher → render-pro.js → R2 → Worker receipt
```

For approved-keyframe LTX-2.3 shots, Local Video Forge adds a shared
Worker/R2 task queue: a task can be created on either machine, while the Apple
Silicon Mac pulls and renders it. See the
[`Local Video Forge runbook`](docs/operations/runbooks/local-video-forge.md).
The hosted Worker exposes an authenticated `/forge` operator console for
prompting a task, choosing a repeatable **Film style**, approving asset rights,
reviewing variants, and queueing the selected final. The
`guided-app-demo@1` style can record a real app/window/tab and an optional
same-session camera-and-microphone presenter; the Apple Silicon Mac encodes the
approved take into preview and final MP4s.

The local control API also exposes the anonymous brand-reel, review, and studio
surfaces. These are generation tools, not social publishing surfaces.

## Documentation policy

Committed Markdown is the source of truth; Blume only renders it. Executable
configuration is authoritative for commands and readiness checks. Run
`npm run docs:validate` after documentation changes.
