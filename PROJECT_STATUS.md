# Site Health — PROJECT STATUS

## Why / What

Site Health is the private owner view for projects, domain strength, web
performance, Google Search, and AI awareness. It is one product with one local
backend.

## Dependencies

- Drank provides domain-rating evidence.
- PSI Swarm provides web-performance evidence.
- Google Search Console provides search evidence.
- Configured model providers supply bounded AI Visibility observations.
- `sass-maker/saas-maker` owns reusable GitHub Actions, Fleet-owned scripts,
  and agent skills under `tooling/`.

## Timeline

- **2026-08-29:** Shipped canonical product-purpose contracts for the whole
  portfolio. All 55 in-scope canonical identities now carry a resolved
  purpose, audience, outcome, mechanism, proof, and honest next action;
  `ios-landings` stays out of scope as a factory rather than a product. The
  contracts are validated in the dossier schema, projected through SaaS
  Maker's deny-by-default public catalog, rendered on each public project
  profile, and scored by the design-workflow purpose gate at a minimum of 85
  with product / audience / value / mechanism / proof / next-action weights
  and a separate non-compensating visual score.
  `pnpm docs:purpose-contracts:check` keeps
  `docs/product-purpose-contracts-latest.md` honest against the catalog.

- **2026-08-29:** Automated retained Git history for every canonical project.
  The refresh now observes the first retained commit date, latest retained
  commit date, retained commit count, and history completeness from each local
  checkout, and the 56 verified dossiers carry those values with reproducible
  provenance instead of hand-maintained literals. Shallow checkouts are marked
  incomplete and missing checkouts stay null with a stated reason.
  `pnpm docs:projects:check` now also audits the hand-maintained catalog
  literals against the observation and lists drift by project id; 52 of 56
  projects were drifting at the time of the first audit.

- **2026-08-24:** Added a reviewed first-person public maker note to all 54
  canonical identities. Regenerated all 54 verified YAML dossiers so each
  begins with current provenance and includes the public note alongside the
  preserved verbatim owner voice. SaaS Maker consumes the deny-by-default
  projection for expanded public project profiles; private repository and
  operational evidence remains excluded.

- **2026-08-23:** Absorbed the former SaaS Ideas identity into SaaS Maker's
  `/ideas` surface. Removed its retired Pages, domain, repository, directory,
  and asset records from the canonical project catalog; the portfolio now has
  57 identities. The historical repository remains outside catalog scope.
- **2026-08-22:** Added a privacy-safe public-directory projection for every
  one of the 58 retained Fleet identities. Each catalog entry now records its
  product form, platforms, concise technology set, and first/latest dates from
  the currently retained Git history; missing local history remains explicit
  instead of being inferred.
- **2026-08-22:** Kept repositories in the owner personal GitHub profile outside
  Fleet scope by explicit owner decision. Moved the already-established,
  unique, clean portfolio checkout from the Desktop sibling path into the Fleet
  project folder; no Git histories were combined and no provider resources were
  changed.
- **2026-08-22:** Made the complete retained portfolio discoverable without
  widening operational scope. Projects now keeps the 32 current identities
  primary and exposes the other 26 archived, parked, outside-Fleet, and
  resource-only identities in a searchable collapsed section. The backend
  reloads catalog membership before projections and metric runs, and rejects
  inactive project and portfolio refresh targets.
- **2026-08-22:** Reconciled the catalog against every Cloudflare object that
  the authenticated CLI can enumerate and all 57 repositories across the six
  accessible non-Vault product organizations. Added live Email Routing
  ownership for ten zones, two private destination objects, both container
  image repositories, and the Cloudflare-managed Gateway CA. Added the six
  organization-profile repositories plus missing source links for five
  existing identities; no new or duplicate product identity was required. No
  Cloudflare resource or GitHub repository was changed.
- **2026-08-22:** Brought GitStat into Fleet as an active P2 secondary product
  and narrowed the default Projects surface to the 32 current P1/P2 identities.
  The complete 58-identity catalog still preserves P4, archived, parked,
  retained-resource, and outside-Fleet history without presenting it as the
  daily work portfolio.
