## Why

AI Awareness currently puts Cloudflare crawler and referral activity beside
model-answer metrics, which makes supporting discovery signals look like proof
that a product is known by AI. The owner needs one portfolio view that answers
whether core products are mentioned, recommended, and cited across the wider
web, with the evidence behind those outcomes available per project.

## What Changes

- Make provider-backed model outcomes the primary AI Awareness ledger and move
  Cloudflare crawl/referral activity into a clearly labeled supporting layer.
- Separate citations to project-owned surfaces from independent external
  sources without turning either into a composite awareness score.
- Expand each core project in place to show configured questions, provider and
  model coverage, citation sources, and supporting Cloudflare evidence.
- Retain bounded normalized citation URLs for future provider observations;
  preserve older host-only observations as explicitly unclassified evidence.
- Keep all unavailable states honest and add no provider calls, credentials,
  schedules, billing, or deployment.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portfolio-strength-console`: AI Awareness becomes a model-first portfolio
  ledger with progressive project evidence and a separate discovery layer.
- `ai-visibility`: Provider observations retain bounded normalized citation
  URLs and source provenance sufficient to distinguish project-owned from
  independent sources.

## Impact

- Fleet Console AI Awareness page, its bounded owner-outcome API, and responsive
  disclosure UI.
- Founder Control AI visibility projections and normalized event payloads.
- AI visibility and Console-focused tests, project design context, and durable
  Fleet status.
- No new dependency, public endpoint, recurring execution, provider spend, or
  production deployment.
