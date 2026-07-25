# Founder control loop

Founder control is the private, local-first owner layer for Fleet. It records
bounded missions, owner decisions, evidence pointers, recommendations, and
measured outcomes. It does not replace GitHub, Cloudflare, Postiz, CodeVetter,
App Health, Drank, PSI Swarm, or High Signal as the source of their own facts.

## Local state

The append-only SQLite ledger defaults to:

```text
~/Library/Application Support/Fleet Ops/founder-control/foundry.sqlite
```

The database and its backups are private machine state and must not be committed.
`FOUNDER_CONTROL_DB` can point tests or a designated host at another local path.

The private backup destination has intentionally not been selected. The CLI can
create, verify, and restore a redacted backup now; activating an off-machine
destination remains a separate owner decision.

## Commands

From the Fleet root:

```bash
node foundry/ops/scripts/founder-control.mjs status
node foundry/ops/scripts/founder-control.mjs draft "Verify the next release" codevetter
node foundry/ops/scripts/founder-control.mjs brief
node foundry/ops/scripts/founder-control.mjs notifications
node foundry/ops/scripts/founder-control.mjs notify --no-drain
node foundry/ops/scripts/founder-control.mjs backfill-current /private/path/current-evidence.json
node foundry/ops/scripts/founder-control.mjs marketing-receipt /private/path/receipt.json
node foundry/ops/scripts/founder-control.mjs snapshot /private/path/snapshot.json
node foundry/ops/scripts/founder-control.mjs backup /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs verify /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs restore /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs serve
```

The standalone service binds to `127.0.0.1:4187`. Reads expose only normalized
projections. Mutations fail closed unless an owner bearer token is configured.

The machine-hosted Ops Console serves the same API under `/api/founder`. Its
Cloudflare Access boundary may authorize mutations only when both the verified
Access email and Access assertion headers are present. Direct localhost callers
cannot mutate by merely omitting authentication.

`notifications` previews the exact owner-action set. `notify` hands only owner
decisions, prolonged blockers, failed critical work, material
security/cost/data risks, and explicitly requested completions to the existing
durable Fleet notification outbox. Stable keys suppress duplicate delivery.
The checked-in five-minute schedule remains inert until the designated host
explicitly installs Fleet cron.

## Mission lifecycle

```text
draft -> accepted -> active -> awaiting verification -> completed
                  \-> blocked -> active
draft/accepted/active/blocked/awaiting verification -> cancelled
```

Every transition is another immutable event. Corrections and reversals append a
new event; no history row is edited or deleted.

## Evidence and privacy

Adapters retain provider, kind, stable identifier, observation time, freshness,
safe scalar summary, confidence, and an optional provider link. They do not copy
logs, traces, credentials, request parameters, private payloads, prompts, or
transcripts. The ownership map is machine-checked at
`foundry/ops/config/evidence-ownership.json`.

`backfill-current` accepts a version-1 document containing only current safe
evidence pointers and attaches them idempotently to existing missions. Unknown
fields are rejected so historical provider output cannot be imported by
accident. `marketing-receipt` links the source-package, approval, render,
Postiz, publication, or measurement stage to the canonical mission while the
provider remains authoritative for its content.

An outcome is not ready for learning until merge, green CI, deployment, and
production-smoke evidence are all present. Ignored work is suppressed unless it
raises security, cost, data-loss, or explicit reactivation risk.
