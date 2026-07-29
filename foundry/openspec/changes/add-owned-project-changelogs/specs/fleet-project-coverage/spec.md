## ADDED Requirements

### Requirement: Maintained public evidence links follow one contract
Fleet SHALL generate and validate changelog, roadmap, and source metadata for
every maintained public product. Changelog URLs MUST use the product's
canonical origin and `/changelog` path. Public roadmap URLs MUST target the
canonical GitHub repository's `/issues` page. Public source URLs MUST target the
canonical GitHub repository root.

#### Scenario: Maintained product metadata is valid
- **WHEN** catalog generation processes a maintained public product with a public repository
- **THEN** the public snapshot contains a same-origin changelog URL, canonical GitHub Issues URL, and canonical GitHub repository URL

#### Scenario: Maintained product uses a private repository
- **WHEN** catalog generation processes a maintained public product whose repository is not intentionally public
- **THEN** the public snapshot contains the same-origin changelog URL and omits private roadmap and source URLs

#### Scenario: Evidence metadata drifts
- **WHEN** a maintained public product uses raw commit history, a status document, a different origin, or a noncanonical repository link
- **THEN** Fleet validation fails and names the product and invalid field
