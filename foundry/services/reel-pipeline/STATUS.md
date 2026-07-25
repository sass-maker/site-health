# STATUS

## Objective

Generate source-backed, reviewable media artifacts for Fleet products and hand
approved drafts to Postiz without owning publishing state.

## Working now

- VideoBrief normalization and local render adapters.
- Worker/R2 production render path and Rust watcher.
- Anonymous brand-reel, studio, faceless, lesson, and content-package flows.
- Source-backed Significant Content and High Signal intake.
- Postiz draft creation through a narrow, tested adapter.
- Local render-mode, Postiz contract, Node, and Rust test coverage.

## Boundaries

- Product claims and approval originate in source packages, not here.
- Reel Pipeline owns generation artifacts and receipts.
- Postiz owns social integrations, draft review, scheduling, publishing, and
  provider analytics.
- No automatic publish path remains in this repository.

## Remaining release work

- Install and configure Postiz on the designated Fleet machine.
- Connect social integrations and provide the external `POSTIZ_API_KEY`.
- Create the environment-specific project-to-integration mapping.
- Run one draft-only canary and confirm it in Postiz before scheduling.
- Complete the existing live Worker/R2 and optional renderer canaries.

Detailed tracking: [`PROJECT_STATUS.md`](PROJECT_STATUS.md).
