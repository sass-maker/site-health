## Context

Foundry already owns a canonical product registry, bounded automation policy,
project/domain/deploy evidence, marketing production, domain intelligence,
performance checks, notifications, and a private Astro console. The console is
currently a read-only inventory. Its home emphasizes hosting, domains,
schedules, and component health; its marketing page emphasizes pipeline
configuration. It does not yet provide one durable object that joins an owner
goal to work, evidence, decisions, deliverables, and measured outcomes.

MissionControlHQ's visible advantage is not deeper infrastructure. It is a
clear human loop: start a mission, see what is happening, respond to requests,
and inspect results. Foundry can exceed that loop for this portfolio because it
has real repository, deploy, domain, marketing, and product evidence.

High Signal currently owns a working Mentions implementation: provider fan-out,
judging, deterministic fallback, personas, citations, competitor analysis, D1
persistence, reports, API routes, and Daily Brief integration. Its locked
product direction makes Mentions a supporting lens for the Daily Brief, not an
independent control plane. Foundry needs the same engine for recurring
portfolio-wide visibility measurement without duplicating it.

Constraints:

- Foundry is private, local-first, and single-owner.
- The designated host runs enabled schedules; fresh clones remain inert.
- Production deploys, publishing, migrations, credentials, and costly external
  work require existing approval gates.
- Tasks, traces, raw observability, code review, and provider dashboards are not
  recreated in Foundry.
- The interface must remain nontechnical at the top level.
- No fake/demo operational state may be presented as real evidence.

## Goals / Non-Goals

**Goals:**

- Give Sarthak one calm owner view of what needs attention, what is underway,
  what shipped, what changed, and what should happen next.
- Model objectives and missions durably enough that local agents, cron jobs,
  marketing tools, and provider evidence can participate in one auditable loop.
- Preserve a strict distinction between a recommendation, an approved action,
  an execution attempt, a deliverable, and a measured outcome.
- Extract AI visibility into a portable package with behavior parity in High
  Signal before Foundry begins consuming it.
- Make the post-ship loop portfolio-aware: measure, market, learn, recommend,
  and ask for owner decisions.
- Reach MissionControl feature parity where it matters and exceed it through
  real portfolio context, evidence provenance, safety, and outcome learning.

**Non-Goals:**

- A generic multi-tenant agent SaaS.
- Chat, DMs, channels, canvases, huddles, or a Buzz/Nostr substrate.
- A replacement for GitHub, Cloudflare, Postiz, CodeVetter, App Health,
  PostHog, or product-native analytics.
- Raw task, trace, log, request, or speed dashboards in the Foundry product.
- Autonomous product direction or automatic implementation of product
  features.
- Moving High Signal's Daily Brief, connected-brand UI, D1 schema, reports, or
  customer data into Foundry.
- Enabling schedules, paid providers, publication, or production deployment as
  part of the initial local implementation.

## Decisions

### 1. One owner loop, not an agent-team simulation

The primary information hierarchy is:

```text
Project
  └── Objective
        └── Mission
              ├── activity events
              ├── deliverables
              ├── evidence receipts
              ├── owner decisions
              └── measured outcomes
```

Actors are factual identities such as Sarthak, Codex, OpenClaw, a named cron
job, Postiz, or GitHub Actions. The UI may show an actor's purpose and current
work, but it will not invent personalities or imply autonomy that does not
exist.

Alternative considered: model named specialist agents as the top-level
product. Rejected because the portfolio and its outcomes—not agent theater—are
the durable user value.

### 2. Append-only event ledger with rebuildable projections

The source record is a typed append-only event:

```ts
type FoundryEvent = {
  id: string;
  type: string;
  occurredAt: string;
  recordedAt: string;
  actor: { type: "owner" | "agent" | "automation" | "provider"; id: string };
  projectId?: string;
  objectiveId?: string;
  missionId?: string;
  correlationId?: string;
  idempotencyKey: string;
  visibility: "private" | "aggregate-public";
  payload: Record<string, unknown>;
  evidence?: EvidencePointer[];
};
```

