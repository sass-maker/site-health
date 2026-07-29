# Fleet Workspace — PROJECT STATUS

Last updated: 2026-07-30

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

- `foundry/ops/config/projects.json` is the sole project identity, attention,
  lifecycle, repository, deployment, and public-listing catalog.
- Automation, marketing, site, and family registries are validated policy
  overlays keyed to catalog identities; generated internal and public views
  never create project identities independently.
- Reel Pipeline produces approved media and publication handoff receipts.
- Drank supplies domain intelligence.
- PSI Swarm supplies bounded performance/site-health evidence.
- Mobile Dev Cockpit is the private mobile Fleet client.
- CodeVetter remains an independent linked product. App Health is an
  independent SaaS Maker-owned product and evidence owner. Neither is a Fleet
  Workspace package.
- Setline and India Standards are independent Significant Hobbies products.
  Their source, product planning, data, release configuration, and GitHub issue
  queues live in `Significant-Hobbies/setline` and
  `Significant-Hobbies/india-standards`; Fleet retains catalog, monitoring,
  automation, and sanitized public-projection links only.
- Fleet owns the backend-free `@saas-maker/feedback` React package. Integrating
  products own submission and storage through its `onSubmit` callback.

## Timeline

- **2026-07-29 — Private Fleet skill-run history shipped:** Added an
  owner-only, machine-local run store for Fleet skills with sanitized retained
  output, explicit capture coverage, idempotent receipts, repairable indexes,
  and structured numeric observations for future project score histories.
  Fleet-mediated Devin runs and Codex skill reads now feed the shared recorder
  without changing the underlying task result. Backfilled the authoritative
  teammate scorecard as 27 Codex and 7 Devin `summary-only` runs, with no
  numeric values inferred from prose or categorical verdicts.
- **2026-07-29 — Product-owned changelog standard and Fleet surfaces shipped:**
  Replaced raw-commit and status-document evidence links in the SaaS Maker
  projection with same-origin product changelogs and repository-native GitHub
  Issues roadmaps. Added verified, responsive `/changelog` surfaces across all
  26 maintained product websites, including SaaS Maker, Drank, PSI Swarm, and
  Motion, plus deterministic link-shape and privacy validation. Production
  verification confirmed every canonical changelog route returns HTTP 200.
- **2026-07-29 — Setline and India Standards separated from Fleet source:**
  Extracted Setline's product-only history into the new private
  `Significant-Hobbies/setline` repository, moved its status, OpenSpec history,
  and GitHub issue queue with the product, and preserved
  `setline.significanthobbies.com`. Confirmed the existing private
  `Significant-Hobbies/india-standards` repository is the newer authority and
  removed its stale embedded duplicate. Fleet now keeps only standalone
  repository, domain, automation, monitoring, and public-projection links for
  both products. No deployment, DNS, database, OAuth, or production-data
  change was performed.
- **2026-07-29 — Public GitHub repository hygiene completed:** Audited 144
  public repositories across Sarthak's account and six owner-controlled
  organizations, added accurate language/domain topics where missing, repaired
  descriptions and homepage metadata, and added or clarified README
  attribution. The profile sync guard now verifies the personal profile plus
  all six organization profiles, including explicit Sarthak attribution and
  the SaaS Maker/Significant Hobbies profiles. Historical helper repositories
  clearly identify their private Foundry maintenance boundary without linking
  public visitors to an inaccessible private repository. No deployment or
  release was performed.
- **2026-07-29 — Motion, App Health, and India Standards moved under portfolio
  ownership:** Transferred Motion and India Standards to
  `Significant-Hobbies`, transferred App Health to `sass-maker`, and reconciled
  the Fleet catalog with App Health's live SaaS Maker domains and India
  Standards' currently live compatibility hostname. Motion's public landing is
  now live at `motion.significanthobbies.com` on the `motion` Cloudflare Pages
  project; its private iOS game remains unreleased. India Standards' canonical
  domain remains release-gated.
