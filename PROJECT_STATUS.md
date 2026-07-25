# Fleet Workspace — PROJECT STATUS

Last updated: 2026-07-25

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
setup; shared package ownership; links to independent evidence
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

- `foundry/ops/config/projects.json` is the canonical internal product inventory.
- `foundry/ops/config/automation-registry.json` is the canonical operational
  attention, action-policy, and retirement registry; `project-tiers.md` is its
  human-readable mirror.
- Reel Pipeline produces approved media and publication handoff receipts.
- Drank supplies domain intelligence.
- PSI Swarm supplies bounded performance/site-health evidence.
- Mobile Dev Cockpit is the private mobile Fleet client.
- CodeVetter and App Health remain independent linked products and evidence
  owners; neither is a Fleet Workspace package.
- Fleet owns the backend-free `@saas-maker/feedback` React package. Integrating
  products own submission and storage through its `onSubmit` callback.

## Timeline

- **2026-07-25 — Cross-project OpenSpecs consolidated:** Imported the useful
  specs, active changes, and archived history from the three standalone Desktop
  stores into the tracked `foundry/openspec/` Fleet store. Preserved the older
  SaaS Maker retirement plan as a clearly named archived snapshot while keeping
  the newer Fleet change authoritative.
- **2026-07-25 — Inactive projects and OpenSpecs consolidated:** Collapsed the
  redundant ignored/removed split into one 12-project ignored/inactive class,
  gathered clean local checkouts under `../fleet-inactive-projects/`, and added
  a deterministic Fleet-wide OpenSpec inventory covering active, Foundry,
  inactive, and registered cross-project stores.
- **2026-07-25 — Portfolio lifecycle entrypoint corrected:** Replaced the
  stale purpose-based product list in the root README with the canonical
  attention model. All ignored/inactive projects are now explicit at the
  workspace entrypoint, while the deploy registry continues to record live
  surfaces independently from maintenance obligations.
- **2026-07-25 — Monorepo ownership boundaries normalized:** Moved all
  Fleet-owned source under `foundry/`: deployable interfaces in
  `foundry/apps/`, helper runtimes in `foundry/services/`, reusable code in
  `foundry/packages/`, and PSI Swarm in `foundry/tools/`. `foundry/ops/`
  contains policy, registries, automation, host setup, scripts, skills, agents,
  evidence, and operational docs.
- **2026-07-25 — Repository boundary cleanup:** Corrected SaaS Maker's public
  GitHub link so it no longer points visitors at the private Fleet repository,
  registered the directory in the canonical agent-surface registry, removed
  redundant embedded repository archives, consolidated shared fixtures under
  `foundry/ops/test/`, and documented the three Fleet Ops ownership zones.
- **2026-07-25 — Public product journey smoke skill:** Added a read-only
  `public-product-smoke` subskill under Fleet site health. It resolves canonical
  live products from the Fleet registry and policy, limits each product to six
  meaningful browser surfaces, requires safe functional interactions, records
  guest-state limitations, and emits an evidence-backed repair queue. Every
  project now declares whether auth is required, service-only, personalized, or
  persistence-only. The audit records naturally encountered rate-limit evidence
  without threshold testing and only recommends evidence-backed protection for
  exact costly endpoints. The manifest helper, auth contract, and exclusion
  handling have dependency-free Node tests.
- **2026-07-24 — SaaS Maker consolidated into Fleet:** Deleted
  `saas-maker-packages`, `saasmaker-api`, and `saasmaker-dashboard` from
  Cloudflare. Fleet now owns the privacy-checked public projection and static
  directory source for `saas-maker-home` at `sassmaker.com`; the operational
  console remains machine-hosted at `fleet.sassmaker.com`. Removed the stale
  `app.sassmaker.com` DNS record, retained the populated `saasmaker-db` as a
  historical snapshot, deleted both obsolete R2 buckets, and moved the
  superseded `saas-maker` repository to Sarthak's personal GitHub account.
