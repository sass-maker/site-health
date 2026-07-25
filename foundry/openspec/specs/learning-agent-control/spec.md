# learning-agent-control Specification

## Purpose

Define idempotent Fleet learning commands, nightly refresh, Telegram control, and sanitized visibility.

## Requirements

### Requirement: Idempotent learning commands
Fleet Ops SHALL provide idempotent commands to sync the catalog, show today's queue, start an item, report status, and mark a session complete.

#### Scenario: Repeated sync
- **WHEN** OpenClaw runs catalog sync twice without source changes
- **THEN** the second run produces no semantic catalog changes or duplicate items

### Requirement: Nightly source refresh
Fleet Ops SHALL run a deterministic nightly catalog refresh that reads approved project documents, research paths, High Signal, and Reader's export contract without invoking a language model.

#### Scenario: Nightly refresh
- **WHEN** the 02:15 machine-local cron runs
- **THEN** the source registry is regenerated, validated, and committed only when semantic source data changed

### Requirement: Telegram learning control
The owner SHALL be able to ask OpenClaw for today's learning queue, choose an item, and receive a deep link to the SWE learning surface.

#### Scenario: Start from Telegram
- **WHEN** the owner selects a learning item in Telegram
- **THEN** OpenClaw records the selection and returns a link that opens the matching item in SWE Interview Prep

### Requirement: Sanitized Fleet visibility
The Fleet website SHALL expose a learning entry point and aggregate status without exposing private saved URLs, notes, answers, or source bodies.

#### Scenario: Public dashboard view
- **WHEN** an unauthenticated visitor views Fleet status
- **THEN** the dashboard may show sync freshness and aggregate counts but no private learning content
