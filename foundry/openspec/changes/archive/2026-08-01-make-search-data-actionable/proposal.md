## Why

Fleet now records authoritative Google Search impressions, clicks, CTR,
position, and a bounded query list, but the owner still has to interpret those
numbers manually. The missing query-to-page relationship and lack of cautious
next-action states keep the page descriptive instead of operational.

## What Changes

- Collect each retained Search Console query together with its ranking landing
  page, while preserving the existing aggregate project metrics and private,
  bounded storage boundary.
- Derive deterministic advisory actions from native values and explicit sample
  floors: check indexing, collect more data, improve snippet, strengthen the
  ranking page, build search relevance, or protect and expand.
- Add a sortable Next action column to the portfolio ledger and show landing
  page plus action beside each query in the expanded project disclosure.
- Keep low-volume, privacy-filtered, missing, and zero-impression states honest.
  Do not invent opportunity scores or automatically edit product content.

## Capabilities

### New Capabilities

- `search-action-ledger`: Defines normalized query-to-page Search Console
  evidence and conservative project- and query-level advisory actions.

### Modified Capabilities

None.

## Impact

- Search Console collection and its machine-local normalized outcome contract.
- Founder outcome projection and the bounded `/v1/outcomes/search` response.
- Fleet Console Google Search ledger and expanded query evidence.
- Focused Search collector, store, projection, service, and Console build tests.
- No new dependency, provider mutation, production configuration, automatic
  remediation, or deployment.