- **2026-07-24 — Helper repositories absorbed:** Moved Reel Pipeline, Drank,
  PSI Swarm, and Mobile Dev Cockpit CI and guarded deploy ownership into Fleet
  Workspace. The superseded standalone repositories were moved to Sarthak's
  personal GitHub account for history and attribution only; Fleet paths are the
  only maintained source and the fresh-machine setup does not clone them.
- **2026-07-21 — Impeccable design workflow adopted:** Installed Impeccable as
  a Fleet-local, machine-scoped agent skill; added deterministic UI edit hooks,
  new-project guidance, and a critique/polish/audit shipping sequence while
  preserving `PROJECT_STATUS.md` as product-scope truth.
- **2026-07-23 — Feedback reduced to a package:** Consumer audit found no Fleet
  imports or hosted API calls. Reduced the retained boundary to a callback-only
  React package at `foundry/packages/feedback/`; removed API, inbox, auth,
  storage, project-key, and Worker source from Fleet.
- **2026-07-22 — SaaS Maker retirement started:** Removed the separate runtime,
  docs platform, and operational product identity; the public directory moved
  to Fleet and npm remains the package documentation surface.
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
| Fleet Ops | `foundry/ops/` | Local/hosted scripts, skills, registries, policy |
| Reel Pipeline | `foundry/services/reel-pipeline/` | Independent Node/Rust/Python media pipeline |
| Drank | `foundry/services/drank/` | Independent domain-intelligence app/API |
| PSI Swarm | `foundry/tools/psi-swarm/` | Local CLI plus independently deployable static surface |
| Mobile Dev Cockpit | `foundry/apps/mobile-cockpit/` | Private local/mobile Fleet client |
| Public directory | `foundry/apps/public-directory/` | Static public product projection on Cloudflare Pages |
| Fleet Console | `foundry/apps/ops-console/` | Private operational view served from the designated host |
| Feedback package | `foundry/packages/feedback/` | Backend-free npm package; no Fleet runtime |

Historical standalone helper repositories live under `sarthakagrawal927` for
attribution and history only. They are not Fleet dependencies, CI inputs, or
setup targets. Rollback is provided by Fleet Workspace Git history and
Cloudflare deployment history, not by maintaining duplicate source.

## Features (shipped)

- Canonical project/domain/deploy inventory and attention model.
- Git, deployment, Cloudflare resilience, performance, SEO, AI-indexing, and
  automation health scripts.
- Bounded public-product browser smoke workflow with canonical manifest,
  production-safe interaction policy, and machine-readable repair handoff.
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
- One tracked `foundry/openspec/` store for Fleet and cross-repository changes;
  project-local changes remain in their owning repositories.
- Deterministic Fleet-wide OpenSpec inventory generated from canonical project
  classifications, current checkouts, inactive history, and registered stores.
- Fleet-local Impeccable design workflow with brand/product registers,
  persistent design context, and pre-ship critique/polish/audit guidance.
- Fleet-owned four-product spotlight contract with direct portfolio/profile synchronization.
- Backend-free feedback package with consumer-owned submission, Pinpoint
  context, and local screenshot attachment.
- Fleet-root CI for every absorbed component plus guarded, source-aware local
  deploy commands for the three Cloudflare surfaces.

## Todo / Planned / Deferred / Blocked

### Planned

1. Implement the approved `foundry-founder-control-loop` OpenSpec change:
   extract a reusable AI-visibility package from High Signal, add a durable
   mission/evidence/decision model, and reshape the private console around
   owner attention and post-ship outcomes.
2. Verify the designated operations host from a fresh clone before activating
   any schedules.
3. Complete the Postiz target-host activation and one draft-only canary using
   `foundry/ops/docs/postiz-operations.md`.
4. Complete the independent App Health Cloudflare resource/Access cutover and
   one SDK-ingest canary.
5. Publish `@saas-maker/feedback@0.4.0` after npm authentication is restored.

### Deferred

- Activating the designated operations host until shared lease and
  machine-authority checks pass.
- Building another broad browser control plane; provider-native tools and
  independent products remain authoritative.

### Blocked

- Publishing `@saas-maker/feedback@0.4.0`: local npm authentication currently
  returns `E401 Unauthorized`. The verified package source remains secured in
  Fleet until registry authentication is restored.
