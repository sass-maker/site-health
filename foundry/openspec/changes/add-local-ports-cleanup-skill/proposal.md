## Why

Local development servers are easy to leave behind, but cleanup commands can
also stop healthy databases, containers, or another active project. Fleet needs
a discoverable, safety-first workflow that uses the existing `ports` CLI
without adding another process scanner or kill utility.

## What Changes

- Add a standalone `$local-ports-cleanup` skill for local port inspection,
  diagnosis, targeted cleanup, and post-cleanup verification.
- Require a read-only inventory before any process is stopped and use the
  narrowest `ports` command that matches the operator's request.
- Prefer graceful termination and exact unhealthy, port, PID, or project
  targets; treat force kills, name-wide kills, and `ports nuke` as exceptional
  actions requiring explicit scope.
- Preserve healthy system listeners, Docker services, databases, and unrelated
  projects unless the operator names them.
- Expose the skill through the canonical Fleet agent stack and capability
  discovery surfaces.

## Capabilities

### New Capabilities

- `local-ports-cleanup`: Safe inspection, diagnosis, targeted cleanup, and
  verification of local development ports through the installed `ports` CLI.

### Modified Capabilities

None.

## Impact

- Adds one Fleet-owned instruction-only skill and its UI metadata under
  `foundry/ops/skills/`.
- Updates Fleet skill exposure, standards, and focused tests.
- Uses the existing machine-local `ports` binary; adds no package, production
  dependency, service, deploy, migration, credential access, or production
  configuration change.
- Does not modify the `port-whisperer` repository or automatically stop
  processes merely because the skill is loaded.
