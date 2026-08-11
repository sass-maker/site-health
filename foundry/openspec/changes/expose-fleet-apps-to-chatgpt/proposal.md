## Why

Fleet applications already contain useful public and owner-scoped retrieval APIs, but ChatGPT does not have one robust, privacy-safe way to query them as coherent tools. The opportunity is to expose the selected applications as separately enableable, strictly read-only MCP connections with least-privilege credentials, stable schemas, citations, pagination, precise tool selection, and fail-closed boundaries.

## What Changes

- Prepare separate read-only ChatGPT MCP connections for Reader, Starboard, High Signal, Calorie, Anime List by Significant Hobbies (`anime-list`), Significant Hobbies, Research Papers, and Setline.
- Reuse and harden Anime List's existing Streamable HTTP MCP endpoint and personal access tokens; implement the other connections through a shared Fleet-owned adapter/runtime with app-specific entrypoints.
- Host eight fixed, separately registered Streamable HTTP routes on one Cloudflare Worker. Protect personal routes with owner-only Auth0 OAuth and exact route audiences; keep public routes anonymous.
- Expose focused retrieval tools:
  - Reader: saved-reading search, item detail, and collection context.
  - Starboard: public repository search/detail, project preview, and grounded tool-adoption evidence.
  - High Signal: published-signal search/detail, Daily Brief, and public track-record context.
  - Calorie: owner-only daily nutrition, bounded nutrition history, saved-food search, and goal-cycle context, explicitly excluding medication data.
  - Anime List: its existing public anime/manga catalog tools and owner-only watchlist tools.
  - Significant Hobbies: public hobby and experience discovery plus public timeline retrieval; private Daily, journal, Trajectory, bucket-list, and account data remain excluded.
  - Research Papers: corpus search/detail, similar papers, hot papers, sleepers, and curated reading paths without invoking paid-answer or ingest workflows.
  - Setline: owner-only programme/template, workout-history/session, and progress retrieval without workout execution or coaching writes.
- Require explicit schemas, stable identifiers, bounded pagination, accurate read-only MCP annotations, source provenance, freshness, timeouts, retries, redaction, and deterministic errors for every tool.
- Add positive, indirect, follow-up, empty, invalid, unauthorized, degraded-upstream, and negative mutation-selection evaluations plus MCP Inspector and ChatGPT developer-mode runbooks.
- Keep every mutation, custom MCP UI, public plugin submission, and paid authentication feature outside the implementation boundary. External activation, credential issuance, migration, merge, and deployment remain explicit operator actions.

## Capabilities

### New Capabilities

- `chatgpt-app-connections`: Robust personal read-only MCP connections for eight selected Fleet applications.

### Modified Capabilities

None.

## Impact

- New Fleet-owned MCP adapter/runtime and operator documentation under `foundry/helpers/chatgpt-connections/` or the final approved Foundry boundary.
- Reader reuses its existing revocable hashed `rdr_*` integration key. Anime List reuses its existing hashed `anime_list_*` personal access token and native `/api/mcp` endpoint.
- Calorie and Setline require dedicated, revocable, owner-scoped read-only token support because their current Better Auth session cookies also authorize writes and are not a robust least-privilege integration boundary. Any additive D1 migration, token-management surface, or production activation remains separately gated.
- Starboard, High Signal, and Significant Hobbies use public read contracts only. Research Papers exposes only explicitly supported public static exports; its local corpus stays local.
- Narrow read adapter routes may be added where an existing API cannot provide bounded, stable, privacy-safe results. No mutation route or credential with write authority may be used by an MCP connection.
- The shared runtime is expected to use the official `@modelcontextprotocol/sdk` and its required schema dependency once approved. The dependency inspection and approval required by Fleet policy remain prerequisites to manifest or lockfile edits.
- Runtime secrets remain outside git and are injected through the existing Fleet secret boundary. Approved activation uses Auth0's standard tenant domain and free plan without a payment card, custom domain, or open dynamic client registration.
