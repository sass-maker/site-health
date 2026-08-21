# Dashboard backend

The Dashboard backend is the private, local-first data layer for five owner
views: Projects, Domains, Performance, Google Search, and AI Awareness. It
packages normalized evidence from the project catalog, DRANK, PSI Swarm,
Google Search Console, and bounded AI-visibility observations.

It does not own marketing, analytics, feedback, skills, workflows, missions,
decisions, notifications, or a task tracker. GitHub Issues remains the
operational tracker. DRANK and PSI Swarm remain independent services that this
backend calls and projects.

## Local state

The append-only SQLite ledger retains its historical path so existing evidence
is not stranded:

```text
~/Library/Application Support/Fleet Ops/founder-control/foundry.sqlite
```

Use `DASHBOARD_DB` to select another local database. The old
`FOUNDER_CONTROL_DB` name remains a compatibility fallback only. Database files
and backups are private machine state and must not be committed.

## Commands

```bash
node foundry/apps/dashboard/backend/scripts/server.mjs status
node foundry/apps/dashboard/backend/scripts/server.mjs snapshot /private/path/snapshot.json
node foundry/apps/dashboard/backend/scripts/server.mjs backup /private/path/backup.json
node foundry/apps/dashboard/backend/scripts/server.mjs verify /private/path/backup.json
node foundry/apps/dashboard/backend/scripts/server.mjs restore /private/path/backup.json
node foundry/apps/dashboard/backend/scripts/server.mjs serve
```

The service binds to `127.0.0.1:4187`. The web app proxies it under
`/api/dashboard`. Reads expose normalized projections; mutations fail closed
unless an owner token, trusted loopback boundary, or verified Cloudflare Access
identity is configured.

Collectors retain bounded scalar summaries and public provider pointers. They
do not copy credentials, raw provider responses, prompts, transcripts, private
payloads, or feedback submissions.
