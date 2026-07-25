## 1. Preflight and migration ledger

- [ ] 1.1 Audit `saas-maker`, the complete `fleet-workspace/fleet-ops` tree,
  `mobile-dev-cockpit`, `drank`, and `reel-pipeline`: branches, tags, releases,
  open PRs/issues, worktrees, stashes, unpushed commits, LFS/submodules, generated
  artifacts, licenses, package managers, toolchains and deployment ownership.
- [x] 1.2 Record exact source URLs/default branches/SHAs and prove every source
  repository is backed up remotely before migration work.
- [x] 1.3 Inventory existing SaaS Maker showcase, cockpit, docs/Blume, packages,
  skills, workers, scripts, registries and helper paths to identify code already
  present and prevent duplicate imports.
- [ ] 1.4 Map every live domain, Cloudflare project/Worker, binding, storage
  resource, schedule, secret name, local-state path and rollback command without
  reading or copying secret values.
- [x] 1.5 Produce a migration ledger with one row per component and explicit
  source, target path, import method, checks, cutover owner and rollback target.
- [ ] 1.6 Inventory every Fleet skill, teammate skill, installer/link target,
  prompt, cron, machine service, notification adapter, local-state path and host
  prerequisite; identify hard-coded checkout paths and duplicate definitions.
- [x] 1.7 Reconcile all current project/package/skill/deploy/automation registries
  field-by-field and document the canonical catalog schema plus generated
  compatibility views required during migration.
- [x] 1.8 Audit every maintained product/runtime for PostHog, Sentry, Cloudflare
  telemetry, native crash/build evidence, custom analytics, logs, performance,
  job, cost and audit signals; distinguish source configuration, fresh verified
  delivery, intentional absence and unknown state.

## 2. Canonical monorepo foundation

- [x] 2.1 Establish the reviewed target layout for existing web apps, imported
  mobile app, services, tools, packages, skills, ops, catalog and docs without
  moving stable paths merely for cosmetic organization.
- [x] 2.2 Add thin root orchestration that discovers native component commands
  without forcing non-JavaScript projects into pnpm.
- [x] 2.3 Add `catalog/foundry.json` plus a strict schema covering products,
  components, packages, skills, repositories, attention, public projections,
  five-pillar ownership, observability, automation/evidence, ownership and
  deployment identities.
- [x] 2.4 Add deterministic generators and drift checks for legacy registries,
  public site data, package/skill indexes, and sanitized dashboard snapshots;
  prohibit independent edits to generated views.
- [ ] 2.5 Add component metadata declaring owner path, runtime/toolchain,
  dependencies, checks, deploy identity, health evidence and rollback command.
- [ ] 2.6 Add path/dependency detection and a CI matrix that runs affected native
  checks plus shared contracts.
- [ ] 2.7 Add a scheduled/manual full-matrix CI path to catch missing dependency
  edges and path-filter mistakes.
- [x] 2.8 Establish one Foundry docs entrypoint and migration-link policy without
  rewriting component-owned technical facts.

## 3. History-preserving component imports

- [x] 3.1 Import the complete Fleet Ops history into `ops/` and `skills/` without
  squashing, preserving PSI Swarm under `tools/psi-swarm`; verify attribution,
  links, licenses, scripts and native checks.
- [x] 3.2 Import Mobile Dev Cockpit history without squashing; preserve the Xcode
  project/toolchain and verify source attribution plus available build checks.
- [x] 3.3 Import Drank history without squashing; preserve data/deploy identity
  and verify source attribution plus native checks.
- [x] 3.4 Import Reel Pipeline history without squashing; preserve runtime,
  artifacts/data boundaries and verify source attribution plus native checks.
- [x] 3.5 For each import, keep the history import commit separate from path,
  workspace, documentation and integration fixes.
- [x] 3.6 Verify no secret, local state, build output, dependency tree, large
  transient artifact or unrelated dirty work entered the monorepo history.
- [x] 3.7 Record provenance for files split from one source tree into `ops/`,
  `skills/`, and `tools/psi-swarm` so path-level history remains auditable.

## 4. Foundry integration and deduplication

- [x] 4.1 Consolidate project, component, package, skill, deploy and automation
  identity into the canonical catalog while preserving stable external IDs.
- [ ] 4.2 Connect Fleet Dashboard to the shared registry/evidence contracts and
  remove duplicate project metadata only after parity tests pass.
- [ ] 4.3 Assign exactly one owner to each schedule, health check, report,
  notification and marketing responsibility; retire duplicate definitions only
  after dry-run parity.
- [x] 4.4 Integrate PSI Swarm as Foundry's local performance engine without
  changing its Node 22/local-first constraints or deployed static-app behavior.
- [x] 4.5 Integrate Drank as the domain-intelligence component and preserve its
  source/data freshness and public API/surface boundaries.
- [x] 4.6 Integrate Reel Pipeline as the approved media-production component;
  preserve separation between topic selection, approval, rendering and
  publishing.
- [x] 4.7 Integrate Mobile Dev Cockpit as a private Foundry control client
  without adding a hosted backend or expanding its product scope.
- [x] 4.8 Update local agent, automation, docs and repository references to the
  new canonical paths with compatibility shims only where temporary migration
  requires them.
- [ ] 4.9 Generate skill links for every canonical Fleet/Foundry and teammate
  skill instead of maintaining a hand-picked installer list; validate Codex,
  OpenClaw and optional Hermes discovery from a clean clone.
- [ ] 4.10 Assign every recurring job an invoking skill, owning component,
  evidence contract, bound, timeout, lock/lease, retry maximum, dry-run,
  receipt and unresolved-failure path.

## 5. Public, private, package and skill surfaces

