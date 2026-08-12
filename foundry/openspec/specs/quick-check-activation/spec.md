# quick-check-activation Specification

## Purpose
Gets browser-controller users to useful local performance evidence quickly while preserving a clear path to psi-swarm's full distributional measurement.
## Requirements
### Requirement: Quick check is a first-class run path
The browser controller SHALL offer a Quick check action that runs exactly two serial audits with the desktop preset against the entered URL.

#### Scenario: User starts a quick check
- **WHEN** a connected user enters a URL and activates Quick check
- **THEN** the controller starts two serial desktop audits without requiring the user to configure run count, preset group, or parallelism

#### Scenario: User submits the URL field from the keyboard
- **WHEN** a connected user enters a valid URL and submits the run form with Enter
- **THEN** the controller starts the same two-run Quick check

#### Scenario: User has not entered a URL
- **WHEN** the URL field is empty
- **THEN** the Quick check and full swarm actions remain unavailable

### Requirement: Quick evidence is labeled honestly
The controller MUST label Quick check output as directional evidence and MUST NOT present it as a statistically stable percentile distribution.

#### Scenario: Quick check completes
- **WHEN** both quick-check audits finish successfully
- **THEN** the result overview identifies the run as a directional desktop check and reports the sample size

#### Scenario: Quick check contains a failed audit
- **WHEN** one or more quick-check audits fail
- **THEN** the progress and result surfaces expose the failure count rather than silently treating the run as complete evidence

### Requirement: Full swarm remains the confirmation path
The browser controller SHALL preserve a full swarm action that runs five serial audits for each preset in the PSI group and SHALL offer it directly after a quick check.

#### Scenario: User starts a full swarm from the form
- **WHEN** a connected user activates Full swarm
- **THEN** the controller starts five serial audits for the PSI preset group

#### Scenario: User confirms a quick result
- **WHEN** a quick check has completed and the user activates Confirm with full swarm
- **THEN** the controller starts the full swarm against the same URL

### Requirement: Advanced controls remain available
The browser controller SHALL retain custom run count, preset group, parallelism, and comparison tag controls behind progressive disclosure.

#### Scenario: Experienced user opens advanced settings
- **WHEN** the user expands advanced settings
- **THEN** the existing custom controls are available with their current values and constraints

#### Scenario: User starts a custom swarm
- **WHEN** the user changes advanced settings and activates Run custom swarm
- **THEN** the controller starts a run using those selected values

### Requirement: Result overview uses standard signals
The controller SHALL place a compact result overview before detailed evidence using measured Lighthouse metrics and standard CWV-style thresholds, without adding a proprietary composite score. Quick checks SHALL show observed medians without tail percentile tables; full and custom swarms SHALL retain the detailed percentile tables.

#### Scenario: Quick-check results are available
- **WHEN** aggregation completes for a quick check
- **THEN** the controller shows observed median LCP, CLS, TBT, and TTFB, identifies the two-run sample as directional, and omits p75, p90, and p99 tables

#### Scenario: Full or custom swarm results are available
- **WHEN** aggregation completes for a full or custom swarm with at least one successful preset
- **THEN** the controller identifies the slowest measured preset by p75 LCP and shows its p75 LCP, CLS, TBT, and TTFB before the detailed percentile tables

#### Scenario: No successful metric aggregation is available
- **WHEN** all audits fail or primary metrics are absent
- **THEN** the controller omits the overview and preserves the existing error and progress evidence

### Requirement: Run inputs prevent invalid requests
The controller MUST validate that the target is an HTTP or HTTPS URL and MUST constrain custom run counts to the supported range of 1 through 200 before starting a run.

#### Scenario: URL is invalid
- **WHEN** the entered target is empty, malformed, or uses a non-HTTP protocol
- **THEN** all run actions remain unavailable and an inline URL recovery message is available beside the field

#### Scenario: Custom run count exceeds the supported range
- **WHEN** a user enters a custom run count below 1 or above 200
- **THEN** the controller clamps the value into the supported range before a run can start

### Requirement: Interrupted runs remain recoverable
The controller MUST stop observing an interrupted run, return to the run form, and identify how the user can retry.

#### Scenario: Local-agent completion polling fails
- **WHEN** the local agent becomes unavailable or reports an error before completion
- **THEN** the controller returns to the run form and presents an alert that directs the user to check the local agent and retry

### Requirement: Execution remains local-first
Quick check and full swarm execution MUST use the existing local psi-swarm agent and MUST NOT send the audited URL or results to a new hosted service.

#### Scenario: User runs either activation path
- **WHEN** Quick check or Full swarm is activated
- **THEN** the browser uses the connected local-agent API and the existing local persistence behavior
