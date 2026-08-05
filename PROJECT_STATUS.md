# Fleet Workspace — PROJECT STATUS

Last updated: 2026-08-05

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
- Fleet owns `@saas-maker/feedback` as the public client package for a shared
  Feedback product. Consumers choose either an `onSubmit` callback or a
  compatible caller-owned `ingestionUrl`; Fleet-owned ingestion, storage,
  and attachments are not yet implemented. Fleet Console now has the
  project-filtered inbox surface and normalized submission projection, which
  remains empty until an ingestion owner supplies sanitized submissions.

## Timeline

- **2026-08-05 — Scheduled Codex work gained a clean-main checkout boundary:**
  Added an explicit per-job checkout policy. Read-only audits still inspect the
  real Fleet workspace, while the mutating weekly GEO job uses a fail-closed
  scheduler clone that refuses dirty, non-main, ahead, or diverged state and
  fast-forwards to exact `origin/main` before loading versioned inputs. Existing
  per-job locks, logs, notifications, and dry-run behavior remain intact.
- **2026-08-05 — Weekly root-search evidence became complete or no-write:**
  Bound the enabled GEO Observatory schedule to the canonical ten-root query
  contract: exactly one brand, exact-domain, category, and problem observation
  per root on one date. The recorder now rejects missing, duplicate, extra,
  historical, rewritten, or mixed-date batches before appending, while the
  legacy all-project query configuration and ledger history remain readable.
- **2026-08-05 — SaaS Maker's full learning article became agent-readable:**
  Replaced the article's summary-only Markdown counterpart with the complete
  published essay, including its methodology, limitations, implementation
  example, sources, and canonical HTML reference. The existing public-route
  registry continues to drive the Markdown route, sitemap, `llms-full.txt`,
  and `/api/ai` catalog from one entry.
- **2026-08-05 — SaaS Maker canonical homepage consolidated:** The public
  directory no longer generates or links a competing `/p/saas-maker` profile.
  Its source navigation now names and consistently links the public
  `sass-maker` organization as the public source index; the private Fleet
  workspace remains intentionally undisclosed.
- **2026-08-05 — Root-domain search intent became measurable:** Added a
  validated weekly query contract for the exact ten canonical roots, with one
  active brand, exact-domain, category, and problem query per root. Ambiguous
  names carry explicit collision notes, superseded queries remain historical,
  and Fleet Console now separates factual Search Console rows from weekly live
  web-search observations while leaving missing evidence as not observed.

- **2026-08-05 — Search Console sitemap inventory was reconciled:** Added a
  preview-first, fail-closed reconciliation command over the 27 canonical
  project hosts plus all ten root domains. The live apply retained 27 project
  sitemaps, submitted the valid Astro sitemap indexes for Aliveville and
  Sarthak Agrawal, and removed 14 stale or duplicate provider entries. A final
  provider preview retained 29/29 desired sitemaps with zero reported errors or
  warnings; Karte's canonical sitemap remains provider-pending.

- **2026-08-05 — Root-domain brand identity became one validated contract:**
  Added one exact ten-domain canonical-name and alias registry, joined generated
  product JSON-LD to it by registrable domain, and aligned the independently
  owned public metadata for CodeVetter, Pace, High Signal, Karte,
  PostTrainLLM, RolePatch, Significant Hobbies, and Sarthak Agrawal. Aliveville
  already matched its canonical name. The change is merged but remains
  undeployed pending the separate production gate.

- **2026-08-05 — Applied Search work now enters measure mode:** Added a
  bounded private receipt linking a project, evidence-backed query action,
  landing page, shipped revision, and timestamp. A matching receipt newer than
  its Search observation now becomes `Wait, then measure` until a completed
  provider window can judge the change.

- **2026-08-05 — Search changes now require query-level evidence:** Portfolio
  averages and operator `site:` checks can no longer prescribe product edits.
  A Google Search change action now requires a retained non-audit query that
  meets the explicit query sample floor; otherwise the project remains in
  bounded data collection.

- **2026-08-05 — Manual indexing requests became durable Search evidence:**
  Added a private, bounded receipt for owner-confirmed Google Search Console
  indexing requests. A request newer than the last URL inspection now moves the
  project from `Fix indexing` to `Wait, then measure` without changing or
  overstating Google's reported indexing verdict.

- **2026-07-31 — Search evidence became durable and fail-closed:** The
  fleet-wide homepage auditor now persists bounded SEO pass, warning, failure,
  reachability, and failed-check evidence for the canonical 27 without
  retaining page bodies. Fetch failures can no longer appear green, and an
  unresearched content inventory is explicitly `research` rather than
  `solid`. The Search Console handoff now reflects the current eight apex
  Domain properties and routes all 27 primary-host sitemap submissions through
  the generated canonical report.
