## Context

Fleet Ops already has canonical filesystem homes for skills, scripts,
templates, and living documentation, but discovery is split between parent
skill routing tables, README tables, filenames, and prior knowledge. Existing
health commands validate particular systems; none exposes the operational
surface as one searchable contract for both humans and agents.

The implementation must remain local, read-only, dependency-free, and useful
from a fresh clone. Existing files remain authoritative: the catalog is a view
over them, not a second registry.

## Goals / Non-Goals

**Goals:**

- Discover the canonical Fleet Ops capability surface deterministically.
- Give humans and agents the same `list`, `search`, `get`, generated `context`,
  and catalog `doctor` behavior.
- Provide stable JSON envelopes, error codes, suggestions, and concise dense
  output.
- Make drift visible without executing a discovered capability or contacting an
  external service.

**Non-Goals:**

- Add an MCP server, web UI, daemon, package, or production runtime.
- Replace parent skills, health scripts, OpenSpec, or project registries.
- Index product source code, archived documentation, secrets, generated
  evidence, or user-profile skill directories.
- Define a shared visual component library or template playground.

## Decisions

### Derive the catalog from canonical files

The library will scan fixed roots under `foundry/ops/`: Fleet-owned and
teammate `SKILL.md` files, operator scripts, reusable templates, and living
Markdown documentation. It will exclude archives and generated output.

Each item will have a namespaced stable identifier, type, display name,
summary, repository-relative path, and searchable text. Skill frontmatter and
document headings supply metadata; deterministic filename-derived fallbacks
keep incomplete files discoverable.

This avoids a manually curated JSON registry that could drift from the files it
describes. A future explicit manifest can be layered on only if filesystem
metadata proves insufficient.

### Keep scanning and presentation separate

A standard-library module in `foundry/ops/lib/` will own discovery, ranking,
lookup, validation, and JSON-envelope helpers. A thin executable script will
own argument parsing, formatting, exit codes, and help text. Tests can exercise
the library against fixtures and the CLI against the real repository.

### Use a small stable command contract

The CLI will expose:

- `list` with an optional type filter;
- `search <query>` with simple deterministic token scoring;
- `get <id>` for exact retrieval;
- `context [query]` for generated agent-facing Markdown or dense output;
- `doctor` for read-only catalog validation.

All commands accept `--json`; result-producing commands accept `--dense`.
Successful JSON uses `{schemaVersion, ok, command, data, meta}`. Failures use
the same outer contract plus `{error: {code, message, suggestions}}`.

### Prefer transparent ranking over fuzzy dependencies

Search will normalize text and rank exact identifier/name matches, prefix
matches, token matches, and path/summary matches with fixed weights. Stable
identifier ordering breaks ties. This is sufficient for a local operational
catalog and avoids a search dependency or opaque embedding runtime.

### Scope doctor to catalog integrity

`doctor` will verify expected roots, item identifiers, required metadata,
duplicate identifiers, and referenced file existence. It will not invoke the
capabilities it discovers or subsume deployment, provider, or host health
checks.

## Risks / Trade-offs

- **Filename-derived script summaries can be generic** → Prefer available
  comments and usage text, keep paths searchable, and report metadata warnings
  without inventing a second registry.
- **A broad docs index can create noisy results** → Exclude archives and weight
  identifiers, names, and type matches above body/path text.
- **Filesystem conventions may evolve** → Centralize roots and validation in
  one module, with focused tests for deterministic behavior.
- **Users may mistake catalog doctor for system health** → Name and document it
  explicitly as catalog integrity validation.
- **Generated context can become long** → Default to concise metadata, support
  query/type filtering, and provide `--dense` output.

## Migration Plan

Add the read-only implementation, tests, and documentation without changing
existing commands. If the new surface is later removed, deleting its library,
script, tests, and docs restores the previous behavior; no data migration or
runtime rollback is required.

## Open Questions

None for the bounded first version. MCP exposure and explicit third-party
integration manifests remain possible follow-up work only after real usage
demonstrates value.
