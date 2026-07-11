# fleet-ops-public-console Specification

## Purpose
TBD - created by archiving change ops-console-live-status. Update Purpose after archive.
## Requirements
### Requirement: Public snapshot refreshes every minute

The public console SHALL rebuild and republish its static snapshot every minute
while the host Mac is awake.

#### Scenario: Console service is started

- **WHEN** `scripts/agent-bin/ops-console start` runs
- **THEN** the local HTTP service starts
- **AND** a launchd refresh job rebuilds and republishes the static snapshot
  every 60 seconds

### Requirement: Public console shows visible freshness

The public console SHALL show when the currently served snapshot was generated.

#### Scenario: User opens a console page

- **WHEN** the overview, projects, connections, or project detail page loads
- **THEN** the page shows a visible "Last updated" timestamp in Asia/Kolkata
- **AND** it states the refresh cadence

### Requirement: Public console exposes richer project intelligence

The public console SHALL provide enough public-safe project context to understand
state, work, source, and relationships without opening a repo.

#### Scenario: User views project listings

- **WHEN** the projects page loads
- **THEN** each project row shows state, lane, tier, local checkout state, branch,
  dirty file count, smoke status, workflow status, open/high/blocked/done task
  counts, and last task update

#### Scenario: User views a project detail page

- **WHEN** a project detail page loads
- **THEN** it shows source links, local checkout state, branch/dirty status,
  task summaries, smoke/workflow status, related connections, and recent open
  work
- **AND** it does not expose raw logs, secrets, local absolute paths, SSIDs, IPs,
  gateway data, or credentials

