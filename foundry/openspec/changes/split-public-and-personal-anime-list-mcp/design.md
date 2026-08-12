## Context

The centralized gateway currently proxies Anime List's native MCP as one OAuth
connection containing six public catalog tools and four personal watchlist
tools. Six additional public candidates are marked prepared but undeployed.
See `proposal.md` for the product decision.

## Goals / Non-Goals

**Goals:**

- Reuse the native Anime List MCP without creating an adapter or copying data.
- Enforce the public/private split at the gateway, not through prompt wording.
- Keep the corrected release slate honest in listings, monitors, and docs.

**Non-Goals:**

- Changing Anime List's product API, storage, OAuth verifier, or source release.
- Deploying either route or creating ChatGPT portal drafts.
- Deleting reusable adapter code for demoted products unless it becomes dead.

## Decisions

### Filter the native tool catalog and calls at the public proxy

The public route uses a fixed allowlist of six native tool names. The gateway
filters `tools/list` responses and rejects any other `tools/call` before
forwarding. This keeps one native implementation while making the privacy
boundary executable. Prompt-only separation was rejected because it cannot
enforce access.

### Use two listings and two branded hosts

`anime-mcp.significanthobbies.com` remains the personal OAuth route and is
listed as My Anime List. A prepared public route uses a separate catalog host,
server identity, no-auth scheme, icon package, and challenge name. Independent
connections are clearer than optional authentication on one connection.

### Remove demoted products from release machinery, retain the audit trail

LoopTV, PostTrainLLM, and What It Takes to Win are removed from hosted routes,
listing packages, representative monitoring, and submission cases. Their
eligibility record says **not needed for now** with the value rationale. Shared
normalization code is retained only where the remaining candidates use it;
product-specific dead definitions are removed.

## Risks / Trade-offs

- **Native upstream changes tool names** → exact allowlist parity tests fail
  closed before release.
- **Two Anime connections could confuse users** → names and descriptions make
  public catalog versus personal watchlists explicit.
- **Demoted work may be useful later** → retain the evidence and git history;
  reintroduction requires a new value decision and normal release validation.

## Migration Plan

1. Add and test the public native-proxy allowlist.
2. Correct routes, listing packages, evaluations, and eligibility docs.
3. Open a draft PR and leave all external activation tasks undone.
4. A later approved release provisions the public Anime hostname and ChatGPT
   draft independently; rollback removes only that prepared route/listing.
