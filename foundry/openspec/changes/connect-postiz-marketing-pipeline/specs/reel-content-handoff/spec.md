## MODIFIED Requirements

### Requirement: Stable cross-repo receipts
Reel Pipeline SHALL emit versioned JSON receipts for render, Postiz draft, platform publication, and metrics stages with package, revision, and variant attribution.

#### Scenario: Upload to YouTube
- **WHEN** a sourced variant is successfully published through Postiz
- **THEN** the receipt contains the provider, Postiz post id, external platform id and URL when available, publication state/time, and source attribution required by the originating project

### Requirement: Existing approval gates remain authoritative
Content-package intake SHALL NOT mark a Postiz draft approved, scheduled, or published and SHALL NOT bypass Reel Pipeline quality checks or Postiz review.

#### Scenario: Import an approved creative variant
- **WHEN** a package variant enters Reel Pipeline
- **THEN** it remains subject to quality and media preflight before a draft is created, and only an explicit owner action in Postiz can schedule or publish it
