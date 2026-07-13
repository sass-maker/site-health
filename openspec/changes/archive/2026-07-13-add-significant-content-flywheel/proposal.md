## Why

Significant Hobbies needs a repeatable two-way growth engine: strong evergreen content should generate multiple high-retention reels, and reel performance should reveal which hooks deserve deeper content. Today, the website content, Reel Pipeline idea store, publish packets, and YouTube upload results are separate shapes, so OpenClaw would have to improvise cross-repo edits and lose provenance.

## What Changes

- Add one version-controlled JSON content package per Significant Hobbies topic as the canonical record for research, search intent, article copy, visual direction, reel variants, related product actions, publication state, and platform results.
- Render published content packages through the existing `/blog/[slug]` editorial surface and relate them to existing hobby pages; the article can publish before a video exists and gains the YouTube embed/metadata when an upload receipt is applied.
- Retire the standalone `/videos` library/watch surfaces. Video remains media attached to a canonical article rather than a separate product or navigation silo.
- Replace the empty hand-authored video catalog with derived video metadata from content packages so article embeds, structured data, social metadata, and video-sitemap entries cannot drift.
- Add a deterministic Significant Hobbies CLI for validating packages, creating drafts, exporting approved reel variants, applying upload/metrics receipts, and checking pipeline status.
- Add a Reel Pipeline content-package intake adapter that converts approved reel variants into existing Idea Store/factory inputs without bypassing the accepted/reviewed posting gate.
- Extend Reel Pipeline publish output with a stable receipt containing package id, variant id, provider, external id/URL, publication timestamp, and later metrics.
- Add hook-quality requirements for every reel variant: first-1.5-second hook, curiosity gap, concrete payoff, visual beat plan, on-screen text, caption, CTA, and format hypothesis.
- Add an OpenClaw runbook and machine-readable commands for the full loop: draft package → validate → export variants → render/review/post → apply receipt → collect metrics → propose follow-up drafts.
- Keep OpenClaw as orchestrator rather than a direct file editor; all state transitions occur through idempotent validated commands.
- Keep secrets, posting credentials, production deploys, and autonomous acceptance outside the content contract.

## Capabilities

### New Capabilities

- `canonical-content-packages`: Versioned Significant Hobbies JSON records, lifecycle validation, rendering through existing editorial/hobby surfaces, YouTube enrichment, and derived website discovery data.
- `reel-content-handoff`: Deterministic export/import contract between Significant Hobbies content packages and Reel Pipeline ideas, factory artifacts, publish receipts, and metrics receipts.
- `catchy-variant-generation`: Structured, testable reel variants with hook, payoff, visual, caption, CTA, format, and provenance requirements instead of generic topic strings.
- `openclaw-content-orchestration`: Idempotent CLI workflow and runbook that OpenClaw can execute safely across both repositories without direct source edits or posting-gate bypasses.
- `content-performance-flywheel`: Attribution from each reel back to its source package and controlled generation of follow-up content drafts from observed performance.

### Modified Capabilities

None.

## Impact

- `significanthobbies`: new `content/` JSON packages/schema, content CLI, existing blog/hobby integration, removal or redirect of standalone video routes, derived video discovery, validation/tests, sitemap/internal-link integration, and package documentation.
- `reel-pipeline`: new package intake/receipt modules, Idea Store provenance fields, CLI commands, factory/publisher receipt integration, tests, and OpenClaw-facing runbook.
- OpenClaw: deterministic command sequence and scheduling guidance only; no secrets, cron jobs, agent configuration, or production automation will be changed without explicit approval.
- Existing SaaS Maker approval and Reel Pipeline posting gates remain authoritative.
- No database migration, new runtime dependency, credential change, upload, deployment, or social post is part of the initial implementation.
