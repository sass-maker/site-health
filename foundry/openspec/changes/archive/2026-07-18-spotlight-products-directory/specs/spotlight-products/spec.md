## ADDED Requirements

### Requirement: canonical public spotlight set

The fleet SHALL define one ordered set of five spotlight products: CodeVetter,
PostTrainLLM, HeyPace, High Signal, and SaaS Maker.

Each entry SHALL include a stable ID, display name, canonical product URL,
GitHub organization/repository URL, and a short public description.

#### Scenario: contract is consumed by a public surface

- **WHEN** the personal site, SaaS Maker site, or README synchronizer reads the
  spotlight contract
- **THEN** it uses the same five entries and canonical URLs
- **AND** it does not silently add a sixth primary product

### Requirement: supporting fleet remains discoverable

The wider fleet SHALL remain available from SaaS Maker's directory, the
personal site's full `/projects` archive, and the relevant organization pages.

#### Scenario: visitor wants the rest of the fleet

- **WHEN** a visitor selects the directory link
- **THEN** they reach SaaS Maker's broader project catalog
- **AND** the personal `/projects` archive remains available for detailed repo
  browsing
- **AND** supporting repositories are not represented as primary personal-site
  spotlights

### Requirement: synchronized GitHub profiles

The fleet MUST keep the personal README and each of the CodeVetter, PostTrainLLM,
HeyPace, High-Signal, and SaaS Maker organization profile READMEs consistent in
names, links, and their relationship to the broader directory.

#### Scenario: profile README is updated

- **WHEN** a profile README is changed
- **THEN** its primary product link matches the contract
- **AND** it links back to `https://sassmaker.com` as the broader directory where
  appropriate

### Requirement: drift detection

The fleet SHALL provide a cheap check that validates the contract against the
portfolio/SaaS Maker metadata and the expected personal and organization README
markers. The check SHALL run on relevant fleet-root changes and on a scheduled
reconciliation job.

#### Scenario: stale metadata is introduced

- **WHEN** a synchronized surface drops a spotlight product or changes its
  canonical URL
- **THEN** the validator exits non-zero and identifies the stale surface

#### Scenario: remote consumer drifts

- **WHEN** a scheduled sync job checks the checked-out portfolio, SaaS Maker, or
  profile repositories
- **THEN** it exits non-zero with the repository and file that drifted
- **AND** it does not silently overwrite product-owned content
