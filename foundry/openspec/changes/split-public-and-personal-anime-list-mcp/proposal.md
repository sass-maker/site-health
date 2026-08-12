## Why

Anime List has a useful anonymous catalog as well as private user watchlists,
but the current ChatGPT connection combines both behind OAuth. At the same
time, three technically eligible expansion candidates do not currently have
enough user value to justify release work.

## What Changes

- Add a distinct anonymous Anime List catalog connection for search, details,
  statistics, and random discovery.
- Rename and describe the existing OAuth listing as the personal Anime List
  connection, retaining watchlists and all current user isolation.
- Mark LoopTV, PostTrainLLM, and What It Takes to Win as **not needed for now**
  and remove them from the planned route, listing, monitoring, and submission
  surface without deploying or deleting their source products.
- Keep SWE Interview Prep, SaaS Maker, and Drank as prepared public candidates.
- Open the implementation as a draft PR; do not deploy, configure domains,
  create ChatGPT drafts, or change secrets.

## Capabilities

### New Capabilities

- `public-anime-list-mcp`: Defines the independent anonymous Anime List
  catalog boundary and its separation from personal watchlist data.

### Modified Capabilities

- `non-ios-public-mcp-connections`: Narrows the prepared non-iOS release slate
  and records explicit not-needed-for-now decisions.

## Impact

- Changes the shared gateway route registry, listing manifest, evaluation and
  monitor fixtures, API/source documentation, and eligibility inventory.
- Reuses Anime List's existing native MCP; adds no dependency, database,
  credential, product API, or deployment.
- Tracked by Fleet Workspace issue #335.
