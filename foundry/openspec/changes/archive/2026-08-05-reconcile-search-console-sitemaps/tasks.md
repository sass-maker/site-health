## 1. Contract

- [x] 1.1 Derive the deduplicated desired sitemap targets from project hosts and root domains.
- [x] 1.2 Add fail-closed preview/apply reconciliation with bounded output.
- [x] 1.3 Test missing, retained, stale, inaccessible, and provider-error cases.

## 2. Operator command

- [x] 2.1 Add the local ADC-backed reconciliation CLI.
- [x] 2.2 Document the command and its mutation boundary.

## 3. Apply and verify

- [x] 3.1 Generate and review the live preview.
- [x] 3.2 Apply the exact additions and removals authorized by issue #162.
- [x] 3.3 Verify a second preview is converged and all live sitemap documents are fetchable.
- [x] 3.4 Run Fleet tests, archive the change, update project status, and merge.
