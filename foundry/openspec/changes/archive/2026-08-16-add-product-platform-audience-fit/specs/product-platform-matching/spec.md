## MODIFIED Requirements

### Requirement: Article routing to editorial and community destinations

The system SHALL route articles only to protected channels and
article-syndication platforms whose `artifactFit` includes `article` and whose
audience tags overlap the product's audience tags. It SHALL NOT route articles
to curated directories or long-tail listing seeds.

#### Scenario: Article is matched to platforms

- **WHEN** an article artifact with a classified product audience is matched
  against the platform inventory
- **THEN** the matched set includes audience-compatible protected channels and
  article-syndication platforms whose `artifactFit` includes `article`
- **AND** the matched set excludes curated directories and long-tail seeds

#### Scenario: Article destination lacks audience fit

- **WHEN** an artifact-compatible editorial or community destination has no
  overlapping audience tag
- **THEN** the destination is excluded from the matched set
- **AND** it is returned in the unclassified set with a fit reason

### Requirement: Product routing to listing and launch surfaces

The system SHALL route products and major features only to protected channels,
curated directories, and long-tail seeds whose artifact and audience tags fit.
It SHALL NOT route products to article-syndication platforms unless the product
launch includes a canonical article.

#### Scenario: Product is matched to platforms

- **WHEN** a product or major-feature artifact with a classified audience is
  matched against the platform inventory
- **THEN** the matched set includes audience-compatible protected channels,
  curated directories, and long-tail seeds whose `artifactFit` includes
  `product` or `major-feature`

#### Scenario: Product with a canonical article

- **WHEN** a product launch includes a canonical article
- **THEN** audience-compatible article-syndication platforms are also included
  in the matched set for the article component only

## ADDED Requirements

### Requirement: Explicit audience classification

The system SHALL accept explicit audience tags for products and platforms from
a validated taxonomy. A missing product or platform audience signal SHALL NOT
be inferred as a match.

#### Scenario: Product or platform lacks a fit signal

- **WHEN** an artifact-compatible product or platform has no audience tags
- **THEN** the platform is returned as unclassified and is not included in a
  campaign or verification queue

#### Scenario: Audience configuration is invalid

- **WHEN** audience configuration contains an unknown tag, duplicate tag, or
  malformed product or platform mapping
- **THEN** validation fails with the affected mapping identified

### Requirement: Evidence-bearing deterministic ranking

The system SHALL attach the overlapping audience tags and a deterministic fit
score to each matched destination. Matching and verification lists SHALL be
ordered by descending fit score and then by platform ID.

#### Scenario: Destinations have different audience overlap

- **WHEN** two artifact-compatible destinations overlap different numbers of
  product audience tags
- **THEN** the destination with more overlapping tags is listed first
- **AND** each destination records the tags that produced its score

#### Scenario: Destinations have equal audience overlap

- **WHEN** two destinations have the same fit score
- **THEN** they are listed in ascending platform-ID order

