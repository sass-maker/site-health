## 1. Freeze the replacement boundary and protect current work

- [x] 1.1 Validate this change and mark `consolidate-foundry-monorepo` as superseded by the new two-repository boundary without erasing its history.
- [x] 1.2 Record current source SHAs and compare standalone versus imported Fleet Ops, Reel Pipeline, Drank, Mobile Dev Cockpit, PSI Swarm, CodeVetter, and App Health trees.
- [x] 1.3 Review every pre-existing dirty SaaS Maker file and assign it to retained SaaS Maker, Fleet Workspace, App Health, or explicitly superseded work before editing overlapping surfaces.

Baseline recorded before implementation:

| Source | Baseline revision | Disposition |
|---|---|---|
| `saas-maker` | `4601a2f68019a94e064a044db3eb59c7078826aa` | Retain public/package/feedback; remove imported operations after transfer |
| `fleet-ops` / Fleet Workspace | `77fbcd911ed33a05fce5f65a3b75a2317fd69000` | Canonical shared infrastructure destination |
| `reel-pipeline` | `fc9c26f37b783d2143d701f03f997aba0998e9cb` | Reconcile standalone assets with newer imported Postiz/content-factory work |
| `drank` | `e97fa60d417e065209937102857b1f8f579b2fde` | Standalone and imported source equivalent apart from generated/local artifacts and formatter config |
| `mobile-dev-cockpit` | `228d9bd99048a468ce597ef8a2d0005f06bdd280` | Reconcile newer imported protocol/workspace changes into Fleet |
| `app-health` | `867b25b8897b0365c89659b8983612cc73673566` | Independent implementation already contains the complete V0 |
| `codevetter` | `a17c51813a6f0d360fcbe6a7d792c737f6c6a665` | Independent; preserve unrelated dirty agent-workspace work |
| Fleet PSI Swarm tree | `6dc4cec7d89ecaad4718b2c67f0089fd3071d30e` | Canonical Fleet copy |
| SaaS Maker PSI Swarm tree | `73985809facc03eecaaae15d19efcf49de7a3c86` | Duplicate imported copy |

Pre-existing SaaS Maker dirty-file disposition:

- Jobs, marketing queue, error feed, latency map, and speed UI fixes are
  superseded because those Cockpit surfaces are retired from SaaS Maker.
- `workers/api/src/db.ts`'s exposed Drizzle client and migration
  `0025_foundry_operational_tables.sql` exist only for the jobs/secrets control
  plane and are superseded; they are not App Health work.
- No dirty file changes a retained showcase, package-docs, or feedback surface.

## 2. Establish Fleet Workspace as the canonical infrastructure monorepo

- [x] 2.1 Add a compliant Fleet Workspace `PROJECT_STATUS.md`, README boundary, and root orchestration metadata that identify `sass-maker/fleet-workspace` as the canonical shared-infrastructure source.
- [x] 2.2 Port the newer imported Fleet Ops host, performance, Postiz, registry, marketing, and test changes from `saas-maker/ops` into `fleet-ops`, reconciling rather than overwriting newer standalone work.
- [x] 2.3 Import and reconcile Reel Pipeline under `fleet-ops/services/reel-pipeline`, preserving unique standalone and SaaS Maker changes, attribution, native toolchain, deploy identity, and rollback source.
- [x] 2.4 Import and reconcile Drank under `fleet-ops/services/drank`, preserving attribution, native checks, data/deploy identity, and rollback source.
- [x] 2.5 Import and reconcile Mobile Dev Cockpit under `fleet-ops/apps/mobile-cockpit` as a private Fleet client without adding a hosted backend or separate product roadmap.
- [x] 2.6 Keep `fleet-ops/psi-swarm` canonical, reconcile any unique SaaS Maker copy changes, and remove duplicate skill/tool ownership.
- [x] 2.7 Add affected-component/root checks that invoke each component's native validation without forcing a shared package manager or deploy cadence.

The Reel reconciliation also imported its newer sibling `content-factory` and
the shared contract fixtures required by native tests. `npm run
check:components:native` now passes Reel Pipeline (327 Node and 98 Rust tests),
Drank, Mobile Cockpit (64 tests plus lint/typecheck), and PSI Swarm CLI/web builds.

