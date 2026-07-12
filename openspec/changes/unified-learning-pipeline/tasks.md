## 1. Catalog Foundation

- [x] 1.1 Define typed learning-source, item, track, snapshot, and assessment contracts in `swe-interview-prep`.
- [x] 1.2 Implement deterministic adapters for native SWE content, active project learning docs, and research-papers paths, excluding `knowledge-base` and archived projects.
- [x] 1.3 Add registry validation, fingerprinting, duplicate-ID checks, stale-source metadata, and focused tests.

## 2. First Usable Learning Surface

- [x] 2.1 Add a unified catalog view with source, project, track, freshness, and status filters.
- [x] 2.2 Add a daily queue that orders High Signal, due reviews, continued items, and one new durable item.
- [ ] 2.3 Connect external items to the existing learning session, notes, Playground, progress, and review controls without changing native concepts.
- [x] 2.4 Add fingerprint-bound MCQ loading, validation, completion feedback, and assessment tests.

## 3. Dynamic Sources

- [x] 3.1 Add a versioned Reader saved-item export/feed and its SWE adapter.
- [ ] 3.2 Add a compact High Signal daily-brief feed and its SWE adapter.
- [ ] 3.3 Add sync fixtures and failure/staleness tests for both dynamic sources. (Reader pending-token and registry contracts covered; authenticated fixture remains.)

## 4. Agent And Fleet Integration

- [ ] 4.1 Add a Fleet Ops learning-control skill with `sync`, `today`, `start`, `status`, and `complete` commands. (Nightly deterministic `sync` shipped; conversational commands remain.)
- [ ] 4.2 Register the skill with OpenClaw/Hermes and document the Telegram workflow.
- [ ] 4.3 Add a sanitized learning link and aggregate sync status to the Fleet dashboard.

## 5. Verification And Release

- [ ] 5.1 Run unit, type, build, and responsive browser checks for the SWE learning flow. (Unit, type, and build pass; browser backend unavailable.)
- [x] 5.2 Verify idempotent sync and no `knowledge-base` leakage.
- [ ] 5.3 Update project status, archive the OpenSpec change when complete, commit, and push each affected repository.
- [ ] 5.4 Deploy only after clean-main/CI checks and explicit production authorization.
