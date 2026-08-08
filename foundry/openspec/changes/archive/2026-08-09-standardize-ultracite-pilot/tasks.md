## 1. Dependency and Baseline

- [x] 1.1 Run the read-only code-cleanup and outdated checks for Fleet Workspace and the `drank` pilot, recording any pre-existing failures.
- [x] 1.2 Add exact `ultracite@7.10.2` as a root development dependency with pnpm and review the manifest and lockfile delta.
- [x] 1.3 Add the Foundry-owned Biome base extending the upstream core preset with documented Fleet overrides.

## 2. Pilot Adoption

- [x] 2.1 Update only `foundry/helpers/drank/biome.json` to consume the shared base and applicable framework presets while retaining genuine project-local overrides.
- [x] 2.2 Resolve only small behavior-preserving pilot diagnostics and run `pnpm check` in `drank`.
- [x] 2.3 Update durable project documentation only if the pilot changes current dependency or tooling truth.

## 3. Agent Context Boundary

- [x] 3.1 Implement a deterministic staging wrapper around the pinned Ultracite agent generator with write and check modes.
- [x] 3.2 Generate the pilot lint-context artifact and reference it without replacing existing `AGENTS.md` package ownership or safety guidance.
- [x] 3.3 Add focused tests for deterministic generation, drift detection, and preservation of hand-maintained instructions.

## 4. Fleet Parity Reporting

- [x] 4.1 Implement a read-only registry-driven parity command with stable human and JSON output.
- [x] 4.2 Record deliberate divergences and exclude parked, non-product, and out-of-Fleet repositories from adoption totals.
- [x] 4.3 Add focused fixtures and tests for aligned, divergent, unmanaged, unavailable, and excluded projects.

## 5. Validation and Rollout Handoff

- [x] 5.1 Run the pilot check, context check, parity tests, root component checks, dependency guard, and `git diff --check`.
- [x] 5.2 Run strict OpenSpec validation and update `PROJECT_STATUS.md` with shipped truth only after implementation is complete.
- [x] 5.3 Create bounded follow-up GitHub issues for remaining in-Fleet adoption groups without editing independent repositories.
- [x] 5.4 Sync the completed capability spec and archive the OpenSpec change.
