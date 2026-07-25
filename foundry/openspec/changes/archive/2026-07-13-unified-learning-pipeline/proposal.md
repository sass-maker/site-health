## Why

Learning material is fragmented across SWE Interview Prep, Fleet project study queues, research-paper paths, Reader saves, and High Signal briefings. The user needs one daily learning loop with the existing SWE learning tools, without creating competing copies of source content.

## What Changes

- Make `swe-interview-prep` the single learner-facing umbrella and progress system.
- Add a canonical, reference-only learning-item contract with stable IDs, source provenance, tracks, freshness, and content fingerprints.
- Index native SWE tracks, active Fleet `docs/learning/new-things.md` queues, research-papers reading paths, Reader saves/blogs, and High Signal daily briefs.
- Exclude `knowledge-base` and archived Fleet projects.
- Add a daily queue ordered as fresh High Signal briefing, due spaced-repetition reviews, then a selected durable learning item.
- Reuse SWE Interview Prep's notes, artifacts, Playground, MCQ runner, progress, and FSRS review system for every source type.
- Generate or import MCQs as derived assessment data keyed by the source fingerprint; never copy an article, paper, or project learning document into a second canonical content store.
- Add OpenClaw commands for catalog sync, starting a learning session, recording progress, and reporting today's state through Telegram.
- Surface the learning queue from the Fleet website by linking into the authenticated SWE learning experience and showing sanitized aggregate status only.

## Capabilities

### New Capabilities

- `unified-learning-catalog`: Reference-only discovery and filtering across all approved learning sources.
- `daily-learning-loop`: A prioritized daily session using SWE Interview Prep's existing learning tools and spaced repetition.
- `derived-assessments`: Provenance-bound MCQs and recall prompts that are regenerated only when source fingerprints change.
- `learning-agent-control`: OpenClaw commands and status reporting for sync, selection, and mobile learning workflows.

### Modified Capabilities

None.

## Impact

- Primary product: `swe-interview-prep` UI, static data loaders, user learning state, and API handlers.
- Source integrations: read-only adapters for `reader`, `research-papers`, `high-signal`, and active Fleet project learning documents.
- Fleet Ops: reusable sync/control skill and sanitized dashboard link/status.
- No source-content migration, new canonical content database, production deployment, credential change, or modification to `knowledge-base` is included.
