## Context

Fleet marketing state is split across `foundry/ops/docs/domain-marketing-plan.md`, hard-coded SaaS Maker audit buckets, the authenticated `/v1/marketing/posts` queue, Reel Pipeline receipts, and Codex cron configuration. The current generator targets Reader, SWE Interview Prep, Starboard, and Karte, while the declared focus set is Pace, CodeVetter, and PostTrainLLM. Queue state is 85 generated, one rejected, and zero accepted/sent, so the binding constraint is review and execution rather than ideation.

## Decisions

### Initial channel scope: Instagram and YouTube

Instagram Reels and YouTube Shorts are the launch channels. TikTok/Postiz is deferred and must not count against current readiness or block the initial automated distribution loop. The provider-neutral contracts retain TikTok as a future extension point.

### Store program intent in a versioned registry

`foundry/ops/config/marketing-program.json` will be the machine-readable source for canonical slug, display name, aliases, domain, mode (`focus | evergreen | infrastructure | private`), trusted content-base adapters, CTA, brand channel/account identifiers, cadence, and whether public marketing is allowed. Human-facing domain plans derive from or validate against this registry.

Initial source-backed channel programs are High Signal, Significant Hobbies, and SWE Interview Prep. Additional projects can opt in by declaring a content-base adapter and at least one channel policy; registration alone does not authorize publishing.

### Keep truth in each product's content base

High Signal owns evidence-linked brief and signal records. Significant Hobbies owns cited topic packages and evergreen article state. SWE Interview Prep owns learning tracks, roadmaps, and canonical source references. OpenClaw may select from these typed records and propose content packages, but cannot replace citations with model memory or treat Reel Pipeline's free-form studio output as a source of truth.

Each canonical package records brand, source ids/URLs, claims, target audience, destination URL, revision, variants, approval state, and downstream receipts. Approved variants are immutable; a changed claim or script creates a new revision.

### Keep queue content private and publish aggregates

A local snapshot command queries the authenticated SaaS Maker API and writes a sanitized record containing counts by canonical project and stage, oldest review age, latest activity, failures, and next action. It excludes titles, hooks, bodies, owner ids, task ids, result URLs, and notes. Fleet Ops reads this snapshot; the public runtime may expose it safely.

### Treat aliases at the boundary

Historical `linkchat` records aggregate under `karte`, `interview-coder` under `swe-interview-prep`, `resume-tailor` under `rolepatch`, and the legacy `tinygpt` identity under the canonical `posttrainllm` slug. The first release does not mutate historical production rows.

### Add backpressure before generation

The queue builder checks aggregate queue state before creating ideas. If generated review debt exceeds the ceiling, or a focus project has too many unreviewed items, it creates no new ideas and sends one review notification. Once below the ceiling, it generates only for configured focus projects lacking a recent experiment.

### Separate foundation, experiment, and outcome

Every project receives a durable marketing foundation state. Focus projects additionally carry one active experiment with hypothesis, channel, asset, CTA, success event, and review date. Queue posts are execution candidates, not the strategy source of truth. Published receipts and metrics close the loop.

### Make mobile review the primary operator workflow

Notifications contain counts, blockers, and one authenticated SaaS Maker `/marketing` link. No unpublished post body is sent to the public dashboard. Telegram delivery uses the existing Fleet notification service and respects its failure/dead-letter behavior.

### Keep Reel Pipeline as a media factory

Reel Pipeline accepts an approved, source-backed variant and returns render artifacts, quality evidence, and a receipt. It does not choose the topic, invent factual claims, own the brand calendar, or decide where content publishes. Its existing aged-intake auto-accept behavior is incompatible with this boundary and must be removed or made impossible in production code.

Current readiness is partial: local orchestration evidence passes, but the repository reports `targetHostReady=false`; real stock render, R2 playback, full Remotion, target-host render, and social posting evidence remain unresolved. Native publisher code covers YouTube and Instagram, not the full channel set.

### Put distribution behind a publisher adapter

The publisher adapter accepts approved channel variants plus media receipts and returns schedule/publication/metrics receipts. It maps brand channel ids to platform integrations and fails closed when an account mapping is missing. Website/blog publication continues through each product repository, and email continues through the Fleet email surface; they are not forced through a social scheduler.

Self-hosted Postiz is the preferred first social-publisher evaluation because it is open source, exposes an agent CLI/API, supports project/account groups and platform-specific settings, and spans the required social networks. It is an operationally heavy stack (application, PostgreSQL, Redis, Temporal, a second PostgreSQL, and Elasticsearch), so the first release defines and fixture-tests the adapter without installing it. A lighter native adapter remains possible if the actual channel set stays limited to YouTube and Instagram.

### Make OpenClaw involvement measurable

An OpenClaw marketing job is not considered enabled merely because the gateway and Telegram bot are running. Readiness requires a registered job, versioned instructions, a dry-run fixture, durable task status, Telegram completion/failure delivery, and dashboard freshness. The job may select sources and propose packages; it cannot approve, schedule, or publish.

## Data Flow

1. Registry defines canonical identity, content base, channel program, and focus intent.
2. OpenClaw dry-run reads typed source records and proposes a versioned content package.
3. Snapshot command reads the authenticated Marketing Queue and canonicalizes aliases.
4. Backpressure decides `review`, `generate`, or `recover` per project.
5. Fleet Ops `/marketing` renders sanitized state and direct private review links.
6. Owner accepts/rejects variants in SaaS Maker.
7. Accepted video work moves through Reel Pipeline and returns render/quality receipts.
8. Approved distribution moves through the configured publisher adapter and returns publication receipts.
9. Metrics update SaaS Maker and the source package; the next snapshot closes the loop.

## Safety

- No automatic acceptance or posting.
- Reel Pipeline's aged-intake auto-accept path is disabled before production integration.
- No credentials or post bodies in snapshots.
- No production row mutation during identity normalization.
- Failed API reads retain the last good snapshot and visibly mark it stale.
- Generation fails closed when queue state is unavailable.
- Domain and DNS work remains separate.

## Verification

- Registry schema and identity uniqueness tests.
- Fixture tests for alias aggregation, stage counts, stale snapshots, and backpressure.
- No-sensitive-fields snapshot contract test.
- Astro build and desktop/mobile browser checks for `/marketing`.
- Dry-run queue-builder tests proving no writes above the review ceiling.
- Notification fixture test with no post content.
- Cross-brand fixtures proving source and account isolation.
- OpenClaw dry-run evidence proving task visibility and Telegram reporting without queue writes.
- Reel Pipeline target-host evidence is reported honestly and cannot be inferred from local smokes.
