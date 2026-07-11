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

The console SHALL be buildable and deployable through Sites.

#### Scenario: Release build runs

- **WHEN** `npm run build` runs in the app
- **THEN** Astro builds successfully
- **AND** `dist/server/index.js` exists for Sites packaging

