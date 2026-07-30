## Why

Independent Fleet products are stored in standalone repositories, but App
Health, Setline, and What It Takes to Win still call a private sibling Fleet
deploy guard and eighteen product agent bootloaders require private or parent Fleet
instructions. Those reverse dependencies make a fresh clone incomplete and
blur whether Fleet is an optional control plane or a required product runtime.

## What Changes

- Remove direct product calls to `../foundry/ops` and private
  `sass-maker/fleet-workspace` instructions.
- Give each affected product a repo-local, manual release contract built from
  its existing checks and deployment command.
- Keep Fleet as the caller: Fleet may discover, validate, monitor, and invoke a
  product's repo-local contract, but the product must not require Fleet source.
- Add a deterministic Fleet boundary check that rejects tracked reverse
  dependencies from independent products to private Fleet paths.
- Update durable product and Fleet documentation after standalone verification.
- Do not deploy, change credentials, alter production configuration, or move
  product source.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `fleet-workspace-boundary`: Require independent products to remain operable
  from a standalone clone and invert orchestration so Fleet calls product-owned
  commands rather than products calling private Fleet source.

## Impact

- Fleet Workspace: boundary validator, tests, standards/status documentation,
  and the cross-repository OpenSpec change.
- `sass-maker/app-health`: deploy and migration commands plus durable status.
- `Significant-Hobbies/setline`: deploy command and durable status.
- `Significant-Hobbies/what-it-takes-to-win`: deploy command and durable status.
- Agent instruction boundaries in Anime List, App Health, Calorie, CodeVetter,
  Email Manager, High Signal, Karte, Knowledge Base, LoopTV, Memory Map, Motion,
  PostTrainLLM, Research Papers, Reader, RolePatch, Significant Hobbies, SWE
  Interview Prep, and What It Takes to Win.
- GitHub repository settings, deployments, credentials, dependencies, DNS, and
  runtime data remain unchanged.
