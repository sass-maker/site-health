## ADDED Requirements

### Requirement: Unified source registry
The system SHALL expose native SWE tracks, approved active Fleet project learning queues, research-paper reading paths, Reader saves, and High Signal briefings through one reference-only catalog, and MUST exclude `knowledge-base` and archived projects.

#### Scenario: Browse across sources
- **WHEN** the learner opens the learning catalog
- **THEN** the system shows filterable items from every successfully synced approved source with source and track labels

#### Scenario: Excluded source
- **WHEN** the catalog sync scans Fleet repositories
- **THEN** no `knowledge-base` item is emitted

### Requirement: Stable provenance
Each catalog item MUST include a stable ID, source kind, source identifier, canonical URL or repository-relative path, track identifiers, and a content fingerprint.

#### Scenario: Open original material
- **WHEN** the learner opens an external catalog item
- **THEN** the system provides its canonical source link and identifies the owning source

### Requirement: No canonical content duplication
The unified catalog MUST store references and derived metadata rather than establishing a second canonical copy of source bodies.

#### Scenario: Sync a project learning document
- **WHEN** a project learning queue is indexed
- **THEN** the registry stores item metadata, provenance, and fingerprint while the repository document remains authoritative

### Requirement: Stale-source tolerance
The catalog SHALL retain the last valid snapshot for a temporarily unavailable source and SHALL expose its last successful sync time.

#### Scenario: One source fails
- **WHEN** Reader sync fails while other adapters succeed
- **THEN** the catalog remains usable and identifies Reader data as stale
