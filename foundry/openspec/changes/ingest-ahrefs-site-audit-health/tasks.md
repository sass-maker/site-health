## 1. Provider contract

- [x] 1.1 Add the dependency-free Site Audit collector with runtime-only authentication and documented response validation
- [x] 1.2 Normalize provider targets and map them to all canonical Fleet roots without tracked project IDs
- [x] 1.3 Preserve Site Audit metrics and emit exact missing, stale, incomplete, partial, and provider-error states

## 2. Operator surface

- [x] 2.1 Add the CLI with JSON stdout, workspace-local Markdown output, maximum-age control, and fail-closed exit codes
- [x] 2.2 Add the root package command and route Ahrefs Site Audit requests through the `site-health` skill
- [x] 2.3 Document the metric boundary, runtime credential, entitlement blocker, and live completion command

## 3. Verification

- [x] 3.1 Add fixture-backed tests for 200, zero/null metrics, 401, 403, missing project, stale crawl, duplicate target, malformed response, and partial coverage
- [x] 3.2 Run focused tests, full Fleet tests, strict OpenSpec validation, docs validation, and `git diff --check`
- [ ] 3.3 Run the live command without printing credentials, record the exact entitlement result, and leave only provider access unchecked when it remains 401/403