- **2026-08-22:** Reconciled all 58 catalog identities against the live
  Cloudflare account. Registered GitStat's retained outside-Fleet Pages
  surface, assigned the missing SWE Interview Prep artifact bucket and job
  queues, recorded the account-level default Secrets Store as owner-unverified,
  and corrected SaaS Maker's API, inbox, and docs from live to configured but
  not deployed. No Cloudflare resources were changed.
- **2026-08-23:** Consolidated Workflows and Skills into SaaS Maker's `tooling/`
  tree, extracted Live and Journal into independent repositories, and made
  Significant Hobbies the canonical Hub plus backend. The private catalog
  remains at exactly 58 identities by replacing the two retired standalone
  identities with Live and Journal.
- **2026-08-22:** Made Site Health strictly local-only on `127.0.0.1`. Removed
  public-host allowances and trusted Cloudflare identity headers; local
  loopback and an optional owner token are the only mutation boundaries. The
  obsolete Mac launch services were retired recoverably, and the
  `fleet.sassmaker.com` route, DNS record, and Access application were removed.
  Authoritative and public DNS resolvers confirmed the hostname no longer
  resolves; the shared tunnel and its unrelated routes remain untouched.
- **2026-08-21:** Repaired the owner evidence loop. The dashboard now starts
  from one `pnpm run dashboard` command, reuses healthy local processes,
  and requests one deduplicated portfolio prefill on every invocation. Cached
  evidence remains visible while authorized free collectors run; persistent
  receipts distinguish provider observations from failed or unavailable
  attempts. Live refreshes populated all ten domain roots, all 32 performance
  targets, and all 33 Search Console properties. AI retains its last provider
  evidence and records the recurring-approval blocker without fixture fallback
  or silent spend.
- **2026-08-21:** Added provider-native Search Console daily-series and previous
  period contracts, a skill capability projection, and read-only
  reconciliation of already-authorized campaign URLs without changing
  campaign receipts.
- **2026-08-21:** Extracted Site Health into its own repository while
  preserving the historical Fleet Workspace Git history. Simplified the
  repository layout to `apps/web` and `apps/backend`; the Fleet directory is
  no longer the product repository.
- **2026-08-21:** Reduced the historical Fleet Workspace repository to the
  Dashboard web app, Dashboard backend, internal AI Visibility engine, and
  required catalog/evidence contracts. Fleet operations, skills, marketing,
  templates, historical design evidence, and the Workflows submodule were
  removed from the product repository; scripts and skills now live under
  `sass-maker/saas-maker/tooling`.

## Products

| Product | Surface | Purpose |
| --- | --- | --- |
| Site Health | `apps/web/` | Private owner-facing UI |
| Site Health backend | `apps/backend/` | Internal implementation supporting Site Health |

## Operator documentation

- [Project dossiers](docs/project-dossiers/) provide one verified YAML record
  per canonical project. Each begins with provenance and the owner's verbatim
  why, includes the reviewed public maker note, then records repository
  revisions, tracked tooling, live GitHub Actions health, domains, deployments,
  and attributed provider resources. Refresh them
  from the complete Fleet workspace with `pnpm docs:projects:refresh`.

## Features (shipped)

- Projects directory and project detail pages, including a searchable retained
  inventory separated from current portfolio counts and refresh scope.
- Privacy-safe public-directory metadata for all 54 catalog identities,
  including a reviewed first-person maker note, product form, platforms,
  technologies, and retained Git-history bounds.
- DRANK/domain-strength view.
- PSI and field-performance view.
- Google Search evidence view.
- GEO/AI-awareness view with a private provider-independent analysis engine.
- Source-specific freshness envelopes with persistent sanitized success,
  failure, unavailable, and in-progress refresh receipts.
- Every owner-command invocation requests fresh Domains, Performance, Search,
  campaign, and capability evidence, including when healthy dashboard processes
  are reused; concurrent invocations join the same source run.
- Daily Search Console graph contract, comparable previous period, and exact
  Search Console property links; legacy aggregate snapshots are never graphed
  as daily traffic.
- Applicable Fleet skill capability discovery without copying implementations
  into Site Health.
- Read-only public-evidence reconciliation for previously authorized campaign
  receipts; source receipts remain unchanged.
- Local-only web and backend surfaces with no public hostname, Tunnel, or
  Cloudflare Access dependency.

## Work queue

[GitHub Issues](https://github.com/sass-maker/site-health/issues)
