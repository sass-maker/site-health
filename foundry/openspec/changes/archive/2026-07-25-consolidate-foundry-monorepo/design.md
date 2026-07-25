## Context

Foundry currently spans SaaS Maker, the complete Fleet Ops layer, six named
product/helper entries, and several runtime shapes. SaaS Maker already owns the
public showcase, Next.js cockpit, Blume package docs, API, CLI, widgets,
Symphony, skills directory, and shared project registry. Fleet Ops owns the
cross-repository skills, automation, notifications, scripts, public console,
agent wiring, and PSI Swarm source. Mobile Dev Cockpit is an Apple-platform
control client; Drank owns domain intelligence; Reel Pipeline owns bounded media
production and handoff. Their operating purpose is one factory, but source,
catalogs, schedules, docs and evidence remain fragmented.

The target is one canonical, modular `sass-maker/saas-maker` monorepo. “One
project” means one Git repository, catalog, ownership model, documentation
entrypoint, task system, design system, automation contract and integration CI.
It does not mean one language, one deploy artifact, one database or one process.
The operator is currently the only user, so the implementation can avoid
premature tenant abstractions while retaining real authentication, least
privilege, and explicit public/private data boundaries.

## Goals / Non-Goals

**Goals:**

- Preserve meaningful source history and attribution for every imported helper.
- Provide one understandable monorepo structure for apps, services, tools and
  shared packages.
- Keep each runtime independently buildable, testable, deployable and
  rollback-capable.
- Eliminate duplicate registry, schedule, dashboard, docs and ownership paths.
- Present a polished public automated-product-factory directory with maintained
  product changelogs and deliberately public roadmaps.
- Present a beautiful, dense, authenticated private control plane without
  leaking raw provider data or private project content into browser bundles.
- Make local packages, npm packages, and skills independently discoverable from
  one catalog and shared design language.
- Make a designated operations host reproducibly run all checked-in skills,
  schedules, machine services, and Reel Pipeline work without source edits.
- Keep current domains, Worker/Pages identities and data bindings stable through
  the cutover.
- Make a fresh clone capable of validating all components with documented
  toolchains and bounded root commands.
- Retire old repositories only after parity evidence and explicit approval.

**Non-Goals:**

- Rewriting Swift, Rust, Python or Node components into one language.
- Combining all Cloudflare deployments into one Worker.
- Moving Free AI or Knowledge Base into the monorepo.
- Building multi-tenant accounts, billing, organizations, or role matrices for
  hypothetical users.
- Changing credentials, DNS, production data, bindings or product behavior as
  part of source consolidation.
- Shipping every future Foundry idea before consolidation is complete.

## Decisions

### Modular monorepo and current-path-aware layout

The existing SaaS Maker paths are retained where they already express a stable
boundary. New imports converge on the following ownership:

```text
apps/
  showcase/         sassmaker.com public factory, directory, changelogs, roadmaps
  cockpit/          fleet.sassmaker.com authenticated private control plane
  docs-blume/       packages.sassmaker.com package catalog and documentation
  skills/           skills.sassmaker.com skill catalog and installation guidance
  mobile-cockpit/   imported Apple control client
packages/           existing local/npm modules plus shared catalog/UI contracts
skills/             Foundry-owned and imported Fleet skills
services/
  drank/            domain intelligence
  reel-pipeline/    rendering and approved publication handoff
tools/
  psi-swarm/        local performance engine and deployed web surface
ops/                imported Fleet scripts, automation, notifications and console
catalog/            the sole hand-edited Foundry catalog and schema
docs/               one Foundry manual with component-owned sections
```

Mobile Dev Cockpit may retain an Xcode project under an app-specific directory;
non-JavaScript components retain native manifests and toolchains. Root commands
or a small task runner orchestrate them without pretending pnpm owns Swift/Rust.
Existing package paths are not reorganized merely to encode distribution;
catalog metadata declares `local`, `npm`, or `skill` and preserves stable import
and publication names.

### One catalog, multiple generated views

`catalog/foundry.json` SHALL become the sole hand-edited source for product,
component, package, skill, repository, attention, surface, changelog, public
roadmap, evidence, observability, automation, and ownership metadata. It is schema-validated
and uses stable IDs. Existing `foundry.projects.json`, Fleet project/deploy
manifests, automation registries, package indexes, skill indexes, and dashboard
snapshots become generated compatibility views during migration and are removed
when their consumers move. CI fails if generated output differs from the
catalog; no generated view may be edited independently.

Product repositories remain authoritative for code and detailed private product
status. A Foundry ingestion adapter reads their approved structured contract and
projects only explicitly public changelog entries and roadmap items into the
catalog snapshot. Raw `PROJECT_STATUS.md`, issues, internal tasks, security
findings, unpublished claims, user/customer data, and private notes never become
public by default.

