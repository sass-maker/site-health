## Why

Fleet currently has a dependency-diff guard, project-specific Knip commands,
and uneven lint/typecheck/test/check coverage, but an operator must discover and
run them separately. A single cleanup entrypoint can make the existing tools
useful together without adding another analyzer or automatically deleting code.

## What Changes

- **BREAKING**: Rename the standalone `$guard-dependencies` skill to
  `$code-cleanup` and update Fleet skill exposure, policy, documentation, and
  UI metadata.
- Preserve the read-only dependency manifest/lockfile comparison and exact npm
  direct-dependency delta behavior.
- Add a one-command repository cleanup runner that auto-discovers and executes
  project-native Knip, aggregate checks or focused format/lint/typecheck/test
  scripts, and `git diff --check`.
- Continue after individual check failures and emit one decision-first human or
  JSON report with pass, fail, unavailable, and skipped states.
- Accept explicitly confirmed public browser npm package specifiers for
  advisory Bundlephobia analysis in the same run.
- Never install packages, run write-mode formatters, remove code, edit
  manifests, or send unconfirmed/private package names to remote services.
- Report missing cleanup coverage so the operator can distinguish a clean run
  from a repository that lacks Knip or project-native checks.

## Capabilities

### New Capabilities

- `fleet-code-cleanup`: Read-only orchestration of dependency review, unused
  code/dependency analysis, project-native quality checks, whitespace
  validation, and advisory browser package evidence.

### Modified Capabilities

- `fleet-dependency-discipline`: Move the existing dependency-review behavior
  under the renamed `$code-cleanup` skill and allow explicit Bundlephobia
  candidates to participate in the combined run.

## Impact

- Renames one Fleet-owned skill directory and its local exposure links.
- Extends the existing standard-library Node CLI and focused tests; adds no
  production or development dependency.
- Updates Fleet root instructions, operational standards, discovery
  documentation, and OpenSpec contracts.
- Runs repository-native commands that already exist but performs no install,
  deploy, migration, credential access, production configuration change, or
  automatic cleanup mutation.
