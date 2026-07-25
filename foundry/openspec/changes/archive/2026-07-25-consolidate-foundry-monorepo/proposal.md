> **Superseded on 2026-07-20:** The owner reversed the target architecture after
> reviewing the resulting product. `separate-saasmaker-from-fleet` now defines
> the active boundary: SaaS Maker is public directory/packages/feedback, while
> `sass-maker/fleet-workspace` owns shared infrastructure. This proposal remains
> intact as migration history and evidence; do not continue its unchecked tasks.

## Why

Foundry operations are currently split across SaaS Maker, the Fleet workspace,
Fleet Dashboard, PSI Swarm, Mobile Dev Cockpit, Drank, and Reel Pipeline,
creating duplicate registries, skills, workflows, documentation, and operational
ownership. Foundry must become one durable automated-product-factory project
that can publicly explain the fleet and privately plan, build, operate, and
market it after most products move to low-attention maintenance.

## What Changes

- Make `sass-maker/saas-maker` the canonical Foundry repository and product
  identity.
- Import the complete versioned `fleet-ops` layer plus Fleet Dashboard, PSI
  Swarm, Mobile Dev Cockpit, Drank, and Reel Pipeline into a modular monorepo
  while preserving meaningful history and independently deployable boundaries.
- Establish one root workspace, registry, documentation index, task model,
  automation contract, observability model, and path-filtered CI/release system.
- Make `sassmaker.com` the public automated-product-factory directory, with an
  allowlisted changelog and roadmap projection for every maintained product.
- Make `fleet.sassmaker.com` the authenticated private control plane for deeper
  operational evidence, approvals, backlogs, costs, jobs, machines, and
  deployment state.
- Move package documentation/catalog surfaces as needed to
  `packages.sassmaker.com`, and publish an independently indexable skill catalog
  at `skills.sassmaker.com`; both are generated from the same canonical catalog.
- Classify reusable modules by distribution (`local`, `npm`, or `skill`) without
  forcing directory moves that would break stable package names or imports.
- Build the public and private surfaces from one local shadcn-based design
  system: official open-source shadcn dashboard blocks for the dense control
  plane and a restrained set of free Aceternity components for expressive
  public sections, with no paid template or opaque UI dependency.
- Make one explicitly designated operations host the sole active owner of cron,
  Reel Pipeline, machine-only automation, and runtime skill execution; every
  other clone is disabled by default and may become a deliberate failover.
- Preserve Swift, Rust, Python, and JavaScript toolchains where they are valid;
  consolidation does not mean a forced language rewrite or one runtime bundle.
- Migrate deploy ownership and live-domain evidence without changing production
  until each component passes parity and rollback checks.
- Replace duplicate schedules, dashboards, and generated reports with one owner
  and explicit adapters.
- Add compatibility notices and archive old repositories only after source,
  history, CI, deployment, documentation, and live parity are verified and the
  archival action is explicitly approved.
- Exclude Free AI and Knowledge Base: they remain stable Toolbox infrastructure,
  not Foundry monorepo components.

## Capabilities

### New Capabilities

- `foundry-monorepo-consolidation`: Canonical monorepo structure, history
  import, multi-toolchain workspace boundaries, shared registry/docs/CI,
  deploy-parity cutover, and legacy-repository retirement.

### Modified Capabilities

None. The umbrella `complete-fleet-automation` contract remains authoritative
for telemetry, automation safety, and attention policy.

## Impact

- Repositories: `saas-maker`, the full `fleet-workspace/fleet-ops` history,
  `mobile-dev-cockpit`, `drank`, and `reel-pipeline` plus the Fleet Dashboard
  already implemented in SaaS Maker.
- Public surfaces: `sassmaker.com`, `packages.sassmaker.com`, and
  `skills.sassmaker.com`; private surface: `fleet.sassmaker.com`.
- Deployment surfaces remain independently addressable during migration.
- Git history, package/workspace commands, package distribution metadata,
  skills, CI, docs links, local agent paths, host leases, Cloudflare targets,
  and Foundry registry identities require reconciliation.
- No credentials, DNS, production deploys, repository archival, data migration,
  or destructive cleanup occurs without an explicit cutover approval.
