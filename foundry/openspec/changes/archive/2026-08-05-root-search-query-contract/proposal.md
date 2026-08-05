## Why

Fleet tracks broad search evidence, but the ten root domains do not share one reviewed query contract. That makes brand-name, exact-domain, category, and problem-intent results difficult to compare and leaves ambiguous names such as Pace, Karte, and High Signal without explicit collision handling.

## What Changes

- Define a bounded, stable query set for every canonical root domain: brand, exact-domain, category, and problem intent.
- Preserve historical aliases as additive queries instead of rewriting query identifiers.
- Label brand collisions and the disambiguating query Fleet should measure.
- Join the root-domain query contract to weekly live-search evidence and Google Search Console results without inventing a rank when a provider returns no observation.
- Expose the latest factual result for every contracted query in the Google Search project expansion.

## Capabilities

### New Capabilities

- `root-search-query-contract`: Validated ten-root query coverage, collision metadata, and factual query-result reporting.

### Modified Capabilities

- `geo-observatory`: Root-domain query evidence becomes complete across four intent kinds and remains historically stable.

## Impact

- Fleet operations configuration and validation for root search queries.
- GEO Observatory joins and result projection.
- Fleet Console Google Search detail rows.
- Unit and contract tests; no new dependency and no deployment in this change.
