# Mashup Media Handoff

## Purpose

Defines a narrow, versioned boundary through which independent Mashup outputs
may be consumed by other Fleet products without sharing runtime internals or
mutable state.

## Requirements

### Requirement: Mashup emits a self-describing media receipt

Mashup SHALL emit a versioned receipt beside each completed media artifact
containing artifact identity, source and output hashes, duration, dimensions,
captions when present, rights and provenance references, recipe identity,
model/runtime revisions, approval state, and validation evidence.

#### Scenario: Complete an approved edit

- **WHEN** Mashup finishes an approved edit
- **THEN** it emits a playable artifact and a receipt sufficient for an external consumer to verify and describe the output without reading Mashup's database

### Requirement: Consumers treat Mashup as external

A consuming product SHALL accept only finished media and validated receipts and
MUST NOT import Mashup modules, invoke Mashup through relative source paths,
read its database, or depend on its model and cache directories.

#### Scenario: Mashup source is unavailable

- **WHEN** a consumer receives a valid artifact and receipt but does not have the Mashup source tree
- **THEN** it can ingest the artifact without degraded behavior

#### Scenario: Receipt is incomplete

- **WHEN** a consumer receives a missing, unsupported, or hash-mismatched receipt
- **THEN** it rejects the handoff with an actionable validation error

### Requirement: Handoff does not imply product relevance

Reel Pipeline and Local AI Video Studio SHALL NOT surface Mashup as an embedded
feature merely because they can consume its output. Product navigation and
capability catalogs SHALL include Mashup only when an explicit user workflow
requires that independent product.

#### Scenario: Browse Reel Pipeline capabilities

- **WHEN** no Mashup artifact has been supplied
- **THEN** Reel Pipeline does not advertise or attempt to execute Mashup planning
