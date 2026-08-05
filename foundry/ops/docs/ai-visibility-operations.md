# Foundry AI Visibility

Foundry's AI Visibility slice is manual, private, and local-only. It uses the
canonical configuration in `config/marketing-program.json`, the existing
`@saas-maker/ai-visibility` package, and the Founder control ledger. It does not
own provider credentials, raw provider responses, schedules, or publishing.

## Current operating boundary

- All 27 Fleet identities eligible for public-site Metrics are configured.
  This includes the explicitly metric-enabled India Standards site and excludes
  the non-product personal website. Each uses its canonical internal project id.
- Each project declares aliases, competitors, prompt sets, personas, allowed
  provider IDs, a cache window, and call/concurrency/timeout/cost limits.
- Direct live providers remain disabled. Fleet accepts fixture baselines and
  strictly validated, operator-supplied provider observations under separate
  evidence modes.
- Ignored projects are filtered against `automation-registry.json` before
  selection. A caller must name an ignored project through the explicit
  `--reactivate` option for that one manual run.
- Recurring schedule intent is disabled. Designated-host, host-verification,
  and approved-canary evidence are all required even after intent is enabled.

## Manual fixture canary

The command prefers a built package and otherwise executes the tracked package
source through Node's local TypeScript transformer. It never installs a package
or contacts a provider.

```bash
node foundry/ops/scripts/ai-visibility-canary.mjs \
  --project pace \
  --fixture foundry/ops/test/fixtures/ai-visibility/providers-v1.json
```

Use `--db` and `--cache` to point a rehearsal at temporary local files. The
default private files live under the Fleet Ops application-support directory,
outside Git.

The receipt reports configured/completed/cached/unavailable calls, normalized
visibility, recommendation, rank, citations, competitor share, coverage,
freshness, observed cost, and comparison with the previous local run.
Every recorded receipt and evidence summary carries `evidenceMode: fixture`;
fixture baselines must not be presented as live-provider visibility.

## Provider-observation ingestion

Use an approved provider client outside Fleet to capture exact answers, then
place them in a temporary local bundle matching
`fleet.ai-visibility-provider-observations.v1`. The non-secret example at
`foundry/ops/test/fixtures/ai-visibility/provider-observations-v1.example.json`
shows the shape; its placeholders are not measurement evidence.

Each completed observation must name:

- one exact canonical expanded prompt id;
- provider id and model;
- capture time and provider request id;
- the exact response text;
- an explicit non-negative observed cost, including `0` when free.

Ingest one or more project runs:

```bash
node foundry/ops/scripts/ai-visibility-provider-observations.mjs \
  --input /path/to/private-provider-observations.json
```

For a portfolio acceptance run, require exact coverage of the currently
eligible 27 projects:

```bash
node foundry/ops/scripts/ai-visibility-provider-observations.mjs \
  --input /path/to/private-provider-observations.json \
  --require-all
```

The all-project gate validates the complete bundle before opening the ledger.
It rejects missing or extra project ids; it never fills gaps. Individual
missing prompt/provider answers remain explicit unavailable coverage.

The command reads no credential or environment key and makes no provider or
network request. It analyzes raw answers only in memory and records
`evidenceMode: provider-observation`, normalized aggregates, status-only
attempts, costs, and a provenance summary. It does not retain response text or
provider request ids. Historical comparisons use only the same evidence mode,
so a provider observation is never shown as movement from a fixture baseline.
Keep the input in a private temporary location, do not commit it, and remove it
through the operator's normal secure-file process after verifying the receipt.

## Search and Cloudflare outcome ingestion

Search Console, AI Crawl Control, and Web Analytics measure different outcomes
from model-answer visibility. Export normalized aggregates into a temporary
bundle matching `fleet.visibility-outcome-bundle.v1`; the non-secret example at
`foundry/ops/test/fixtures/visibility-outcomes/provider-outcomes-v1.example.json`
shows the accepted shape.

