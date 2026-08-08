## Why

Fleet has no safe, repeatable way to explain local disk usage, and the external
storage-analyzer workflow places temporary and final reports outside the
workspace while also exposing deletion actions. Fleet needs a read-only variant
whose complete evidence trail stays inside the workspace and cannot delete data.

## What Changes

- Add a Fleet-owned storage-analysis skill for macOS storage and cleanup-candidate
  inspection.
- Keep scanning and report generation strictly read-only with no delete, Trash,
  permission, or system-configuration action.
- Write each run's scan JSON and static HTML report under the ignored
  `.fleet-local/reports/storage/<run-id>/` workspace directory.
- Classify findings as safe cache, review required, or protected, and explain
  impact without presenting unsafe cleanup commands as completed actions.
- Add deterministic fixtures and tests for classification, path containment,
  report rendering, and the no-delete boundary.
- Retain attribution for the MIT-licensed upstream ideas while rewriting the
  implementation around Fleet policy.

## Capabilities

### New Capabilities

- `workspace-storage-analysis`: Read-only workspace-local storage scanning,
  classification, evidence retention, and static report generation.

### Modified Capabilities

None.

## Impact

- Adds a standalone skill and standard-library scripts under
  `foundry/ops/skills/` plus the normal Fleet skill exposure and validation.
- Adds no production or development dependency and makes no deployment,
  credential, system configuration, or product-runtime change.
- Generates only ignored machine-local artifacts under the Fleet workspace.
