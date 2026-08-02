## 1. Fleet migration preflight

- [x] 1.1 Retrieve current Cloudflare D1 import, SQL compatibility, binding, local-development, limits, and pricing documentation and record only constraints that affect the scoped projects.
- [x] 1.2 Create one owning Fleet issue plus linked independently shippable issues in each scoped project; record the per-project approval gates and use clean migration branches.
- [x] 1.3 Inventory each project's schema objects, access paths, auth adapter, transactions/batches, scheduled work, operator scripts, database size/transfer shape, and critical invariants without retaining application rows or credentials.
- [x] 1.4 Confirm or revise the rollout order from inventory evidence, including whether `karte` is already D1-authoritative and whether Anime List needs one or two D1 bindings.
- [x] 1.5 Define a sanitized migration-receipt schema covering source/target identities, migration versions, counts, integrity checks, critical aggregates, journey checks, timings, and approval state.

## 2. Karte canary or reconciliation

- [x] 2.1 Establish Karte's current production database authority from repo and provider evidence; classify the slice as a true Turso cutover or stale Turso cleanup.
- [x] 2.2 Add or verify deterministic D1 migrations, local D1 isolation, runtime/auth bindings, and maintained automation paths.
- [x] 2.3 Rehearse the Karte transfer locally when needed and pass schema, data, auth, read/write, typecheck, test, and build gates.
- [x] 2.4 Present the Karte receipt and request explicit approval before any remote D1 creation, production data operation, binding/config mutation, or deploy. (Reconciliation required no remote mutation; draft PR #49 contains local cleanup only.)
- [x] 2.5 After approval, execute the bounded Karte cutover, acceptance, rollback observation, and status/registry update; leave Turso retirement separate. (Reconciliation: the cutover predated this change; no production mutation was required.)
- [x] 2.6 Run `code-cleanup` before removing Karte's libSQL dependency, Turso-only scripts/config, or lockfile entries, then validate the smallest affected surface.

## 3. Significant Hobbies

- [x] 3.1 Add a D1-backed Drizzle/runtime boundary, deterministic migrations, isolated local configuration, and targeted database/auth tests.
- [x] 3.2 Convert or replace maintained seed and operator paths so no required production operation depends on a libSQL URL.
- [x] 3.3 Rehearse the transfer locally and pass schema, data, relationship, auth, trajectory write, typecheck, test, and build gates.
- [x] 3.4 Present the Significant Hobbies receipt and request explicit approval before remote resource creation or cutover.
- [x] 3.5 After approval, execute the bounded cutover and observation, update durable status/registry truth, and leave Turso retirement separate.
- [x] 3.6 Run `code-cleanup` before dependency/config removal and validate the smallest affected surface.

## 4. Reader

- [x] 4.1 Add a D1-backed Drizzle/Better Auth boundary, deterministic migrations, isolated local configuration, and targeted database/auth tests.
- [x] 4.2 Replace Turso-specific environment validation, deploy checks, Drizzle configuration, and maintained migration/operator paths with D1-aware equivalents while preserving R2 behavior.
- [x] 4.3 Rehearse the transfer locally and pass schema, ownership, document/annotation, auth/session, typecheck, test, and build gates.
- [x] 4.4 Present the Reader receipt and request explicit approval before remote resource creation or cutover.
- [x] 4.5 After approval, execute the bounded cutover and observation, update durable status/registry truth, and leave Turso retirement separate.
- [x] 4.6 Run `code-cleanup` before dependency/config removal and validate the smallest affected surface.

## 5. SWE Interview Prep

- [x] 5.1 Add the Pages Functions D1 binding, deterministic migrations, isolated local configuration, and a D1-compatible query boundary for all production handlers.
- [x] 5.2 Convert schema initialization, environment validation, deployment checks, and maintained scripts without changing API or owner-auth behavior.
- [x] 5.3 Rehearse the transfer locally and pass schema, progress/FSRS, notes, projects, activity, auth, typecheck, targeted test, and build gates.
- [x] 5.4 Present the SWE Interview Prep receipt and request explicit approval before remote resource creation or cutover.
- [x] 5.5 After approval, execute the bounded cutover and observation, update durable status/registry truth, and leave Turso retirement separate.
- [x] 5.6 Run `code-cleanup` before dependency/config removal and validate the smallest affected surface.

## 6. Starboard

- [x] 6.1 Add the D1 runtime/ORM boundary, deterministic migrations, isolated local configuration, and targeted persistence/auth tests.
- [x] 6.2 Move or replace every database-touching enrichment, embedding, seed, and digest workflow with an authenticated Cloudflare-bound or Wrangler-driven execution path.
- [x] 6.3 Rehearse the transfer locally and pass schema, project/repository ownership, embeddings metadata, digest, auth, typecheck, targeted test, and build gates.
- [x] 6.4 Present the Starboard receipt and request explicit approval before remote resource creation or cutover. (Prepared receipt is blocked only on the production export, remote D1/Vectorize creation, and cutover gates.)
- [x] 6.5 After approval, execute the bounded cutover and observation, update durable status/registry truth, and leave Turso retirement separate.
- [x] 6.6 Run `code-cleanup` before dependency/config removal and validate the smallest affected surface. (No critical advisories; 14 high advisories and one unused export remain pre-existing, while typecheck, 143 tests, Biome, docs, local D1, and the production build pass.)

## 7. Anime List

- [x] 7.1 Resolve the one-versus-two D1 database decision from current schema/data/operation evidence and document the accepted binding layout.
- [x] 7.2 Add D1-compatible catalog and user-state boundaries, deterministic migrations, isolated local configuration, and targeted persistence/auth tests.
- [x] 7.3 Move or replace daily and quarterly catalog syncs, cache reloads, saved-search work, seeding, and maintained repair scripts with Cloudflare-bound or Wrangler-driven paths.
- [x] 7.4 Rehearse chunked catalog plus user-state transfer locally and pass schema, catalog aggregates, watchlist/collection/token ownership, auth, sync, typecheck, targeted test, and build gates.
- [x] 7.5 Present the Anime List receipt and request explicit approval before remote resource creation or cutover.
- [x] 7.6 After approval, execute the bounded cutover and observation, update durable status/registry truth, and leave Turso retirement separate.
- [x] 7.7 Run `code-cleanup` before dependency/config removal and validate the smallest affected surface.

## 8. Open Historia

- [x] 8.1 Add a D1-backed Drizzle and Better Auth boundary, deterministic migrations, isolated local configuration, and targeted persistence/auth tests.
- [x] 8.2 Verify the source snapshot, apply the schema and data to remote D1, deploy a SHA-tagged Worker version, and pass public/auth/save acceptance checks.
- [x] 8.3 Run `code-cleanup` before removing libSQL and Turso-only configuration, then update durable project status.

## 9. TrueHire

- [x] 9.1 Add an OpenNext-compatible D1 binding and Drizzle boundary, deterministic migrations, and targeted auth/domain-service tests.
- [x] 9.2 Rehearse and execute the bounded production transfer with per-table row-count and foreign-key parity before a SHA-tagged deploy.
- [x] 9.3 Pass public/auth/database acceptance, run `code-cleanup` before removing libSQL and Turso-only configuration, and update durable project status.

## 10. Fleet convergence and retirement

- [x] 10.1 Update the Fleet cost-surface scanner, fixtures, registry validation, and spend governance so prepared, authoritative, and rollback-held database states remain distinct.
- [x] 10.2 Run strict OpenSpec validation, Fleet registry/tooling checks, per-project final checks, and `git diff --check`; record all skipped or blocked validation.
- [x] 10.3 Confirm the first six project status files and Fleet registry identify current D1 authority without claiming Turso retirement prematurely.
- [x] 10.4 Present a migration summary with per-project receipts, residual risks, retained Turso resources, and exact rollback status.
- [x] 10.5 Obtain explicit approval for all eight Turso database retirements; secret removal remains a separate credential-cleanup operation.
- [x] 10.6 Delete each Turso database only after its serving path is D1-backed or retired, verify the provider inventory is empty, and update durable dependency truth.
- [x] 10.7 After all accepted cleanup ships, archive the OpenSpec change and record only durable shipped truth in Fleet and project status files.