```bash
node foundry/ops/scripts/visibility-outcomes-ingest.mjs \
  --input /path/to/private-visibility-outcomes.json
```

The command makes no network request and reads no credentials. It validates the
whole bundle before writing to the private machine-local ledger. Accepted
families are deliberately narrow:

- Google Search Console: impressions, clicks, CTR, and average position;
- Cloudflare AI Crawl Control: AI crawler requests and crawled URLs;
- Cloudflare Web Analytics: AI referral visits and page views.

Project detail shows these provider-native values with scope, reporting period,
observation time, and history. Cloudflare crawler access and referral traffic
remain discovery evidence; neither is counted as a model mention,
recommendation, rank, or citation. The portfolio matrix is unchanged.

Search Console collection is direct and read-only. It uses the operator's
local Google Application Default Credentials and the non-secret quota project
in `foundry/ops/config/search-console.json`:

```bash
node foundry/ops/scripts/search-console-collect.mjs
node foundry/ops/scripts/search-console-collect.mjs --project posttrainllm
```

The default collection scope is the stable union of the 27-project public
metric portfolio and every catalog-backed identity in the validated ten-root
search contract. The current union is 29 targets because Aliveville
(`ai-game`) and Sarthak Agrawal (`sarthakagrawal-personal`) remain intentionally
outside the public metric portfolio while still belonging to the root-search
mission. This does not reclassify either project or add it to Performance,
Marketing, or AI metric pages. `--project` accepts the catalog project ID.

Sitemap inventory has a separate preview-first reconciliation command. It uses
the 27 canonical project hosts plus the exact ten root-domain identities,
deduplicates overlaps, and changes Search Console only with `--apply`:

```bash
node foundry/ops/scripts/search-console-sitemap-reconcile.mjs
node foundry/ops/scripts/search-console-sitemap-reconcile.mjs --apply
```

The apply form submits missing canonical sitemap URLs and deletes provider
entries outside the complete desired set for the selected properties. Run the
preview again afterward; a converged inventory has no `add:planned` or
`remove:planned` actions. This does not request URL indexing or prove rankings.
Astro roots that expose an index rather than `/sitemap.xml` declare that exact
same-host URL in `foundry/ops/config/search-console.json`.

The default run queries the 28 completed days ending three days ago. Accessible
Domain properties cover their subdomains; every target query is constrained to
its canonical HTTPS hostname. The collector retains only normalized aggregate
metrics in the private ledger and reports inaccessible properties instead of
recording them as zero. The Google Search dashboard uses the same target union,
so historical observations for supplemental roots remain visible and future
updates refresh them without rewriting their project IDs.

URL Inspection is the slow provider call, so a portfolio run permits at most
four inspections in flight and treats a 20-second inspection timeout as an
explicit unavailable result without retrying that same timeout. Non-timeout
transient failures retain one bounded retry. Search Analytics metrics still
record when inspection is unavailable, and the ledger append remains atomic.
Four in-flight requests stay conservative against Google's documented URL
Inspection limits of 600 queries per minute and 2,000 per day for one site:
<https://developers.google.com/webmaster-tools/limits>.

## Persistence and privacy

The ledger stores normalized aggregates, status-only attempt receipts, cost
receipts, citation hosts, and evidence pointers. It does not store response
text, provider request IDs, arbitrary provider errors, credentials, prompts, or
raw telemetry. The local cache strips response text and retains only normalized
analysis needed for a zero-call cache hit.

Visibility and citation findings create evidence-backed recommendations only.
They do not create missions, tasks, drafts, publications, or schedules. An
owner must review and accept a recommendation before the existing
recommendation-to-mission handoff can draft work.

## Direct-live and cadence gate

The original task 7.8 fixture rehearsal was accepted on 2026-07-25. Provider
observations retain a credential-free ingestion path, and Search Console has an
owner-approved read-only local collector. Cloudflare and model-provider
adapters plus recurring cadence still require their own guarded activation.
Schedule activation remains a later decision after designated-host
verification.
