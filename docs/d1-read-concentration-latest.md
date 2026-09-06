# D1 read concentration — optimization pass

Observed 2026-09-05 against the live Cloudflare account. Reproduces and then
corrects the SAR-17 spend baseline stored at `local_metadata`
`spend-snapshot:portfolio`. Read-only: no schema, index, resource, or
production change was applied.

Reproduce with `wrangler d1 insights <db> --sort-by reads` and
`wrangler d1 execute <db> --remote --command "explain query plan ..."`.

## Headline

**The missing-index hypothesis is wrong for all three databases.** on-record,
starboard, and protein-index carry 22, 41, and 36 explicit indexes. Every join
in the expensive shapes already resolves through an index. The low
`queryEfficiency` numbers in the baseline are an artifact of the metric, not a
symptom of a missing index.

`queryEfficiency` is rows-returned ÷ rows-read. Any `COUNT(*)` returns one row,
so it scores ~1e-5 no matter how well indexed it is. Ranking by efficiency
therefore surfaces aggregates, not index gaps.

The real driver is **uncached full-corpus aggregates behind an all-SSR site**.

## on-record — 29.4M rows/24h, 57% of fleet

Corpus is small: 30,562 claims, 10,418 episodes, 2,305 people, 25 shows, 1,316
claim references. 29.4M reads/day against 30.5k claims means the claims table is
read end-to-end roughly 960 times per day.

### The filter that does nothing

`review_status = 'published'` matches **30,562 of 30,562 rows**. Every public
query carries it; it excludes nothing. An index on it would be useless, and
`EXPLAIN QUERY PLAN` confirms the driving step is `SCAN claims` with the joins
already indexed:

```
SCAN claims
SEARCH episodes USING INDEX sqlite_autoindex_episodes_1 (id=?)
SEARCH shows USING INDEX sqlite_autoindex_shows_1 (id=?)
USE TEMP B-TREE FOR GROUP BY
USE TEMP B-TREE FOR ORDER BY
```

The scan is inherent to the query, not a planning failure.

### Cached vs uncached is the whole story

`workers/api/src/index.ts` already defines `publicReferenceCache`
(`hono/cache`, `max-age=300`) and applies it to four routes:

```
app.use('/api/stats', publicReferenceCache);
app.use('/api/recommendations', publicReferenceCache);
app.use('/api/recommendation-groups', publicReferenceCache);
app.use('/api/people/*', publicReferenceCache);
```

Mapping the top five shapes to routes:

| Shape | Route | Runs/24h | Rows read | Avg/run | Cached |
|---|---|---:|---:|---:|---|
| `claim_references` six-table join | `publishedReferences` fan-in | 1,070 | 11,096,970 | 10,371 | yes |
| `count(distinct people.id)` | `GET /api/people` (total) | 43 | 5,047,426 | 117,382 | **no** |
| claims listing | `GET /api/search` | 32 | 4,889,920 | 152,810 | **no** |
| episodes `group by` | `GET /api/sources` (rows) | 30 | 3,703,680 | 123,456 | **no** |
| `distinct shows` | `GET /api/sources` (publishers) | 33 | 3,025,968 | 91,696 | **no** |

**138 uncached requests read 16,666,994 rows — 57% of on-record's daily volume
and 32% of the entire fleet's D1 reads.** Average cost 120,775 rows per request.

Note the Hono routing detail: `/api/people/*` matches `/api/people/:slug` but
**not** `/api/people` itself, so the list route's 117k-row count query is
uncached while the individual person pages are cached. That looks unintended.

`/api/sources` issues three statements per request (rows + count + publishers),
so one uncached source-page render costs roughly 215k row reads.

### The clearest single waste

The `publishers` query in `/api/sources` ignores the request's `q` and `show`
filters entirely — it returns the same list on every call. `shows` holds 25
rows. It reads **91,696 rows to return at most 25 constant values**, and only
changes when a show's first claim is published. 3.03M rows/day, 10.3% of
on-record, for a value that is effectively static.

### Why cost exists with zero measured sessions

`apps/web/astro.config` sets `output: 'server'` with **no `prerender` export on
any page**. Every page view is SSR, and every SSR render calls the API, which
hits D1. Clarity is installed (`apps/web/src/layouts/Base.astro`, tag
`ybch0p6cta`) but only fires in a real browser that executes JS.

So "cost with no traffic" is a misreading. The traffic is real HTTP traffic —
crawlers and API clients against a publicly documented API — that Clarity
structurally cannot see. Reconciling D1 request counts against Clarity sessions
compares two different populations.

### Options (none applied)

1. Extend `publicReferenceCache` to `/api/people`, `/api/sources`,
   `/api/search`, `/api/topics/*`. Lowest-risk, reuses proven machinery.
   Caveat: at 30–43 runs/day the 300s TTL only collapses bursts; savings depend
   on arrival clustering, which the insights API does not expose.
2. Raise the TTL for these routes with explicit invalidation on publish. The
   corpus changes in release batches, so a 300s TTL is far shorter than the
   data's actual change rate.
