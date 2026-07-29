# skill-run-observability Specification

## Purpose

Define Fleet's private local evidence contract for skill executions, retained
outputs, and explicit numeric observations so operators can inspect history and
future project graphs can consume honest time series.

## Requirements

### Requirement: Durable private run envelope
Fleet Ops SHALL record each observed Fleet-owned skill execution as a versioned,
immutable, machine-local run envelope containing skill identity, project scope,
source, capture completeness, timing, status, output metadata, and an
idempotency key.

#### Scenario: Wrapped skill completes
- **WHEN** a command-backed Fleet skill finishes through the shared runner
- **THEN** one run envelope records its exact exit status, timing, project and
  skill identifiers, and retained-output references

#### Scenario: Duplicate receipt is submitted
- **WHEN** the same source idempotency key is recorded more than once
- **THEN** exactly one run remains in history and the duplicate is reported
  without changing the original record

### Requirement: Retained skill output
Fleet Ops SHALL retain sanitized skill output in owner-readable local artifacts
and SHALL record output hashes, byte counts, redaction counts, truncation state,
and capture completeness in the run envelope.

#### Scenario: Command emits stdout and stderr
- **WHEN** a wrapped skill writes to both streams
- **THEN** Fleet Ops preserves sanitized stdout and stderr separately while
  returning the child's original output and exit code to the caller

#### Scenario: Instruction-only skill finishes in Codex
- **WHEN** the Codex hook can identify a Fleet skill used during a completed turn
- **THEN** it retains the final assistant message as `final-response` output
  without claiming exact command-stream coverage

#### Scenario: Output contains a credential-shaped value
- **WHEN** retained output matches a supported credential-redaction pattern
- **THEN** the persisted artifact replaces the value, records a nonzero
  redaction count, and never writes the matched value to the run store

#### Scenario: Output exceeds the configured limit
- **WHEN** a skill produces more bytes than the per-stream storage limit
- **THEN** Fleet Ops stores a bounded head-and-tail artifact and marks the run
  as truncated

### Requirement: Structured numeric observations
Fleet Ops SHALL accept explicit versioned numeric observations linked to a run,
including metric name, finite value, optional unit, direction, project scope,
entity scope, observation time, and provenance.

#### Scenario: Domain rank is recorded
- **WHEN** a domain-ranking skill emits a structured rank observation
- **THEN** Fleet Ops stores the numeric value with `lower-is-better`, the domain
  entity, its unit, project, run id, and observation time

#### Scenario: Agent score is recorded
- **WHEN** an agent-evaluation skill emits a structured score observation
- **THEN** Fleet Ops stores the score and its declared scale/unit without
  translating unrelated verdicts into that scale

#### Scenario: Prose contains a number without a metric receipt
- **WHEN** skill output mentions a percentage, rank, or score but provides no
  structured observation
- **THEN** Fleet Ops retains the output but creates no numeric metric

### Requirement: Stable run and metric queries
Fleet Ops SHALL provide human-readable and stable JSON queries for run history,
individual retained outputs, and chronologically ordered project metric series.

#### Scenario: Query project score history
- **WHEN** a caller requests a project, skill, and metric in JSON mode
- **THEN** Fleet Ops returns ordered observations with schema version, value,
  unit, direction, entity scope, run id, and observation time

#### Scenario: Incompatible metric units exist
- **WHEN** observations share a name but declare different units or directions
- **THEN** the query preserves the distinctions and does not combine them into
  one implied series

### Requirement: Multiple honest capture paths
Fleet Ops SHALL distinguish wrapped command streams, Codex hook final responses,
Fleet-mediated Devin output, explicit host receipts, and historical backfills
through source and capture-completeness fields.

#### Scenario: Host cannot detect a skill automatically
- **WHEN** a Fleet skill runs on a host without the supported hook or wrapper
- **THEN** the skill protocol requires an explicit completion receipt and the
  resulting run identifies that source

#### Scenario: Hook parsing is ambiguous
- **WHEN** a Codex Stop hook cannot confidently identify a Fleet skill from its
  bounded transcript inspection
- **THEN** the hook exits without fabricating a run and does not interfere with
  the completed turn

### Requirement: Historical Codex and Devin backfill
Fleet Ops SHALL idempotently backfill the 27 Codex and 7 Devin delegations in
the checked-in teammate scorecard as reconstructed `summary-only` runs.

#### Scenario: Initial scorecard import
- **WHEN** the backfill command processes the current Fleet teammate scorecard
- **THEN** it creates exactly 34 run records with teammate, date, project/scope,
  task type, verdict, curated note output, source fingerprint, and
  `curated-summary` reconstruction confidence

#### Scenario: Backfill runs again
- **WHEN** the unchanged scorecard is imported a second time
- **THEN** no duplicate historical run or output artifact is created

#### Scenario: Historical row has no numeric score
- **WHEN** a scorecard row contains only a categorical verdict and note
- **THEN** the importer creates no numeric metric observation

### Requirement: Failure isolation and repair
Skill observability SHALL NOT change an underlying skill's exit status or block
its result, and the append-only query indexes SHALL be rebuildable from
canonical run directories.

#### Scenario: Recorder write fails
- **WHEN** output retention or index append fails after a skill executes
- **THEN** the caller receives the skill's original result plus a logging
  warning, and no partial run is presented as complete

#### Scenario: Query index is damaged
- **WHEN** doctor detects a missing or malformed index entry
- **THEN** Fleet Ops can rebuild indexes from valid immutable run envelopes

### Requirement: Private storage and explicit retention
Run envelopes, outputs, and metrics SHALL remain outside git and public
projections, use owner-only local permissions, report total storage usage, and
require an explicit dry-run-reviewed command before pruning.

#### Scenario: Public projection is generated
- **WHEN** Foundry builds the SaaS Maker public projection
- **THEN** no raw skill run, retained output, or private metric history is
  included

#### Scenario: Operator reviews disk usage
- **WHEN** the operator requests skill-run storage status
- **THEN** Fleet Ops reports run count, output bytes, oldest/newest run, and
  proposed prune impact without deleting data
