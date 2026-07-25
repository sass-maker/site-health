## Why

Fleet's spend guard currently audits Cloudflare while several active products
also depend on Turso. Turso has a separate calendar-month quota model, optional
overages, and row-scan billing semantics, so Cloudflare evidence alone can miss
both real spend and imminent fail-closed database outages.

## What Changes

- Extend `cloudflare-spend-guard` with a read-only Turso audit lane for current
  plan, overage mode, quotas, billing-cycle usage, database attribution, and
  project necessity.
- Detect tracked Turso/libSQL exposure in Fleet projects without reading
  connection strings, tokens, local environment files, or CLI config files.
- Use authenticated read-only Turso CLI or Platform API surfaces for
  organization usage, database inventory, and database-level inspection.
- Distinguish a paid Turso plan or enabled overages from a free fail-closed
  quota; never turn missing billing evidence into `$0`.
- Add query-efficiency guidance for excessive row scans while preventing raw SQL
  literals or database contents from being persisted in reports.
- Keep database changes, plan changes, overage changes, migrations, deletes,
  tokens, and production configuration outside the skill.

## Capabilities

### New Capabilities

- `turso-spend-governance`: Read-only Turso plan, quota, usage, database
  attribution, necessity, optimization, and evidence-safe reporting for Fleet.

### Modified Capabilities

None.

## Impact

- Updates the Fleet-owned `cloudflare-spend-guard` skill, its evidence
  references, deterministic configuration scanner, tests, and UI metadata.
- Adds no dependency, schedule, database query, provider mutation, credential
  handling, production configuration, deployment, or migration.
- Reuses the existing Fleet registry and project status files to map Turso
  databases and dependencies to active, parked, retired, or unowned products.
