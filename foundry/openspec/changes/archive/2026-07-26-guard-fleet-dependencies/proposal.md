## Why

Fleet policy discourages unnecessary packages, but the current protection is
split between agent instructions, project-specific Knip adoption, and manual
review. A dependency can still enter through a manifest or lockfile edit
without a consistent pre-install necessity check or a deterministic
cross-ecosystem change report.

## What Changes

- Add a standalone Fleet-owned `guard-dependencies` skill that triggers before
  agents add, replace, upgrade, or remove packages.
- Add a zero-production-dependency guard that detects changed dependency
  manifests and lockfiles, reports structured direct npm dependency deltas,
  and requires manual review for other supported ecosystems.
- Add an optional Bundlephobia lookup for exact browser npm package versions;
  keep remote size evidence advisory and never make service availability a
  merge gate.
- Run the guard against one repository or every local Fleet repository without
  modifying manifests, lockfiles, working trees, or provider state.
- Reuse Knip as the post-change unused-dependency authority rather than adding
  a competing dead-code tool.

## Capabilities

### New Capabilities

- `fleet-dependency-discipline`: Pre-install dependency review, deterministic
  manifest/lockfile change detection, browser bundle-cost evidence, and
  read-only Fleet-wide reporting.

### Modified Capabilities

None.

## Impact

- Adds one standalone skill, one standard-library Node script, focused tests,
  skill exposure wiring, and compact Fleet documentation updates under
  `foundry/ops/`.
- Reads git history, tracked manifests, lockfiles, and the Fleet project
  registry; optional Bundlephobia requests send only an npm package specifier.
- Adds no production package, install hook, dependency mutation, CI workflow,
  deployment, migration, credential access, or production configuration
  change.
