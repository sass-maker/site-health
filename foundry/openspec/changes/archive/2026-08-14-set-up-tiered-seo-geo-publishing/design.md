## Context

See `proposal.md` for motivation. The catalog in `ops/config/projects.json` is the source of truth for priority, lifecycle, deployment, and sharing readiness. Existing dated placement documents contain useful history, while `growth-program.json`, submission receipts, and GitHub Issues already own execution evidence and work state.

External venues have incompatible rules. For example, Show HN requires something users can try, Product Hunt excludes several content-only formats, AlternativeTo rejects several utility categories, and community sites police repetitive self-promotion. A single universal checklist would therefore be inaccurate and unsafe.

## Goals / Non-Goals

**Goals:**

- Make scope drift fail closed for every P1 and P2 identity.
- Keep P4 promotion exhaustive for active, deployed, share-ready finished products.
- Express recommendations as reusable channel references plus project-specific placements.
- Separate mechanical execution from content ownership and make exceptional owner unblocks obvious before execution.
- Account for concrete destinations behind every broad channel family.
- Produce one readable document from structured data.

**Non-Goals:**

- Submitting, publishing, launching, or deploying on external services.
- Promising rankings, backlinks, domain-rating gains, or LLM citations.
- Replacing product-owned content, technical SEO, growth outcome ledgers, submission receipts, or GitHub Issues.
- Treating duplicate cross-posting as a substitute for original, useful assets.

## Decisions

### Use a separate canonical program keyed to project IDs

The strategy will live in `ops/config/seo-geo-publishing.json`, rather than expanding `projects.json` with large editorial plans. Validation joins the program to catalog truth. This keeps inventory facts stable while allowing venue guidance to evolve more frequently.

Alternative considered: author only a Markdown checklist. Rejected because priority changes and missing projects would not fail validation.

### Model channels once and reference them from project plans

The channel registry records the venue kind, value, current rules, default execution boundary, official guidance URL, and review date. Project plans reference channel IDs and add only the venue-specific angle, format, fit, and operator.

Alternative considered: duplicate full venue rules under every project. Rejected because it creates immediate drift and an unreviewable document.

### Treat blocked identities as preparation-only

All P1 and P2 projects stay represented even when they are not share-ready. Their entries can name prerequisites and future candidate venues, but their placements cannot be executable. The catalog reason is rendered directly so the guide cannot silently overrule verified readiness.

### Cover every eligible P4 product

The finished P4 set is derived from catalog eligibility: P4, active, deployed, and ready to be shared. The explicit ordered list must equal that derived set, so a newly eligible project cannot be silently omitted. Blocked or archived P4 entries remain excluded.

### Separate execution from content ownership

Every channel has an explicit execution mode. The agent owns mechanical publication after authentication; `agent-with-unblock` means the owner intervenes only for authentication, CAPTCHA/2FA, payment, legal attestation, release authority, or an unexpected moderation gate. Placement actors describe content ownership and first-person judgment, not who operates the browser.

### Maintain a concrete destination inventory

The broad channel registry is reconciled with concrete platforms, communities, archives, registries, marketplaces, directories, and curated lists. Maintained candidates remain eligible for live verification and an exact campaign manifest. Long-tail seeds remain accounted for as research-only and cannot be submitted until promoted with current evidence.

### Integrate generation with the existing project-surface check

The existing generator will load, validate, and render the program. Its `--check` mode will report the guide as stale alongside other project surfaces. Focused unit tests will cover exact priority scope, P4 eligibility, readiness gating, unknown channels, and deterministic rendering.

### Keep recommendations bounded and evidence-led

The guide will prefer one original source asset adapted to a small set of high-fit venues. Community contributions, curated-list pull requests, and research/package repositories are recommendations only when the project has a legitimate artifact for them. Broad launch directories remain optional discovery channels, not assumed SEO wins.

## Risks / Trade-offs

- [Venue rules change after review] → Store official guidance URLs and review dates; require periodic review before execution.
- [A recommendation is mistaken for authorization to post] → Render preparation and final-action ownership for every placement; this implementation performs no external writes.
- [Cross-posts create duplicate or thin content] → Require a canonical source asset and venue-specific adaptation; use canonical URLs where supported.
- [P2 breadth dilutes focus] → Preserve full coverage but retain Fleet's maximum-five-P2-per-work-cycle rule for actual execution.
- [External visibility creates spam risk] → Exclude category-incompatible venues, require destination-native contextual participation, and keep moderation-sensitive execution individually receipted.

## Migration Plan

1. Add the structured program and its validator/renderer.
2. Add focused tests and connect generation to the existing project-surface command.
3. Generate the tiered guide and concrete destination inventory, then validate exact catalog and channel-family coverage.
4. Leave dated shortlists as historical receipts; link the new guide as the current strategy rather than deleting history.

Rollback is limited to removing the new program, renderer, generated guide, and generator integration; no product runtime or external service state is changed.
