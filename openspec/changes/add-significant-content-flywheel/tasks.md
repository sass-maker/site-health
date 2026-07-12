## 1. Significant Hobbies content contract

- [ ] 1.1 Add the versioned package/reel/receipt schemas, empty canonical JSON document, normalized selectors, and strict lifecycle validation
- [ ] 1.2 Add deterministic CLI commands for create, validate, status, export, apply-receipt, and performance reporting with atomic idempotent updates
- [ ] 1.3 Add unit fixtures and tests for valid packages, weak hooks, variant diversity, unsupported versions, export filtering, receipt retries, and receipt conflicts

## 2. Significant Hobbies publishing integration

- [ ] 2.1 Normalize legacy and package-backed content into the existing blog index/detail route without duplicate slugs
- [ ] 2.2 Render package sources, sections, takeaways, product actions, and related hobby links on canonical `/blog/[slug]` articles
- [ ] 2.3 Derive optional YouTube embed, metadata, `VideoObject`/chapters, social data, standard sitemap, and video sitemap entries from package JSON
- [ ] 2.4 Surface related package articles on hobby pages and in agent-readable/LLM indexes
- [ ] 2.5 Remove the dedicated video destination and permanently redirect retired `/videos` URLs to the blog or canonical article

## 3. Reel Pipeline handoff

- [ ] 3.1 Add the versioned Significant Hobbies handoff validator and idempotent content-package intake adapter
- [ ] 3.2 Extend Idea Store records with structured source attribution and immutable approved variant payloads
- [ ] 3.3 Convert imported scene plans directly into script/VideoBrief inputs without regenerating the approved hook or payoff
- [ ] 3.4 Add render, upload, and metrics receipt builders tied to package revision and variant id
- [ ] 3.5 Add CLI commands for import, content status, and receipt export while preserving existing quality/review/accepted-post gates
- [ ] 3.6 Add unit tests for duplicate imports, revision behavior, script preservation, receipt attribution, and posting-gate isolation

## 4. OpenClaw loop and performance feedback

- [ ] 4.1 Add machine-readable cross-repo status and comparable variant performance reports
- [ ] 4.2 Add follow-up brief output that creates drafts only and cannot mutate published claims or approval state
- [ ] 4.3 Add an OpenClaw runbook with exact bounded commands, retry behavior, authority boundaries, and recovery paths
- [ ] 4.4 Run an offline fixture through validate → export → duplicate import → render receipt → duplicate apply → metrics report

## 5. Verification and lifecycle

- [ ] 5.1 Run focused tests after each repository change, then full unit/type/build checks in both repositories
- [ ] 5.2 Run SEO, structured-data, Markdown negotiation, accessibility, responsive, and redirect checks on affected Significant Hobbies routes
- [ ] 5.3 Update both `PROJECT_STATUS.md` files and relevant recommendation/context documentation
- [ ] 5.4 Archive the shared OpenSpec change and commit the store plus both verified repository changes without deploying, posting, or scheduling
