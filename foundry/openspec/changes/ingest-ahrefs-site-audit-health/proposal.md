## Why

Fleet currently records Ahrefs Domain Rating but cannot represent Ahrefs Site
Audit health without either conflating the two metrics or silently turning an
authorization failure into a zero. The provider contract is public and
unit-free, so the ingestion and failure boundaries can be implemented and
tested now while live workspace entitlement remains owner-gated.

## What Changes

- Add a provider adapter for the Ahrefs v3 Site Audit project-health endpoint.
- Match the returned project targets to the ten canonical roots without storing
  provider project IDs or secrets in git.
- Emit a human-readable Fleet report with separately labeled health score,
  crawl state/date, crawled URLs, and error/warning/notice counts.
- Fail closed on missing credentials, 401/403 responses, missing projects,
  stale crawls, malformed responses, and partial coverage.
- Add fixture-backed contract tests and expose the command through the
  `site-health` routing surface.

## Capabilities

### New Capabilities

- `ahrefs-site-audit-health`: Authenticated, metric-safe ingestion and reporting
  for Ahrefs Site Audit project health across the canonical Fleet roots.

### Modified Capabilities

None.

## Impact

- Affects Fleet Ops site-health libraries, scripts, tests, documentation, and
  the `site-health` routing skill.
- Reads `foundry/ops/config/root-brands.json` and `AHREFS_API_KEY`; it does not
  persist the credential or add a production dependency.
- Live completion still requires an Ahrefs workspace/key entitled to Site Audit
  projects, but source implementation and all synthetic contract paths do not.
