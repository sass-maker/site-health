## ADDED Requirements

### Requirement: Public learning index
The SaaS Maker public surface SHALL provide an indexable Learnings route that
lists durable first-party articles with title, summary, and publication date.

#### Scenario: Browse public learnings
- **WHEN** a visitor opens the Learnings route
- **THEN** they can discover and navigate to the model-aware skills article
  without entering a private Fleet surface

### Requirement: Model-aware skills article
The public learning article SHALL explain the difference between agents and
skills, identify the skill-level execution-profile gap, describe the
provider-neutral Fleet contract, and avoid claiming an unverified invention or
industry standard.

#### Scenario: Read the article
- **WHEN** a visitor reads the model-aware skills article
- **THEN** they can distinguish existing agent-level model routing from
  Fleet's proposed portable skill-level capability declaration

### Requirement: Public article metadata
Every public learning article MUST have a canonical URL, useful description,
publication date, author attribution, article structured data, and inclusion
in the public sitemap and machine-readable index.

#### Scenario: Discover the article
- **WHEN** a search engine or AI agent inspects the SaaS Maker public surface
- **THEN** it receives canonical and structured metadata for the article
  without private Fleet details

### Requirement: Separate campaign approval
Creating a public learning article SHALL NOT authorize deployment, syndication,
social posting, directory submission, or other external publication actions.

#### Scenario: Article implementation completes
- **WHEN** the article builds and passes local review
- **THEN** every external action remains blocked until the owner approves the
  exact immutable launch-campaign manifest
