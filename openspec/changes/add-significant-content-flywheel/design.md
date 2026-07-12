## Context

Significant Hobbies currently has legacy articles in a large TypeScript array plus a newly added but empty standalone video catalog and `/videos` routes. Reel Pipeline has a capable Idea Store, faceless factory, quality gate, publish packet builder, and native YouTube/Instagram posting, but its ideas retain only a title, hook, angle, format, and free-form notes. The YouTube publisher returns an external id and URL, which are currently written into SaaS Maker notes rather than a reusable cross-repo receipt.

OpenClaw already has an isolated Reel Pipeline agent and can run repository commands, but no content-flywheel contract or schedule exists. Existing fleet rules require SaaS Maker to remain the marketing approval source of truth and prohibit silently changing credentials, posting accounts, cron, or production configuration.

## Goals / Non-Goals

**Goals:**

- Make one versioned JSON content package the source of truth for each new Significant Hobbies topic.
- Publish package content through the existing blog and hobby graph without creating a dedicated video destination.
- Turn each approved content package into multiple deliberately different, production-ready reel variants.
- Preserve hooks, scripts, visuals, CTA, provenance, and destination URL when Reel Pipeline imports a variant.
- Return YouTube/Instagram publication and metrics results to the exact package and variant through idempotent receipts.
- Give OpenClaw deterministic validate/export/import/status/apply commands that are safe to retry.
- Keep existing review and accepted-post gates intact.

**Non-Goals:**

- A `/videos` library, video-first navigation item, or duplicate watch page.
- Migrating every legacy blog post into JSON in the first release.
- Letting OpenClaw edit TypeScript, infer state from prose logs, accept its own marketing posts, or handle credentials.
- Enabling cron jobs, changing OpenClaw configuration, uploading media, posting publicly, or deploying either repository in this change.
- A database, CMS, new runtime dependency, or cross-repo shared package registry.

## Decisions

### Keep canonical packages in one compile-time JSON document

Significant Hobbies will own `src/content/content-packages.json` with `{ "schemaVersion": 1, "packages": [...] }`. A Zod-backed library and CLI validate the document before use. Next.js imports the JSON at build time, while the CLI performs targeted atomic updates for OpenClaw.

This makes the YouTube enrichment genuinely one JSON-field update, works in Cloudflare Workers without runtime filesystem access, and avoids requiring OpenClaw to maintain generated TypeScript imports.

Alternative considered: one JSON file per package with a generated index. It reduces merge conflicts but introduces a build-generation step and generated-file drift before the volume justifies it.

### Use the existing blog URL as the canonical content page

A published package appears at `/blog/[slug]`, is listed alongside legacy articles, and is linked from its related hobby page. Before upload, it renders the article only. After `youtube.videoId` is present, the same page adds the player, visible video details, matching `VideoObject`/chapter metadata, and a video-sitemap record.

The current `/videos` index and watch routes will be removed or permanently redirected to `/blog` and `/blog/[slug]`. No standalone video page or navigation item remains.

Alternative considered: add `/guides/[slug]`. That would create a second editorial taxonomy and fragment authority between guides and the existing journal.

### Preserve legacy posts through an adapter

The blog index and detail route will resolve both legacy `blogPosts` and new packages through a small normalized view model. New automation writes only packages; existing articles do not need an immediate mechanical migration.

### Make the package rich enough to prevent Reel Pipeline regeneration drift

Each approved reel variant carries an id, format, hypothesis, hook, payoff, target duration, ordered scene plan, on-screen text, visual direction, caption, CTA, tags, and destination URL. The first scene contains the exact hook and is capped at 1.5 seconds. Reel Pipeline converts this data directly into its script/VideoBrief shape instead of asking another model to reinvent it.

Alternative considered: export only topic and hook into the existing Idea Store. The current factory would regenerate the script and could erase the reason the variant was selected.

### Use a versioned handoff envelope with provenance

`content export` writes a `significant-content-reels/v1` envelope containing package id, package revision, source URL, and approved variants. Reel Pipeline imports each variant under the idempotency key `<packageId>:<revision>:<variantId>` and stores structured `contentSource` plus the immutable variant payload on the idea.

