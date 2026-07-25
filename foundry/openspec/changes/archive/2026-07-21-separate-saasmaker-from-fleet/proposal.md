## Why

SaaS Maker has become an internal control plane that duplicates stronger fleet
products and makes otherwise independent products depend on a task queue,
analytics wrappers, observability screens, and operational APIs that Sarthak
does not use as a daily decision surface. The useful product is much smaller:
a public directory, published reusable packages, and shared feedback.

The imported Fleet helpers still have value, but they belong in the existing
`sass-maker/fleet-workspace` repository rather than inside the public SaaS Maker
product. This separation makes product ownership legible and removes a false
hub from the fleet.

## What Changes

- **BREAKING:** Reduce SaaS Maker to its public product directory, package
  catalogue/documentation, and the minimum feedback API, widget, inbox, and
  project-key model needed to support shared feedback.
- **BREAKING:** Retire SaaS Maker's Cockpit control-plane surfaces and APIs for
  tasks, workflows, jobs, marketing queues, analytics, AI, observability,
  App Health, fleet control, Droid, events, testimonials, waitlists, and
  embedded changelogs/roadmaps as operational systems.
- Keep public product changelog and roadmap presentation as generated marketing
  content, not as a fleet task/control-plane database.
- Keep `@saas-maker/feedback` as the sole cross-product SaaS Maker runtime
  package. Deprecate or remove the remaining SaaS Maker SDK, CLI, widget, and
  tooling integrations after consumers are migrated.
- Make `fleet-ops` / `sass-maker/fleet-workspace` the canonical Fleet project
  for the marketing pipeline, Reel Pipeline, Drank, PSI Swarm, Mobile Dev
  Cockpit, skills, schedules, host automation, registries, and common
  infrastructure.
- Keep CodeVetter and App Health as independent products and repositories.
  Remove their SaaS Maker ownership claims without merging their source into
  Fleet.
- Preserve source history, current standalone deploy identities, and rollback
  paths until Fleet workspace parity is proven. No production deployment,
  migration, DNS change, package publication, or repository archival is part
  of this source change.

## Capabilities

### New Capabilities

- `saasmaker-public-boundary`: SaaS Maker exposes only the public directory,
  package catalogue/docs, generated product marketing data, and shared
  feedback product.
- `fleet-workspace-boundary`: Fleet Workspace owns the marketing pipeline and
  common operational helpers while preserving independent runtime boundaries.
- `saasmaker-integration-retirement`: Fleet products depend on SaaS Maker only
  for feedback, with other SDKs, widgets, APIs, and configuration removed or
  replaced by their canonical owners.

### Modified Capabilities

None. The earlier `consolidate-foundry-monorepo` change remains historical
evidence of the superseded direction; this change replaces its target
architecture rather than revising an existing capability contract.

## Impact

- Primary repositories: `saas-maker` and `fleet-ops`.
- Migration sources: `reel-pipeline`, `drank`, `mobile-dev-cockpit`, and the
  Fleet-owned PSI Swarm tree.
- Independent repositories explicitly preserved: `codevetter` and
  `app-health`.
- Consumer cleanup: Chess analytics/tooling, Starboard and SWE Interview Prep
  testimonials/changelog surfaces, Significant Hobbies dead widget code, and
  stale SaaS Maker registration/configuration across feedback consumers.
- Public surfaces retained: `sassmaker.com` and `packages.sassmaker.com`.
- API surface retained only as needed for feedback submission, feedback media,
  feedback inbox/authentication, project-key resolution, and health.
- Production state remains unchanged until a separately approved cutover.
