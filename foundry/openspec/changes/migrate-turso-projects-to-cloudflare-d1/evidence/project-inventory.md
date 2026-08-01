# Project persistence inventory

Observed 2026-08-01 from tracked repository sources, the Fleet registry,
read-only Cloudflare metadata, and Turso SQLite catalog/page metadata. No
environment file, secret, application row, schema SQL body, or production
mutation was used.

| Project | Current runtime boundary | Auth/data shape | Automation and operator paths | Transfer shape / key invariants |
|---|---|---|---|---|
| Karte | Already D1: OpenNext Worker `DB` binding and `drizzle-orm/d1` | One D1 for Better Auth plus profile, link, project, contact, chat, analytics, domain, inbox, and opportunity state | Local D1 setup is safe; stale operator paths were reconciled in draft PR #49 | Reconciliation only. Live `linkchat-auth` metadata reports 24 tables and 786,432 bytes. Historical Turso `linkchat` remains at 323,584 bytes with 22 tables. |
| Significant Hobbies | Turso/libSQL client wrapped by Drizzle in the Worker runtime | Better Auth plus hobby, trajectory, and supporting product state | CI/deploy validate Turso configuration; maintained seed path uses libSQL | Direct ORM-driver migration. Source is 425,984 bytes with 24 tables and 45 indexes; preserve auth/session and trajectory transactions. |
| Reader | Turso/libSQL client wrapped by Drizzle in the Worker runtime | Better Auth plus articles, documents, boards, lists, memories, and annotations; R2 remains separate | Deploy requires Turso variables; Drizzle config and historical migration tool are Turso-specific | Direct ORM-driver migration with R2 unchanged. Source is 434,176 bytes with 13 tables and 15 indexes; preserve owner filtering and annotations. |
| SWE Interview Prep | Pages Functions directly construct a libSQL client; many handlers use its execute result shape | Custom Google/JWT auth plus progress, notes, chats, FSRS/mastery, projects, activity, drills, and artifacts | Env validation and readiness require Turso; no scheduled DB workflow found | Broad direct-query adapter conversion. Source is 266,240 bytes with 19 tables and 5 indexes; preserve result shapes and owner-only APIs. |
| Starboard | Next/Worker runtime and scripts use direct libSQL clients | Project/repository ownership, search and embedding metadata, enrichment and digest state | Four DB-touching GitHub workflows plus seed, enrichment, embedding, and digest commands | Highest-risk transfer: 2,133,086,208 bytes, 29 tables, 28 indexes, 6 triggers, and 2 virtual tables. D1 export limitations require explicit virtual-table recreation and current paid-plan proof. |
| Anime List | Hono Worker and scripts use direct libSQL clients; optional separate manga client falls back to the primary DB | Custom Google/JWT auth plus anime/manga catalogs, users, watchlists, collections, saved searches, alerts, tokens, and caches | Three DB-touching catalog workflows plus daily/quarterly sync and repair/seed commands | One D1 is sufficient: source is 42,016,768 bytes with 14 tables, 25 indexes, and no virtual tables. Preserve catalog sync and user-state boundaries. |

## Cross-project SQL/runtime risks

- Karte, Reader, and Significant Hobbies have ORM boundaries; Starboard, Anime
  List, and SWE Interview Prep depend more heavily on libSQL execute/batch
  behavior and result shapes.
- Anime List and Starboard have database automation outside a Cloudflare
  request. Their cutovers require Worker-bound or Wrangler-driven replacements,
  not only a runtime client swap.
- The inventory must flag every query with more than 100 parameters, large
  batches approaching 30 seconds, virtual/FTS tables, and integers beyond
  JavaScript's safe range during each implementation slice.
- All six projects are clean locally. Migration branches exist from current
  `origin/main`; only Karte is checked out for the canary.

## Confirmed rollout order

1. Karte reconciliation (draft PR #49).
2. Significant Hobbies.
3. Reader.
4. SWE Interview Prep.
5. Anime List using one D1 binding.
6. Starboard last, after virtual-table reconstruction and current paid-plan
   capacity are proved.

Current Turso usage/plan evidence and row-level parity still belong in each
production approval receipt. Metadata sizing does not authorize a transfer.
