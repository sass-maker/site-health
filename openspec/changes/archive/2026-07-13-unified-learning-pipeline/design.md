## Context

SWE Interview Prep already provides tracks, concepts, drills, MCQs, notes, artifacts, a Playground, progress, and FSRS spaced repetition. It also contains a library ingestion path, but copying external documents into its bundle would create stale duplicate content. The approved sources have different shapes: local Markdown queues, typed research paths, dynamic Reader saves, and fresh High Signal briefings.

## Goals / Non-Goals

**Goals:**

- Provide one learner UI and one daily queue.
- Preserve source ownership and provenance.
- Reuse existing SWE learning and review primitives.
- Support deterministic sync and idempotent agent commands.
- Make the first local-machine workflow usable before production integration.

**Non-Goals:**

- Moving or rewriting source documents.
- Indexing `knowledge-base`.
- Mirroring full article or paper bodies into SWE Interview Prep.
- Replacing Reader, research-papers, or High Signal product surfaces.
- Automatically publishing, deploying, or purchasing model access.

## Decisions

### SWE Interview Prep owns the learner experience

The existing five-tab learning OS already implements the expensive interaction and progress work. A separate Fleet learning application would duplicate UI, state, and review logic. Fleet's public dashboard exposes only a link and aggregate state; authenticated learning stays in SWE Interview Prep.

### A reference registry joins heterogeneous sources

Every item uses a small common shape: stable ID, source kind, source ID, title, summary, canonical URL or repository path, track IDs, published/updated timestamp, fingerprint, and optional assessment references. Adapters may emit derived metadata but MUST NOT persist the full source body as canonical content.

### Sync is adapter-based and deterministic

Local project docs and research paths are indexed by a Fleet script. Reader and High Signal use explicit export/feed contracts. Generated registry files are reproducible build artifacts and contain metadata plus references only. Failed sources retain the last valid snapshot and expose staleness.

### Assessment data is separate and fingerprint-bound

Imported questions or generated MCQs store the source item ID, source fingerprint, prompt/version, choices, answer, explanation, and generation timestamp. A matching fingerprint reuses questions; a changed fingerprint invalidates them. Progress references stable learning-item IDs and remains independent of question regeneration.

### The daily queue has deterministic lanes

The queue prioritizes: one fresh High Signal briefing, FSRS reviews already due, one continued active item, then one new item from the selected source/track. The learner can filter or override any lane. No recommendation algorithm silently removes access to the full catalog.

### OpenClaw calls commands, not implementation internals

Fleet Ops provides idempotent commands for `sync`, `today`, `start`, `status`, and `complete`. Telegram can start or inspect a session, while the web application remains the rich interaction surface.

## Risks / Trade-offs

- [Reader and High Signal do not expose stable feeds] -> Add narrow versioned export endpoints rather than scraping pages.
- [Local project paths do not exist in Cloudflare builds] -> Commit only the generated reference registry and refresh it from the primary Fleet machine.
- [Fresh news overwhelms durable learning] -> Cap the briefing lane at one session and keep due reviews ahead of new durable content.
- [AI-generated MCQs are wrong] -> Show provenance, explanations, feedback controls, and validate shape/answer consistency before use.
- [Source IDs change] -> Prefer repository-relative paths and canonical external IDs; retain aliases when an adapter renames an item.

## Migration Plan

1. Add the common catalog contract and local adapters without changing native SWE tracks.
2. Add the catalog and Today UI using local progress for guests and the existing authenticated state path where possible.
3. Add Reader and High Signal export contracts, then refresh the checked-in registry.
4. Add OpenClaw control commands and Fleet dashboard linkage.
5. Deploy only after current dirty work is reconciled, CI passes, and the user explicitly authorizes production deployment.

Rollback removes the new route and registry; existing SWE concepts, reviews, and user state remain untouched.

## Open Questions

- Whether Reader's first sync should use its production database export or a public authenticated feed.
- Whether High Signal's daily item should point to an existing digest URL or receive a dedicated compact learning feed.
