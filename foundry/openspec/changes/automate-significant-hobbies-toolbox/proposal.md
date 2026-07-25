## Why

Significant Hobbies, Reader, Anime List, SWE Interview Prep, LoopTV, and Chess
form a family of personal Toolbox applications that should stay usable and
discoverable with minimal maintenance. They need one family-level contract
without forcing identical product events or six separate operational systems.

## What Changes

- Inventory each repository's public surface, storage, authentication, content
  refresh, scheduled jobs, indexing, and meaningful personal-use activation.
- Define a small shared family contract for build/live/indexing/error evidence
  plus product-specific activation and background freshness where relevant.
- Protect private reading, learning, hobby, watchlist, game, and user-state data
  from centralized reports.
- Reuse Significant Hobbies family identity and Foundry adapters while keeping
  repository-local runtimes independently testable and deployable.
- Add only bounded quiet experiments with attribution and automatic expiry.

## Capabilities

### New Capabilities

- `significant-hobbies-toolbox-automation`: Family-level usability,
  privacy, content/job freshness, indexing, quiet experimentation, and Foundry
  evidence across six personal utilities.

### Modified Capabilities

None.

## Impact

- Repositories: `significanthobbies`, `reader`, `anime-list`,
  `swe-interview-prep`, `looptv`, and `chess`.
- Materia and Protein Index are Ignored and remain out of scope.
- No family monorepo migration, feature roadmap, content-policy change, paid
  marketing, production deployment, or unnecessary shared SDK.