- **2026-07-29 — Maintained repositories moved to organization ownership:**
  Transferred Email Manager and RolePatch to `sass-maker`, and Memory Map,
  Calorie, and Karte to `Significant-Hobbies`. Updated canonical Fleet,
  indexing, fresh-clone, and marketing references, while preserving GitHub's
  redirects from the old personal URLs. The personal namespace is now reserved
  for profile/personal work and historical or absorbed repositories. No
  deployment was performed.
- **2026-07-29 — What It Takes to Win restored to the active Fleet:** Replaced
  the stale `success-by-26` historical exception with the product's canonical
  name and repository, classified the live Significant Hobbies site as a
  maintained secondary product, and added its public directory metadata. The
  existing Cloudflare Pages project name remains an internal infrastructure
  identifier; no deployment was performed.
- **2026-07-29 — SaaS Maker directory refreshed and released:** Reworked the
  public homepage as a responsive workshop-style product wall, corrected the
  PostTrainLLM featured pane's full-bleed image and long-name fit, and expanded
  the privacy-filtered projection from 19 to 24 maintained listings. Email
  Manager, Knowledge Base, Memory Map, Setline, and SaaS Maker itself now have
  canonical public detail routes, bringing the visible product directory to 23
  products after intentionally excluding the personal website. SaaS Maker is
  positioned as “software as a specialized service”; private Fleet controls
  remain excluded.
- **2026-07-26 — Fleet design workflow hardened from 7/20 to 19/20:** Added a
  Fleet-owned workflow over the pinned Impeccable 4.0.2 skill payload
  (installed through npm package 3.3.1), with explicit
  preserve and overhaul lanes, project-specific design authority, reference
  and probe gates for new directions, and a machine-checkable review receipt.
  Meaningful UI work now fails closed on missing desktop/tablet/mobile
  evidence, critique or audit score floors, unresolved P0/P1 findings, failed
  project checks, or missing owner acceptance. Owner feedback is retained for
  the next iteration; aesthetic detector findings remain advisory. The skill
  is linked across active projects. No product redesign or deployment was
  performed.
- **2026-07-26 — Project coverage became catalog-generated:** Expanded the
  internal catalog to 40 identities, added Calorie, reconciled every immediate
  active checkout and all 12 inactive Git repositories, and made Mashup's
  local-only posture explicit. One deterministic generator now updates the
  internal catalog views, automation and marketing identity projections, and
  SaaS Maker's privacy-filtered data. The private console resolves inactive
  source paths and separates Past and Local-only work; the public directory
  lists 19 maintained products plus the 10 explicitly public historical
  repositories while hiding private repositories. The personal site remains a
  concise link surface rather than another portfolio mirror. No deployment was
  performed.
- **2026-07-26 — Foundry Fleet Ops runtime repaired and privately restarted:**
  Pulled the active Fleet and moved OpenClaw support agents off historical
  standalone paths onto canonical `foundry/ops/`, `foundry/services/`, and
  research workspaces. Reinstalled Fleet-owned skills, removed stale legacy
  links, and verified the capability catalog with no broken Fleet skill links.
  A clean runtime publish exposed and fixed an incomplete Ops Console package;
  the console now runs under launchd, its public health endpoint passes, and
  every console/API route fails closed with HTTP 401 unless Cloudflare Access
  identity headers are present. OpenClaw and Telegram are current and healthy,
  notifications drain successfully, and a real `fleet-ops` agent turn passed
  from the canonical workspace. The remaining private-host cutover is explicit:
  configure/verify the Cloudflare Access application, then promote exactly one
  designated host before activating schedules.
