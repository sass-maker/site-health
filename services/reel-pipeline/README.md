# Reel Pipeline

> Canonical source: `services/reel-pipeline/` in
> [`sass-maker/fleet-workspace`](https://github.com/sass-maker/fleet-workspace).
> The former standalone repository is historical only.

Fleet's media-generation service. It turns approved, source-backed briefs into
reviewable vertical-video artifacts and content-package receipts.

Reel Pipeline does **not** own social accounts, scheduling, publishing, or
provider analytics. Approved packages are handed to Postiz as drafts; a human
reviews and schedules them there.

## Start here

- [`STATUS.md`](STATUS.md) — short operational view.
- [`PROJECT_STATUS.md`](PROJECT_STATUS.md) — durable scope, dependencies, and
  remaining work.
- [`docs/index.md`](docs/index.md) — documentation map.
- [`AGENTS.md`](AGENTS.md) — repository rules and verification commands.

## Quick start

```bash
gh repo clone sass-maker/fleet-workspace fleet
cd fleet/services/reel-pipeline
npm ci
npm test
npm run dev
```

Useful checks:

```bash
npm run smoke:render-modes
npm run smoke:postiz
npm run ready:local
npm run docs:validate
```

## Boundary

```text
approved source package
        ↓
Reel Pipeline: validate → render → review artifact → media receipt
        ↓
Postiz: draft → human review → schedule → publish → provider metrics
```

The production Worker/R2 render flow remains:

```text
Cloudflare Worker + R2 → Rust watcher → render-pro.js → R2 → Worker receipt
```

The local control API also exposes the anonymous brand-reel, review, and studio
surfaces. These are generation tools, not social publishing surfaces.

## Documentation policy

Committed Markdown is the source of truth; Blume only renders it. Executable
configuration is authoritative for commands and readiness checks. Run
`npm run docs:validate` after documentation changes.
