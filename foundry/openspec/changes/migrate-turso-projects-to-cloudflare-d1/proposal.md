## Why

Six maintained Fleet projects still depend on Turso even though their application runtimes already live on Cloudflare. Moving their relational persistence to Cloudflare D1 reduces provider sprawl and credential/operations overhead, while requiring a staged cutover because these databases contain user, authentication, catalog, and automation state.

## What Changes

- Migrate `anime-list`, `karte`, `reader`, `significanthobbies`, `starboard`, and `swe-interview-prep` from Turso/libSQL to one project-owned Cloudflare D1 database per product surface.
- Replace runtime libSQL clients with D1 bindings while preserving existing API contracts, authentication behavior, query results, scheduled jobs, and local-development workflows.
- Convert each current schema and migration history into deterministic D1 migrations and add repeatable, sanitized export/import tooling for the one-time data move.
- Add per-project parity checks for schema, row counts, critical aggregates, foreign-key integrity, and representative read/write journeys before cutover.
- Stage projects independently, beginning with the lowest-risk canary; do not batch all six production cutovers.
- Keep Turso read-only as a rollback source for a bounded observation window, then retire Turso configuration only after acceptance and explicit approval.
- **BREAKING**: deployment configuration will require a D1 binding and will no longer require Turso URL/token variables after each project completes its cutover.

## Capabilities

### New Capabilities

- `project-d1-persistence`: Each scoped project uses an owned D1 binding for production relational persistence without changing its customer-visible API behavior.
- `database-cutover-safety`: Each project has a repeatable migration, verification, cutover, observation, and rollback contract that prevents unverified data loss or a fleet-wide big-bang switch.

### Modified Capabilities

- `fleet-dependency-discipline`: Fleet dependency records and project status must identify D1, rather than Turso, as the relational persistence owner after a verified project cutover.
- `cloudflare-spend-governance`: Fleet cost-surface discovery and spend governance must attribute the migrated relational workloads to D1 and stop treating retired Turso databases as active dependencies.

## Impact

- **Projects:** `anime-list`, `karte`, `reader`, `significanthobbies`, `starboard`, and `swe-interview-prep`.
- **Runtime/config:** Worker or Pages Functions bindings, Wrangler configuration, database adapters, auth adapters, scheduled jobs, environment validation, and local test bindings.
- **Data:** six Turso databases (`mal-watchlist`, `linkchat`, `reader`, `significanthobbies`, `starboard`, and `swe-interview-prep`) mapped to six project-owned D1 databases; Anime List's optional split manga connection must be collapsed or explicitly retained as a second D1 binding only if measured size/operation constraints require it.
- **Tooling/docs:** schema migrations, one-time transfer commands, verification receipts, CI checks, `PROJECT_STATUS.md`, Fleet project registry, and spend-surface scanner fixtures.
- **Dependencies:** remove `@libsql/client` and Turso-only Drizzle configuration only after each project's D1 adapter and scripts no longer need them; dependency edits must follow the Fleet code-cleanup boundary.
- **Production:** no database creation, data export/import, binding mutation, secret removal, deploy, or Turso retirement occurs during proposal review. Each mutation is a separately approved per-project task.
