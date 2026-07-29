## MODIFIED Requirements

### Requirement: Public changelogs and roadmaps are generated content
SaaS Maker SHALL render privacy-safe product evidence links from the
deterministic Fleet public snapshot. For each maintained product, Changelog
SHALL open the product-owned same-origin `/changelog` page, Roadmap SHALL open
the canonical repository's GitHub Issues page, and Source SHALL open the
canonical GitHub repository when that link is intentionally public. SaaS Maker
MUST NOT own or ingest the changelog body, a task workflow, private roadmap
data, or repository content at runtime.

#### Scenario: Fleet publishes a maintained product snapshot
- **WHEN** Fleet generates a valid public snapshot for a maintained product
- **THEN** SaaS Maker renders the product-owned changelog, repository-native roadmap, and public source links without runtime access to private Fleet systems

#### Scenario: Product repository is intentionally private
- **WHEN** public Fleet policy omits a private repository or issues URL
- **THEN** SaaS Maker still links the same-origin public changelog and omits inaccessible repository links
