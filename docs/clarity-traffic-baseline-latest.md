# Clarity traffic baseline — fleet-wide

Observed 2026-09-05 against the canonical store
(`~/Library/Application Support/Fleet Ops/founder-control/foundry.sqlite`).
Snapshot window is the three days ending `2026-09-04T23:43–23:44Z`, collected by
`clarity-collect.mjs fetch-all --days 3`. Every stored row carries
`provenance: "provider"` and `state: "verified"` — real Clarity Data Export
responses, not fixtures.

Reproduce the state table with `pnpm clarity status-all`; refresh the numbers
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
