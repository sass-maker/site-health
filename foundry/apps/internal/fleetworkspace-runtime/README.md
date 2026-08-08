# FleetWorkspace verified-transition runtime

This is the first bounded FleetWorkspace experiment: a dependency-free Node.js
runtime that records a GitHub issue transition as an attributable JSONL event
timeline and detects a deliberately duplicated side effect.

## Commands

```bash
pnpm test
pnpm check

node src/cli.mjs run-github-issue \
  --repo sass-maker/fleet-workspace \
  --title "[FleetWorkspace experiment] Verified transition" \
  --marker "fw-YYYYMMDD-unique" \
  --timeline evidence/run.jsonl \
  --unsafe-retry \
  --confirm-external-write

node src/cli.mjs print --timeline evidence/run.jsonl
```

`run-github-issue` performs real GitHub writes and therefore refuses to run
without `--confirm-external-write`. `--unsafe-retry` is deliberately unsafe: it
creates the same marked issue twice while predicting that the retry is
idempotent, allowing the verifier to preserve a `duplicate_side_effect`
mismatch. The CLI never closes issues automatically.

