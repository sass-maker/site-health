## ADDED Requirements

### Requirement: One daily learning queue
The system SHALL build one daily queue from a fresh High Signal briefing, due spaced-repetition reviews, continued work, and a selected durable learning item.

#### Scenario: Start today's session
- **WHEN** the learner starts the default daily session
- **THEN** the queue presents at most one fresh briefing, all selected due reviews, and one durable next item

### Requirement: Source and track choice
The learner MUST be able to choose any approved source, project, or track and start a learning session from that scope.

#### Scenario: Choose research path
- **WHEN** the learner filters to a research-paper path and starts an item
- **THEN** the learning session uses that item while preserving its path and paper provenance

#### Scenario: Sprint one project
- **WHEN** the learner starts Sprint mode for a project or research path
- **THEN** each completed item offers the next item from the same source until that source is exhausted

### Requirement: Reuse existing learning tools
External learning items SHALL support the existing SWE notes, artifacts, Playground, MCQ runner, progress, and spaced-repetition feedback controls where applicable.

#### Scenario: Complete an external item
- **WHEN** the learner completes an MCQ and records an explanation for a Reader article
- **THEN** progress and review state are recorded against the external learning-item ID without modifying the Reader source

### Requirement: Unified progress without merged content
The system SHALL aggregate completion, streak, review-due, and track progress across native and external items while retaining source-level breakdowns.

#### Scenario: View progress
- **WHEN** the learner opens Progress
- **THEN** totals include all learning sources and can be segmented by source and track
