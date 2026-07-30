## ADDED Requirements

### Requirement: Installed ports tool preflight
The skill MUST use the installed `ports` CLI as its port and process authority,
MUST inspect its available command surface before cleanup, and MUST NOT install
or substitute another scanner or kill utility when `ports` is unavailable.

#### Scenario: Ports is installed
- **WHEN** an operator requests local port cleanup and `ports` is available
- **THEN** the skill verifies the command and uses its structured inventory
  before selecting any mutation

#### Scenario: Ports is unavailable
- **WHEN** the `ports` executable cannot be found or invoked
- **THEN** the skill reports the missing prerequisite and performs no process
  termination or package installation

### Requirement: Evidence-first inventory
The skill MUST inspect listener ownership, project, health, command, working
directory, and Docker metadata before stopping a process, and SHALL widen from
the default development inventory to all listeners only when the requested
target requires it.

#### Scenario: Unhealthy development process exists
- **WHEN** the default inventory identifies an orphaned or zombie development
  listener
- **THEN** the skill presents that listener as a cleanup candidate with its
  port, PID, project, health, and ownership evidence

#### Scenario: Requested listener is hidden by default
- **WHEN** an operator explicitly names a port that is absent from the filtered
  development inventory
- **THEN** the skill inspects the all-listener inventory for that exact target
  without broadening the cleanup scope

### Requirement: Narrowest authorized cleanup
The skill MUST select the narrowest `ports` command matching the operator's
request and verified ownership, MUST prefer graceful termination, and MUST NOT
use force kills, name-wide kills, or `ports nuke` without explicit operator
authorization for that scope.

#### Scenario: Clean unhealthy listeners
- **WHEN** the operator requests general stale-port cleanup and unhealthy
  listeners are present
- **THEN** the skill uses `ports clean`, preserves its candidate preview and
  confirmation, and does not target healthy listeners

#### Scenario: Free an exact port
- **WHEN** the operator names a port and its listener ownership is verified
- **THEN** the skill uses `ports free` for that port only and leaves other
  listeners unchanged

#### Scenario: Clean an exact project
- **WHEN** the operator names a project that exactly matches inventory
- **THEN** the skill may use `ports kill-project` for that exact project and
  does not use a partial or inferred project name

#### Scenario: Broad cleanup is not explicit
- **WHEN** the request does not explicitly authorize force, process-name-wide,
  or all-development-server cleanup
- **THEN** the skill does not pass `--force`, invoke `ports killall`, or invoke
  `ports nuke`

### Requirement: Healthy dependency preservation
The skill MUST preserve healthy Docker services, databases, system listeners,
and unrelated project processes unless the operator explicitly names the
target after its ownership is shown.

#### Scenario: Healthy database shares the development inventory
- **WHEN** cleanup candidates include an unhealthy application server and a
  healthy database or container
- **THEN** the skill stops only the unhealthy application server and reports
  the healthy dependency as preserved

#### Scenario: No safe candidate exists
- **WHEN** every discovered listener is healthy and the operator has not named
  an exact target
- **THEN** the skill reports that no safe automatic cleanup target was found
  and leaves every listener running

### Requirement: Post-cleanup verification
The skill MUST re-scan after mutation and MUST report stopped, still-listening,
skipped, failed, and unverified targets without treating a failed or empty scan
as proof of success.

#### Scenario: Port is released
- **WHEN** the requested port no longer appears in the post-cleanup inventory
- **THEN** the skill reports the port released and identifies the process that
  was stopped

#### Scenario: Supervisor rebinds the port
- **WHEN** the requested port appears after cleanup with a new PID
- **THEN** the skill reports the rebound listener and does not claim the port
  remains free

#### Scenario: Diagnostic scan is unhealthy
- **WHEN** `ports doctor` reports a failed scanner prerequisite or the
  post-cleanup scan cannot be trusted
- **THEN** the skill reports cleanup as unverified and surfaces the diagnostic
  guidance without escalating to raw system kill commands
