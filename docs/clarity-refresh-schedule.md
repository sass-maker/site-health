# Clarity refresh schedule

How the traffic stream from
[`clarity-traffic-baseline-latest.md`](clarity-traffic-baseline-latest.md)
recurs. **Installed 2026-09-05** — weekly, Monday 09:40, per the board decision
on SAR-25. This documents the tooling and the cadence it runs.

## The provider constraint

`--days 3` is the widest window the Clarity Data Export API serves
(`clarity.mjs` rejects anything outside `1 | 2 | 3` with
`CLARITY_RANGE_INVALID`). Each run therefore measures at most the previous
three days, and **the cadence decides the coverage**:

| Cadence | Coverage | Gap |
| --- | --- | --- |
| Weekly | 3 of every 7 days | **4 days per week unmeasured** |
| Every 3 days | consecutive windows abut | none |

No collector change alters this. The limit is the provider's.

Each run costs one Data Export call per tokened project against a per-project
daily quota, so the cost scales with cadence, not with fleet size: 26 calls per
run either way, ~26/week versus ~61/week.

## Freshness is a separate dial

`readClarityProjection` (`apps/backend/lib/dashboard-backend/clarity.mjs:624`)
hard-codes a 24-hour expiry:

```js
const snapshotExpired = Date.parse(now) > Date.parse(snapshot.observedAt) + DAY_MS;
```

Under a weekly cadence the dashboard therefore reads `stale` for six days out of
seven even when the schedule is running perfectly — `stale` stops meaning "the
refresh failed" and starts meaning "it isn't Monday." Every other evidence family
already declares a policy matched to its cadence in
`evidence-freshness.mjs` (`drank` and `ai` are `7 * DAY_MS` / `weekly`);
Clarity has no entry there. Aligning the TTL with whichever cadence is chosen is
a one-line change, and it is the third open question on SAR-25.

## The tooling

`scripts/clarity-schedule.mjs` (`pnpm clarity:schedule`) manages a launchd agent
labelled `com.sarthak.clarity-refresh`, following the house pattern of
`~/Library/LaunchAgents/com.sarthak.priority-queue-sync.plist`.

```sh
pnpm clarity:schedule status                          # read-only
pnpm clarity:schedule preflight --check-token live    # read-only
pnpm clarity:schedule print --cadence weekly          # read-only, dumps the plist
pnpm clarity:schedule install --cadence weekly --confirm
pnpm clarity:schedule uninstall
```

Only `install` and `uninstall` touch the machine, and `install` refuses to run
without `--confirm`, so no accidental invocation can leave a persistent agent
behind.

Installed 2026-09-05 with `pnpm clarity:schedule install --cadence weekly --confirm`.
`status` confirms it:

```
label      com.sarthak.clarity-refresh
plist      /Users/sarthak/Library/LaunchAgents/com.sarthak.clarity-refresh.plist (present)
loaded     yes
cadence    Weekday 1, Hour 9, Minute 40 (StartCalendarInterval)
```

The freshness TTL question from the open questions above is unresolved — Clarity
still has no entry in `evidence-freshness.mjs`, so the dashboard will read
`stale` most of the week even with the schedule running. That's a separate
follow-up, not blocking this install.

Cadence flags map to the two launchd mechanisms that fit: `weekly` emits a
`StartCalendarInterval` (default Monday 09:40, overridable with `--weekday`,
`--hour`, `--minute`); `every-3-days` emits `StartInterval 259200`, because
`StartCalendarInterval` cannot express "every third day." Both plists lint clean
under `plutil -lint`. If the Mac is asleep at the scheduled moment launchd runs
the job on wake; with `StartInterval`, multiple missed intervals coalesce into
one run.

The job runs the collector directly rather than through pnpm — one fewer binary
that has to be on the launchd PATH — and appends to
`~/Library/Logs/com.sarthak.clarity-refresh.log`. `status` tails that log.

## Preflight

The silent-failure risk for any scheduled run is token resolution:
`resolveClarityToken` shells out to `infisical secrets get … --env dev`, so the
job needs both the `infisical` binary on the login-shell PATH and a live CLI
session. `preflight` checks that chain through the same `/bin/zsh -lc` login
shell launchd will use, and reports the token probe by exit status only — no
secret value is read into the process or written to a log.

Verified 2026-09-05 on the owner's Mac:

```
node        ok — /opt/homebrew/bin/node
infisical   ok — /opt/homebrew/bin/infisical
collector   ok
log dir     ok — writable
token live  ok — resolvable from a login shell (value not read)
```

The remaining caveat is that this probe ran inside an unlocked login session.
A launchd `gui/$UID` job shares that session keychain, so it should behave
identically, but the first scheduled run is the real proof — and it lands in the
log either way.

## Not covered

`pace` and `gitstat` stay uncollected: both need a human at a TTY for the
Keychain prompt, so no schedule reaches them. See
[the baseline](clarity-traffic-baseline-latest.md#deliberately-uncollected).
