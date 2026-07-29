# STATUS

## Objective

Plan and generate source-backed, reviewable media artifacts for Fleet products,
then hand approved drafts to Postiz without owning publishing state.

## Working now

- VideoBrief normalization and local render adapters.
- Worker/R2 production render path and Rust watcher.
- Anonymous brand-reel, studio, faceless, lesson, and content-package flows.
- Source-backed Significant Content and High Signal intake.
- Nested podcast editorial planning and operator review with provenance-gated
  source intake and resumable expensive stages.
- Approved `fleet.podcast-edit.v1` rendering with exact EDL preservation,
  source-hash verification, source headings, watermarks, sidecar captions, and
  render receipts.
- Postiz draft creation through a narrow, tested adapter.
- Local render-mode, Postiz contract, Node, and Rust test coverage.

## Boundaries

- Product claims and approval originate in source packages, not here.
- Podcast source material must be creator-owned or public domain, and filmed
  visual inserts must retain source rights and credit metadata.
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
