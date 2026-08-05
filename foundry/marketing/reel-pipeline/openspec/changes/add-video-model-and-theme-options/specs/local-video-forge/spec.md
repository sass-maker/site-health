## MODIFIED Requirements

### Requirement: Capability-aware leased execution

Workers SHALL advertise model-profile-specific capabilities, claim at most one
compatible task at a time, and receive a time-bounded lease. A task with Auto
selection SHALL resolve to one ready compatible profile and reveal that profile
before render confirmation. Only the lease owner SHALL update or complete the
task. An expired lease SHALL make the task reclaimable.

#### Scenario: Explicit profile is compatible
- **WHEN** an approved task selects a ready model profile and a worker advertises all of its required capabilities
- **THEN** that worker may claim the task and the task records the selected profile id and pinned revisions

#### Scenario: Explicit profile is unavailable
- **WHEN** a task selects a profile whose runtime, weights, memory, territory, or generation mode is incompatible
- **THEN** no worker claims it and readiness reports the exact blocker without installing anything

#### Scenario: Auto selects a profile
- **WHEN** a task requests Auto and more than one compatible ready profile exists
- **THEN** Forge ranks them from the saved brief priorities, returns the chosen profile and reason, and waits for render confirmation

### Requirement: Model setup is never implicit

Forge SHALL separate model setup from selection, brief saving, Auto resolution,
task submission, and render execution. Setup SHALL disclose the pinned source,
expected disk requirement, and host compatibility and SHALL require its own
operator confirmation.

#### Scenario: Operator inspects an uninstalled profile
- **WHEN** the operator selects Wan Remix or MiniMax H3 for inspection
- **THEN** Forge reports its blocker and setup metadata without downloading source or weights

#### Scenario: Render begins for a missing profile
- **WHEN** a confirmed render references a profile that is not ready
- **THEN** the task remains unclaimed and returns the setup blocker rather than starting an install

### Requirement: Durable render metadata

Every generated variant SHALL additionally record the selected model profile
id, selection mode and reason, supported generation mode, pinned model/runtime
revisions, theme pack id, content scope, and source-rights posture.

#### Scenario: Auto-selected render completes
- **WHEN** Forge completes a render after Auto selected LTX
- **THEN** the receipt records `ltx-2.3-mlx-q4`, the Auto reason, exact revisions, theme pack, and rights posture
