# Foundry evidence service

The Foundry evidence service is the private, local-first data layer behind the
Foundry dashboard. It records bounded provider observations and builds
privacy-safe projections for the owner interface. It does not create tasks,
recommendations, notifications, decisions, or feedback records. GitHub Issues
remains the only operational work tracker.

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
node foundry/ops/scripts/founder-control.mjs snapshot /private/path/snapshot.json
node foundry/ops/scripts/founder-control.mjs backup /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs verify /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs restore /private/path/backup.json
node foundry/ops/scripts/founder-control.mjs serve
```

The standalone service binds to `127.0.0.1:4187`. Reads expose only normalized
projections. Mutations fail closed unless an owner bearer token, trusted
loopback boundary, or verified Cloudflare Access identity is configured.

The machine-hosted dashboard serves the same API under `/api/founder`. Checked-in
schedules remain inert until a designated host explicitly installs them.

## Evidence and privacy

Collectors retain provider, kind, stable identifier, observation time,
freshness, safe scalar summaries, confidence, and optional public provider
links. They do not copy logs, traces, credentials, request parameters, private
payloads, prompts, transcripts, or feedback submissions. The ownership map is
machine-checked at `foundry/ops/config/evidence-ownership.json`.

AI Visibility collectors are the current writers. Their normalized observations
remain attributable to canonical projects without creating a parallel task or
recommendation system.