### Five-pillar operating model

Every Foundry capability, navigation destination, catalog contract, schedule,
and owner maps to exactly one primary pillar and may declare secondary pillars:

- **Build:** specifications, agents, source, packages, skills, CI, releases and
  deployment readiness.
- **Market:** public directory, changelogs, roadmaps, indexing, content,
  distribution and attributed experiments.
- **Learn:** product analytics, experiments, feedback, research, outcomes and
  recommendations.
- **Visibility:** health, telemetry, errors, performance, costs, jobs, evidence
  freshness and audit history.
- **Control:** approvals, schedules, machines, retries, leases, rollback,
  emergency stops and authority boundaries.

The private cockpit uses these pillars as its top-level information
architecture. Public pages draw from Build, Market and explicitly public Learn
outcomes but never expose private Visibility or Control data. Cross-pillar flows
retain one canonical action/receipt identity so a build can be traced through
marketing, learning, visibility and operator control without copying state.

### Observability topology

The catalog records observability per product and runtime, not as one boolean.
Each adapter declares provider (`posthog`, `sentry`, `cloudflare`, `native`, or
another named provider), purpose (`product-analytics`, `errors`, `crashes`,
`logs`, `performance`, `jobs`, `cost`, or `audit`), runtime/surface, event or
signal families, privacy classification, collection mode, dashboard/evidence
reference, owner, freshness window, health state and accepted gaps. Provider
credentials, DSNs and private payloads are never catalog fields.

Foundry generates a private coverage matrix and a per-product topology from
this metadata plus normalized evidence. “Configured” and “verified receiving
fresh data” are distinct states. Local-first desktop/mobile tools may explicitly
use privacy-safe native crash/build evidence instead of remote product analytics;
the system does not force PostHog or Sentry where they add no value. Duplicate
SDKs, double page-view capture, missing consent/privacy boundaries, unowned
dashboards and stale ingestion are actionable findings.

### Public and private product surfaces

`apps/showcase` evolves into the public automated-product-factory site at
`sassmaker.com`. Every maintained product receives a canonical directory page,
purpose, current state, links, dated public changelog, public roadmap, and
machine-readable metadata. Ignored and Removed entries remain excluded unless
an explicit attribution page is approved. Pages are statically rendered where
possible for speed, search indexing, AI indexing, and resilience.

`apps/cockpit` becomes the authenticated private control plane at
`fleet.sassmaker.com`. It consumes sanitized server-side snapshots rather than
fetching raw GitHub, Cloudflare, analytics, job, or machine credentials in the
browser. It may expose builds, deployments, evidence freshness, failures,
analytics, costs, jobs, receipts, approvals, private roadmap/backlog, machine
health, observability topology, and rollback state. Authorization is fail-closed. Public and private
routes have separate build/deploy checks and no shared browser payload containing
private fields.

`apps/docs-blume` moves package/catalog documentation to
`packages.sassmaker.com` with redirects or compatibility routes for durable old
docs URLs. `apps/skills` is an independently indexable catalog at
`skills.sassmaker.com`, generated from the same catalog and skill frontmatter.
It documents purpose, authority, prerequisites, compatible runtimes, install
method, schedules that invoke it, and source path without exposing internal
credentials or private prompts.

### UI system and visual quality

The existing shadcn-compatible local UI becomes the single design foundation.
The cockpit starts from the official open-source shadcn dashboard block and
keeps operational pages dense, keyboard-accessible, scannable, and responsive.
Charts use the existing/local Recharts-compatible shadcn chart primitives;
tables, command search, drawers, filters, badges, skeletons, empty states, error
states, and approval dialogs use source-owned shadcn components.

Public surfaces share typography, spacing, colors, cards, navigation, and
content primitives through a local package. A small reviewed set of free
Aceternity components may add depth to the public hero, factory flow, bento
overview, and changelog transitions. Decorative motion is never used in dense
operator workflows and must respect reduced motion. No paid block, copied
proprietary dashboard, unreviewed registry item, or broad UI dependency is
accepted. Reused source retains required license/attribution records.

Visual acceptance includes desktop/mobile screenshots, loading/empty/error/
stale/blocked states, keyboard navigation, focus order, contrast, reduced
motion, responsive tables/charts, and no duplicate headings or content-derived
layout breakage.

### Designated operations host and failover

The second machine becomes the sole active operations host for cron, runtime
skills, OpenClaw/mobile control, notification draining, machine-only adapters,
and Reel Pipeline execution. A clone is inert by default. Activation requires a
machine-local role plus an explicit install command and creates a lease/heartbeat
visible in the private cockpit. Jobs fail closed when another healthy primary
owns the lease. This Mac remains the development and disabled standby host until
an explicit promotion; failover is documented, reversible, and receipt-backed.

