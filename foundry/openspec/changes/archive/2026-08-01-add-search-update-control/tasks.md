## 1. Allowlist Search Refresh

- [x] 1.1 Add a portfolio-only Search family to the metric-run controller.
- [x] 1.2 Route it to the existing Search Console collector without a shell or
  duplicated target list.
- [x] 1.3 Cover command selection and active-run deduplication in focused tests.

## 2. Add the Page Control

- [x] 2.1 Add one Update button and polite status region to the Search header.
- [x] 2.2 Reuse the existing portfolio refresh client with Search-specific copy
  and redraw behavior.

## 3. Verify and Close

- [x] 3.1 Pass focused controller/service tests, the Console build, strict
  OpenSpec validation, and diff checks.
- [x] 3.2 Exercise the local button through one complete 27-project update.
- [x] 3.3 Update durable status, archive the spec, commit, push, and do not
  deploy.
