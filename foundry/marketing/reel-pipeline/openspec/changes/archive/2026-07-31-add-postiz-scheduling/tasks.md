## 1. Scheduled distribution contract

- [x] 1.1 Add Studio-level future schedule normalization and an approved draft-or-schedule submission function
- [x] 1.2 Map optional scheduled requests to Postiz `type: schedule` with the exact UTC date while preserving draft behavior
- [x] 1.3 Persist scheduled request and sanitized receipt state without exposing integration ids, credentials, or unpublished copy
- [x] 1.4 Keep immediate publication and direct-provider inputs rejected before network access

## 2. Marketing Studio UI

- [x] 2.1 Add a labelled local date/time control, resolved timezone hint, and explicit Schedule in Postiz action
- [x] 2.2 Keep draft and schedule actions evidence-gated and show truthful draft, scheduled, and configuration states
- [x] 2.3 Preserve the existing Reel Pipeline workbench pattern and responsive operation at 390, 768, and 1440 pixels

## 3. Verification

- [x] 3.1 Add focused Studio tests for future schedules, past/invalid rejection, lifecycle persistence, and draft compatibility
- [x] 3.2 Add Postiz client contract tests for Instagram and YouTube scheduled payloads before any live request
- [x] 3.3 Run focused tests, full Node and Rust tests, Studio/Postiz/render-mode smokes, docs validation, strict OpenSpec validation, and diff checks
- [x] 3.4 Record browser evidence and design-review scores with zero unresolved P0/P1 findings
- [x] 3.5 Record that live auto-post execution remains unverified and requires an explicit canary outside automated tests
