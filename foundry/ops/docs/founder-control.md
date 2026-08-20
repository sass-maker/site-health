# Founder evidence service

Founder control is the private, local-first evidence service behind Fleet
Console. It records bounded provider observations and recommendations, then
builds privacy-safe projections for the owner interface. GitHub Issues remains
the only operational work tracker. Product feedback remains with each product's
chosen ingestion owner and is never stored or projected here.

## Local state

The append-only SQLite ledger defaults to:

```text
~/Library/Application Support/Fleet Ops/founder-control/foundry.sqlite
```

The database and its backups are private machine state and must not be committed.
`FOUNDER_CONTROL_DB` can point tests or a designated host at another local path.
Existing databases may retain an unused legacy workflow column. Current writers
omit it, new databases do not create it, and no cleanup command deletes or
rewrites historical local rows.

The private backup destination has intentionally not been selected. The CLI can
create, verify, and restore a redacted backup now; activating an off-machine
destination remains a separate owner choice.

## Commands

From the Fleet root:

```bash
node foundry/ops/scripts/founder-control.mjs status
node foundry/ops/scripts/founder-control.mjs brief
node foundry/ops/scripts/founder-control.mjs notifications
node foundry/ops/scripts/founder-control.mjs notify --no-drain
node foundry/ops/scripts/founder-control.mjs snapshot /private/path/snapshot.json
node foundry/ops/scripts/founder-control.mjs backup /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs verify /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs restore /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs serve
```

The standalone service binds to `127.0.0.1:4187`. Reads expose only normalized
projections. Mutations fail closed unless an owner bearer token, trusted
loopback boundary, or verified Cloudflare Access identity is configured.

The machine-hosted Ops Console serves the same API under `/api/founder`.
`notifications` previews failed critical schedules and material
security/cost/data-loss recommendations. `notify` hands those bounded records to
the existing durable Fleet notification outbox; stable keys suppress duplicate
delivery. The checked-in schedule remains inert until the designated host
explicitly installs Fleet cron.

## Evidence and privacy

Collectors retain provider, kind, stable identifier, observation time,
freshness, safe scalar summaries, confidence, and optional public provider
links. They do not copy logs, traces, credentials, request parameters, private
payloads, prompts, transcripts, or feedback submissions. The ownership map is
machine-checked at `foundry/ops/config/evidence-ownership.json`.

AI Visibility collectors are the current writers. Their normalized observations
and recommendations remain attributable to canonical projects without creating
a parallel task system.
