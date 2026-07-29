## 1. Run store and contracts

- [x] 1.1 Add versioned run-envelope and numeric-observation validation with
  explicit source, capture-completeness, provenance, unit, and direction fields
- [x] 1.2 Add owner-only runtime-root creation, atomic immutable run writes,
  idempotency handling, bounded stream storage, hashing, and credential-pattern
  redaction
- [x] 1.3 Add rebuildable append-only run and metric indexes plus focused
  corruption and duplicate fixtures

## 2. Shared Fleet skill command

- [x] 2.1 Add an `agent-bin` command that wraps a child command, tees sanitized
  stdout/stderr, preserves its exit code, and records one completed run
- [x] 2.2 Add an explicit completion-receipt command for instruction-only hosts
  and accept optional structured metric input without parsing prose
- [x] 2.3 Add human and JSON `list`, `show`, `output`, `metrics`, `status`,
  `doctor`, `rebuild`, and dry-run-only prune commands

## 3. Host and skill integration

- [x] 3.1 Add a bounded Codex `Stop` hook adapter that detects Fleet skill
  instruction reads, records final-response output, and fails open on ambiguity
- [x] 3.2 Install the repo-owned Codex hook through the existing agent-stack
  workflow without overwriting unrelated user hooks
- [x] 3.3 Route future Fleet-mediated Codex and Devin teammate calls through the
  shared recorder so their actual command output is retained
- [x] 3.4 Add the explicit receipt requirement and coverage semantics to shared
  Fleet skill/operator guidance

## 4. Historical backfill

- [x] 4.1 Add an idempotent teammate-scorecard importer with stable row
  fingerprints and `summary-only` reconstructed output
- [x] 4.2 Backfill and verify exactly 27 Codex and 7 Devin historical runs,
  without manufacturing numeric metrics
- [x] 4.3 Verify a second import creates no duplicate runs or output artifacts

## 5. Metric-history proof

- [x] 5.1 Add a fixture skill run that emits stdout, stderr, and explicit domain
  rank and agent-score observations
- [x] 5.2 Verify project-scoped metric queries return ordered, unit-safe,
  direction-aware JSON suitable for future graphs
- [x] 5.3 Verify raw outputs and private metric history remain outside tracked
  Foundry data and public projections

## 6. Documentation and validation

- [x] 6.1 Document the local store, capture coverage, query examples, metric
  receipt format, retention behavior, and privacy boundary in Fleet Ops docs
- [x] 6.2 Run focused recorder, CLI, hook, backfill, redaction, and query tests
- [x] 6.3 Run capability/OpenSpec validation and `git diff --check`
- [ ] 6.4 Open a pull request linked with `Closes #63`; archive the OpenSpec
  change and update durable Fleet status only after implementation is accepted
