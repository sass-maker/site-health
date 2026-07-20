# Fleet Workspace — PROJECT STATUS

Last updated: 2026-07-20

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

## Todo / Planned / Deferred / Blocked

### Planned

1. Complete source reconciliation for Reel Pipeline, Drank, Mobile Dev Cockpit,
   and newer Fleet Ops changes under their canonical Fleet paths.
2. Generate the privacy-allowlisted public SaaS Maker product projection from
   Fleet's canonical registry.
3. Add affected-component validation and verify clean-clone behavior.
4. Prepare, but do not execute, later deploy and legacy-repository cutovers.

### Deferred

- Archiving standalone helper repositories until source, CI, deployment, and
  rollback parity are proven and explicitly approved.
- Activating the designated operations host until shared lease and
  machine-authority checks pass.
- Building another broad browser control plane; provider-native tools and
  independent products remain authoritative.

### Blocked

- Production cutover, DNS changes, scheduler activation, npm publication, and
  repository archival require separate explicit approval.