- [x] 5.1 Evolve `apps/showcase` into the public automated-product-factory
  directory at `sassmaker.com`, generated from the catalog with one maintained
  product page, public changelog, public roadmap and machine-readable metadata.
- [x] 5.2 Add public-projection schema/ingestion with explicit allowlists and
  negative fixtures proving private status, issues, tasks, findings, user data
  and unpublished claims cannot enter public output.
- [ ] 5.3 Move package catalog/docs ownership to `apps/docs-blume` at
  `packages.sassmaker.com`, preserve durable old docs URLs through tested
  redirects/aliases, and expose local versus npm distribution accurately.
- [ ] 5.4 Add `apps/skills` at `skills.sassmaker.com`, generated from canonical
  skill metadata/frontmatter with install, authority, compatibility, source and
  schedule information plus search/AI indexing surfaces.
- [ ] 5.5 Convert `apps/cockpit` into the authenticated private Fleet control
  plane at `fleet.sassmaker.com` using sanitized server-side snapshots and
  fail-closed route/cache/source-map tests.
- [ ] 5.6 Expose builds, deploys, analytics, costs, jobs, receipts, approvals,
  private plans, machines, evidence freshness and rollback state with explicit
  loading, empty, stale, blocked, failure and success states.
- [x] 5.7 Organize private cockpit navigation and summaries under Build,
  Market, Learn, Visibility and Control, preserving stable cross-pillar action
  and receipt links.
- [ ] 5.8 Add an observability coverage matrix and per-product topology showing
  provider/purpose/runtime, configured versus fresh-verified state, privacy,
  ownership, dashboards/evidence and accepted/actionable gaps without secret
  values.
- [ ] 5.9 Build one source-owned `@foundry/ui` package from the existing design
  system and official shadcn dashboard primitives; route every web app through
  its tokens/components and reject app-local component drift.
- [ ] 5.10 Review and adapt only selected free Aceternity public components into
  `@foundry/ui`, recording source/license, removing demo copy and unnecessary
  dependencies, and honoring reduced motion.
- [ ] 5.11 Run desktop/mobile visual snapshots, keyboard/focus/contrast checks,
  responsive data-table/chart checks, reduced-motion checks and representative
  loading/empty/error/stale states for all four web surfaces.
- [ ] 5.12 Verify public pages meet fleet landing, performance, SEO and AI
  indexing standards and private pages are excluded from public indexing.

## 6. Designated operations host

- [ ] 6.1 Add an inert-by-default host role and idempotent doctor/bootstrap that
  validates toolchains, links all skills, reports missing machine-local
  authority without values, and renders services/schedules before activation.
- [ ] 6.2 Add a renewable single-primary lease/heartbeat covering cron, runtime
  skills, notification drain, machine adapters and Reel Pipeline; block overlap
  and surface state in the private cockpit.
- [x] 6.3 Add explicit promote, pause, resume, failover and revoke procedures
  with durable receipts and no source/config edit required per machine.
- [ ] 6.4 Verify a fresh clone remains inert, a configured fixture host activates
  exactly the intended jobs, a second fixture host is rejected, and expired
  lease failover is bounded and reversible.
- [ ] 6.5 Document machine-local credentials, pairings, logs, locks, receipts,
  models, caches and signing state; prove bootstrap never copies them into Git.

## 7. CI, build and deploy parity

- [ ] 7.1 Run every imported component's native lint/typecheck/test/build/docs
  checks from a clean monorepo clone and record toolchain prerequisites.
- [ ] 7.2 Verify root affected-component CI and full-matrix CI produce the same
  required checks as the source repositories.
- [ ] 7.3 Verify each deploy command in dry-run/read-only mode resolves to the
  existing expected Worker/Pages/project identity and canonical domains.
- [ ] 7.4 Record source SHA, monorepo SHA, last-known-good deployment and rollback
  command for every component.
- [ ] 7.5 Run catalog, generated-view, automation, notification, site-health,
  resilience, observability coverage, public/private boundary, accessibility,
  visual and
  Foundry dashboard integration checks against the consolidated source.
- [ ] 7.6 Run a clean-clone host doctor and inert bootstrap on this Mac; record
  the exact later steps required on the designated operations machine.

## 8. Controlled cutover

- [ ] 8.1 Prepare one cutover checklist per component and web surface covering merge, CI,
  deployment approval, smoke/parity, observation window and rollback trigger.
- [ ] 8.2 Merge source consolidation only after all required local and CI checks
  pass; do not deploy during the source-import PRs.
- [ ] 8.3 For each separately approved production cutover, deploy from the
  monorepo, run bounded live parity checks and record a deployment receipt.
- [ ] 8.4 Roll back to the recorded known-good source/deployment immediately if
  required parity fails; preserve failure evidence for a follow-up PR.
- [ ] 8.5 Update canonical GitHub links, READMEs, agent guidance, Foundry manual,
  directory and fleet registry only after the new source is authoritative.
- [ ] 8.6 Activate the designated operations host only after source, skills,
  schedules, leases, notifications and machine-service parity pass; keep this
  Mac disabled as standby unless separately promoted.

## 9. Legacy repository retirement

- [ ] 9.1 Add read-only migration notices to old repositories identifying final
  source SHA, canonical monorepo path, migration date and rollback reference.
- [ ] 9.2 Confirm old repositories have no unique unmerged work, active deploy
  workflow, schedule, issue/PR dependency or inbound documentation link.
- [ ] 9.3 Request explicit approval before archiving each old repository; do not
  delete repositories or history.
- [ ] 9.4 After approved archival, verify protections/visibility, replacement
  links and the absence of active automation from old repositories.
- [ ] 9.5 Produce a final consolidation report proving one canonical Foundry
  source, independent deployability, complete attribution and recoverability.