Events are immutable. Corrections, reversals, approvals, and cancellations are
new events. Materialized views provide current mission, decision, activity, and
portfolio state and can be rebuilt from the ledger. Ingestion rejects duplicate
idempotency keys.

Alternative considered: mutable task rows as the source of truth. Rejected
because provider reconciliation, retries, ambiguous writes, and approval
history need durable receipts.

### 3. Local SQLite persistence behind a small control API

The designated host stores the private ledger in one SQLite database outside
the Git repository. The domain contract and projection code live under
`foundry/ops/lib/founder-control/`. A small same-machine HTTP service exposes
typed read and mutation endpoints to the Astro console and authenticated local
tools. It uses the existing Node runtime and avoids a new hosted database.

The repository contains schemas, migrations, fixtures, and tests—not the
private database. Export produces a redacted, versioned backup artifact.

Alternative considered: D1 or a hosted control plane. Rejected for the first
version because the sole operator and automation host are local, and the system
must remain useful without a new bill or internet dependency.

### 4. Provider evidence stays referenced, not recopied

Evidence receipts normalize identity, state, timestamp, source URL/identifier,
freshness, and a safe summary. Raw traces, logs, request payloads, unpublished
content, credentials, and provider datasets remain with their owners.

Examples:

- GitHub: commit, PR, workflow run.
- Cloudflare: deployment, domain, Worker/Pages state.
- Postiz: draft, schedule, publication, metrics receipt.
- CodeVetter: review verdict link and summary.
- App Health: aggregate health/performance finding link and summary.
- AI visibility: prompt/provider/result evidence retained according to its
  bounded storage policy.

### 5. The owner inbox is a projection, not another task tracker

A **Needs me** item is generated only when a mission event requires an owner
decision, clarification, external action, or risk acceptance. It contains:

- the exact question;
- why it matters;
- the evidence and affected project;
- allowed responses;
- consequences and reversibility;
- expiry or staleness;
- the originating mission.

Resolving it appends a decision event and wakes eligible downstream work.
Foundry does not duplicate GitHub issues or implementation task lists.

### 6. Natural-language intake creates a draft mission

“Ask Foundry” is a narrow intake, not persistent chat. It turns an owner request
into a draft containing outcome, projects, constraints, approval boundaries,
evidence required, and completion criteria. Deterministic parsing handles
structured submissions; an optional AI adapter may improve the draft. No work
starts until the draft is accepted or the request is explicitly classified as
read-only.

### 7. AI visibility is a headless package with product-owned adapters

`foundry/packages/ai-visibility` becomes the canonical implementation and is
packaged as `@saas-maker/ai-visibility`. It owns:

- prompt/persona/provider contracts;
- provider-independent execution and bounded concurrency;
- deterministic response analysis;
- optional judge adapter;
- citation extraction and normalization;
- brand mention, recommendation, rank, sentiment, and competitor analysis;
- aggregation, share of voice, trend inputs, and report primitives;
- idempotency, cache fingerprints, retry classification, and budget hooks.

It does not own:

- credentials or provider account configuration;
- databases, migrations, HTTP routes, schedules, auth, or UI;
- High Signal's brand/customer model;
- Foundry's project registry or private mission ledger.

High Signal first gains contract fixtures around current behavior, then consumes
the package through a D1/API adapter. Foundry consumes the same package through
a Fleet registry/scheduler/ledger adapter. Deletion of High Signal's duplicated
engine occurs only after parity tests pass.

### 8. AI checks are bounded and cost-visible

Every run declares provider set, prompts, personas, maximum calls, maximum
concurrency, timeout, cache policy, and estimated/observed cost. Free AI or
already-configured providers are preferred. Scheduled runs remain disabled
until a local canary proves output and cost. Results distinguish unavailable,
not configured, timed out, and completed; missing providers do not become zero
visibility scores.

### 9. The console is outcome-first and progressively discloses evidence

Primary navigation:

