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

- **2026-07-21 — SaaS Maker production boundary cut over:** Deployed the public
  directory, narrow feedback API, and private feedback Cockpit from synchronized
  `main`; all shared smoke checks passed. Created and deployed the canonical
  Blume package-docs Pages origin. Its `packages.sassmaker.com` custom domain is
  pending authenticated dashboard/API attachment.
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
- PSI Swarm performance tooling.
- Agent and notification policy, machine-host foundations, and inert schedule
  definitions.
- OpenSpec store for cross-repository fleet changes.
- Public SaaS Maker projection with Fleet-owned spotlight synchronization and
  a checked-in privacy-safe consumer snapshot.

## Todo / Planned / Deferred / Blocked

### Planned

1. Attach `packages.sassmaker.com` to the deployed `saas-maker-packages` Pages
   project after Cloudflare dashboard/API authentication is available.
2. Verify the designated operations host from a fresh clone before activating
   any schedules.
3. Prepare later legacy-repository retirement decisions without deleting
   rollback sources automatically.

### Deferred

- Archiving standalone helper repositories until source, CI, deployment, and
  rollback parity are proven and explicitly approved.
- Activating the designated operations host until shared lease and
  machine-authority checks pass.
- Building another broad browser control plane; provider-native tools and
  independent products remain authoritative.

### Blocked

- `packages.sassmaker.com` requires a signed-in Cloudflare dashboard session or
  authenticated Pages Domains API connector; the current browser/API connector
  is not authenticated.
