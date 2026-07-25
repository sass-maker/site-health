## Why

Fleet's operational capabilities are spread across skill frontmatter, scripts,
templates, and documentation, so humans and agents must already know a path or
parent router before they can discover the right tool. A small, read-only
catalog can make the existing system searchable and machine-readable without
introducing another runtime, dependency, or source of operational authority.

## What Changes

- Add a dependency-free Fleet capability catalog that discovers existing
  skills, operator scripts, reusable templates, and living documentation from
  their canonical `foundry/ops/` paths.
- Add one CLI with `list`, `search`, `get`, `context`, and `doctor` commands.
- Support concise human output plus stable `--json` envelopes and token-efficient
  `--dense` output for agents.
- Generate agent-facing context from the same live catalog used by CLI search.
- Validate duplicate identifiers, unreadable metadata, and missing catalog
  roots without modifying the workspace.
- Document the discovery command and cover its contract with focused Node tests.
- Do not add an MCP server, UI, package dependency, product catalog, or
  production integration.

## Capabilities

### New Capabilities

- `fleet-capability-discovery`: Read-only discovery, retrieval, generated
  context, and validation of canonical Fleet operational capabilities.

### Modified Capabilities

None.

## Impact

- Adds a small library and CLI under `foundry/ops/`, plus focused tests and
  operational documentation.
- Reads existing skill metadata and repository files; it does not change skill
  routing, execute discovered commands, or alter production behavior.
- Uses only Node.js standard-library APIs and the repository's existing native
  test runner.
