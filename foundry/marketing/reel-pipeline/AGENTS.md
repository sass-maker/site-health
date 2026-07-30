# Reel Pipeline agent instructions

Also follow the shared Fleet instructions at `../../../AGENTS.md`.

## Purpose

This repository generates media. It does not own social scheduling or
publishing. Postiz is the only social review/schedule/publish surface.

## Verify

```bash
npm test
npm run smoke:render-modes
npm run smoke:postiz
npm run docs:validate
```

Use `npm run ready:target` only on the prepared target host because it checks
live prerequisites.

## Constraints

- Preserve source-package claims and approval evidence.
- Default to local/draft generation; never publish from this repository.
- Do not add direct social-provider adapters or credential stores.
- Keep engine integrations behind VideoBrief/content-package contracts.
- Do not advance git submodules on `main` without a focused canary.
- Do not touch credentials, `.env` files, or cloud configuration without
  explicit approval.
- Keep root status in `PROJECT_STATUS.md`; do not create parallel ledgers.

Command reference: [`docs/development/commands.md`](docs/development/commands.md).
