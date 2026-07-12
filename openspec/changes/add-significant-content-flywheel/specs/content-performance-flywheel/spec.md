## ADDED Requirements

### Requirement: Variant-level performance attribution
Metrics SHALL be stored against the exact package id, revision, variant id, provider, and external post id that produced them.

#### Scenario: Collect YouTube metrics
- **WHEN** Reel Pipeline fetches metrics for a sourced upload
- **THEN** its metrics receipt can be applied without guessing which content package or hook generated the result

### Requirement: Comparable performance report
The system SHALL produce a machine-readable report that compares variants on available reach, retention/watch-time, and engagement metrics while identifying missing or incomparable data.

#### Scenario: Rank a multi-variant test
- **WHEN** at least two variants for a package have comparable metrics
- **THEN** the report identifies the leading hook/format and includes the evidence window used

### Requirement: Follow-up brief generation
Performance output SHALL be able to generate a follow-up brief containing the winning pattern, losing pattern, audience signal, and suggested questions for deeper content.

#### Scenario: Feed reels back into content
- **WHEN** a variant materially outperforms its siblings
- **THEN** OpenClaw can create a new draft package or draft variants that cite the observed pattern and source metrics

### Requirement: Metrics cannot rewrite published truth
Performance feedback SHALL NOT automatically change published article claims, sources, lifecycle state, or variant approval.

#### Scenario: Receive a viral result
- **WHEN** a reel receives unusually high reach
- **THEN** the result may create a follow-up draft but cannot mutate or publish canonical content without the normal validation and approval path
