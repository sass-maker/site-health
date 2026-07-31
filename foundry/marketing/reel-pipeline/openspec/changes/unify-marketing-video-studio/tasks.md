## 1. Brief and capability foundation

- [x] 1.1 Add the normalized `fleet.marketing-studio-brief.v1` contract, ignored JSON store, revision behavior, and focused tests
- [x] 1.2 Add deterministic and Studio-LLM-backed natural-language brief generation with one shared normalizer and offline tests
- [x] 1.3 Add the five-workflow capability registry with runtime owner, readiness, required inputs, and action descriptors
- [x] 1.4 Extend faceless workflow input so confirmed brand, channel, duration, and creative fields survive into its VideoBrief and artifacts

## 2. Marketing Studio API

- [x] 2.1 Add list/create/read/update brief endpoints while preserving every existing `/studio/:tool` route
- [x] 2.2 Add an explicit brief execution endpoint that runs faceless work only after confirmation and records its artifact evidence
- [x] 2.3 Add safe continuation descriptors for Brand Reel, Forge, and Editorial without importing or duplicating their state
- [x] 2.4 Add production-list aggregation across briefs, Studio artifacts, and authoritative continuation surfaces

## 3. Evidence and Postiz handoff

- [x] 3.1 Add a Studio artifact-to-content-package/media-receipt builder that requires brand, source, claim, destination, rights, approval, quality, and stable HTTPS media evidence
- [x] 3.2 Add a prepare-only distribution endpoint that returns proposed artifacts and performs no network call
- [x] 3.3 Add an injected Postiz draft endpoint with exact mapping, explicit approval, stable-media preflight, sanitized receipt persistence, and no schedule input
- [x] 3.4 Add Postiz readiness and Open Postiz continuation state without exposing credentials, integration ids, unpublished copy, or private media URLs

## 4. Unified operator interface

- [x] 4.1 Create the preserve-mode Fleet design receipt and capture the current `/studio` before state
- [x] 4.2 Replace the page shell with accessible Create, Productions, Distribute, and Tools views using the existing Reel Pipeline design context
- [x] 4.3 Add the conversational composer, normalized brief editor, workflow cards, clarification/blocker states, and explicit execution confirmation
- [x] 4.4 Add production playback, quality/review evidence, authoritative continuation actions, and honest empty/error/loading states
- [x] 4.5 Add distribution preparation, evidence checklist, draft-only Postiz action, and explicit Postiz scheduling boundary
- [x] 4.6 Preserve all existing Studio tool forms and behavior under the Tools view

## 5. Verification and documentation

- [x] 5.1 Add focused API, store, classifier, routing, package, draft-boundary, and existing-route regression tests
- [x] 5.2 Run Studio smoke, focused Node tests, full Node/Rust tests, docs validation, strict OpenSpec validation, and `git diff --check`
- [x] 5.3 Run browser interaction checks and capture after evidence at 390, 768, and 1440 pixels
- [ ] 5.4 Complete Impeccable critique, P0/P1 fixes, polish, audit, and the Fleet design-review gate with owner `keep` or delegated feedback
- [x] 5.5 Update Content Studio docs and `PROJECT_STATUS.md` only after the implemented and locally verified behavior is true
- [x] 5.6 Keep live Postiz account connection, scheduling, publication, and auto-post verification out of this change and linked to Fleet Workspace issue #40
