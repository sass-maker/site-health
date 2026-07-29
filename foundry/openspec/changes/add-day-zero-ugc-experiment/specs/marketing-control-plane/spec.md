## MODIFIED Requirements

### Requirement: End-to-end stage visibility
The marketing page SHALL show foundation, queued, approved, produced,
published, and measured state per canonical project. For an active Day 0 UGC
experiment it SHALL additionally show elapsed experiment time, creator count,
weekly cadence, executions per format, breakout evidence, review debt, and one
bounded next action without exposing creator credentials or private contract
terms.

#### Scenario: Inspect a Day 0 UGC experiment
- **WHEN** the operator opens `/marketing` for the pilot project
- **THEN** the project shows product qualification, current positioning, format repetitions, cross-creator results, signal band, blocker, and next action
