# Clarity refresh schedule

How the traffic stream from
[`clarity-traffic-baseline-latest.md`](clarity-traffic-baseline-latest.md)
recurs. The installed job uses a three-day interval, but a loaded job is not
proof of successful collection. On 2026-10-02, launchd reported zero runs in the
current login session; the latest log was dated 2026-09-28. After explicit owner
approval, the repair was installed on 2026-10-02 with RunAtLoad enabled. Launchd
confirmed one automatic run, which exited 1 for missing tokens and provider
timeouts rather than claiming complete coverage. Two targeted follow-ups
recovered the timeouts; ten token gaps remain. See the current baseline above.

All-project run modes, the six reported classes, and the bounded summary schema
are in [`clarity-fleet-health.md`](clarity-fleet-health.md).

## The provider constraint

`--days 3` is the widest window the Clarity Data Export API serves
(`clarity.mjs` rejects anything outside `1 | 2 | 3` with
`CLARITY_RANGE_INVALID`). Each run therefore measures at most the previous
three days, and **the cadence decides the coverage**:

| Cadence | Coverage | Gap |
| --- | --- | --- |
| Weekly | 3 of every 7 days | **4 days per week unmeasured** |
| Every 3 days | consecutive windows abut only when runs actually succeed on time | offline or failed runs leave gaps |

No collector change alters this. The limit is the provider's.

Each run costs one Data Export call per tokened project against a per-project
daily quota. Use the collector's current eligible/tokened counts; the historical
26-project baseline is not the current coverage denominator.

## Freshness is a separate dial

Clarity now declares an `every-3-days` freshness policy in
`evidence-freshness.mjs`, and `readClarityProjection` reads the same policy.
A snapshot remains fresh through the scheduled three-day interval and becomes
stale only after the next refresh is overdue. The dashboard no longer reports a
healthy schedule as stale on days two and three.

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

Originally installed 2026-09-05 and subsequently changed with
`pnpm clarity:schedule install --cadence every-3-days --confirm`.
`status` confirms it:

```
label      com.sarthak.clarity-refresh
plist      /Users/sarthak/Library/LaunchAgents/com.sarthak.clarity-refresh.plist (present)
loaded     yes
cadence    every 3 days (StartInterval)
```

Cadence flags map to the two launchd mechanisms that fit: `weekly` emits a
`StartCalendarInterval` (default Monday 09:40, overridable with `--weekday`,
`--hour`, `--minute`); `every-3-days` emits `StartInterval 259200`, because
`StartCalendarInterval` cannot express "every third day." Both plists lint clean
under `plutil -lint`. Calendar jobs can run on wake after a missed scheduled
time; do not assume the same catch-up behavior for interval jobs or that a Mac
which was offline longer than three days can recover older provider data.

The repaired `every-3-days` source emits `RunAtLoad=true`. This avoids waiting
another full three-day interval after each login/reload, which could otherwise
prevent collection in shorter sessions. Weekly scheduling remains unchanged.
`status` now reports the installed RunAtLoad value and warns about an interval
job without it. Installing the repair triggers a provider refresh immediately;
it is not a read-only check. Repeated reloads can consume additional quota, and
overlapping three-day windows must not be summed as distinct traffic.

The job runs the collector directly rather than through pnpm — one fewer binary
that has to be on the launchd PATH — and appends to
`~/Library/Logs/com.sarthak.clarity-refresh.log`. `status` tails that log.

## Preflight

The silent-failure risk for any scheduled run is token resolution:
`resolveClarityToken` shells out to `infisical secrets get … --env dev`, so the
job needs both the `infisical` binary on the login-shell PATH and a live CLI
session. `preflight` checks that chain through the same `/bin/zsh -lc` login
shell launchd will use. It requires both a successful lookup and non-empty
output: Infisical's `--silent` mode can otherwise exit zero for an absent key.
The value stays in an unexported child-shell variable; only success/failure
returns to the scheduler, and no value is emitted or written to a log. Missing
binaries, an unwritable log directory or an unresolved checked token cause a
non-zero preflight exit.

On 2026-10-02, the current login-shell check resolved `live` and correctly
reported `ph-catalog` as unresolved. Synthetic tests cover empty-success,
non-empty-success and lookup-failure cases without using real credentials.

Verified 2026-09-05 on the owner's Mac:

```
node        ok — /opt/homebrew/bin/node
infisical   ok — /opt/homebrew/bin/infisical
collector   ok
log dir     ok — writable
token live  ok — resolvable from a login shell (value not read)
```

That 2026-09-05 probe is historical, not current credential verification.
The remaining caveat is that it ran inside an unlocked login session.
A launchd `gui/$UID` job shares that session keychain, so it should behave
identically, but the first scheduled run is the real proof — and it lands in the
log either way.

## Not covered

The September 5 decision to skip `pace` and `gitstat` remains historical in
[the baseline](clarity-traffic-baseline-latest.md#deliberately-uncollected).
Pace is now measured through its existing token. Current missing-token projects
are listed in the baseline's current collection section; no schedule can repair
an absent project-scoped token. Creating or storing credentials requires
separate authority under the workspace's no-credential-change rule.
