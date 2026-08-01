## Context

The Search outcome projection already has access to project-level geo-observatory query histories through the connection model, while the Performance projection already exposes lab LCP, Cloudflare field vitals, periods, scopes, and RUM sample count. The existing project-row disclosures are the intended location for supporting evidence.

## Goals / Non-Goals

**Goals:**

- Extend the bounded Search response with only the latest configured target-query observations needed by the UI.
- Render target queries and the lab-versus-field interpretation within existing expansions using the current dense visual language.
- Keep the interpretation deterministic, transparent, and based on native values.

**Non-Goals:**

- New provider collection, route-level Cloudflare analytics, scores, columns, pages, navigation, or dependencies.
- Treating geo-observatory results as Search Console measurements.
- Treating one canonical Lighthouse run and host-wide real-user data as directly equivalent populations.

## Decisions

### Reuse the connection model instead of reading ledgers in the UI

The Founder Control projection will copy a bounded latest observation for each already-normalized target query into Search rows. This keeps filesystem knowledge outside the browser and follows the existing API boundary. Reading the geo-observatory ledger from the Astro client was rejected because it would duplicate normalization and expose implementation details.

### Add supporting evidence only inside open rows

Tracked target queries appear after the Search Console query table, and Performance adds one diagnosis sentence before the existing facts and charts. Both remain absent from the collapsed portfolio ledger. New cards, columns, and nested disclosures were rejected as unnecessary UI weight.

### Compare only LCP pass states

The diagnosis uses the shared 2,500 ms LCP threshold and reports four possible comparisons. It does not calculate ratios or a composite score because lab and field evidence have different scopes. If either source is absent, the copy states that comparison is unavailable.

## Risks / Trade-offs

- [The latest target observation may be older than Search Console data] → Always show its own observation date and source label.
- [A host-wide field result may reflect pages other than the canonical lab URL] → State both scopes in the interpretation and retain provider period/scope facts below it.
- [Extra detail can make expansions dense] → Omit the target section entirely when no configured observations exist and add only one diagnosis sentence.

## Migration Plan

The response addition is backward-compatible. Rollback removes the optional target-query property and the two render helpers; stored evidence and provider collection remain unchanged.
