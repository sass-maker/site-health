## 1. Significant Hobbies content contract

- [x] 1.1 Add the versioned package/reel/receipt schemas, empty canonical JSON document, normalized selectors, and strict lifecycle validation
- [x] 1.2 Add deterministic CLI commands for create, validate, status, export, apply-receipt, and performance reporting with atomic idempotent updates
- [x] 1.3 Add unit fixtures and tests for valid packages, weak hooks, variant diversity, unsupported versions, export filtering, receipt retries, and receipt conflicts

## 2. Significant Hobbies publishing integration

- [x] 2.1 Normalize legacy and package-backed content into the existing blog index/detail route without duplicate slugs
- [x] 2.2 Render package sources, sections, takeaways, product actions, and related hobby links on canonical `/blog/[slug]` articles
- [x] 2.3 Derive optional YouTube embed, metadata, `VideoObject`/chapters, social data, standard sitemap, and video sitemap entries from package JSON
- [x] 2.4 Surface related package articles on hobby pages and in agent-readable/LLM indexes
- [x] 2.5 Remove the dedicated video destination and permanently redirect retired `/videos` URLs to the blog or canonical article

## 3. Reel Pipeline handoff

- [x] 3.1 Add the versioned Significant Hobbies handoff validator and idempotent content-package intake adapter
- [x] 3.2 Extend Idea Store records with structured source attribution and immutable approved variant payloads
- [x] 3.3 Convert imported scene plans directly into script/VideoBrief inputs without regenerating the approved hook or payoff
- [x] 3.4 Add render, upload, and metrics receipt builders tied to package revision and variant id
- [x] 3.5 Add CLI commands for import, content status, and receipt export while preserving existing quality/review/accepted-post gates
- [x] 3.6 Add unit tests for duplicate imports, revision behavior, script preservation, receipt attribution, and posting-gate isolation

## 4. OpenClaw loop and performance feedback

- [x] 4.1 Add machine-readable cross-repo status and comparable variant performance reports
- [x] 4.2 Add follow-up brief output that creates drafts only and cannot mutate published claims or approval state
- [x] 4.3 Add an OpenClaw runbook with exact bounded commands, retry behavior, authority boundaries, and recovery paths
- [x] 4.4 Run an offline fixture through validate → export → duplicate import → render receipt → duplicate apply → metrics report

## 5. Verification and lifecycle

- [x] 5.1 Run focused tests after each repository change, then full unit/type/build checks in both repositories
- [ ] 5.2 Run SEO, structured-data, Markdown negotiation, accessibility, responsive, and redirect checks on affected Significant Hobbies routes
- [x] 5.3 Update both `PROJECT_STATUS.md` files and relevant recommendation/context documentation
- [ ] 5.4 Archive the shared OpenSpec change and commit the store plus both verified repository changes without deploying, posting, or scheduling
