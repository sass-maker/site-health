## 1. Skill Surface

- [x] 1.1 Rename the Fleet-owned skill, CLI, tests, and UI metadata from `guard-dependencies` to `code-cleanup`
- [x] 1.2 Update Fleet exposure, policy, and discovery documentation to use `$code-cleanup`

## 2. Cleanup Runner

- [x] 2.1 Add package-manager and repository-native cleanup command discovery
- [x] 2.2 Add failure-tolerant execution for Knip, native checks, and `git diff --check`
- [x] 2.3 Add explicit Bundlephobia candidates and combined human/JSON reporting
- [x] 2.4 Preserve the existing dependency `check`, `fleet`, and `lookup` commands

## 3. Validation

- [x] 3.1 Add focused tests for command selection, missing coverage, continued execution, output, and exit status
- [x] 3.2 Run OpenSpec validation, unit tests, CLI help, skill-link installation, and a representative read-only cleanup run
- [x] 3.3 Review the final diff and confirm no dependency, unrelated file, or repository-content mutation was introduced
