# product-platform-matching Specification

## Purpose
Define deterministic, auditable rules for routing articles and products to the
correct classes of external distribution platforms.
## Requirements
### Requirement: Article routing to editorial and community destinations

The system SHALL route articles to protected channels and article-syndication
platforms (editorial, discovery, owned-publication) and SHALL NOT route
articles to curated directories or long-tail listing seeds.

#### Scenario: Article is matched to platforms

- **WHEN** an article artifact is matched against the platform inventory
- **THEN** the matched set includes protected channels and article-syndication
  platforms whose `artifactFit` includes `article`
- **AND** the matched set excludes curated directories and long-tail seeds

### Requirement: Product routing to listing and launch surfaces

The system SHALL route products and major features to protected channels,
curated directories, and long-tail seeds and SHALL NOT route products to
article-syndication platforms unless the product launch includes a canonical
article.

#### Scenario: Product is matched to platforms

- **WHEN** a product or major-feature artifact is matched against the platform
  inventory
- **THEN** the matched set includes protected channels, curated directories,
  and long-tail seeds whose `artifactFit` includes `product` or
  `major-feature`

#### Scenario: Product with a canonical article

- **WHEN** a product launch includes a canonical article
- **THEN** article-syndication platforms are also included in the matched set
  for the article component only

### Requirement: ArtifactFit populated per platform

The system SHALL populate an `artifactFit` array on every platform in the
accreditation state file indicating which artifact types the platform accepts:
`product`, `major-feature`, and/or `article`.

#### Scenario: Directory is tagged for products

- **WHEN** a curated directory or long-tail seed is initialized in the state
  file
- **THEN** its `artifactFit` includes `product` and `major-feature` and does
  not include `article`

#### Scenario: Article-syndication platform is tagged for articles

- **WHEN** an article-syndication platform is initialized in the state file
- **THEN** its `artifactFit` includes `article` and does not include
  `product` or `major-feature`

#### Scenario: Protected channel is tagged for all artifact types

- **WHEN** a protected channel (Hacker News, LinkedIn, X) is initialized
- **THEN** its `artifactFit` includes `product`, `major-feature`, and
  `article`

### Requirement: Matching filters by accreditation state

The matching function SHALL return only platforms whose `currentState` is
`accredited` or `seed`; platforms in `rejected` state are excluded unless the
owner explicitly overrides.

#### Scenario: Rejected platform is excluded

- **WHEN** a platform is in `rejected` state and the owner has not overridden
- **THEN** the matching function does not include it in the matched set

#### Scenario: Owner overrides a rejection

- **WHEN** the owner explicitly overrides a rejected platform for one campaign
- **THEN** the matching function includes it with a recorded override reason

### Requirement: Audience-fit ordering within matched buckets

The matching function SHALL order platforms within each bucket (accredited,
seed, articleComponent) by audience-fit score (descending) so the most
relevant platforms for a given product surface first. The artifact-type
routing remains the outer filter; audience-fit only reorders within a bucket.

#### Scenario: Platforms with matching audience tags rank first

- **WHEN** a product has `productAudienceTags: ['ai', 'developer-tools']` and
  two seed platforms match the artifact type, one with `audienceTags: ['ai']`
  and one with `audienceTags: ['fitness']`
- **THEN** the AI-tagged platform appears before the fitness-tagged platform
  in the seed bucket
- **AND** the AI-tagged platform's `audienceFit` is 1 and
  `audienceMatchedTags` is `['ai']`

#### Scenario: Missing audience tags means unclassified, not no-fit

- **WHEN** either the platform or the product has no audience tags
- **THEN** the platform's `audienceFit` is 0 and
  `audienceUnclassified` is true
- **AND** the platform is not excluded from matching (artifact-type routing
  still applies)

#### Scenario: Product audience tags are echoed in the result

- **WHEN** `productAudienceTags` is passed to `matchPlatforms`
- **THEN** the result includes `productAudienceTags` for auditability

