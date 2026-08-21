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
- `sass-maker/workflows-and-skills` owns reusable GitHub Actions, Fleet-owned
  scripts, and agent skills.

## Timeline

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
  removed from the product repository; scripts and skills were preserved in
  `sass-maker/workflows-and-skills`.

## Products

| Product | Surface | Purpose |
| --- | --- | --- |
| Site Health | `apps/web/` | Private owner-facing UI |
| Site Health backend | `apps/backend/` | Internal implementation supporting Site Health |

## Features (shipped)

- Projects directory and project detail pages.
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
