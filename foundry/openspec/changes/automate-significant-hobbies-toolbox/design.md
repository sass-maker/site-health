## Context

Six public utilities share the Significant Hobbies family identity but retain
different repositories, stacks, content sources and activation semantics. The
family needs shared maintenance and discoverability policy without a forced
monorepo or universal analytics SDK.

## Goals / Non-Goals

**Goals:** complete family inventory, build/live/indexing, privacy-safe errors,
meaningful per-product activation, job/content freshness and quiet experiments.

**Non-Goals:** merge repositories, create shared product roadmap, centralize
private user data, force signups/conversions or auto-deploy production.

## Decisions

- Maintain one family registry mapping canonical domains to six repository
  owners and their runtime-specific checks.
- Define activation individually: hobby/public-item action, reading/library
  action, anime discovery/list action, completed learning/drill action, LoopTV
  playback action, and completed chess/coaching action.
- Use shared Foundry reporting/marketing adapters, not a shared runtime SDK
  unless existing code already supports one safely.
- Background imports/syncs expose freshness, bounds, retries and unresolved
  failure; static products mark job contracts not-applicable.
- Private libraries, learning history, watchlists, saved games and notes remain
  out of fleet evidence.

## Risks / Trade-offs

- **Family aggregate hides one broken child** → Report each canonical surface
  separately.
- **Universal events become meaningless** → Require product-specific activation
  names under one aggregate envelope.
- **Quarterly jobs fail silently** → Track freshness relative to declared
  cadence, not daily expectations.
