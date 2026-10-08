# Clarity traffic baseline — fleet-wide

## Current collection health after approved schedule install — 2026-10-02

The approved three-day launchd repair is installed with `RunAtLoad=true` and
`StartInterval=259200`. One automatic run completed. It correctly exited 1 for
ten missing project tokens and two bounded provider timeouts. Each timed-out
project (`swe-interview-prep`, `calorie`) then succeeded in one separate bounded
qualification attempt. No fleet rerun, automatic retry, timeout increase,
credential change, or raw-provider retention was used.

The current catalog/source audit now has **45 eligible products**, including
the newly wired `ai-game` and `open-historia`, rather than the earlier 43.
All **76 products** are accounted for: **35 fresh, 10 unavailable, 12 intentional
unwired, 19 inactive, zero failed current requests**. Fresh coverage is **35/45
(77.8%)**; the cached-health reader labels those fresh rows `cached`, not new
measurements. Source audit: 72 distinct registered IDs, 45 ready journeys,
zero blocking findings. Source wiring does not prove provider capability settings.

The latest successful snapshots were observed from **12:58:18Z to 13:05:14Z**.
Using only these 35 latest three-day snapshots gives **111 sessions and 2,895
bot sessions**, in separate Clarity fields; 13 products have zero sessions.
Overlapping exports and historical inactive snapshots are excluded. These are
not verified external people or activations, and are not causal Cloudflare or
SEO-growth evidence. `live` contributes 2,532 bot sessions.

Missing tokens: `gitstat`, `email-manager`, `issue-pages`, `looptv`, `ai-game`,
`open-historia`, `web-playables`, `sarthakagrawal-personal`, `reddit-insights`,
and `ph-catalog`. The available browser reaches Google sign-in but has no
authenticated Clarity session; no token was created or stored. The original
eight-token setup approval remains pending execution, with the two newly
eligible projects kept visible as additional gaps.

Source repairs are published in Site Health PR #503 at
`fdeaa4724e4bdecdc39a360c5599e60674607d58` and SaaS Maker PR #169 at
`9a7c1145c78be18e94180269265ab7d3e2376355`; their exact-main push checks passed.
The monthly Clarity gate now warns on ten never-configured scopes rather than
claiming complete coverage. Complete monthly reporting still fails on the
incomplete GEO union and stale/failed domain-strength evidence.

## Earlier same-day qualification before schedule install — 2026-10-02

After the owner restored the Infisical login, one authorized provider refresh
ran from **2026-10-02T12:12:14Z to 12:15:17Z**, using the three-day export window
and at most one request per eligible product. Initially, 28 products returned
fresh aggregates and seven requests failed. Bounded follow-up diagnostics and
repair qualification ended at **12:28:44Z** with **35 fresh products and zero
failed current requests**. No request was retried within a collection run.
The September baseline below remains historical,
including the owner's decisions; its totals are not the current baseline.

At this earlier observation the canonical portfolio had **76 products**, of which **43 were eligible
for Clarity collection**. Standalone repository-review rows are not products and
must not inflate this denominator.

| Collection class | Count | Evidence |
| --- | --- | --- |
| `measured` | 35 | Latest successful provider responses across today's bounded runs |
| `cached` | 0 | This was a refresh attempt, not a cached-health report |
| `unavailable` | 8 | No project-scoped token resolved: `CLARITY_TOKEN_REQUIRED` |
| `failed` | 0 | All seven original request failures cleared |
| `unwired` | 14 | Not eligible under current source policy |
| `inactive` | 19 | Excluded from current collection |

Fresh provider coverage is **35/43 (81.4%)**. A subsequent cached-health read
reports these 35 successful rows as `cached` with detailed state `fresh`, not as
35 additional measurements. Totals below use only each project's latest
three-day snapshot; overlapping follow-up exports are never added together.

The eight unavailable projects are `gitstat`, `email-manager`, `issue-pages`,
`looptv`, `web-playables`, `sarthakagrawal-personal`, `reddit-insights`, and
`ph-catalog`. Working login is not proof of individual token availability.
The historical September 5 decision to skip GitStat is preserved below; a
missing token is not authorization to replace credentials or that decision.

