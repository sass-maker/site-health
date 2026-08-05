## Context

The GEO Observatory already owns stable query identifiers and an append-only live-search ledger, while Search Console stores provider-native query/page rows. The root-brand contract now supplies the authoritative ten-domain identity set. This change must join those systems without creating a second ranking claim or rewriting historical query identifiers.

## Goals / Non-Goals

**Goals:**

- Validate complete four-intent coverage for the exact ten roots.
- Reuse existing GEO and Search Console evidence.
- Project the same contract into each relevant Fleet Console project expansion.
- Keep historical query identifiers readable after active targets improve.

**Non-Goals:**

- Scraping or fabricating Google rank positions.
- Guaranteeing first-page ranking.
- Adding paid SEO providers or production dependencies.
- Publishing content or deploying products.

## Decisions

1. Add a root-query contract beside the root-brand contract. The root contract is deliberately narrower than the 27-project GEO configuration and can carry root-specific collision and lifecycle metadata without changing subdomain tracking.
2. Validate the root-query contract against `root-brands.json`, not a hand-maintained count. This prevents the two sources from drifting.
3. Join evidence by normalized query text and root domain. Search Console rows are provider evidence; unmatched contract queries remain `not-observed`. GEO observations remain the only source of A/B/C first-page classification.
4. Surface contracted queries within the existing Google Search expansion. A new top-level dashboard would duplicate the project ledger and add navigation without additional evidence.

## Risks / Trade-offs

- [Risk] Search Console privacy thresholds can omit low-volume queries. -> Mitigation: show `not-observed`, never numeric zero or a made-up position.
- [Risk] Ambiguous commercial phrases can drift in meaning. -> Mitigation: query identifiers are immutable; replacements are additive and explicitly supersede older queries.
- [Risk] Multiple projects share one root property. -> Mitigation: each project expansion inherits the root contract but only Search Console rows already scoped to that project are treated as project evidence.

## Migration Plan

Land the contract, validator, projection, and tests together. Existing GEO ledger entries and Search Console observations remain readable. Rollback is a code/config revert; no stored evidence is rewritten.
