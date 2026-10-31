# Cloudflare hosting preparation

Part of [#617](https://github.com/sass-maker/site-health/issues/617). This is a
storage/authentication port, **not a completed migration or a deployable cutover**.
The existing Node owner service remains authoritative and unchanged in operation.
No production resources, configuration values, credentials or owner data are
created, read, transferred or changed by the tests.

## Runtime boundaries

- The existing Astro static build and UI remain in `apps/web`. Every asset runs
  through the Worker before serving; HTML and assets require the same signed
  Access owner assertion as APIs. `workers.dev` and version previews are disabled.
- Three SQLite Durable Objects coordinate the dashboard, brand evidence and
  App Store public cache/allowances separately, using one identity per owner/store.
  Business methods execute synchronously inside each object. Node adapters retain
  SQLite files, WAL, permissions, explicit transactions and interruption journals.
- R2 holds private immutable, content-addressed evidence documents. A persisted
  runtime manifest references typed catalog/dashboard/coverage/spend/capability
  snapshots. It is a read-only projection of the canonical owner-local catalog,
  never another editable catalog. No URL maps arbitrary R2 keys or native paths.
- Job claims, retry leases, fencing and cancellation are durable. A collector
  receipt cannot claim success until evidence publication is qualified. No
  container-local disk is authoritative. Collector executors are not included.
- Signed Access verification is shared with the Node hosted adapter: RS256,
  configured issuer/audience/owner, expiry/issued-at and exact HTTPS origin.
  Missing configuration and key outages fail closed; there is no loopback trust.

The example config has placeholders and is never used by the tests. Its initial
compatibility date is `2026-07-30`, matching pinned Miniflare `4.20260730.0` and
workerd `1.20260730.1`, the latest registry versions available when prepared.
A later date bump requires provider/runtime qualification. Logs and traces are
configured; provisioned Access, routes, bindings and retention remain operator work.

## Coverage and remaining work

| Boundary | Implemented in this unit | Still required before cutover |
| --- | --- | --- |
| Three stores | Shared domain cores, real DO SQL transactions, full-table snapshots | Independent storage/migration review and owner-data staged rehearsal |
| Snapshot integrity | Schema/count/digest/rowid/sequence checks, empty-stage import, replay and idempotent receipt | Evidence/artifact/PSI-history and cloud-job recovery manifests; final freeze/watermark; publication tooling |
| Owner authentication | Shared Access JWT rule; private assets/API/R2 denial; exact Origin/JSON/body bounds | Provisioned owner Access and real hosted denial/recovery proof |
| Readiness, projects, collections | Existing projection/save rules on DO SQL | Real complete catalog build and route/page acceptance |
| Six outcome reads | Existing bounded outcome/freshness contracts from immutable evidence | Qualified live acquisition/publication and attributed native artifact references |
| UI Library, capabilities, spend, Clarity | Typed snapshot routes | Exact source-field parity for every independent evidence adapter |
| Brand profile/prompts/growth/actions/drafts | Existing project-scoped business routes and storage | Durable resumable AI/community/brief runner; scheduled work |
| App Store | Existing Apple HTTP and AI proposal routes; durable allowances/cache | Real credential-binding qualification (synthetic Worker provider fixtures are covered) |
| Metric jobs | Durable queue/claim/fence/cancel/interruption lease model | Qualified executor, receipt-to-evidence publication, prefill and schedules |
| Browser-private work | Existing JSON export/preview/atomic import retained | Synthetic two-origin test and owner-operated exports/imports |
| Cloud release | Example config and Worker bundle with forbidden-Node-import guard | Provisioning, full checks/review, private build, upload, cutover and live proof |

| Collector | Cloud state |
| --- | --- |
| PSI Swarm | Unavailable: Node/Chrome executor plus durable sample/artifact upload not qualified |
| Domain Rating, GEO, pooled AI | Unavailable: existing operator/source semantics must be ported and qualified |
| Search Console | Unavailable: Google HTTP acquisition needs credential bindings instead of gcloud ADC |
| Clarity, App Health usage, revenue | Unavailable: HTTP adapters need explicit cloud credential bindings and durable publication |
| Brand API checks/community/briefs | Unavailable: interrupted work must resume without duplicated or lost observations |
| Apple research and AI proposals | Request routes ported; shared allowance/cache remain durable; private drafts stay in browser |
| Native/local observations | Typed `authenticated-native-feed` storage only; feed authentication/ingestion and attribution pending |

Unconfigured refreshes return an explicit 503 and retain existing evidence.
Missing evidence is not zero. This unit does not claim collector or full-route
parity merely because a read-only snapshot can be rendered.

## Verification

`pnpm run test:cloudflare` bundles a synthetic-only fixture and runs actual workerd
SQLite Durable Objects and private R2. The fixture exposes test-only RPC helpers;
it is never the production entrypoint. Tests exercise full-store snapshot replay,
restart/eviction, rollback, duplicate/conflicting writes, job fencing/cancellation,
signed owner/issuer/audience/time/origin checks, private HTML/assets/API/R2, body
bounds and synthetic route reads. Existing Node test runners remain authoritative.
`pnpm run build:cloudflare` rejects unsupported disk/process/SQLite imports.

## Cutover and recovery sequence

1. Finish every coverage gap above, required independent review and runtime tests.
   Keep the current owner service working throughout preparation.
2. Provision owner-only Access and attributed private Worker/DO/R2 resources.
   Verify no public asset, `workers.dev`, preview or R2 bypass.
3. Build all existing pages from one complete private canonical catalog snapshot;
   retain its hash/source revision. Never deploy a CI synthetic project catalog.
4. Pause all old writers/schedulers for a final watermark. Export all three stores,
   evidence/policy/PSI manifests and owner-operated browser backups. Record one
   authoritative writer and preserve the old service as read-only recovery.
5. Import into isolated staging object identities. Verify all table counts,
   schemas, digests, rowids, sequences, metadata, brand history, growth revisions,
   allowances, timestamps, R2 artifacts and replay. Retry interrupted import
   idempotently. A partial three-store import must never become authoritative.
6. Qualify every route/page/collector and self-service browser import on the new
   origin. Transfer browser-private drafts only through the existing browser UI.
   Cloud credentials require explicit bindings; never copy Keychain or ADC files.
7. Switch traffic and start exactly one scheduler/writer set only after parity.
   Confirm saved writes survive restart and each refresh publishes fresh evidence.
8. After cloud writes, rollback requires exporting/reconciling those writes and
   browser-origin changes at a new watermark. Reopening stale local databases is
   not recovery. Keep both versioned source and data recovery paths until verified.

API semantics: [DO SQLite](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/),
[Worker-first assets](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/),
[Access JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).