Credentials, device pairings, logs, locks, receipts, render caches, model files,
signing material, and other machine state remain outside Git. A bootstrap doctor
reports prerequisites and missing authority without printing values.

### History-preserving imports

Before each import, record source repository URL, default branch, exact source
SHA, tags, open PRs, releases, submodules/LFS use, ignored generated artifacts,
and unpushed work. Import into a dedicated migration branch using a reviewed
history-preserving method such as `git subtree add` without squashing or an
equivalent filtered-history merge. Never rewrite or delete the source repo
during import.

Each import is its own reviewable commit/PR followed by path normalization in a
separate commit. This keeps provenance distinguishable from consolidation edits.

### Shared contracts, independent runtimes

Shared packages own only stable cross-component contracts: project identity,
evidence envelopes, task/action receipts, authentication clients, and common UI
tokens where compatible. Components do not import private internals from one
another. Runtime deploy configs remain component-local and preserve existing
Cloudflare names, domains, bindings and rollback commands.

### CI and release model

Root CI first validates registry/docs and detects changed components. A
path-filtered matrix then runs each affected component's native checks. A weekly
full matrix prevents path-filter mistakes. Production deployment remains
manual and component-specific; a monorepo commit may contain several components
but each release receipt identifies the exact component path and source SHA.
Public/private boundary tests, catalog generation checks, skill validation,
license inventory, accessibility checks, and representative visual snapshots are
shared gates. Heavy browser suites remain release/full-matrix checks rather than
making every small PR slow.

### Data, credentials and local state

No secrets or machine-local state move through Git. Existing Cloudflare
bindings, D1/KV/R2/Queue/Workflow resources, local SQLite data, Xcode signing,
and publishing credentials remain external. Migration documentation maps old
configuration owners to new component paths without printing values.

### Alternatives considered

- **Keep a federation of repositories:** preserves smaller clones but leaves the
  catalog, skills, schedules, CI and ownership split—the problem being solved.
- **One deployable application:** simpler conceptually but couples unrelated
  runtimes and creates a dangerous release/rollback blast radius.
- **Separate repositories with a generated portal:** improves discovery but not
  operational ownership, agent paths, history, or host reproducibility.
- **Paid dashboard template or large component framework:** initially faster but
  adds opaque code, licensing risk, visual drift, and dependency weight. Local
  shadcn source plus selected permissive blocks is easier to own long-term.

### Cutover and retirement

For each helper:

1. Freeze source SHA and audit unmerged/unpushed work.
2. Import history and restore build/test parity in the monorepo.
3. Update registry/docs/CI references and prove dry-run deployment identity.
4. Merge and, only with approval, deploy from the monorepo.
5. Observe parity and rollback readiness.
6. Mark the old repo read-only with a migration notice.
7. Archive the old repo only after explicit approval.

Rollback before archival is to deploy from the prior source repository/known
good SHA. After archival, the old repository remains recoverable and the known
good deployment version remains recorded.

## Risks / Trade-offs

- **History import creates conflicts or huge Git growth** → Import one helper at
  a time, preserve source tags/SHAs, and separate import from cleanup.
- **Multi-toolchain root becomes brittle** → Keep native commands authoritative
  and use thin orchestration only.
- **Path filters skip required checks** → Maintain a dependency map and run a
  scheduled full matrix.
- **Shared packages create coupling** → Share contracts, not implementation
  internals; preserve component APIs.
- **Cutover changes production accidentally** → Separate source migration from
  deploy approval and verify exact deploy identities in dry-run/read-only mode.
- **Old repos continue receiving work** → Add prominent read-only notices,
  archive after approval, and update agent/repository links centrally.
- **One agent attempts a big-bang merge** → Require component-by-component PRs
  and a final integration gate.
- **Public roadmap leaks internal work or creates accidental commitments** →
  Require explicit public fields, preview diffs, schema validation, and private
  field negative tests.
- **Private dashboard authentication fails open** → Keep private snapshot APIs
  server-side, test unauthenticated access, and block cutover on any browser
  bundle or route leak.
- **Two machines run the same cron** → Require an explicit host role, renewable
  lease, overlap test, and visible heartbeat before enabling schedules.
- **Beautiful UI becomes decorative or slow** → Measure core routes, limit
  motion/dependencies, test reduced-motion and mobile states, and keep dense
  operational views visually quiet.

## Open Questions

- The applying agent must inspect whether SaaS Maker already contains canonical
  dashboard or helper packages and avoid importing duplicates.
- Repository transfer/archive permissions and production cutover credentials may
  be external blockers; they do not block source consolidation and local parity.
- Final transfer of the canonical repository to a personal GitHub owner, if
  desired, is a later ownership operation; it does not change the monorepo
  design and requires explicit confirmation before changing remotes.
