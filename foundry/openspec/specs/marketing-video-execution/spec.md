# marketing-video-execution Specification

## Purpose

Define one truthful Reel Pipeline execution boundary for all Marketing video
variants.

## Requirements

### Requirement: External editorial products remain decoupled

Reel Pipeline SHALL NOT import, spawn, configure, or own the Mashup editorial
runtime. It MAY ingest a finished Mashup media artifact only through the
versioned media-handoff contract and SHALL treat it as an external source with
verified provenance.

#### Scenario: Execute without Mashup installed

- **WHEN** Mashup is absent from the workspace
- **THEN** Reel Pipeline's catalog, validation, fixture execution, and supported real adapters continue to operate

#### Scenario: Ingest finished Mashup media

- **WHEN** an operator supplies a valid Mashup artifact and matching receipt
- **THEN** Reel Pipeline may use the artifact as source media without reading Mashup state or invoking its planner

#### Scenario: Request podcast planning inside Reel Pipeline

- **WHEN** an operator requests a Mashup planning operation from Reel Pipeline
- **THEN** Reel Pipeline reports that the workflow belongs to the independent Mashup product and performs no hidden subprocess execution

### Requirement: Versioned execution envelope

Every stable catalog variant SHALL resolve through one versioned execution
contract accepting a saved brief, exact variant, explicit inputs, and `fixture`
or `real` mode and returning normalized status, owner, artifact, provenance,
quality, evidence, and blocker fields.

#### Scenario: Adapter completes

- **WHEN** a registered adapter produces a valid MP4
- **THEN** the envelope records the stable variant ID, execution mode, owner, playable artifact, owner manifest, hashes, and validation evidence

#### Scenario: Fixture is requested

- **WHEN** execution mode is `fixture`
- **THEN** the adapter returns the exact committed rights-safe preview and marks it fixture-derived without claiming the optional production runtime ran

#### Scenario: Mixed fixture is requested

- **WHEN** execution mode is `fixture` with two or three ordered registered component variants
- **THEN** the compositor returns a playable mixed MP4 and a receipt containing the base, influences, component hashes, renderer, and `mix` posture

#### Scenario: Real runtime is unavailable

- **WHEN** execution mode is `real` and its runtime or required source is absent
- **THEN** execution fails with an actionable blocker and does not substitute or relabel a fixture as real output

### Requirement: Complete adapter and input registry

The catalog, adapter registry, input schema registry, maker presets, and gallery
SHALL share the same stable recipe and variant identifiers.

#### Scenario: Variant contract is incomplete

- **WHEN** a stable variant lacks an adapter, input schema, exact preset, or exact demo
- **THEN** validation fails with the missing contract surface before shipping

### Requirement: Rights-safe real inputs

Real execution SHALL constrain local paths to approved roots and SHALL require
the owning runtime's source, rights, and provenance evidence before processing.

#### Scenario: Commercial lyric package is supplied

- **WHEN** local audio, verbatim timed lyrics, attribution, separate composition and master rights assertions, and evidence are supplied
- **THEN** the lyric adapter may render and records input hashes without copying the commercial source package into Git

#### Scenario: Only a title or streaming URL is supplied

- **WHEN** the input is only a commercial song title, YouTube URL, or streaming-service URL
- **THEN** execution remains blocked and no downloader or lyric retrieval is invoked

#### Scenario: Approved provider or capture input is supplied

- **WHEN** Grok media, guided-demo capture, podcast sources/EDL, or another private source is supplied beneath an approved root with required evidence
- **THEN** the owning adapter may execute while preserving its native manifest and receipt
