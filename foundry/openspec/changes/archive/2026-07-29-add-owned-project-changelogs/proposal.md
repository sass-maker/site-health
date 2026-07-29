## Why

SaaS Maker currently sends visitors to raw commit history or status documents
for product progress, so projects do not own a readable account of what
changed. Maintained public products need a consistent, product-authored
changelog surface while GitHub remains the source of truth for future work and
source code.

## What Changes

- Add an owned changelog page to every maintained public product website,
  including Motion after its live landing was discovered during closure.
- Seed each changelog from verified shipped milestones already present in the
  repository, written as concise user-visible entries rather than a raw commit
  feed.
- Make the changelog discoverable from the product website without changing
  existing primary navigation labels unnecessarily.
- Change SaaS Maker product metadata so:
  - **Changelog** opens the product-owned website changelog.
  - **Roadmap** opens the owning repository's GitHub Issues page.
  - **Source** opens the canonical GitHub repository.
- Add Fleet validation that rejects maintained public catalog entries whose
  changelog, roadmap, or source links violate this contract.
- Exclude archived/past products, local-only tools, private operational
  consoles, service-only products without a public website, and headless
  packages.

## Capabilities

### New Capabilities

- `owned-product-changelogs`: Defines the content, routing, discoverability,
  ownership, accessibility, and verification contract for maintained public
  product changelogs.

### Modified Capabilities

- `saasmaker-public-boundary`: Replaces Fleet-generated changelog/roadmap
  content with privacy-safe links to product-owned changelogs and
  repository-native GitHub work/source surfaces.
- `fleet-project-coverage`: Adds deterministic validation for changelog,
  roadmap, and source metadata on maintained public product entries.

## Impact

- Affects maintained public product website repositories, their smallest
  relevant build/check commands, Fleet catalog metadata and generation, and
  the SaaS Maker public directory.
- Adds no runtime service, database, production dependency, automated
  deployment, or private data ingestion.
- GitHub issue #60 tracks the cross-project rollout. Production deployment
  remains manual per product after source changes are validated and pushed.