- **2026-07-31 — Provider-backed AI visibility gained a credential-free
  ingestion path:** Added strict, versioned offline observation bundles with
  provider, model, timestamp, request, cost, and canonical-project provenance;
  normalized receipts enter the existing private ledger without retaining raw
  answers or enabling live providers, credentials, schedules, or deployment.
- **2026-07-31 — Agent-surface source ownership made explicit:** Aligned every
  maintained project's `inRegistry` flag with the canonical 27-project agent
  registry, protected independently authored discovery files for App Health,
  Memory Map, India Standards, Setline, and the recovered Knowledge Base public
  landing without mapping the private operator dashboard. No deployment was
  performed.
- **2026-07-31 — Visibility inventory and sitemap reporting converged on one
  catalog:** Removed the retired TrueHire project from active indexing,
  submission, favicon, and repository-hygiene tooling while preserving its
  historical catalog entry, then archived its GitHub repository. Made
  `projects.json` the sole membership and primary-domain source for the 27
  maintained visibility targets; agent-surface metadata now fails validation
  on missing, extra, duplicate, or mismatched entries. Added a live,
  recursive sitemap submission report for all 27 primary domains plus three
  explicitly non-submit secondary hosts. The first unified production probe
  found 19/27 primary sitemaps live; the remaining source implementations need
  rollout or DNS correction. No deployment was performed.
- **2026-07-31 — SaaS Maker public discovery gained one route source of
  truth:** Consolidated the directory's 33 canonical HTML routes, Markdown
  bodies, sitemap entries, and `/api/ai` surfaces into one typed registry.
  Product profiles, policy pages, changelog, learnings, and the home directory
  can no longer drift between search and agent discovery. No deployment was
  performed.
- **2026-07-31 — Visibility remediation replaced false zeros with honest
  evidence:** PSI projection now ignores failed/null measurements and design
  projection accepts only validated review receipts. Valid independent-project
  reviews can now be preserved in a deterministic, sanitized Fleet snapshot
  containing scores and hashes but no local paths or free-form receipt content;
  a readable local receipt remains authoritative and fails closed when invalid.
  The shared agent-surface generator gained truthful Markdown, sitemap,
  alternate catalog-path, and no-config support; templated collection audits
  now verify a real sitemap member. Local first passes added or corrected public
  agent discovery and on-page search prerequisites across the weakest projects,
  while fresh PSI runs recorded current good desktop LCP for Significant
  Hobbies, Calorie, and SaaS Maker. No deployment or off-site score was
  fabricated.
- **2026-07-31 — Latest visibility evidence filled across the 27-project
  matrix:** Recorded current AI Agent Readiness, AI Crawlability, and local
  content-inventory observations for every metric-eligible project. Added
  stable brand and category search terms for the 19 projects that had no GEO
  Observatory configuration. Re-probed all 55 configured queries through
  current Web Search after rejecting semantically unrelated scraper results;
  the recorder now requires exact configured queries, two or three current
  evidence URLs, and class-consistent project-origin evidence. Completed
  HeyPace's design-review receipt, bringing the visible matrix to 27/27 latest
  observations in every family. Agent Readiness now retains public-route
  Markdown coverage and `/api/ai` catalog integrity: the first complete sweep
  found 11,351 bounded sitemap routes, checked 1,473 routes, and confirmed 293
  readable routes across all 27 projects. Large corpora use a labelled
  deterministic 250-route sample. AI Visibility remains an explicitly labelled
  fixture baseline; no synthetic historical values, deployment, or provider
  mutation was performed.
- **2026-07-30 — Metrics became the Fleet visibility workspace:** Expanded the
  evidence set to include Search Visibility, AI Agent Readiness, AI
  Crawlability, and Content Coverage. Metrics now opens as a sortable
  27-project matrix with concrete D-Rank, search, AI, PSI, LCP, and design
  values. Every cell deep-links to SEO, GEO, Performance, or Design on the
  canonical project page, where tracked search terms, AI questions, graphs,
  missing states, and run controls live. A localhost HeyPace crawlability run
  verified that one shared audit records separate Agent Readiness and
  Crawlability histories. No deployment was performed.
- **2026-07-30 — Fleet Console entrypoint became the project directory:**
  Removed the redundant Overview destination and made Projects the default.
  Every canonical row now links to its available website, owned changelog, and
  source, while missing destinations stay explicit. Metrics now fills report
  space responsively and exposes every dated observation on hover. Generic
  skill-run history was subsequently retired from the Console; its retained
  envelopes remain operational evidence only. No deployment was performed.