3. Split the `publishers` list into its own long-lived cached lookup, or
   maintain a `shows.has_published_claims` flag at ingest. Removes 3.03M
   rows/day independent of any caching decision.
4. Prerender the batch-updated pages instead of SSR-ing them.

Option 3 is the highest value per unit of risk, and its benefit does not depend
on traffic-shape assumptions.

## starboard — 3.19M rows/24h

The two high-frequency shapes are already efficient and need no work:

| Runs/24h | Rows read | Avg/run | Efficiency |
|---:|---:|---:|---|
| 1,801 | 356,598 | 198 | 5.0e-1 |
| 1,761 | 248,371 | 141 | 5.0e-1 |

Cost is concentrated in three low-frequency operator/dashboard shapes —
**20 runs reading 1,325,316 rows, 41.5% of the database's daily total**:

- `/api/growth` star-velocity (13 runs, 859,490 rows). Correlated subqueries
  over `repo_star_snapshots` per candidate repo, with `LIMIT` applied only
  after the per-repo subqueries run.
- A `COUNT(*)` over `repos` with a `UNION` subquery (5 runs, 235,950 rows).
- Tool-facet `GROUP BY` over the same `UNION` subquery (2 runs, 229,876 rows).

The `UNION` subquery (`stargazers_count >= ?` UNION starred community repos)
cannot use an index for the union'd set and is re-evaluated per query. No cron
triggers exist in the repo, and no route-level caching is present.

## protein-index — 1.37M rows/24h

Worker state is `live-retained`, D1 state `retained`, live at
protein.significanthobbies.com. **All of the top five shapes come from just 12
runs** — coverage/completion dashboard queries in `worker/completion.ts`
(`getCompletionSummaries`, reached via `worker/coverage.ts`):

| Runs/24h | Rows read | Avg/run |
|---:|---:|---:|
| 2 | 372,948 | 186,474 |
| 2 | 190,170 | 95,085 |
| 6 | 160,008 | 26,668 |
| 1 | 155,804 | 155,804 |
| 1 | 101,968 | 101,968 |

These are multi-CTE completion ledgers that aggregate the full product corpus.
36 indexes exist and the joins use them; the CTEs still have to visit every
product. This is a materialize-or-bound problem, not an index problem.

### Clarity identity

**protein-index has no Clarity tag anywhere in its source.** Its "0 sessions" is
*unmeasured*, not *zero* — unlike on-record, which is instrumented and genuinely
reports zero. Wiring one needs a Clarity project ID from the owner plus a code
change, and should land before anyone concludes this project has no traffic.

## rag — the baseline's framing is wrong

There is no `rag` project. `rag-db`, `rag-raw-docs`, and the seven `rag-*`
Vectorize indexes are **knowledge-base** infrastructure — the "Private Agent
Search" product, live at knowledgebase.sassmaker.com and search.sassmaker.com,
bound in `knowledge-base/cloudflare/worker/wrangler.jsonc`. The dossier already
records `rag-db` and `rag-raw-docs` as `state: active`. They are not dormant
retained state and must not be removed.

Live vector counts:

| Index | Vectors | Stored dimensions | Bound in wrangler | Dossier state |
|---|---:|---:|---|---|
| rag-embedding-768 | 12,859 | 9,875,712 | yes | active |
| rag-gemini-1536 | 1,661 | 2,551,296 | yes | retained-unreferenced |
| rag-embedding-384 | 4 | 1,536 | yes | active |
| rag-embedding-1024 | 1 | 1,024 | yes | active |
| rag-voyage-1024 | 3 | 3,072 | no | retained-unreferenced |
| rag-bge-768 | 0 | 0 | no | retained-unreferenced |
| rag-bge-small-384 | 0 | 0 | no | retained-unreferenced |

Total ≈ **12.43M stored dimensions against 30M included** on the Paid plan.

**There is no Vectorize spend to reclaim.** The three unbound indexes hold 3
vectors between them — 0.02% of usage. The only non-trivial candidate is
`rag-gemini-1536` (2.55M dimensions, 20.5% of rag usage), which the dossier
explicitly retains as rollback data from the 2026-08-30 move to Workers AI
embeddings. Removing it is a rollback-capability decision, not a cost decision.

`rag-db`'s 0 rows read over 24h is expected: retrieval runs against Vectorize,
and the worker sets `RAG_CACHE_ENABLED=true` with a 300s query cache.

## What this changes about the baseline

- "Missing index signature" → not supported. All three databases are
  well-indexed; the expensive shapes are aggregates that must scan.
- "Cost with no traffic" → the traffic is real but non-human, and Clarity cannot
  observe SSR/API requests. The two metrics were never comparable.
- "rag: 7 dormant Vectorize indexes, clearest pause candidate" → 3 of 7 are
  active bindings on a live product; the dormant ones are empty. No spend to
  reclaim.
- protein-index "0 sessions" → unmeasured, not zero.

Still true: on-record is 57% of fleet D1 reads, and 57% of *that* comes from
138 uncached requests per day. The headroom argument stands; the diagnosis
changes from indexing to caching and bounding.
