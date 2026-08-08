## 1. Skill Boundary and Attribution

- [x] 1.1 Initialize the `analyze-storage` Fleet skill with concise trigger metadata and workspace-local commands.
- [x] 1.2 Add the upstream MIT notice and document exactly which concepts were adapted.
- [x] 1.3 Expose the standalone skill through Fleet's canonical skill-link installer and registry checks.

## 2. Read-Only Analysis Runtime

- [x] 2.1 Implement standard-library disk and immediate-child size collection without following symlinks or mutating scanned paths.
- [x] 2.2 Implement conservative green, yellow, red, and unreadable classification with explicit evidence.
- [x] 2.3 Enforce run-id validation and artifact containment below `.fleet-local/reports/storage/`.
- [x] 2.4 Render deterministic `scan.json`, `report.json`, and self-contained static `report.html` artifacts with no action API.

## 3. Verification

- [x] 3.1 Add deterministic fixture tests for tier classification, unreadable evidence, and matching report totals.
- [x] 3.2 Add negative tests for path traversal, symlink handling, report mutation controls, and writes outside the workspace.
- [x] 3.3 Run the skill validator, focused tests, a bounded workspace-local live scan, Fleet tests, strict OpenSpec validation, and `git diff --check`.

## 4. Ship and Record

- [x] 4.1 Update Fleet standards and `PROJECT_STATUS.md` with shipped capability truth and the workspace-local report boundary.
- [x] 4.2 Sync the capability spec, archive this OpenSpec change, and link the implementation PR to issue #251.
- [x] 4.3 Record the completed Fleet-owned skill run without retaining private report paths or contents.
