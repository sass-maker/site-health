# Site Health backend

The Site Health backend is the private, local-first data layer for five owner
views: Projects, Domains, Performance, Google Search, and AI Awareness. It
packages normalized evidence from the project catalog, DRANK, PSI Swarm,
Google Search Console, the seo-audit and GEO Observatory probes, Microsoft
Clarity, infrastructure spend, and bounded AI-visibility observations.

It does not own marketing, a general-purpose analytics dashboard, feedback,
skills, workflows, missions, decisions, notifications, or a task tracker.
GitHub Issues remains the operational tracker. DRANK, PSI Swarm, and Microsoft
Clarity remain independent services that this backend calls and projects.

## Local state

The append-only SQLite ledger retains its historical path so existing evidence
is not stranded:

```text
~/Library/Application Support/Fleet Ops/founder-control/foundry.sqlite
```

Use `DASHBOARD_DB` to select another local database. The old
`FOUNDER_CONTROL_DB` name remains a compatibility fallback only. Database files
and backups are private machine state and must not be committed.

## Performance headline

`performanceProjection()` reads the most recent PSI *batch* per surface, not the
most recent run. A batch is every stored run for that domain sharing the newest
run's preset and starting within ten minutes of it — the portfolio runner's
`--runs 2` plus any same-window re-run, whatever tag it carried. The headline PSI
score, LCP, and the `fast-enough` / `needs-work` status come from the median of
that batch, and `samples` reports how many runs it covered.

Single-run readings carry the full per-sample lab variance: across the 36
portfolio targets the median within-batch spread is 2 PSI points but the tail
reaches 20, enough to flap a surface across the 90 / 2500 ms gates on its own.
The sparkline series still carries every stored run; only the headline collapses.

## Measurement streams and their stores

Each owner view reads one stream, and the streams do not share a store. A page
renders nothing until its stream's collector has landed evidence somewhere on
this list.

| Family | Endpoint | Read from |
| --- | --- | --- |
| `drank` | `/v1/outcomes/domains` | `drank/data/fleet-dr.json` in the workspace |
| `psi` | `/v1/outcomes/performance` | `~/.psi-swarm/history.db` (`runs`), joined at read time |
| `search` | `/v1/outcomes/search` | visibility-outcome store (Google Search Console) |
| `seo` | `/v1/outcomes/seo-audit` | `apps/backend/data/seo-audit/latest.json` |
| `geo` | `/v1/outcomes/geo-awareness` | `apps/backend/data/geo-observatory/ledger.jsonl` |
| `ai` | `/v1/outcomes/ai-awareness` | `visibility.run-recorded` events in `foundry.sqlite` |
| clarity | `/v1/projects/{id}/clarity` | `clarity-snapshot:{id}` in `local_metadata` |
| spend | `/v1/spend` | `spend-snapshot:portfolio` in `local_metadata` |

## Missing measurements are never zero

Every projection distinguishes three things a reader could otherwise conflate:
a measured value, a measured zero, and no measurement at all.

- A signal is `null` when nothing was measured, and `{ value: 0 }` when zero was
  measured. `numeric()` in `dashboard-projection.mjs` rejects `null`, `''` and
  booleans before coercion, because `Number(null)` is `0` and would silently
  manufacture a measurement.
- Each family enumerates the union of what its collector covers and what the
  public-metric scope expects, so a surface that was never collected appears as
  an explicit row rather than dropping out of the list. GEO separates
  `not-measured` (panel configured, never run) from `not-configured` (no panel);
  seo-audit uses `not-audited`; spend uses `not-collected`.
- In the client those states take the info colour *and a dashed border*, so the
  distinction survives for a reader who cannot separate the two colours.

### Refresh receipts always reach a terminal state

`refreshing` outranks `stale` in `evidence-freshness.mjs`, so a receipt stuck in
`running` renders as a refresh in flight forever — a number that lies about its
own freshness, in the direction of looking healthy. Three layers keep that from
happening, in order of how much they can catch:

1. **The collector owns its receipt.** `withRefreshReceipt` wraps the work in
   `search-console-collect.mjs` and `run-performance-portfolio.mjs`, so the
   terminal state is written by the process doing the work — on success, on
   throw, and on a catchable stop signal. This matters because those two runs
   take minutes (36 PSI targets, sequential) and routinely outlive the
   short-lived backend that started them. Each records `resultCount` — how many
   surfaces it actually landed — because a portfolio receipt says nothing about
   coverage on its own, so a hand-run subset would otherwise read exactly like
   the full sweep.
2. **The backend retires what it started.** `abandonActiveRuns()` marks every
   in-flight run `failed` when `serve` stops, and boot reconciliation retires
   receipts a previous boot left behind.
3. **An upper bound on `running`.** A run still `running` `ABANDONED_RUN_MS`
   (6h, matching the reporting-loop preflight) after it started did not stall,
   it died: `buildEvidenceEnvelope` reports it `failed` with
   `REFRESH_ABANDONED`, and `reconcileAbandonedRefreshReceipts` writes that back
   to the store. This is the only layer that survives `SIGKILL`.

The stale `lastSuccessAt` a stuck receipt was hiding is preserved throughout, so
retiring a dead run reveals the real age of the evidence instead of erasing it.

