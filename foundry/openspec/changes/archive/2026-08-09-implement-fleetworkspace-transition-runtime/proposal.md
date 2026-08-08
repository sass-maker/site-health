## Why

Agent tool calls currently provide execution records but not durable, testable
predictions about how external state should change. FleetWorkspace needs one
narrow runtime slice that can preserve an attributable event timeline and prove
that it detects a GitHub side effect that contradicts a recorded prediction.

## What Changes

- Add an internal FleetWorkspace runtime component with an append-only JSONL
  event store and a readable timeline command.
- Define the minimum actor, workspace, run, observation, action, transition,
  mismatch, and intervention events with shared provenance fields.
- Add a hard-coded GitHub environment adapter for observing and creating marked
  issues through the existing authenticated GitHub CLI.
- Add a GitHub issue world program that grounds observations, predicts issue
  count transitions, verifies observed state, and records goal evidence or a
  localized duplicate-side-effect mismatch.
- Add deterministic tests and a recorded real-world experiment timeline for one
  successful transition followed by one deliberately unsafe retry.
- Keep deployment, multiplayer UI, generic plugins, repair, skill compilation,
  post-training, and production automation out of scope.

## Capabilities

### New Capabilities

- `verified-transition-runtime`: Append-only attributable execution, explicit
  transition prediction, external observation, mismatch localization, and
  readable replay for the initial GitHub issue workflow.

### Modified Capabilities

- `fleet-workspace-boundary`: Recognize the FleetWorkspace execution runtime as
  an internal Fleet-owned component without changing independent product
  boundaries or importing CodeVetter and PostTrainLLM source.

## Impact

- New component: `foundry/apps/internal/fleetworkspace-runtime/`.
- New OpenSpec requirements for the runtime and a narrow amendment to the
  existing Fleet Workspace boundary.
- GitHub-visible experiment: two deliberately matching issues may be created in
  `sass-maker/fleet-workspace`; both experiment issues will be closed after the
  mismatch is recorded, while issue `#245` remains the implementation tracker.
- No production dependencies, secrets, deployment configuration, migration, or
  release surface is introduced.
