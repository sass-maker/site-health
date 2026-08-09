## Purpose

Expose verified aggregate model usage as a privacy-safe public measure of how SaaS Maker products serve people around the world.

## ADDED Requirements

### Requirement: Fleet accepts authoritative daily snapshots

Fleet SHALL provide a guarded command that accepts one ISO-dated cumulative
snapshot containing lifetime tokens, tokens for that source day, and privacy-safe
project/geography aggregates. It MUST accept only values backed by
provider-reported or otherwise authoritative token records and MUST reject
negative, malformed, decreasing, duplicate-date-conflicting, or internally
inconsistent snapshots.

#### Scenario: Operator seeds a verified daily snapshot
- **WHEN** the operator supplies a valid snapshot newer than the current published snapshot
- **THEN** Fleet validates and writes the deterministic public projection

#### Scenario: Source contains estimates
- **WHEN** any submitted value is marked estimated or lacks authoritative provenance
- **THEN** Fleet rejects the snapshot without changing the published projection

#### Scenario: Lifetime total decreases
- **WHEN** a snapshot's lifetime total is lower than the previously published lifetime total
- **THEN** Fleet rejects the snapshot and preserves the previous projection

### Requirement: Token telemetry preserves visitor privacy

The seed contract MUST NOT accept prompts, completions, user identifiers, IP
addresses, precise coordinates, headers, cookies, or request bodies. It SHALL
accept only allowlisted country and coarse-locality labels that are already
safe for public aggregation.

#### Scenario: Payload contains forbidden fields
- **WHEN** an event contains content, identity, network, or precise-location fields
- **THEN** the service rejects the event without persisting any portion of it

#### Scenario: Geography is unavailable
- **WHEN** verified usage has no safe coarse geography
- **THEN** the operator includes it in the global total but excludes it from geographic and country aggregates

### Requirement: Public output is aggregate-only

The public snapshot SHALL expose lifetime tokens, tokens for its source day,
countries served, contributing projects, and bounded daily pulse buckets.
Each pulse bucket SHALL contain only an allowlisted project display name,
coarse locality label, rounded token total, and deliberately imprecise recency.
The public output MUST NOT expose raw events or exact request timestamps.

#### Scenario: Static site builds with current impact
- **WHEN** a verified public snapshot exists
- **THEN** the build contains the four headline measures and only privacy-safe daily pulse buckets

#### Scenario: A locality bucket is too sparse
- **WHEN** a project and locality combination does not meet the configured public aggregation floor
- **THEN** its tokens remain in global totals but the bucket is withheld or merged into a broader region

### Requirement: Public figures never imply estimated coverage

The system SHALL distinguish verified seeded usage from unavailable or partial
coverage and MUST NOT extrapolate or animate invented token values.

#### Scenario: No products have reported usage
- **WHEN** the public read model contains no verified events
- **THEN** the page presents an awaiting-data state instead of a fabricated counter

#### Scenario: Only some products contribute
- **WHEN** one or more maintained products have not integrated authoritative telemetry
- **THEN** the page identifies the figure as collected usage and reports only the actual contributing-project count

### Requirement: Globe communicates aggregate activity accessibly

The SaaS Maker homepage SHALL present “TOKENS SPENT FOR THE WORLD” as a
prominent chapter with an enormous monotonically non-decreasing lifetime
counter, a globe, the three supporting measures, and keyboard-accessible pulse
details. Motion MUST pause offscreen and MUST have a purposeful reduced-motion
state that preserves the same information.

#### Scenario: Page reveals the latest verified total
- **WHEN** the published snapshot contains previous and current verified lifetime totals
- **THEN** the displayed total remains at the current value from first paint and never rewinds or counts past it

#### Scenario: Visitor selects a pulse
- **WHEN** a visitor activates a visible pulse by pointer, touch, or keyboard
- **THEN** the page reveals its project, coarse locality, rounded tokens, and imprecise recency without exposing a person or exact request

#### Scenario: Visitor prefers reduced motion
- **WHEN** the operating system requests reduced motion
- **THEN** the globe remains static, counter changes are immediate, and pulse details remain fully usable

#### Scenario: Client scripting is unavailable
- **WHEN** JavaScript or Canvas cannot run
- **THEN** the statically rendered current totals and pulse disclosures remain readable without animation

### Requirement: Snapshot recency is explicit

The chapter SHALL show both the authoritative snapshot day and a visible
last-updated timestamp carried from the authoritative seed. Neither label SHALL imply live
request streaming.

#### Scenario: Daily seed is older than the current day
- **WHEN** the published snapshot has not been refreshed today
- **THEN** the visitor can still see exactly when the page projection was last built and which source day it represents