- **2026-07-30 — Every Fleet Console page reduced to one owner question:**
  Removed repository taxonomy, package contracts, storage explanations, generic
  measurement coverage, and static pipeline descriptions from the primary
  pages. Overview now shows only attention and newest meaningful results;
  Project statuses shows lifecycle, objective, owner decision, and next action;
  Metrics asks whether projects are becoming more visible through direct
  outcomes and supporting site-health readiness; generic skill runs stay
  operational rather than becoming product history; Marketing shows campaign
  and publishing outcomes; and Feedback is the
  project-filtered inbox with a factual zero-submission state. Connection
  topology remains secondary in System Map. No deployment or provider mutation
  was performed.
- **2026-07-30 — Fleet Console gained project-scoped historical improvement:**
  Replaced the overloaded Outputs navigation with a collapsible six-bucket
  sidebar and focused Overview, Project statuses, Metrics, Marketing, and
  Feedback views. One URL-persisted project scope now follows
  the operator across views. Comparable skill, PSI Swarm, D-Rank, and AI
  Visibility observations render as native-unit histories with start, current,
  absolute and percentage movement, observation count, and date range; one
  observation remains an explicit baseline. Skill owners remain
  storage-neutral: the central runner owns normalized envelopes and any future
  hosted D1 ingestion boundary. No deployment or provider mutation was
  performed.
- **2026-07-30 — Helpers and Console clients separated:** Corrected the
  six-bucket model to Helpers, Skills, Public Apps, Marketing, Packages, and
  Fleet Console. Moved Drank, PSI Swarm, and AI Visibility under
  `foundry/helpers/`; placed Mobile Cockpit beside Fleet Console as an
  experimental local-only client; kept Feedback as the sole public package;
  and added caller-selected, credential-free ingestion URL support without
  creating a Fleet backend or deploying any component.
- **2026-07-30 — Fleet Console became the output and integration view:** Added a
  fail-soft, privacy-bounded projection spanning all six Foundry buckets. The
  primary Outputs surface now shows skill executions and captured artifacts,
  project-level current and historical evidence, portfolio output over time,
  and deterministic improvement actions. The complete 15-transport topology is
  preserved in an accessible left-side System Map sheet. Home carries a compact
  output summary, while missing baselines and unmeasured Feedback and Marketing
  outcomes remain explicit rather than appearing as shipped.
- **2026-07-30 — Foundry organized around six product buckets:** Replaced the
  implementation-type top-level model with packages, skills, public apps,
  internal apps, Marketing, and the final dashboard. Moved Mobile Cockpit and
  the public directory under public apps; Drank and PSI Swarm under internal
  apps; Fleet Console under the dashboard; and Reel Pipeline plus Content
  Factory under Marketing. Preserved native runtimes and deployment identities,
  repaired path contracts, and documented implemented, partial, and missing
  cross-bucket connections. No deployment or data migration was performed.
- **2026-07-30 — Historical Foundry repositories retired:** Added exact
  maintained-source redirects and archived the public Reel Pipeline, Drank,
  Mobile Dev Cockpit, PSI Swarm, and Mashup repositories in Sarthak's personal
  namespace. Mashup's complete changed implementation and design evidence were
  preserved first, its nine historical issues were consolidated into Fleet
  issue #73, and the canonical editorial runtime remains under
  `foundry/marketing/reel-pipeline/editorial/`.
- **2026-07-30 — Independent-product boundary made one-way:** Removed tracked
  release and agent-instruction dependencies from standalone products to the
  private Fleet checkout while preserving product-owned validation and manual
  deploy contracts. Added a read-only catalog-driven audit of canonical product
  revisions so Fleet may orchestrate products without becoming their runtime or
  setup dependency.
- **2026-07-30 — Public credential-free workflow module extracted:** Created
  public `sass-maker/workflows`, pinned it at `foundry/ops/workflows`, and moved
  weekly public surface and HTTP performance evidence to standard public
  runners. Private package/product CI, full PSI/Lighthouse proof, provider
  inventory, registry checks, mobile proof, and deploy authority remain in
  Fleet Workspace. The public module accepts no private checkout credential
  and validates a deterministic allowlisted site manifest.
- **2026-07-30 — GitHub Actions runs bounded by explicit policy:** Split Fleet
  contracts, feedback, AI Visibility, and Ops Console checks into independent
  path-scoped workflows; made heavy macOS proof manual-only; reduced recurring
  hosted audits from daily to weekly; and added concurrency, timeouts, manual
  dispatch, and a repository check that rejects workflow-policy drift.
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

