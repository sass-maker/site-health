## ADDED Requirements

### Requirement: Product and page inventory

The `content-coverage` skill SHALL resolve one product or the Fleet registry,
read the owning repository's product truth and instructions, and inventory its
live sitemap, indexable pages, local content sources, internal links, dates,
schema types, and available performance evidence.

#### Scenario: Audit one product

- **WHEN** the owner invokes content coverage for a registered product
- **THEN** the report identifies every discovered first-party page, its source
  path when local, its page archetype, and any inventory uncertainty

#### Scenario: Audit all products

- **WHEN** the owner invokes content coverage for all registered products
- **THEN** unavailable repositories, sitemaps, or analytics are marked skipped
  or blocked without omitting the product from the summary

### Requirement: Competitive archetype coverage

The skill SHALL discover current search-result competitors and industry page
patterns, map relevant category, problem, how-to, use-case, integration,
comparison, alternative, proof, benchmark, glossary, template, and
product-explanation archetypes, and require only archetypes supported by
current intent and product fit.

#### Scenario: Competitors publish a common useful archetype

- **WHEN** multiple relevant search competitors cover a customer intent that
  the product can answer accurately and distinctively
- **THEN** the skill records a coverage gap with competitor and search evidence

#### Scenario: Competitor volume is irrelevant

- **WHEN** competitor pages are off-topic, duplicative, outdated, thin, or not
  connected to the product's audience
- **THEN** the skill excludes them from required coverage and records why

### Requirement: Actionable coverage verdict

The skill SHALL classify every existing and missing opportunity as keep,
update, refresh, merge, create, redirect, prune, excluded, or blocked and SHALL
prioritize actions by audience value, product fit, evidence, search intent,
competitive opportunity, and implementation effort.

#### Scenario: Two pages cannibalize one intent

- **WHEN** two first-party pages substantially overlap the same search intent
- **THEN** the report recommends one canonical page and an explicit merge or
  redirect action instead of another article

#### Scenario: Product has no article surface

- **WHEN** a high-priority page is required but the repository has no suitable
  indexable content surface
- **THEN** the manifest includes creation of that surface through the target
  repository's spec-driven workflow before page publication

### Requirement: Source-backed page generation

The skill SHALL generate complete page bodies from repository and public
evidence, preserve a claim ledger, include useful internal links and
destination metadata, and refuse unsupported comparative, legal, medical,
financial, or performance claims.

#### Scenario: Generate a missing product explainer

- **WHEN** the product has verified behavior and a missing high-priority
  product-explanation archetype
- **THEN** the generated page accurately explains that behavior, cites its
  evidence, links to the product action, and introduces no unverified claim

#### Scenario: Comparison evidence is unavailable

- **WHEN** a proposed competitor comparison cannot be supported by current
  equivalent product evidence
- **THEN** the page remains blocked or is reframed as a sourced category
  comparison

### Requirement: Approved repository publication

The skill SHALL be preview-only by default and SHALL write, validate, commit,
push, or publish first-party pages only when each exact action appears in an
approved unchanged campaign manifest.

#### Scenario: Publish through an existing content surface

- **WHEN** an approved manifest targets an existing repository content model
- **THEN** the skill makes the smallest coherent edits, follows the nearest
  agent instructions, runs the listed checks, and records the resulting
  revision and public verification state

#### Scenario: Production publish was not approved

- **WHEN** page creation was approved but the manifest contains no production
  deploy or release action
- **THEN** the skill stops after the approved repository actions and reports
  publication as pending