The seven originally failed projects were `chatgpt-memory-insights`, `research-papers`,
`anime-list`, `karte`, `what-it-takes-to-win`, `storagedaddy`, and `daddyrad`.
Their tokens resolve, have valid bearer-header format, and decode to unexpired
JWTs. A targeted follow-up captured `UND_ERR_SOCKET` for Karte and DaddyRAD,
not an HTTP credential or quota rejection. The adapter now requests
`Connection: close` to avoid idle pooled-socket reuse during sequential token
lookups, with no automatic retries. A local HTTP-server regression verifies
separate connections, sanitized failures and exactly one request per attempt.
Both remaining projects then returned fresh data in a new repair-qualification
run. This is a mitigation for the observed closed sockets, not proof of the
provider's internal cause; see the comparable
[upstream Undici report](https://github.com/nodejs/undici/issues/3492).
No credentials were changed. The source repair is local and tested, not pushed.

The monthly reporting preflight now uses current eligible products rather than
46 historical receipts. It reports **35 succeeded, 8 unavailable**, with the
three inactive/unwired receipts (`journal`, `agent-office`,
`local-ai-video-studio`) excluded explicitly. Missing tokens remain a coverage
warning, not a fleet-wide stale outage or a clean pass.

### Fresh three-day traffic

The 35 fresh products report **110 sessions and 2,536 bot sessions** in Clarity's
separate aggregate fields. Thirteen report zero sessions. These are not verified
external people, product activations, or attention attributable to this
exercise. Browser/device identities are not deduplicated across products.
`live` accounts for **2,181** of the bot sessions; do not attribute that spike
to Cloudflare settings without corresponding request-level evidence.

| Product | Sessions | Bot sessions |
| --- | --- | --- |
| `pace` | 33 | 27 |
| `live` | 12 | 2,181 |
| `contextdaddy` | 11 | 8 |
| `what-it-takes-to-win` | 8 | 30 |
| `high-signal` | 6 | 40 |
| `browserdaddy` | 5 | 8 |
| `swe-interview-prep` | 5 | 22 |

The current zero-session products are `codevetter`, `saas-maker`, `on-record`,
`reader`, `app-health`, `mashup`, `field-track`, `meme-lab`, and
`every-song-is-a-website`, plus `chatgpt-memory-insights`, `research-papers`,
`karte`, and `daddyrad`. Some still have bot sessions. Missing or failed
projects are not part of this zero-session list.

The source audit found 72 distinct registered Clarity project IDs and 43 ready
browser journeys. The latest full source audit passes with **no blocking
findings**; its remaining warnings identify alternate development worktrees,
not additional production identities. **Source readiness does not prove live tag execution, provider
capability settings, or collection.**

The local collector now preserves missing export metrics as `null`, including
incomplete grouped totals, instead of fabricating zero traffic. Existing
normalized snapshots do not contain enough raw evidence to retroactively
validate old zeros. Do not infer people by summing browsers across products, or
infer completed product engagement from requests or tag loads alone.

Read the current local data without resolving tokens:

```sh
pnpm clarity:table
pnpm clarity status live
pnpm clarity:schedule status
```

For this owner session, the existing dashboard is running at
**http://127.0.0.1:4322/**, with a read-only local API at
**http://127.0.0.1:4187/v1/projects/<project-id>/clarity**. Port 4321 belongs to
other product previews and was left untouched. This API startup does not
automatically collect provider data; mutations require owner authentication.
These are session processes, not an installed persistent service. Follow
[`clarity-fleet-health.md`](clarity-fleet-health.md) for collection classes and
[`clarity-refresh-schedule.md`](clarity-refresh-schedule.md) for scheduling.
Current source freshness is three days. Scheduler source improvements do not
prove that an installed job ran. The provider refresh above was attempted, but
schedule installation was not changed. The installed job is loaded with a three-day
interval and `RunAtLoad` disabled. Its interval restarts at login, so shorter
login sessions can prevent a scheduled collection; loading it is not proof of
successful collection.

## Historical baseline — 2026-09-05

The remainder records the September 5 observation and decisions. References to
"current", 56 projects, 24-hour freshness, unscheduled collection, and credential
storage below describe that date only. Historical traffic labels and aggregate
browser totals are retained as recorded, not revalidated measurement claims.

Observed 2026-09-05 against the canonical store
(`~/Library/Application Support/Fleet Ops/founder-control/foundry.sqlite`).
Snapshot window is the three days ending `2026-09-04T23:43–23:44Z`, collected by
`clarity-collect.mjs fetch-all --days 3`. Every stored row carries
`provenance: "provider"` and `state: "verified"` — real Clarity Data Export
responses, not fixtures.

Reproduce the state table with `pnpm clarity:table` (schema and classes:
[`clarity-fleet-health.md`](clarity-fleet-health.md)); refresh the numbers
with `pnpm clarity:refresh`.

## Headline

The fleet's traffic stream is anchored. **56 projects are registered, 28 are
eligible, and 26 of those 28 have verified traffic stored (92.9%).** The
remaining two are a deliberate omission, not a gap — see
[Deliberately uncollected](#deliberately-uncollected).

The number itself is the finding: **24 human sessions and 45 bot sessions across
the entire portfolio in three days.** Bots outnumber humans roughly 2:1, and 16
of 26 measured products recorded no traffic of any kind.

## Fleet split — 56 registered

| State | Count | Meaning |
| --- | --- | --- |
| `fresh` — tokened + measured | **26** | Token in Infisical `dev`, verified snapshot stored |
| `unavailable` — eligible, untokened | **2** | `pace`, `gitstat` — deliberately uncollected |
| `unwired` — ineligible | **4** | `site-health`, `chatgpt-connections`, `reel-pipeline`, `ios-landings`; no public browser surface per the canonical receipt |
| `inactive` — out of portfolio | **24** | Not current products; cannot refresh |
| | **56** | |

The eligible denominator is **28, not 56**. Reporting coverage against 56
understates it by 28 projects that were never collectable.

## The traffic

Three-day window, sorted by human sessions. `pagesPerSession` is null where
there were no sessions to average over.

| Project | Sessions | Bot | Browsers | Pages/session |
| --- | --- | --- | --- | --- |
| `live` | 8 | 7 | 17 | 1.59 |
| `swe-interview-prep` | 6 | 16 | 17 | 1.77 |
| `high-signal` | 5 | 2 | 11 | 1.85 |
| `posttrainllm` | 2 | 9 | 11 | 1.00 |
| `journal` | 2 | 5 | 7 | 1.00 |
| `motion` | 1 | 0 | 1 | 1.00 |
| `rolepatch` | 0 | 3 | 3 | — |
| `kith` | 0 | 2 | 2 | — |
| `setline` | 0 | 0 | 5 | — |
| `agent-office` | 0 | 1 | 1 | — |
| 16 others | 0 | 0 | 0 | — |

**Fleet total: 24 human sessions, 45 bot sessions, 75 unique browsers.**

The 16 at absolute zero — no sessions, no bots, no browsers: `anchor`,
`app-health`, `calorie`, `chatgpt-memory-insights`, `codevetter`, `field-track`,
`karte`, `knowledge-base`, `local-ai-video-studio`, `mashup`, `on-record`,
`reader`, `research-papers`, `saas-maker`, `significanthobbies`, `starboard`.

Two of those — `codevetter` and `saas-maker` — are flagships. A zero here is a
measured zero, not an empty stream: the collector reached Clarity, Clarity
answered, and the answer was nothing.

`setline` is the odd row: five unique browsers, zero sessions, zero bots. Worth
a look on its own; it suggests browsers that loaded the tag without completing a
session.

## Deliberately uncollected

`pace` (`heypace.app`) and `gitstat` (`git.significanthobbies.com`) are eligible
and instrumented. Both fail on `CLARITY_TOKEN_REQUIRED` alone — the token is the
only thing missing.

They cannot be collected by an agent. `clarity-collect.mjs token-store` opens a
hidden macOS Keychain prompt (service `com.sassmaker.site-health.clarity`) and
refuses a token from an argument, a pipe, or an environment value, so it needs a
human at a TTY.

**On 2026-09-05 the owner chose to skip both and close the baseline at 26/28.**
This is a recorded decision, not an outstanding task. Nothing is blocked on it.

To collect them later, from this directory:

```sh
node apps/backend/scripts/clarity-collect.mjs token-store pace
node apps/backend/scripts/clarity-collect.mjs token-store gitstat
pnpm clarity:refresh
```

Equivalently, add `CLARITY_API_TOKEN_PACE` and `CLARITY_API_TOKEN_GITSTAT` to
Infisical `dev` at path `/`, where the other 26 tokens already live. The
per-project Data Export token comes from Clarity → Settings → Data Export →
Generate new API token.

Token durability was verified: exactly 26 `CLARITY_API_TOKEN_*` secrets exist in
Infisical `dev` and map 1:1 to the 26 measured projects. They are durable
secrets, not one-run environment exports.

## Refresh cadence

Snapshots carry a hard **24h freshness TTL**. The current 26 flip from `fresh` to
`stale` at ~`2026-09-05T23:43Z`.

**The owner chose a weekly cadence on 2026-09-05**, accepting that the dashboard
reads `stale` between runs. This is a point reading refreshed weekly, not a live
stream — read the dashboard's Clarity panel accordingly.

The weekly step is one command:

```sh
pnpm clarity:refresh   # fetch-all --days 3 across the tokened set
```

`--days 3` is the maximum window the Data Export API serves, so a weekly run
captures three of the seven days. **Four days per week go unmeasured.** If that
gap matters, the cadence has to move to every third day or shorter — no
collector change would help, the limit is the provider's.

Each run costs one Data Export call per tokened project against a per-project
daily quota, so avoid re-running to "reset the clock" on snapshots that already
cover the same window.

Making that cadence recur — the launchd tooling, the two cadence options, and the
freshness-TTL question — lives in
[`clarity-refresh-schedule.md`](clarity-refresh-schedule.md) (SAR-25). As of
2026-09-05 nothing is scheduled; the refresh is still the manual command above.

## Dashboard

`performance` and `projects/[slug]` no longer render against an empty traffic
stream. Verified against the local backend:

- `GET /v1/projects/live/clarity` → `state: fresh`, `sessions: 8, botSessions: 7,
  uniqueBrowsers: 17, pagesPerSession: 1.59`
- `GET /v1/projects/codevetter/clarity` → `state: fresh`, all-zero metrics
- `GET /v1/projects/pace/clarity` → `state: unavailable`

Site Health stayed local and private throughout; no data left the machine beyond
the authenticated Clarity Data Export calls.

## What this anchors

This is the traffic figure the SAR-1 §0 inventory recorded as missing. It
corroborates the 5% class-A GEO finding from the AI-visibility pass: the pages
are clean and nobody is arriving. Ranking work and content work should both be
measured against these 24 sessions, not against an assumed baseline.
