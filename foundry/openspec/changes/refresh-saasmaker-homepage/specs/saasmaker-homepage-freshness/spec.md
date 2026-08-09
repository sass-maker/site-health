## Purpose

Keep SaaS Maker's homepage current and make editorial learning feel intentional
without exposing private Fleet state.

## ADDED Requirements

### Requirement: Homepage product truth comes from the canonical public projection

SaaS Maker SHALL derive maintained-product counts, groups, links, and past work
from Fleet's privacy-checked public projection. It MUST NOT publish uncommitted
workspace state, private repositories, internal milestones, or inferred product
status as “latest.”

#### Scenario: Fleet's public projection is current
- **WHEN** the homepage builds
- **THEN** its catalog count and entries match the checked public projection

#### Scenario: Local registry edits are unpublished
- **WHEN** the Fleet workspace contains dirty or private project changes
- **THEN** the SaaS Maker build continues using the last validated public projection

### Requirement: SaaS Maker records current shipped changes

The product-owned changelog SHALL list meaningful public SaaS Maker releases in
reverse chronological order with a date, summary, and concrete shipped changes.

#### Scenario: Token-world chapter has shipped
- **WHEN** a visitor opens the SaaS Maker changelog
- **THEN** the visitor can find a dated entry describing the verified token ledger, Three.js globe, recency, and fallbacks

### Requirement: Latest learning is an editorial chapter

The homepage SHALL present the latest published learning as a distinct
full-width editorial chapter after the maintained catalog, not as a sidebar or
category attached to catalog rows. It SHALL expose the article title,
description, publication date, reading time, and one clear reading action.

#### Scenario: Visitor finishes scanning products
- **WHEN** the maintained catalog ends
- **THEN** a visually distinct learning chapter provides the next editorial step without looking like another product group

#### Scenario: Homepage is narrow
- **WHEN** the viewport is mobile-sized
- **THEN** the learning metadata and action remain readable in source order without horizontal overflow
