# D1 migration preflight

Retrieved from current Cloudflare documentation on 2026-08-01. These are the
constraints that materially affect the six-project Turso migration; they are
not proof of current account plan, usage, cost, or database size.

## Import and schema

- D1 imports SQL text rather than raw SQLite database files. Raw SQLite files
  must be converted with `sqlite3 .dump`; the dump must omit outer
  `BEGIN TRANSACTION` / `COMMIT` statements and any `_cf_KV` table definition.
- `wrangler d1 execute --file` accepts imports up to 5 GiB. Larger transfers
  must be split. The project inventory must still compare every database
  against the lower per-database limit of the active Cloudflare plan.
- D1 uses SQLite semantics but not every libSQL client behavior is a binding
  API equivalent. Each project must inventory result-shape, batch,
  transaction, pragma, and parameter-count assumptions.
- Imports and migrations must use deterministic SQL files. D1 migrations are
  ordered, recorded in `d1_migrations`, and may use a configured
  `migrations_dir` / `migrations_pattern`. A failed migration is rolled back
  while earlier successful migrations remain applied.
- Foreign-key-sensitive migrations can use `PRAGMA defer_foreign_keys = true`;
  cutover verification must run explicit foreign-key checks afterward.
- D1 export is not supported for virtual tables, and a running D1 export blocks
  other requests. The Turso source inventory must identify FTS/virtual tables
  before generating a transfer procedure.
- Integer values returned through JavaScript can lose precision beyond the
  52-bit safe range. The inventory must flag `int64` identifiers/counters.

## Runtime and local isolation

- Production application access should use a declared D1 Worker/Pages binding.
  The binding API exposes prepared statements and typed result methods; it is
  not a drop-in remote libSQL URL.
- Wrangler and the REST API can perform operator queries, but application
  request paths should use bindings. This confirms that database-touching
  GitHub workflows need a Wrangler-driven or Worker-bound design.
- Wrangler local development uses local simulated D1 state by default and
  persists it across runs. Tests that require a clean database must use an
  explicit isolated persistence directory or reset procedure.
- `--remote` must remain an explicit production operation. Repository scripts
  and CI must not make it the default for development or tests.

## Limits that affect design

- Current documented per-database maximums are 10 GB on Workers Paid and
  500 MB on Workers Free; the 10 GB per-database maximum cannot be raised.
- A D1 database processes queries serially. Index quality and query duration
  directly affect throughput, so catalog scans and scheduled batch work need
  measurement before Anime List or Starboard cutover.
- Current documented limits include 100 bound parameters per query, 100 KB per
  SQL statement, 2 MB per row/string/BLOB, and a 30-second query/batch duration.
  Existing bulk `IN` queries and libSQL batches must be checked against them.
- Worker invocation subrequest limits and Workers CPU/memory limits also apply
  to D1 work; large transfer/import operations belong in Wrangler commands,
  not normal customer requests.

## Pricing and availability implications

- D1 bills or meters rows read, rows written, and storage; it scales to zero
  rather than charging for provisioned compute hours.
- Workers Free uses daily included read/write allowances and fail-closed
  behavior when those allowances are exhausted. Workers Paid uses monthly
  included usage and overage pricing.
- No cost saving or safe-plan claim can be made from configuration alone. Before
  each cutover, retrieve current account plan plus measured Turso source size,
  D1 projected workload, and current provider usage.

## Authoritative sources

- https://developers.cloudflare.com/d1/best-practices/import-export-data/
- https://developers.cloudflare.com/d1/reference/migrations/
- https://developers.cloudflare.com/d1/worker-api/
- https://developers.cloudflare.com/d1/best-practices/local-development/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/best-practices/query-d1/
- https://developers.cloudflare.com/d1/wrangler-commands/
