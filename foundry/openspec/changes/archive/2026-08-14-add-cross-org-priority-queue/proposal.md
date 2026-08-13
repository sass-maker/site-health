## Why

Sarthak's open authored issues are spread across many repositories and GitHub organizations, while the global Issues dashboard cannot express a stable owner-defined order. Fleet needs one GitHub-native view that preserves repository issues as the operational records while making the next task—and the exact position of every later task—explicit.

## What Changes

- Add one central GitHub Project containing open issues authored by `sarthakagrawal927` across every accessible repository and organization.
- Add an unsorted `Queue` table grouped by Priority so every band is visibly ordered and any issue can be inserted between two items in its band without renumbering or changing repository metadata.
- Add project-local `Priority` and `Status` fields for grouping and filtering without making either field override manual queue order.
- Add a project-local `Reasoning complexity` field that records the intelligence needed independently of effort or duration.
- Establish an evidence-based review contract centered on the operator's declared outcomes: finish active work first, market ready products second, and measure results third.
- Add a minimal, user-authenticated synchronization command that discovers newly opened authored issues and adds missing items without storing credentials or installing repository-specific workflows.
- Keep newly synchronized items visibly unreviewed until a human or agent has read the issue body and relevant state; synchronization must never guess Priority or Reasoning complexity.
- Configure closed-item cleanup so completed issues leave the active queue while remaining GitHub-native and recoverable through project history or archive behavior.
- Document the cross-organization permission, visibility, and automation limits observed during the prototype.

## Capabilities

### New Capabilities

- `cross-org-priority-queue`: A GitHub-native, manually ordered personal queue over authored issues from multiple repositories and organizations, with safe synchronization and completion handling.

### Modified Capabilities

None.

## Impact

- GitHub: one Project, project-local fields/views/workflows, and the existing repository issues referenced as items.
- Fleet tooling: a small script under `foundry/ops/` using the installed `gh` CLI and the operator's existing GitHub authentication.
- Documentation and status: Fleet operational documentation, OpenSpec artifacts, and `PROJECT_STATUS.md` after the capability is verified and shipped.
- Tracking: [Fleet issue #353](https://github.com/sass-maker/fleet-workspace/issues/353).
- No production deployment, new production dependency, issue migration, secret storage, or replacement task database.