- **Home** — Needs me, Working now, What shipped, What changed, Recommended next.
- **Projects** — posture, current objective, recent outcome, next decision.
- **Marketing** — campaigns, AI visibility, domain visibility, distribution,
  feedback, and learning.
- **Decisions** — open and historical owner decisions.
- **Activity** — concise mission timeline and deliverables.

Technical evidence is linked from details, not promoted into top-level
navigation. Tasks, Speed, Traces, and Observability are explicitly absent.
Visual implementation uses the Fleet Impeccable workflow and must pass a
desktop/mobile browser audit.

### 10. “Over parity” is an acceptance contract

MissionControl parity requires:

1. start a mission from one concise request;
2. see current work and accountable actors;
3. receive and resolve requests for input;
4. inspect a mission timeline and deliverables;
5. see scheduled work and recent runs;
6. receive a concise daily summary.

Foundry exceeds parity only when it additionally:

1. resolves every mission to canonical portfolio projects;
2. links shipped work to real repository/deploy evidence;
3. connects post-ship marketing, AI visibility, domains, feedback, and outcomes;
4. preserves approval and execution receipts;
5. ranks recommendations by evidence, impact, confidence, effort, and attention
   tier;
6. remains fully useful on the designated local host without a new hosted
   control-plane bill.

## Risks / Trade-offs

- **A large “mission” abstraction could become another task manager** →
  missions store owner outcomes and evidence; implementation tasks remain in
  GitHub/OpenSpec.
- **The ledger could collect sensitive payloads** → strict schemas, private by
  default, evidence pointers instead of raw payloads, redaction tests, and no
  credentials in events.
- **AI visibility extraction could regress High Signal** → freeze fixtures and
  contract tests first; migrate one analyzer at a time; keep the old path until
  parity passes.
- **Package publication could block migration** → support local pack/tarball
  verification first; publish only after npm auth and release approval.
- **Provider fan-out could create surprise cost** → disabled schedules,
  explicit budgets, caching, call ceilings, cost receipts, and free-first
  defaults.
- **A local database can be lost with the host** → deterministic migrations,
  periodic encrypted/private backup, export verification, and projection
  rebuild tests.
- **Too much UI could recreate the current technical cockpit** → enforce the
  five top-level questions and progressive disclosure through visual acceptance
  tests.
- **Cross-repository migration can drift** → one OpenSpec change is the
  planning authority; package contracts and consumer tests gate deletion.

## Migration Plan

1. Correct lifecycle and product-boundary documentation; capture baseline
   screenshots and current MissionControl parity gaps.
2. Add pure mission/event/decision contracts, SQLite migrations, projections,
   and tests with no UI or active automation.
3. Ingest existing read-only GitHub, deploy, marketing, domain, and notification
   evidence into the ledger through adapters.
4. Build Home, Decisions, Mission detail, Projects, Marketing, and Activity
   against fixtures; then switch to local evidence.
5. Freeze High Signal Mention fixtures and extract
   `@saas-maker/ai-visibility`; prove High Signal output parity.
6. Add Foundry project config, manual AI-visibility canary, local history, and
   Marketing UI. Do not activate cron yet.
7. Connect Postiz, Drank, feedback, and outcome receipts to missions and
   recommendations.
8. Add narrow mission intake, actor state, daily summary, and notifications.
9. Run parity journeys, Impeccable critique/polish/audit, privacy checks,
   backup/restore, and a fresh-clone host rehearsal.
10. Publish the package, deploy/update consumers, and activate schedules only
    through their separate guarded approvals.

Rollback is additive: stop the local service, keep the current read-only
console, disable adapters/schedules, and leave High Signal on its preserved
pre-extraction path until parity is proven. Event migrations are forward-only;
projections are rebuildable.

## Open Questions

- The default retention window for raw AI responses versus normalized
  aggregates must be chosen before scheduled checks activate.
- Package publication scope (`public` versus organization-restricted) must be
  confirmed before npm release; source remains open and portable either way.
- The designated host backup destination must be selected before the private
  ledger becomes authoritative.