### GEO Observatory rubric

Fixed by `config/geo-observatory.json` and not reinterpreted here: **A** = the
product's own domain in the top three organic results, **B** = partial page-one
visibility, **C** = absent from page one. A product whose every query is C has a
complete measurement showing zero visibility — which is not the same as a
product nobody has ever queried.

### Spend scope

Cloudflare and Turso bill at account scope, so `/v1/spend` is portfolio-wide and
the project page labels it as such rather than implying a per-product number.
A cost the collector could not read stays `unknown`; it is never rendered as
`$0`.

## Commands

```bash
node apps/backend/scripts/server.mjs status
node apps/backend/scripts/server.mjs snapshot /private/path/snapshot.json
node apps/backend/scripts/server.mjs backup /private/path/backup.json
node apps/backend/scripts/server.mjs verify /private/path/backup.json
node apps/backend/scripts/server.mjs restore /private/path/backup.json
node apps/backend/scripts/server.mjs serve
pnpm clarity -- status <project-id>
pnpm clarity -- fetch <project-id> --days 1
pnpm clarity -- status-all
pnpm clarity -- fetch-all --days 1
pnpm clarity -- fetch-all --days 1 --reuse-fresh <project-id>
pnpm clarity -- token-store <project-id>
pnpm clarity -- provider-audit <project-id> < receipt.json
```

The service binds to `127.0.0.1:4187`. The web app proxies it under
`/api/dashboard`. Reads expose normalized projections; mutations fail closed
unless an owner token or the trusted local loopback boundary is configured.
The service has no public-host, Cloudflare Tunnel, or Cloudflare Access mode.

Collectors retain bounded scalar summaries and public provider pointers. They
do not copy credentials, raw provider responses, prompts, transcripts, private
payloads, or feedback submissions.

## Microsoft Clarity

The official `@microsoft/clarity-mcp-server` binary is an optional local MCP
capability. Site Health does not parse its natural-language output. The Clarity
collector calls Microsoft's documented Data Export endpoint directly and
stores only aggregate sessions, bot sessions, unique browser/device identities,
and the provider's pages-per-session value. It never downloads session replays,
heatmaps, URLs, or visitor identifiers.

Project eligibility is read from SaaS Maker Tooling's canonical
`tooling/config/clarity-projects.json` receipt. A provider project ID alone is
not enough: the receipt must verify a wired public surface. Cached reads do not
contact Microsoft, startup prefill excludes Clarity, and an explicit project
refresh spends one of Microsoft's ten daily export requests for that project.
`status-all` accounts for every canonical identity without resolving tokens or
contacting Microsoft. `fetch-all` is an explicit live operation: it runs
eligible current products sequentially, spends at most one request per product,
skips unwired and inactive identities, and continues after individual failures.
When a focused pilot immediately precedes a fleet sweep, `--reuse-fresh`
requires a cached fresh snapshot for the same range and projects that receipt
as measured instead of issuing a second provider request.

The collector resolves a project-specific `CLARITY_API_TOKEN_<PROJECT_ID>`
first, then the Fleet Infisical project's `dev` environment, then the macOS
Keychain service
`com.sassmaker.site-health.clarity` with the Site Health project ID as its
account. Infisical writes use `/dev/stdin`; values never enter CLI arguments,
environment variables, files, or command output. Tokens stay in process memory and are never accepted as command-line
arguments or persisted in the database. Generate each token in the matching
Clarity project's Settings → Data Export screen and store it through a private
runtime channel before refreshing. `token-store` accepts only the project ID
and delegates secret entry to the native hidden Keychain prompt. The exported
`storeClarityToken()` helper supports an already-private in-process browser
channel and
passes the token to `/usr/bin/security` through stdin; the token is never placed
in argv, an environment variable, a file, or command output.

Site Health also projects SaaS Maker Tooling's public
`clarity-capabilities.json` desired-state policy. It accounts for recordings,
heatmaps, behavioral insights, Copilot, automatic and custom Smart Events,
funnels, AI citations, AI Bot Activity, masking, IP exclusions, GA4, Consent
API v2, Data Export, MCP analytics and recording investigation, and Clarity
benchmarks. Desired, conditional, and blocked states are policy—not proof that
the signed-in provider setting is enabled. Provider verification remains a
separate receipt.

After an operator saves and rereads every applicable setting, Site Health can
record a `site-health.clarity-provider-audit.v2` receipt in its private metadata
store. The receipt is bound to the current provider project, capability policy,
and a digest of the journey definition. It is allowlisted to capability IDs,
fixed evidence methods, assertions, exception codes, and reread timestamps.
It cannot retain project URLs, IP ranges, free-text identifiers, provider
payloads, recording data, visitor identifiers, or tokens. Cached `status-all`
reads these receipts without resolving credentials and reports provider-verified
and fully-accounted capability totals separately.
`provider-audit` accepts the bounded receipt on stdin and emits only its project,
timestamp, state, and aggregate counts.

`clarity-journeys.json` adds one live-root-observed Smart Event and funnel
candidate for each wired product. A candidate is shown as ready to configure,
not enabled; surfaces with no stable server-rendered action remain marked for
rendered discovery.
