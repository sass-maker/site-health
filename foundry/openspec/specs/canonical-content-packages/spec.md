# canonical-content-packages Specification

## Purpose

Define versioned Significant Hobbies content packages and their canonical editorial lifecycle.

## Requirements

### Requirement: Versioned canonical package document
Significant Hobbies SHALL store every automated content package in a versioned JSON document and SHALL validate the complete document before build or mutation commands succeed.

#### Scenario: Load a valid package document
- **WHEN** the application or content CLI loads a supported schema version with valid packages
- **THEN** it receives normalized typed packages without modifying the source document

#### Scenario: Reject schema drift
- **WHEN** a package document uses an unsupported version or contains invalid content
- **THEN** validation fails with the package and field that must be corrected

### Requirement: Existing editorial surface is canonical
A published content package SHALL render at `/blog/[slug]` and SHALL relate to an existing hobby without creating a standalone video page.

#### Scenario: Publish content before video upload
- **WHEN** a valid package is published with no YouTube id
- **THEN** its canonical blog article is indexable, linked from its hobby context, and contains no empty video placeholder

### Requirement: YouTube enrichment is nullable and additive
The package SHALL keep YouTube publication fields nullable and SHALL enrich the same canonical article when a valid upload receipt supplies them.

#### Scenario: Apply a YouTube upload receipt
- **WHEN** a receipt supplies a valid YouTube id, URL, upload time, and optional thumbnail or chapters
- **THEN** the JSON package is updated, the article renders the player and matching structured data, and its blog URL enters the video sitemap

### Requirement: No dedicated video destination
The system SHALL NOT expose a standalone video library or canonical video watch page.

#### Scenario: Follow an old video URL
- **WHEN** a visitor requests the retired video index or a known video slug
- **THEN** the visitor is permanently redirected to the blog index or the canonical article

### Requirement: Legacy article compatibility
The editorial system SHALL resolve both legacy TypeScript articles and new JSON packages through the same blog index and detail experience.

#### Scenario: Browse during migration
- **WHEN** a visitor opens the Hobby Journal
- **THEN** legacy and package-backed articles appear without duplicate slugs or broken legacy pages

### Requirement: Source-backed visible content
Published packages SHALL include source records for factual claims and SHALL keep machine-readable summaries consistent with visible article content.

#### Scenario: Publish a factual guide
- **WHEN** a ready package contains factual or research claims
- **THEN** its article displays the relevant source links and its structured metadata does not introduce claims absent from the article
