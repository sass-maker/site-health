## ADDED Requirements

### Requirement: Public console shows the real Fleet Ops schedule set

The public console SHALL render the full machine-run Codex cron schedule set
from the Fleet Ops cron registry.

#### Scenario: User opens the console

- **WHEN** the console page loads
- **THEN** it shows each enabled Codex cron job from `jobs.tsv`
- **AND** it shows the job name, schedule, model, effort level, and lock window

### Requirement: Public console includes Wi-Fi Watch

The public console SHALL present Wi-Fi Watch as a Fleet Ops product using
public-safe summary telemetry.

#### Scenario: Wi-Fi data exists

- **WHEN** Wi-Fi Watch samples and events are present
- **THEN** the console shows health, latest Mbps, average Mbps, sample count,
  event count, recent incident count, and latest sample time
- **AND** it does not show SSID, local IP, gateway, DNS, MAC address, or raw
  diagnostic details

### Requirement: Console is usable on mobile

The console SHALL remain readable and operable on phone-sized screens.

#### Scenario: User views on a mobile viewport

- **WHEN** the viewport width is 390 CSS pixels
- **THEN** the layout stacks without horizontal scrolling
- **AND** controls, cards, and text remain legible without overlap

### Requirement: Console deploys to the internet

The console SHALL be buildable and served publicly through the machine-hosted
Cloudflare Tunnel.

#### Scenario: Release build runs

- **WHEN** `npm run build` runs in the app
- **THEN** Astro builds successfully
- **AND** static route HTML exists for overview, projects, project details, and
  connections

#### Scenario: User opens a public route

- **WHEN** the user opens `/`, `/projects`, `/projects/saas-maker`, or
  `/connections` through the public tunnel hostname
- **THEN** the local service returns the corresponding static page
- **AND** the page is read-only

### Requirement: Public console shows fleet project state

The public console SHALL show the state of each Fleet registry project using
public-safe data from catalog, tasks, audit, smoke, and local git summaries.

#### Scenario: User views all projects

- **WHEN** the projects page loads
- **THEN** it lists registered projects with state, lane, open task count, high
  priority task count, blocked task count, smoke status, and dirty file count
- **AND** cataloged projects that are not checked out locally are still visible

#### Scenario: User views a project detail page

- **WHEN** a project detail page loads
- **THEN** it shows repository/homepage links when available, current work,
  branch, workflow status, smoke status, task counts, and related connections
- **AND** it does not expose raw task descriptions, local absolute paths, raw
  logs, SSIDs, IPs, gateways, or credentials

### Requirement: Public console shows project connections

The public console SHALL show how Fleet Ops, SaasMaker, Wi-Fi Watch, and fleet
products connect operationally.

#### Scenario: User views the connections page

- **WHEN** the connections page loads
- **THEN** it shows typed edges for registry, control, telemetry, marketing,
  AI gateway, and active work relationships
- **AND** each edge links to the related project pages when those projects are
  represented in the console

### Requirement: Public snapshot refreshes automatically

The public console SHALL refresh its static snapshot on a fixed local schedule
while the machine is awake.

#### Scenario: Console service is started

- **WHEN** `scripts/agent-bin/ops-console start` runs
- **THEN** the local HTTP service starts
- **AND** a launchd refresh job rebuilds and republishes the static snapshot
  every 5 minutes
