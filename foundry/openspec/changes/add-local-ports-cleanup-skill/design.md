## Context

The installed `ports` 1.2.2 binary already discovers listening processes,
resolves projects, reports health and Docker ownership, and supports targeted
termination. Its commands have intentionally different safety profiles:
`ports clean` previews unhealthy processes and confirms, while `ports free`,
`ports kill`, and exact `ports kill-project` targets do not confirm.
`ports nuke` confirms but covers every visible development server.

The new skill must make those primitives easy for agents to use without
duplicating scanner logic or treating every listener as disposable. It is a
machine-local operational workflow; it must not touch production systems,
credentials, configuration, or repository dependencies.

## Goals / Non-Goals

**Goals:**

- Give agents a deterministic inspection-to-cleanup workflow using `ports`.
- Select the narrowest cleanup target supported by the evidence and request.
- Preserve healthy and unrelated listeners by default.
- Verify the requested target is released and report exactly what changed.
- Expose the workflow as a canonical Fleet standalone skill.

**Non-Goals:**

- Reimplementing port discovery, process classification, or termination.
- Changing the `port-whisperer` binary or its release process.
- Automatically killing every old, high-memory, Docker, database, or system
  process.
- Adding scheduled cleanup, background monitoring, or production automation.

## Decisions

### Keep the skill instruction-only

The skill calls the existing `ports` binary directly and adds no wrapper
script. The binary already owns parsing, exact project matching, graceful
SIGTERM with bounded SIGKILL fallback, and structured JSON output. A second
script would duplicate behavior and could drift from the installed tool.

The alternative was a Fleet-specific cleanup script over `lsof` and `ps`.
That would discard `ports` project, health, Docker, and timeout handling while
creating another destructive process-control surface.

### Use an evidence-first cleanup ladder

Each run starts by locating the binary and reading the filtered structured
inventory. The skill widens to `ports json --all` only when the requested target
is absent or the operator explicitly includes normally hidden listeners.
`ports doctor` is diagnostic and is used when scanning is slow, empty, or
otherwise suspect.

The mutation ladder is:

1. `ports clean` for unhealthy processes, retaining its preview and built-in
   confirmation.
2. `ports free <port...>` for operator-named ports after ownership is checked.
3. `ports kill-project <exact-name>` for an exact project returned by inventory.
4. `ports kill <pid...>` only when PID targeting is necessary and ownership is
   verified.
5. `--force`, `killall`, or `nuke` only when the operator explicitly requests
   that broader or forceful scope after seeing the candidates.

`ports run <cmd...>` remains a restart convenience, not the default cleanup
path, because it stops every listener whose working directory is below the
current project before replacing the agent process with the requested command.

### Fail closed on ambiguous healthy listeners

Age, memory use, and a familiar framework are evidence for review, not proof
that a listener is stale. When no unhealthy or explicitly named target exists,
the skill reports the inventory and leaves processes running. Docker services,
databases, system apps, and unrelated project listeners require explicit
operator scope even if they occupy a commonly used development port.

### Re-scan after mutation

After cleanup, the skill runs `ports json` again and checks every requested
port, PID, or project target. It reports stopped targets, targets still
listening, skipped healthy dependencies, and any failed or unverified action.
It never converts an empty or failed scan into a claim that cleanup succeeded.

## Risks / Trade-offs

- **Health and project classification are heuristic** → show candidate
  ownership before mutation and keep healthy ambiguous listeners running.
- **A port can be rebound immediately by a supervisor** → re-scan and report
  the new PID instead of claiming the original kill permanently freed it.
- **Filtered inventory can hide a requested system listener** → widen to
  `ports json --all` only for that target and retain the explicit-scope gate.
- **The binary may be missing or older than the documented surface** → inspect
  `ports --help` and stop without installing or substituting raw kill commands.
- **Built-in confirmation is inconvenient for automation** → preserve it for
  unhealthy or broad cleanup; do not pipe automatic approval into an
  unreviewed candidate list.

## Migration Plan

1. Add and validate the OpenSpec contract.
2. Initialize the standalone skill with canonical UI metadata.
3. Add the safety workflow and focused exposure/content tests.
4. Add the skill to `agent-stack.sh` and Fleet discovery documentation.
5. Install the managed local skill links and verify discovery.
6. Validate the skill, focused tests, OpenSpec change, and diff.

Rollback removes the skill from the exposed list and deletes its canonical
skill directory. No process state, stored data, dependency, or production
surface requires migration.

## Open Questions

None. Changes to `ports` behavior remain owned by the separate
`port-whisperer` repository.