- **2026-07-26 — Mashup went fully offline, and its validation experiment was
  found to be measuring noise:** Enrichment moved to a local mlx model, so no
  subcommand needs the free-ai gateway. A feasibility audit then invalidated
  the blind study that was ready to run. The study prompt had no material
  behind it — nonsense text scores 0.434 against that archive and the prompt
  scored 0.459 — which is now gated by a measured `mashup coverage` check
  rather than a hard-coded cosine. Its five conditions shared 0–5% of their
  clips, so no preference could ever have been attributed to sequencing; a
  matched-pair design (`experiment --matched`) fixes that, and `mashup
  order-test` is the cheap mechanical pre-check. A latent bug was found where
  `plan` charged an ending penalty and `rescore` did not, silently inflating
  every human-edited timeline. Scope settled: one operator publishing to their
  own channel, software not released. 337 tests, private repo, no deployed
  surface. Fleet-wide lesson recorded — embedding cosine has a floor far above
  zero, so any relevance threshold must be measured against a nonsense
  baseline rather than hard-coded; this applies to knowledge-base, materia and
  recsys-lab too.
- **2026-07-25 — Minimal recurring Spend Guard completed:** Added a sanitized,
  idempotent machine-local spend ledger with deterministic latest JSON and
  Markdown reports, material 85%/95% quota and evidence-loss alerts, and one
  disabled weekly Cloudflare + Turso cron definition. The first manual baseline
  correctly reported Turso rows-read pressure as critical and Cloudflare
  billing visibility as unknown. Follow-up verification traced the Turso burn
  to Starboard's already-fixed index, query-shape, and FTS-rebuild paths,
  confirmed the required index in the live database, confirmed successful
  post-fix scheduled runs, and observed no counter movement across two checks.
  Added exact Turso database ownership aliases, removed the retired High Signal
  annotation Worker from current inventory, and fixed the archived Turso
  governance purpose. Cron activation,
  notification-adapter configuration, and all provider mutations remain
  deferred.
- **2026-07-25 — Mashup registered as a local Toolbox experiment:** Added the
  new clean `sarthakagrawal927/mashup` checkout to the canonical project,
  attention, marketing, and OpenSpec inventories. Its Python CLI, loopback
  editor, 178 tests, Ruff checks, Astro build, and validation commands are
  verified and pushed. It has no deployed surface; real-archive validation
  remains explicitly blocked on an owner-approved roughly 1.5 GiB download and
  the existing Fleet free-ai gateway key.
- **2026-07-25 — Cloudflare + Turso Spend Guard shipped:** Added a Fleet-owned,
  read-only skill that separates fixed subscriptions, usage charges, runtime
  consumption, quota exhaustion, and configuration exposure before judging
  spend likelihood or availability risk. It maps Cloudflare and Turso cost
  surfaces to project purpose, preserves missing billing permissions as
  unknown, tracks exposure risk separately, and returns
  keep/optimize/pause-candidate decisions. Credential-free config, FOCUS-usage,
  and Turso dependency helpers passed focused tests, capability discovery, the
  skill and specification validators, and read-only forward tests; no provider
  or production mutation occurred.
- **2026-07-25 — Founder control local acceptance passed:** Added idempotent,
  safe current-evidence backfill, mission-linked marketing receipts, and
  deduplicated owner notifications routed to Foundry Needs me. Verified the
  owner over-parity journeys, High Signal's seeded connected-brand contracts
  and Mentions build, all Fleet/component checks, and a clean-checkout console.
  The approved Pace AI-visibility canary then verified bounded mixed-provider
  coverage, normalized private retention, 68 KB rehearsal storage, $0.004
  observed fixture cost, and a $0 repeat from cache. No live provider,
  deployment, package publication, backup activation, or schedule activation
  occurred.
- **2026-07-25 — Foundry AI Visibility local slice shipped:** Added canonical
  project visibility configuration, ignored-project reactivation gates, a
  fixture-only bounded canary, normalized ledger history/comparison and cost
  receipts, recommendation-only synthesis, and an owner-facing Marketing view.
  Recurring intent remains disabled and no live provider canary ran.