Duplicate imports return the existing idea rather than adding another backlog item. A changed package revision creates a new attributable revision only when the variant content changed.

### Emit receipts rather than writing across repositories

Reel Pipeline emits a `significant-content-receipt/v1` JSON receipt after render, platform publication, or metric collection. Receipts identify package id, revision, variant id, stage, provider, external id/URL, timestamps, and metrics. Significant Hobbies applies receipts through `content apply-receipt`; it never accepts a receipt for an unknown package/variant or silently overwrites a conflicting platform id.

OpenClaw moves receipt files between commands. Reel Pipeline never edits the Significant Hobbies checkout directly.

### Keep lifecycle state explicit and monotonic

Package state is `draft | ready | published | archived`. Reel state is `draft | approved | exported | rendered | posted`. YouTube fields remain nullable until a valid upload receipt arrives. Receipt application advances state but retries with the same payload are no-ops.

### Make “catchy” a contract, not an adjective

Ready/published packages require at least three reel variants with distinct formats or hook hypotheses. Validation rejects weak preambles such as “in this video,” hooks that exceed the first-beat budget, missing concrete payoffs, repeated hooks, absent visual beats, and CTA links that do not resolve to the canonical article.

Heuristics prevent obviously generic packages; the existing Reel Pipeline quality/review gates remain responsible for actual creative judgment.

### Keep performance feedback controlled

Metrics receipts attach views, watch time/retention when available, likes, comments, and collection time to the exact variant. A deterministic report ranks comparable variants and emits a follow-up brief. OpenClaw can use that brief to create a new `draft` package or new draft variants, but metrics never mutate published article claims or auto-approve content.

### OpenClaw orchestrates commands only

The runbook defines a retry-safe loop:

1. Create or update a draft through the Significant Hobbies CLI.
2. Validate and mark editorial/reel variants ready.
3. Export approved variants.
4. Import into Reel Pipeline and run existing factory/review/post commands.
5. Export render/upload/metrics receipts.
6. Apply receipts in Significant Hobbies and run status.
7. Generate follow-up drafts from the performance report.

No scheduler is installed in this change. When scheduling is approved, one OpenClaw job should run this bounded loop rather than separate jobs that can race.

## Risks / Trade-offs

- [One JSON document can become large or conflict] → Keep content blocks compact, use targeted CLI updates, and split to per-package files only after measured authoring contention.
- [Automation produces generic or inaccurate content] → Require sources, visible claims, distinct variants, deterministic validation, and existing approval gates before publication/posting.
- [A receipt is applied twice] → Use provider external id plus package/revision/variant/stage as an idempotency key and treat identical retries as no-ops.
- [A post is uploaded manually outside Reel Pipeline] → Support a validated manual upload receipt command with the same schema and conflict checks.
- [Removing `/videos` loses a potential video-rich-result advantage] → Keep video metadata and video sitemap on the canonical article; accept that the product intentionally prioritizes one coherent content destination.
- [Cross-repo schema drift] → Keep version identifiers in both envelopes, fixture-test each consumer, and fail closed on unsupported versions.
- [OpenClaw gains too much authority] → Commands do not expose credentials, acceptance, deployment, or unrestricted file editing; posting still requires the existing accepted queue state.

## Migration Plan

1. Add schemas, empty package document, CLI, fixtures, and validation to Significant Hobbies.
2. Add handoff intake, provenance fields, receipt utilities, and tests to Reel Pipeline.
3. Integrate package posts into the existing blog/hobby routes and derive video metadata from package YouTube fields.
4. Redirect/remove standalone video surfaces and update sitemaps, LLM indexes, navigation references, and tests.
5. Add the OpenClaw runbook and run an offline fixture through export → import → receipt → apply twice.
6. Do not create a schedule, upload, deploy, or post. Enable those only after explicit operational approval.

Rollback removes the new package adapter and CLI integrations. Legacy blog content remains unchanged, and receipts/packages are version-controlled JSON that can stay unused without affecting production data.

## Open Questions

- The initial content package topics and final Significant Hobbies channel/account routing are not yet selected.
- Scheduling cadence, OpenClaw model choice, and whether OpenClaw may mark variants `approved` remain explicit operational decisions after the offline loop is verified.