| Bucket | Component | Canonical path | Runtime boundary |
|---|---|---|---|
| Helpers | AI Visibility | `foundry/helpers/ai-visibility/` | Framework-independent helper library plus Fleet evidence consumer |
| Helpers | Drank | `foundry/helpers/drank/` | Domain-intelligence app/API |
| Helpers | PSI Swarm | `foundry/helpers/psi-swarm/` | Local CLI plus independently deployable static surface |
| Skills | Fleet skills | `foundry/ops/skills/` | Agent workflows installed as repo-local symlinks |
| Public apps | Public directory | `foundry/apps/public/public-directory/` | Static public product projection on Cloudflare Pages |
| Marketing | Reel Pipeline | `foundry/marketing/reel-pipeline/` | Node/Rust/Python orchestration, Editorial, rendering, and distribution contracts |
| Marketing | Content Factory | `foundry/marketing/content-factory/` | Reel Pipeline-owned content rendering/package scripts |
| Packages | Feedback | `foundry/packages/feedback/` | Public client package with caller-owned callback or ingestion URL |
| Fleet Console | Fleet Console | `foundry/apps/dashboard/fleet-console/` | Private operational view served from the designated host |
| Fleet Console | Mobile Dev Cockpit | `foundry/apps/dashboard/mobile-cockpit/` | Experimental local-only mobile client; future undecided |
| Substrate | Fleet Ops | `foundry/ops/` | Scripts, registries, automation, evidence, policy, and host support |
| Substrate | Public workflows | `foundry/ops/workflows/` | Pinned public submodule and credential-free GitHub Actions |

The implemented, partial, and missing cross-bucket contracts are documented in
[`foundry/README.md`](foundry/README.md#connection-map).

Historical standalone helper repositories live under `sarthakagrawal927` for
attribution and history only. They are not Fleet dependencies, CI inputs, or
setup targets. Rollback is provided by Fleet Workspace Git history and
Cloudflare deployment history, not by maintaining duplicate source.

## Features (shipped)

- Project-owned Cloudflare D1 persistence and audited cutover receipts for
  Anime List, Karte, Open Historia, Reader, Significant Hobbies, Starboard,
  SWE Interview Prep, and TrueHire, with no remaining Turso databases.
- Enforced GitHub Actions run policy with path-scoped automatic checks,
  independent package workflows, manual heavy-native proof, weekly audit
  ceilings, concurrency cancellation, job timeouts, and manual-only production
  deployment rules.
- Public, commit-pinned workflow module with an exact-schema public site
  manifest, bounded availability and HTTP latency evidence, least-privilege
  standard-runner jobs, and no private Fleet checkout path.
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
- Six explicit Foundry product buckets with category-owned canonical paths,
  native component boundaries, and an evidence-backed connection map.
- Responsive Fleet Console with a collapsible sidebar that groups Domains,
  Google Search, AI Awareness, and Performance under Metrics while keeping
  Projects, Marketing, and Feedback standalone. Project-owned views retain one
  URL-persisted 27-project scope, while the four portfolio-wide Metrics views
  have no redundant project filter. Domains includes compact pointer- and
  keyboard-inspectable D-Rank history; bounded prewarmed outcome endpoints keep
  these views independent of the full connection payload. The Console includes provider-backed
  AI Awareness, marketing-receipt coverage, explicit PSI/LCP guardrails,
  Search Visibility, AI Visibility,
  D-Rank, AI Agent Readiness, AI Crawlability, Content Coverage, PSI Swarm,
  and Design Critique reports. Agent Readiness retains public-route Markdown
  coverage, readable/checked/public route counts, and `/api/ai` catalog
  integrity as dated project histories. The Console also provides a
  success/failure skill-result ledger, a privacy-bounded Feedback inbox,
  deterministic improvement actions, a secondary 15-provider System Map, and
  fail-soft evidence.
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
- Feedback client package with Pinpoint context, local screenshot attachment,
  and consumer-supplied submission; Fleet Console has the project-filtered
  inbox and privacy-bounded projection, while shared ingestion and persistence
  remain unshipped.
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
- Credential-free provider-observation ingestion with strict bundle validation,
  partial-canary and canonical-27 gates, evidence-mode-isolated history, and no
  retained raw answer text or provider request IDs. Provider-backed runs retain
  at most 50 normalized citation URLs so Fleet can distinguish project-owned
  evidence from independent sources without storing model responses.
- Read-only Google Search Console collection plus credential-free Cloudflare
  outcome ingestion with strict normalized validation, canonical-project
  identity, private history, provider-deep-link validation, and separate
  Search, web-traffic, field-performance, crawler, and AI-referral evidence
  without changing portfolio scores. The portfolio Google Search ledger
  compares all 27 public projects and expands each row to expose bounded query
  metrics and its exact Search Console property. AI Awareness keeps Cloudflare
  values and exact zone links as subordinate discovery evidence beneath
  model-answer outcomes; Performance and Marketing expose their bounded
  Cloudflare values and breakdowns with one deduplicated portfolio update.
  Shared Domain properties and Cloudflare zones are isolated to each project's
  canonical HTTPS hostname.
- Validated ten-root search query contract with stable brand, exact-domain,
  category, and problem intents; explicit collision metadata; additive query
  history; provider-honest per-query evidence in project Search details; and
  one enabled weekly job that records the complete same-date 40-query batch or
  leaves the ledger unchanged.
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
