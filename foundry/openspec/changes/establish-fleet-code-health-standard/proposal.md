## Why

Fleet has useful repository-native checks, Knip adoption, dependency review,
and a lint-parity report, but it cannot currently answer whether every
maintained code project has complete quality coverage or whether complexity,
duplication, dead code, coverage, and other maintainability signals are
regressing. A single cross-ecosystem standard is needed so missing evidence is
visible, legacy debt is ratcheted instead of normalized, and “clean” means the
same thing across the Fleet without forcing one language's tools onto another.

## What Changes

- Add a durable Fleet Code Health Standard covering scope, applicability,
  blocking gates, no-regression ratchets, scheduled trend signals, exceptions,
  and normalized evidence states.
- Add a deterministic, read-only Fleet audit that joins the canonical project
  registry to repository-native evidence and reports `pass`, `fail`, `warning`,
  `unavailable`, `not-applicable`, and `excluded` without installing tools or
  mutating inspected repositories.
- Define ecosystem profiles for JavaScript/TypeScript, Python, Rust, Go,
  Swift/native, mixed-language, and content/config-only projects while keeping
  repository-local commands authoritative.
- Establish the initial blocking contract for format, lint, compiler/type,
  tests, unused code, cognitive complexity, duplication, coverage,
  dependency risk, cycles, suppressions, and repository hygiene when
  applicable.
- Use baseline-and-ratchet enforcement for existing debt: new projects meet
  the target floor, maintained projects cannot regress, and exceptions require
  an owner, reason, GitHub issue, and review date.
- Correct Fleet-wide quality scope so lifecycle `past`, parked, out-of-fleet,
  and non-product identities are excluded explicitly rather than scanned or
  counted as healthy.
- Emit stable JSON plus a decision-first human report suitable for local use,
  CI, scheduled evidence, and future Fleet Console projection.
- Improve small, unambiguous Fleet-owned quality gaps found during acceptance;
  preserve independent repository work and record larger repository-owned debt
  in GitHub Issues instead of mass rewriting projects.
- After the Fleet-level standard and inventory are established, adopt and
  improve projects sequentially in owner-priority order with at most one
  independent project mutation active at a time.

## Capabilities

### New Capabilities

- `fleet-code-health`: Cross-ecosystem quality profiles, normalized health
  evidence, blocking and advisory signals, legacy-debt ratchets, exceptions,
  and deterministic Fleet-wide reporting.

### Modified Capabilities

- `fleet-dependency-discipline`: Restrict Fleet-wide dependency and quality
  enforcement to maintained in-Fleet projects and report excluded lifecycle
  identities consistently.
- `fleet-lint-standardization`: Move from pilot-only parity evidence to a
  standard consumed by the broader code-health contract while preserving
  explicit ecosystem-native divergences.

## Impact

- Adds Fleet-owned policy, configuration, standard-library Node tooling, and
  focused tests under `foundry/ops/`.
- Extends the existing cleanup and lint-parity concepts without adding a
  production or development dependency.
- Reads project manifests, native configuration, and git metadata only; it
  does not install packages, execute write-mode formatting, delete findings,
  deploy, migrate, access credentials, or alter production configuration.
- May identify follow-up work in independent repositories; those changes stay
  isolated in their own clean worktrees and issue/PR scopes and are completed
  one project at a time.
- Updates Fleet agent guidance and durable project status when the capability
  ships.
