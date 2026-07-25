## Context

The `saas-maker` repository currently combines four different concerns:

1. a public SaaS Maker brand and product directory;
2. published packages and package documentation;
3. a private Cockpit/API control plane for tasks, marketing, jobs, analytics,
   observability, AI, App Health, and automation;
4. imported source from Fleet Ops, Mobile Dev Cockpit, Drank, Reel Pipeline,
   and PSI Swarm.

The third concern duplicates CodeVetter, App Health, PostHog/Cloudflare, Postiz,
and fleet automation. The fourth concern belongs to the already-existing
`sass-maker/fleet-workspace` repository, checked out locally as `fleet-ops`.
Several imported copies have advanced beyond their standalone source repos, so
source ownership cannot be changed by deleting directories first.

The current production system has D1 data and deployed surfaces. This change is
source-only: production removal, database migration, DNS changes, npm
deprecations, and repository archival require later explicit cutover approval.

## Goals / Non-Goals

**Goals:**

- Give SaaS Maker one legible public purpose: show products and maintained
  packages, and collect feedback.
- Keep the minimum private surface required to review and manage feedback,
  without retaining a general fleet dashboard.
- Make Fleet Workspace the sole source for shared operations, marketing
  production, skills, schedules, host automation, Drank, PSI Swarm, and Mobile
  Dev Cockpit.
- Preserve every useful helper change and source history before removing the
  imported copy from SaaS Maker.
- Remove cross-project SaaS Maker dependencies other than feedback.
- Keep CodeVetter and App Health independent in source, deployment, data, and
  product direction.
- Keep public product roadmaps/changelogs as generated marketing content.

**Non-Goals:**

- Deploying, migrating, deleting production data, changing DNS, publishing or
  deprecating npm packages, or archiving GitHub repositories.
- Merging CodeVetter or App Health into Fleet Workspace.
- Turning Fleet Workspace into another broad browser control plane.
- Rewriting Reel Pipeline, Drank, PSI Swarm, or Mobile Dev Cockpit to one
  language or package manager.
- Replacing Postiz, PostHog, Cloudflare, GitHub, CodeVetter, or App Health with
  Fleet-owned clones.

## Decisions

### 1. Use two repositories with different product boundaries

`saas-maker` remains the public SaaS Maker product. `fleet-ops`—whose remote is
already `sass-maker/fleet-workspace`—becomes the canonical operational
monorepo.

This is preferred over renaming SaaS Maker into Fleet because the public brand,
published package scope, deployment identities, and operational authority have
different audiences and failure modes. It is also preferred over keeping every
helper standalone because the user explicitly wants one common Fleet project
and the shared scripts/skills already live there.

### 2. Fleet owns canonical product metadata; SaaS Maker consumes a public snapshot

Fleet Workspace SHALL own the complete internal project registry. A generator
SHALL produce an allowlisted, deterministic public product snapshot that is
committed or synchronized into SaaS Maker. SaaS Maker SHALL not query a private
Fleet control-plane API at request time.

This preserves one source of truth without coupling the public site to the
operations host. Private tasks, failures, credentials, machine state, and
unpublished claims are excluded by schema and tests.

### 3. Feedback is the only shared SaaS Maker runtime

SaaS Maker retains:

- project identity and public project-key resolution needed by feedback;
- feedback submission and optional image upload;
- authenticated feedback review/status management;
- `@saas-maker/feedback` and its documentation;
- health and narrowly required authentication routes.

The private interface becomes a feedback inbox, not a fleet Cockpit. Existing
tables and migrations may remain temporarily for data safety, but retired
routes and UI are removed from the shipped source graph.

### 4. Public changelogs and roadmaps are content projections

The public directory may show a product's changelog and roadmap, but those are
generated from repository/status/catalog inputs owned by Fleet. SaaS Maker does
not retain task workflow, changelog CRUD, or roadmap-board ownership merely to
render marketing content.

### 5. Move helpers only after source reconciliation

Fleet Workspace receives canonical paths:

- `services/reel-pipeline/`
- `services/drank/`
- `apps/mobile-cockpit/`
- `psi-swarm/` (already canonical)
- existing `skills/`, `scripts/`, `automation/`, `config/`, and host tooling

For Reel Pipeline, Drank, Mobile Dev Cockpit, and Fleet Ops, the SaaS Maker
import is compared with the latest standalone `main`; unique committed changes
are ported and validated. Only then is the SaaS Maker copy removed. Standalone
repositories remain rollback sources until a later archival decision.

### 6. Independent products stay independent

CodeVetter loses its optional SaaS Maker task handoff because the task API is
retired, but no CodeVetter source is merged into Fleet. App Health receives any
unique App Health SDK/UI/API work worth preserving, but remains a standalone
repository and deployment. Neither product reports through SaaS Maker.

### 7. Retire package consumers before package publication changes

Consumer source is migrated first:

- Chess uses direct analytics and local tooling rather than retired SaaS Maker
  wrappers.
- Starboard and SWE Interview Prep stop embedding SaaS Maker testimonials and
  changelog widgets.
- Significant Hobbies removes unmounted testimonial/changelog code and
  dependencies.
- Other products keep only `@saas-maker/feedback` when they use SaaS Maker.

The repository then marks only feedback as maintained. Actual npm deprecation
or unpublish operations are a later explicit release action.

### 8. Preserve dirty work by disposition, not by blanket reset

Current uncommitted SaaS Maker changes are reviewed file by file. Changes to a
retained feedback/public surface are incorporated. Changes to an operational
surface are transferred to Fleet/App Health if still useful or explicitly
recorded as superseded. No blanket reset or destructive cleanup is used.

## Risks / Trade-offs

- **Imported and standalone helper trees have diverged** → reconcile per file,
  run each component's native checks, and retain standalone remotes as rollback
  references until parity is demonstrated.
- **Removing API route registration can strand production consumers** → audit
  tracked consumers and production smoke targets before source removal; deploy
  only through a separately approved cutover.
- **Feedback currently shares auth/database code with Cockpit features** → keep
  the existing data model initially and minimize route/UI reachability before
  considering a data migration.
- **A static public snapshot can become stale** → Fleet owns a deterministic
  generator and drift check; synchronization happens through reviewable commits,
  not hidden runtime coupling.
- **The public package site may document retired packages** → label historical
  packages clearly and make feedback the only maintained cross-product runtime.
- **Cross-repo implementation is large** → land boundary-safe commits per
  repository, validate each repository independently, and do not combine source
  cleanup with production cutover.

## Migration Plan

1. Freeze the architectural target in this change and mark the old Foundry
   consolidation target as superseded by decision.
2. Reconcile and transfer unique Fleet helper work into `fleet-ops`, preserving
   source attribution and native checks.
3. Port unique App Health work to `app-health`; remove only SaaS Maker ownership
   and integration, not App Health capability.
4. Remove non-feedback SaaS Maker consumers from fleet products.
5. Reduce SaaS Maker workspaces, API route registration, private UI, tests,
   docs, catalog, and packages to the retained boundary.
6. Add Fleet-owned public projection generation and make the SaaS Maker showcase
   consume that projection.
7. Run repository-local validation, build the public/package/feedback surfaces,
   and record what production cutover remains.
8. Commit and push source changes per repository. Do not deploy.

Rollback before production cutover is a Git revert in each repository. After a
future cutover, the existing standalone helper repositories and last-known-good
Cloudflare deployments remain rollback targets until separately archived.

## Open Questions

None block source implementation. Final production domains for the minimal
feedback inbox and the timing of npm deprecations remain explicit later
cutover/release decisions.
