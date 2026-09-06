# Clarity fleet health — all-project collector

How the Clarity collector accounts for **every** canonical identity in one run,
what the bounded summary contains, and which run modes touch the provider.

The cadence and the provider's 1–3 day window are covered separately in
[`clarity-refresh-schedule.md`](clarity-refresh-schedule.md). The current
numbers live in [`clarity-traffic-baseline-latest.md`](clarity-traffic-baseline-latest.md).

## Two all-project modes

```bash
# cached-health: reads stored snapshots only. No token resolution, no network.
pnpm clarity status-all
pnpm clarity:table                    # same run, rendered as a markdown table

# provider-refresh: at most one Data Export request per eligible current project.
pnpm clarity -- fetch-all --days 3
pnpm clarity -- fetch-all --days 3 --format markdown
```

`status-all` never calls `tokenResolver` and never calls the adapter — that is
asserted by a test, not by convention. `fetch-all` runs projects sequentially,
continues after a per-project failure, and returns one row for every identity
even when a token is missing or Clarity rejects the request.

Both modes accept `--format json|markdown`. JSON is the default and the
machine-readable contract; markdown is the same data for a human report.

Exit code is `1` when the run ends with any `failed` or `unavailable` project.

## The six reported classes

Every canonical identity lands in exactly one class. The collector's detailed
state is preserved alongside it, so a class never hides why.

| Class | Meaning | Detailed states folded in |
| --- | --- | --- |
| `measured` | A live aggregate request succeeded this run (or an exact-range fresh snapshot was explicitly reused). | `measured` |
| `cached` | Stored aggregate evidence exists; no provider call was made for it. | `fresh`, `stale`, `refreshing` with a snapshot |
| `unavailable` | Eligible, but there is nothing to report: no resolvable private token, or no snapshot yet. | `unavailable`, `not-measured`, `refreshing` without a snapshot |
| `unwired` | The canonical receipt records no tracked browser surface, with a reason. | `unwired` |
| `inactive` | The identity is retained but excluded from live refresh. | `inactive` |
| `failed` | Clarity rejected or could not serve the request — or the receipt has no catalog project (drift). | `failed`, `not-cataloged`, any unknown state |

`not-cataloged` folds into `failed` on purpose: receipt/catalog drift is a
broken contract, not a quiet exclusion, and it must never be reported as a pass.

`unwired` and `inactive` rows carry the recorded exclusion reason from the
canonical receipt. Neither triggers a provider request.

## Summary schema — `site-health.clarity-fleet-collection.v2`

```jsonc
{
  "schemaVersion": "site-health.clarity-fleet-collection.v2",
  "mode": "cached-health",          // or "provider-refresh"
  "observedAt": "2026-09-06T09:00:00.000Z",
  "projects": 56,                   // every identity in receipt ∪ catalog
  "counts": { "not-measured": 38, "unwired": 6, "inactive": 12 },
  "classificationCounts": {         // always all six keys, zero-filled
    "measured": 0, "cached": 0, "unavailable": 38,
    "unwired": 6, "inactive": 12, "failed": 0
  },
  "capabilityCounts": { "desired": 0, "conditional": 0, "blocked": 0,
                        "notApplicable": 0, "providerVerified": 0,
                        "providerAccounted": 0 },
  "activeEligibleCapabilityCounts": { /* same shape, exclusions removed */ },
  "results": [ /* one entry per identity, see below */ ]
}
```

Field notes:

- `counts` is keyed by the **detailed** state; `classificationCounts` by the six
  reported classes. `classificationCounts` always sums to `projects`.
- `activeEligibleCapabilityCounts` excludes `inactive`, `unwired`, and
  `not-cataloged` identities, so capability adoption is measured against the set
  that can actually adopt.
- `mode` mirrors the Clarity Fleet Health skill's mode names, so a report can be
  traced back to the command that produced it.

### One result entry

```jsonc
{
  "projectId": "pace",
  "state": "measured",              // detailed collector state
  "classification": "measured",     // one of the six classes
  "eligibility": { "eligible": true, "hostname": "…", "reason": "…" },
  "capabilities": { /* clarity capability projection */ },
  "observedAt": "2026-09-06T09:00:00.000Z",
  "metrics": { "sessions": 9, "botSessions": 2,
               "uniqueBrowsers": 7, "pagesPerSession": 1.4 },
  "reusedFreshSnapshot": false,     // present only when a pilot was reused
  "failure": { "code": "CLARITY_UNAUTHORIZED", "message": "…" }  // failed rows
}
```

`status-all` rows carry `snapshot` and `lastAttemptAt` instead of `metrics` and
`observedAt`, because they report stored evidence rather than a fresh request.

### What is never in the summary

No recordings, heatmaps, URLs, page paths, visitor identifiers, raw provider
responses, tokens, or provider error bodies. Failure messages are drawn from a
fixed allowlist in `sanitizedFailure`, so a provider error string can never
carry a token into the summary — asserted by test.

`uniqueBrowsers` counts unique browser/device identities. It is not a count of
registered accounts and must never be reported as users.

## Markdown table

`--format markdown` renders the same summary:

```
# Clarity fleet health

Mode: `cached-health` · schema `site-health.clarity-fleet-collection.v2`
Projects: 56 — measured 0 · cached 0 · unavailable 38 · unwired 6 · inactive 12 · failed 0
Observed at: 2026-09-06T00:15:40.214Z

| Project | Class | State | Sessions | Unique browsers | Bot sessions | Pages/session | Observed | Note |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| ai-game | inactive | inactive | — | — | — | — | — | Intentionally unwired: the product is inactive… |
| pace | unavailable | not-measured | — | — | — | — | — | Eligible, but no stored snapshot yet. |
```

Rows sort by project id. `Note` is a single truncated line: the sanitized
failure message, the recorded exclusion reason, or a fixed explanation of why
there is nothing to report. It is capped at 96 characters so a long receipt
reason cannot turn the table into free text.

## Where the code lives

| Concern | File |
| --- | --- |
| Classifier, summary shape, markdown renderer | `apps/backend/lib/dashboard-backend/clarity-fleet.mjs` |
| Collector, token resolution, snapshot persistence | `apps/backend/scripts/clarity-collect.mjs` |
| Data Export adapter, eligibility, capability projection | `apps/backend/lib/dashboard-backend/clarity.mjs` |
| Fleet accounting tests (fixtures for every class) | `apps/backend/test/dashboard-clarity-fleet.test.mjs` |
| Adapter and per-project tests | `apps/backend/test/dashboard-clarity.test.mjs` |

The canonical receipt (`clarity-projects.json`), the capability policy, and the
journey registry are owned by SaaS Maker Tooling and read from the sibling
checkout. Site Health owns token resolution, snapshot persistence, and this
projection; it never creates projects, generates tokens, or edits source wiring.

## Boundaries this collector keeps

- No project creation, token generation, source wiring change, or deploy.
- No automatic scheduling from a health run — the cadence is a separate,
  explicitly installed launchd agent.
- Microsoft's Clarity MCP server is optional, exploratory, and never the
  fleet pass/fail gate. This deterministic adapter is the authority.
- Source wiring, provider settings, deployment, and observed traffic are four
  separate gates. Evidence for one never proves another.

Operator protocol and the four skill modes: `saas-maker/tooling/skills/clarity-fleet-health/SKILL.md`.
