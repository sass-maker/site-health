# Fleet Workspace — PROJECT STATUS

Last updated: 2026-07-21

## Why / What

Fleet Workspace is the single version-controlled home for shared operations
across Sarthak's projects. It owns the project registry, automation policy,
skills, marketing production pipeline, domain intelligence, performance tools,
mobile control client, host setup, and reviewable evidence used to keep mostly
finished products usable and discoverable.

**Users:** Sarthak and explicitly authorized local or hosted agents.

**In scope:** Fleet registries and policy; shared scripts and skills; bounded
automation; Postiz/Reel Pipeline marketing production; Drank domain
intelligence; PSI Swarm site performance; Mobile Dev Cockpit; machine-host
setup; public product projection generation; links to independent evidence
owners.

**Out of scope:** Product feature direction; a general public SaaS; duplicating
GitHub, PostHog, Cloudflare, Postiz, CodeVetter, or App Health; ingesting private
product content into public output; automatic production deploys; owning
CodeVetter or App Health source.

## Dependencies

### External

- GitHub for source, pull requests, Actions, and repository-native work.
- Cloudflare for deployed product surfaces and provider-native runtime evidence.
- Postiz for approved marketing scheduling/distribution.
- PostHog and product-native analytics where selected by each product.
- The designated operations machine for explicitly enabled cron and
  machine-only automation; fresh clones remain inert.

### Internal

- `fleet-ops/config/projects.json` is the canonical internal product inventory.
- Reel Pipeline produces approved media and publication handoff receipts.
- Drank supplies domain intelligence.
- PSI Swarm supplies bounded performance/site-health evidence.
- Mobile Dev Cockpit is the private mobile Fleet client.
- CodeVetter and App Health remain independent linked products and evidence
  owners; neither is a Fleet Workspace package.
- SaaS Maker consumes only an allowlisted public product projection and remains
  independently deployable.

## Timeline

- **2026-07-21 — Impeccable design workflow adopted:** Installed Impeccable as
  a Fleet-local, machine-scoped agent skill; added deterministic UI edit hooks,
  new-project guidance, and a critique/polish/audit shipping sequence while
  preserving `PROJECT_STATUS.md` as product-scope truth.
- **2026-07-21 — SaaS Maker production boundary cut over:** Deployed the public
  directory, narrow feedback API, and private feedback Cockpit from synchronized
  `main`; all shared smoke checks passed. Created and deployed the canonical
  Blume package-docs Pages origin; one package does not justify a separate
  vanity hostname.
- **2026-07-21 — Marketing and App Health boundaries finalized:** Reel Pipeline
  now creates Postiz drafts instead of owning a SaaS Maker queue or native
  social publishers. The pinned self-hosted Postiz contract is inert pending
  target-machine cutover. App Health now has a Cloudflare Analytics Engine/D1
  implementation pending production resources and Access setup in its own
  repository.
- **2026-07-20 — SaaS Maker/Fleet boundary corrected:** Replaced the abandoned
  direction that embedded Fleet inside SaaS Maker. Fleet Workspace became the
  canonical shared-infrastructure destination; SaaS Maker narrowed to public
  directory, maintained packages, and feedback. Source migration is in
  progress; no production cutover was performed.
- **2026-07-19 — Fleet automation contracts:** Added attention tiers, bounded
  automation registries, marketing programs, site-health tools, and host
  foundations across the workspace.
- **2026-07-13 — Fleet-wide operating standards:** Established deploy guards,
  domain/project inventory, agent layering, and shared health scripts.

## Products

| Component | Canonical path | Runtime boundary |
|---|---|---|
| Fleet Ops | `fleet-ops/` | Local/hosted scripts, skills, registries, policy |
| Reel Pipeline | `fleet-ops/services/reel-pipeline/` | Independent Node/Rust/Python media pipeline |
| Drank | `fleet-ops/services/drank/` | Independent domain-intelligence app/API |
| PSI Swarm | `fleet-ops/psi-swarm/` | Local CLI plus independently deployable static surface |
| Mobile Dev Cockpit | `fleet-ops/apps/mobile-cockpit/` | Private local/mobile Fleet client |
| Ops Console | `fleet-ops/apps/ops-console/` | Local operational view; not a SaaS Maker surface |
| Public projection | generated from Fleet registry | Sanitized static input for `sassmaker.com` |

Legacy standalone helper repositories remain rollback sources until an
explicit source/deploy cutover and later archival decision.

## Features (shipped)

- Canonical project/domain/deploy inventory and attention model.
- Git, deployment, Cloudflare resilience, performance, SEO, AI-indexing, and
  automation health scripts.
- Shared fleet and teammate skills with local agent discovery.
- Bounded marketing registry, dry-run, attribution, and quiet-experiment
  contracts.
- Draft-only Postiz adapter, sanitized marketing lifecycle snapshots, retired
  queue-boundary regression guard, and an inert pinned Postiz host contract.
- Bounded machine-local Postiz draft/evidence runners; ambiguous creates are
  quarantined for reconciliation and schedules remain disabled until canary
  acceptance.
- PSI Swarm performance tooling.
- Agent and notification policy, machine-host foundations, and inert schedule
  definitions.
- OpenSpec store for cross-repository fleet changes.
- Fleet-local Impeccable design workflow with brand/product registers,
  persistent design context, and pre-ship critique/polish/audit guidance.
- Public SaaS Maker projection with Fleet-owned spotlight synchronization and
  a checked-in privacy-safe consumer snapshot.

## Todo / Planned / Deferred / Blocked

### Planned

1. Verify the designated operations host from a fresh clone before activating
   any schedules.
2. Complete the Postiz target-host activation and one draft-only canary using
   `fleet-ops/docs/postiz-operations.md`.
3. Complete the independent App Health Cloudflare resource/Access cutover and
   one SDK-ingest canary.
4. Prepare later legacy-repository retirement decisions without deleting
   rollback sources automatically.

### Deferred

- Archiving standalone helper repositories until source, CI, deployment, and
  rollback parity are proven and explicitly approved.
- Activating the designated operations host until shared lease and
  machine-authority checks pass.
- Building another broad browser control plane; provider-native tools and
  independent products remain authoritative.

### Blocked

- `sassmaker.com` still has a zone-level cache override that supersedes the
  directory's tracked revalidation headers. An authenticated cache purge and
  rule adjustment are required so new directory releases appear immediately.