## 3. Move registry and public projection ownership to Fleet

- [x] 3.1 Make Fleet's project registry the sole internal source of truth and remove generated-view authority from SaaS Maker.
- [x] 3.2 Add a deterministic allowlisted public product projection plus negative privacy fixtures and drift validation in Fleet Workspace.
- [x] 3.3 Make the SaaS Maker showcase consume only the checked-in public Fleet projection and prove it has no runtime dependency on private Fleet systems.

## 4. Preserve independent CodeVetter and App Health ownership

- [x] 4.1 Compare SaaS Maker's App Health SDK, Go package, contracts, UI, docs, and tests with the standalone `app-health` repository; port unique valuable work and validate it before removing SaaS Maker ownership.
- [x] 4.2 Remove the optional SaaS Maker task/session integration from CodeVetter without touching or overwriting its unrelated dirty agent-workspace changes; run the smallest desktop typecheck/tests.
- [x] 4.3 Remove CodeVetter and App Health source/package/runtime ownership claims from SaaS Maker and represent them only as independent linked products in Fleet metadata.

## 5. Retire non-feedback SaaS Maker consumers

- [x] 5.1 Replace Chess's SaaS Maker SDK/PostHog/tooling dependencies with direct analytics and local configuration while retaining feedback.
- [x] 5.2 Remove SaaS Maker testimonials and embedded changelog widgets from Starboard and SWE Interview Prep while retaining feedback and primary flows.
- [x] 5.3 Remove Significant Hobbies' unmounted testimonial/changelog code and dependencies while retaining feedback.
- [x] 5.4 Remove stale registration-only metadata, CSP allowances, old slugs, and retired SaaS Maker references where no maintained feedback integration exists.
- [x] 5.5 Audit tracked fleet runtime source and prove every remaining cross-project SaaS Maker reference is feedback-only.

## 6. Reduce SaaS Maker to directory, packages, and feedback

- [x] 6.1 Define the retained API graph—health, feedback submission/media, project-key resolution, feedback review/status, and narrowly required auth—and add a route-boundary test.
- [x] 6.2 Convert the private Cockpit into a minimal feedback inbox and remove fleet, task, workflow, job, marketing, analytics, AI, App Health, speed, observability, Droid, event, testimonial, waitlist, and operational roadmap/changelog navigation and pages.
- [x] 6.3 Remove retired API route registration, implementation, contracts, tests, OpenAPI entries, and CLI recipes while preserving feedback data and avoiding a production migration.
- [x] 6.4 Remove imported Fleet Ops, Reel Pipeline, Drank, PSI Swarm, Mobile Dev Cockpit, Droid, automation-host, and common-infrastructure source from SaaS Maker only after their canonical Fleet copies pass checks.
- [x] 6.5 Keep `@saas-maker/feedback` as the sole maintained runtime package; remove retired SDK/CLI/widgets/internal packages from the workspace and label historical packages accurately in package docs.
- [x] 6.6 Update the SaaS Maker showcase, package site, README, AGENTS guidance, catalog, generated views, and `PROJECT_STATUS.md` to the narrow product boundary.
- [x] 6.7 Reconcile the pre-existing dirty SaaS Maker changes: retain feedback/public fixes, transfer useful Fleet/App Health fixes, and explicitly supersede changes to removed surfaces.

## 7. Verification and source handoff

- [x] 7.1 Run Fleet registry/projection privacy tests and the smallest native checks for every imported or changed Fleet component.
- [x] 7.2 Run SaaS Maker feedback API tests, route-boundary tests, typecheck, public showcase build, package-docs build, and feedback widget build.
- [x] 7.3 Run targeted checks for every changed consumer plus CodeVetter and App Health; record unrelated failures without fabricating a pass.
- [x] 7.4 Verify git status, diffs, ignored artifacts, and tracked secret patterns in every touched repository; preserve unrelated user work.
- [x] 7.5 Commit and push safe source changes per repository, update this task list and durable status files, and report production deploy/data/DNS/npm/repository-archival cutovers as explicit remaining work.

Source handoff completed on 2026-07-21. No production deploy, DNS change,
database migration, npm publish/deprecation, repository archival, or Cloudflare
resource removal was performed. Those remain explicit operator-approved cutovers.
