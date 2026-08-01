# video-demo-gallery Specification

## Purpose
Define complete, portable, truthfully attributed preview coverage for every
selectable Marketing video variant.

## ADDED Requirements

### Requirement: Exact 48-variant coverage
The gallery SHALL contain exactly one primary playable demo and maker preset
for every stable recipe and variant pair and SHALL reject unknown, duplicate,
null, stale, or uncovered variant identifiers.

#### Scenario: Catalog and gallery agree
- **WHEN** coverage validation joins the catalog, gallery, and presets
- **THEN** all 48 stable variant identifiers have one exact playable demo and the validator succeeds

#### Scenario: Coverage drifts
- **WHEN** a variant is missing, duplicated, stale, or represented only by another variant's demo
- **THEN** validation fails with the exact identifier and Fleet Console shows a blocking catalog error instead of silently omitting it

### Requirement: Portable deterministic preview pack
The repository SHALL contain a compact rights-safe preview pack and the
repository-owned fixtures and command needed to regenerate it without provider
credentials, copyrighted commercial media, or hidden local files.

#### Scenario: Fresh clone opens the gallery
- **WHEN** normal install and local start commands run from a fresh clone
- **THEN** every catalog variant has a locally served playable preview without an additional download or provider login

#### Scenario: Media drifts
- **WHEN** a preview is missing, unreadable, outside the approved root, hash-mismatched, non-vertical, silent, or not a valid MP4
- **THEN** strict validation fails and reports the exact artifact

### Requirement: Truthful provenance and playback
Every gallery item SHALL identify fixture or real-proof posture, actual
renderer, source posture, spend posture, and evidence, and SHALL be served with
inline MP4 byte-range support from an approved registered path.

#### Scenario: Fixture demonstrates an optional runtime style
- **WHEN** the viewing machine lacks Blender, Grok, a local model, capture, or podcast sources
- **THEN** its committed preview remains playable and visibly labelled fixture rather than a live runtime proof

#### Scenario: Operator uses a style
- **WHEN** the operator chooses a gallery item
- **THEN** `/marketing` opens with that exact prompt preset, recipe, and variant selected

### Requirement: Reusable ordered style mixes
The gallery SHALL let the operator select two or three playable styles into an
ordered mix, identify the first as the base and later items as influences, and
carry the component variant IDs and generated prompt into `/marketing`.

#### Scenario: Operator builds a mix
- **WHEN** the operator adds two or three exact gallery styles and chooses to use the mix
- **THEN** `/marketing` opens with the ordered components visible and a mixed fixture action available

#### Scenario: Mix selection is invalid
- **WHEN** the selection contains fewer than two, more than three, duplicate, unknown, or unavailable component IDs
- **THEN** the gallery or execution boundary rejects it without changing the 48 exact single-style records
