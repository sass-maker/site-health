## ADDED Requirements

### Requirement: Search Console sitemap inventory converges on canonical hosts

Fleet SHALL derive the desired Google sitemap inventory from the canonical
project hosts plus the exact root-domain brand contract and SHALL reconcile it
through an explicit preview and apply boundary.

#### Scenario: Preview names every intended provider mutation

- **WHEN** the operator runs sitemap reconciliation without `--apply`
- **THEN** missing canonical sitemaps are reported as additions
- **AND** submitted sitemaps outside the complete desired property set are
  reported as removals
- **AND** no Search Console mutation occurs

#### Scenario: Apply converges without broad deletion

- **WHEN** the operator applies the reviewed reconciliation
- **THEN** only the reported sitemap URLs are submitted or deleted
- **AND** every desired sitemap remains assigned to an accessible property
- **AND** a subsequent preview reports no additions or removals
- **AND** the result does not claim URL indexing or search-rank improvement

