## Why

Foundry has stronger project, deploy, domain, marketing, and machine-operation
truth than generic agent dashboards, but its private console exposes that truth
as infrastructure inventory rather than a coherent owner control loop.
MissionControlHQ is currently easier to understand because it centers missions,
work in progress, decisions, and outcomes. Foundry should reach parity on that
human loop and exceed it through portfolio-aware evidence, post-ship marketing,
AI visibility, and feedback.

## What Changes

- Introduce one durable model for objectives, missions, work events,
  deliverables, evidence, decisions, and outcomes.
- Replace the console's infrastructure-first home with a private founder view:
  **Needs me**, **Working now**, **What shipped**, **What changed**, and
  **Recommended next**.
- Add a concise natural-language mission intake that produces a reviewable
  mission brief; it does not become a general-purpose chat product.
- Represent agents and automations as accountable actors with bounded authority,
  current work, receipts, and escalation state rather than theatrical personas.
- Extract the reusable MentionPilot/AI-visibility engine from High Signal into
  `foundry/packages/ai-visibility` as `@saas-maker/ai-visibility`.
- Keep High Signal's Daily Brief, brand connection, Mentions lens, customer
  storage, and customer-facing reports in High Signal while consuming the
  extracted engine.
- Add Fleet-level scheduled AI mention checks, citations, competitor share of
  voice, trend history, and evidence-backed marketing recommendations under
  Foundry's Marketing surface.
- Connect approved marketing work, domain intelligence, visibility changes,
  explicit feedback, and product outcomes to the same mission/evidence model.
- Remove the retired SaaS Maker queue as an approval system of record; Foundry's
  private decision inbox becomes authoritative for Foundry-owned work.
- Preserve provider-native systems as evidence owners: GitHub for code and CI,
  Cloudflare for runtime/deploy evidence, Postiz for distribution, CodeVetter
  for code quality, and App Health for application performance.

## Capabilities

### New Capabilities

- `founder-mission-control`: Objectives, mission intake, mission lifecycle,
  accountable actors, deliverables, schedules, and the owner-first home.
- `evidence-activity-ledger`: A typed append-only event and receipt contract
  that links work, external evidence, decisions, and outcomes without copying
  provider-owned raw telemetry.
- `owner-decision-inbox`: A persistent **Needs me** queue for approvals,
  clarifications, blockers, and reversible owner decisions.
- `ai-visibility`: A reusable provider-independent package and Fleet consumer
  for AI mentions, citations, recommendation/rank analysis, competitor share of
  voice, bounded execution, and trend aggregation.
- `portfolio-learning-loop`: Post-ship synthesis across marketing, AI
  visibility, domains, feedback, and product outcomes into evidence-backed
  recommendations and follow-up missions.

### Modified Capabilities

- `marketing-control-plane`: Replace the retired SaaS Maker queue dependency
  with Foundry missions and owner decisions, and attach publication/measurement
  receipts to the shared evidence ledger.

## Impact

- **Fleet Workspace:** `foundry/apps/ops-console`,
  `foundry/packages/ai-visibility`, Fleet registries, local persistence,
  machine runners, notifications, marketing orchestration, and public/private
  projection boundaries.
- **High Signal:** Mention execution and analysis code moves behind the shared
  package contract; its API, D1 schema, Daily Brief integration, Mentions lens,
  and public reports retain product ownership.
- **Existing providers:** GitHub, Cloudflare, Postiz, Drank, PSI Swarm,
  CodeVetter, App Health, and product analytics remain authoritative and are
  referenced through typed evidence receipts.
- **Dependencies:** no Buzz/Nostr adoption, no generic chat stack, no git
  hosting, no multi-tenant SaaS platform, and no new production dependency
  until the design and package boundary are approved.
- **Deployment:** implementation will be staged locally first. Publishing the
  package, migrating High Signal, activating schedules, or deploying the
  console requires separate guarded execution and verification.
