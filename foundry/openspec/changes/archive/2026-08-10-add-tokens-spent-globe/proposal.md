## Why

SaaS Maker currently proves that its products exist, but it does not dramatize
their shared, cumulative use. “TOKENS SPENT FOR THE WORLD” can turn verified
model usage into a memorable public expression of the studio's reach without
reviving SaaS Maker as an operational control plane or inventing metrics.

## What Changes

- Add a monumental “TOKENS SPENT FOR THE WORLD” chapter to the canonical
  `sassmaker.com` homepage, with a slowly rotating globe, a dominant lifetime
  token counter, and supporting counts for tokens today, countries served, and
  contributing projects.
- Show privacy-safe regional pulses for recent real usage and allow a visitor to
  inspect a coarse disclosure such as `CodeVetter · Tokyo · 42K tokens`.
- Add a validated Fleet command for seeding one cumulative, privacy-safe daily
  snapshot from authoritative product usage records. The snapshot contains no
  prompts, outputs, user identity, IP addresses, or precise coordinates.
- Establish the launch baseline from CodeVetter's existing authoritative token
  usage data, then accept cumulative daily snapshots as more products join.
- Publish that bounded aggregate-only snapshot with the static SaaS Maker build.
  SaaS Maker does not regain an API, database, authentication system, or private
  operational surface.
- Never substitute estimates or demo totals for missing telemetry. Before real
  data is available, render an explicit awaiting-data state while preserving
  the composition and explanatory copy.
- Preserve the existing SaaS Maker wordmark, routes, navigation labels,
  catalog, legal copy, and product links.
- Lift the globe composition slightly toward its heading and show an explicit
  last-updated timestamp so the daily seed cadence is immediately legible.

## Capabilities

### New Capabilities

- `public-token-impact`: Defines validated daily token-impact snapshots,
  privacy-safe publication, and the interactive globe presentation.

### Modified Capabilities

- `saasmaker-public-boundary`: Allows SaaS Maker to consume one explicitly
  public aggregate token-impact projection while continuing to prohibit private
  Fleet state and any SaaS Maker-owned runtime service.

## Impact

- **Public site:** `foundry/apps/public/public-directory/` gains the section,
  progressive enhancement, no-data/error fallbacks, and matching agent-readable
  copy.
- **Aggregate owner:** Fleet gains a local validation/generation command and a
  public snapshot; no Worker, database, API, or Pages project is created.
- **Participating products:** daily source values are admitted only when backed
  by authoritative token counts. Initial coverage is limited to products whose
  usage can be verified.
- **Data:** aggregate counters and bounded recent coarse-region buckets only;
  no prompt, completion, identity, raw IP, or precise-location retention.
- **Dependencies:** add pinned `three@0.185.1` as the sole browser rendering
  dependency. It has no transitive dependencies and replaces the Canvas 2D
  renderer with a procedural WebGL scene while preserving a CSS/HTML fallback.
- **Deployment:** the static section ships only after at least one verified
  snapshot exists; later daily seeds flow through the same guarded static build.