- **2026-07-25 — Mature automation changes closed:** Archived the completed AI
  infrastructure, data/research, portfolio/identity, PostTrainLLM, Significant
  Hobbies, Cloudflare resilience, and Mobile Cockpit MVP OpenSpec changes after
  strict validation and merged-source verification. The live Cloudflare audit
  now reports 29/29 canonical domains healthy with no high or medium findings;
  ignored repositories are explicit non-blocking exceptions.
- **2026-07-25 — Fleet capability catalog shipped:** Added one read-only,
  dependency-free discovery surface across canonical Fleet skills, operator
  scripts, templates, and living docs, with ranked search, exact retrieval,
  generated agent context, stable JSON/dense output, and catalog diagnostics.
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

- Canonical 43-identity project/domain/deploy/lifecycle catalog with active and
  inactive checkout reconciliation, generated internal inventory views, and a
  privacy-gated SaaS Maker projection for maintained and past public work.
- Deterministic maintained-product evidence links: each public changelog stays
  on the product domain, public roadmaps resolve to GitHub Issues, public source
  links resolve to canonical repositories, and private repository links remain
  omitted.
- Product-owned responsive changelog surfaces for all 26 maintained product
  websites, seeded only from verified shipped milestones.
- Git, deployment, Cloudflare resilience, performance, SEO, AI-indexing, and
  automation health scripts.
- Read-only Cloudflare and Turso spend governance with current-provider
  retrieval, fixed-versus-usage cost separation, quota-block risk,
  project/database necessity decisions, configuration exposure scanning, and
  billable-usage normalization. An inert weekly job can append sanitized
  private snapshots and alert only on material quota, positive-cost, or
  evidence-loss changes.
- Bounded public-product browser smoke workflow with canonical manifest,
  production-safe interaction policy, and machine-readable repair handoff.
- Shared fleet and teammate skills with local agent discovery.
- Private local Fleet skill-run history with sanitized retained output,
  explicit capture completeness, structured project metric observations,
  Codex/Devin capture paths, idempotent historical backfill, and
  doctor/rebuild tooling.
- Read-only Fleet capability catalog with ranked human/agent discovery,
  generated context, stable JSON/dense output, and catalog integrity checks.
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
- Fleet-owned design workflow over pinned Impeccable with project-specific
  context, preserve/overhaul lanes, reference and direction gates,
  machine-checkable multi-viewport review receipts, score/severity/project
  checks, and durable owner feedback.
- Fleet-owned four-product spotlight contract with direct portfolio and
  personal/six-organization profile synchronization, canonical repository
  ownership checks, and explicit creator-attribution markers.
- Backend-free feedback package with consumer-owned submission, Pinpoint
  context, and local screenshot attachment.
- Fleet-root CI for every absorbed component plus guarded, source-aware local
  deploy commands for the three Cloudflare surfaces.
- Local-first founder control with an append-only mission/evidence ledger,
  owner decisions, outcome learning, daily briefs, and an owner-first console.
- Framework-independent `@saas-maker/ai-visibility` package with deterministic
  citation, mention, recommendation, rank, sentiment, competitor, provider,
  budget, cache, and provenance contracts.
- Foundry AI Visibility consumer with fixture-only manual execution, normalized
  private history/comparison, cost and cache receipts, recommendation-only
  handoff, ignored-project suppression, and disabled schedule activation gates.
- Owner-facing Marketing → AI Visibility view covering visibility,
  recommendation, rank, citations, competitor share, coverage, trend,
  freshness, and observed cost without exposing provider-owned raw responses.
- High Signal now consumes the reviewed packed AI-visibility package while
  retaining ownership of its D1 data, auth, providers, schedules, APIs, Daily
  Brief, reports, and UI. The migration merged with package, adapter, Mention,
  docs, typecheck, and web-build verification; no deployment was performed.
- Sanitized automation evidence adapters and machine-readable coverage reports;
  technical coverage remains outside the primary owner-facing navigation.

## Work queue

Open work is tracked only in [GitHub Issues](https://github.com/sass-maker/fleet-workspace/issues).
An open issue is a to-do, a linked pull request is in progress, and merge plus
issue closure makes the work done.
