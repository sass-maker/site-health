## ADDED Requirements

### Requirement: Content coverage routing

The `site-health` parent skill SHALL route requests about article sufficiency,
industry-standard SEO pages, competitor content gaps, topic coverage,
cannibalization, and missing product explainers to the `content-coverage`
subskill.

#### Scenario: Ask whether a product has enough SEO articles

- **WHEN** the owner asks whether a product covers the SEO pages expected in
  its industry
- **THEN** `site-health` loads the content-coverage protocol without treating a
  passing on-page audit as proof of content sufficiency

### Requirement: Content verdict in combined scorecard

The combined site-health report SHALL include the latest content-coverage
verdict and highest-priority content gap for every in-scope product.

#### Scenario: No content audit exists

- **WHEN** a product has no current content-coverage artifact
- **THEN** the scorecard marks content coverage unavailable rather than solid
