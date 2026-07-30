# Local skill run history

Fleet keeps a private, machine-local record of Fleet-owned skill executions so
operators can inspect what ran, retain its output, and compare explicit numeric
results over time.

The store is operational evidence, not a public analytics product. It lives at:

```text
~/Library/Application Support/Fleet Ops/skill-runs/
```

Set `FLEET_SKILL_RUNS_DIR` to use an alternate root for tests or another host.
Nothing in this directory is committed or emitted through the SaaS Maker public
projection. Founder Control receives counts, structured observations, and at
most one bounded result summary derived from an already-redacted artifact. The
summary filter rejects private paths, URLs, email addresses, credential-like
text, structured blobs, redacted artifacts, and truncated artifacts; retained
bodies never enter the API.

## What one run contains

Every run has an immutable `fleet.skill-run.v1` envelope with:

- skill and project identity;
- actor, host, source, and capture completeness;
- start, finish, observation time, duration, status, and exit code;
- output paths, sizes, hashes, redaction count, and truncation state;
- an idempotency key plus optional correlation/source information.

The source and capture fields make coverage explicit:

| Source | Captured output |
| --- | --- |
| `wrapped` / `devin-wrapper` | Sanitized stdout and stderr, plus an optional result file |
| `codex-hook` | The completed turn's final assistant response |
| `explicit-receipt` | Output supplied by an instruction-only host |
| `backfill` | A curated historical summary; never presented as original stdout |

Outputs are owner-readable, credential-pattern redacted, bounded by size, and
marked when redacted or truncated. Observability failures warn but do not
change the underlying skill result.

## Running and recording skills

`agent-stack.sh install-skills` installs the command at
`~/.local/bin/fleet-skill-run` and merges the Codex Stop hook into the user's
existing hook configuration. Codex requires the changed hook definition to be
reviewed once through `/hooks`.

Wrap a command-backed skill:

```bash
node "$HOME/.local/bin/fleet-skill-run" exec \
  --skill site-health \
  --project heypace \
  -- command arg
```

Attach an output file or structured observations when the command produces
them:

```bash
node "$HOME/.local/bin/fleet-skill-run" exec \
  --skill name-domains \
  --project example \
  --output-file /tmp/domain-result.json \
  --metrics-file /tmp/domain-metrics.json \
  -- command arg
```

Instruction-only hosts can submit a completed receipt as JSON:

```bash
node "$HOME/.local/bin/fleet-skill-run" record --json <<'JSON'
{
  "run": {
    "skillId": "agent-evaluation",
    "projectId": "example",
    "source": "explicit-receipt",
    "captureCompleteness": "final-response",
    "status": "succeeded",
    "idempotencyKey": "example-agent-evaluation-2026-07-29"
  },
  "output": "Evaluation completed.",
  "metrics": []
}
JSON
```

## Numeric observations

Numbers become graphable only through explicit
`fleet.skill-metric.v1` observations. The recorder does not scrape numbers from
prose or translate categorical verdicts into a score.

```json
[
  {
    "metricName": "domain-rank",
    "value": 18,
    "unit": "position",
    "direction": "lower-is-better",
    "entityKind": "domain",
    "entityId": "example.com",
    "observedAt": "2026-07-29T09:00:00.000Z",
    "provenance": { "kind": "skill-receipt", "reference": "domain-ranking" }
  },
  {
    "metricName": "agent-score",
    "value": 8.6,
    "unit": "score/10",
    "direction": "higher-is-better",
    "entityKind": "agent",
    "entityId": "codex",
    "observedAt": "2026-07-29T09:00:00.000Z",
    "provenance": { "kind": "skill-receipt", "reference": "agent-evaluation" }
  }
]
```

Units and directions remain attached to every observation. Consumers must not
combine incompatible series.

## Inspecting history

```bash
node "$HOME/.local/bin/fleet-skill-run" list --project heypace
node "$HOME/.local/bin/fleet-skill-run" show <run-id> --json
node "$HOME/.local/bin/fleet-skill-run" output <run-id>
node "$HOME/.local/bin/fleet-skill-run" metrics \
  --project heypace --metric domain-rank --json
node "$HOME/.local/bin/fleet-skill-run" status --json
node "$HOME/.local/bin/fleet-skill-run" doctor --json
```

`rebuild` recreates the append-only query indexes from immutable run envelopes.
`prune` is dry-run only in version one: it reports what an explicit future
retention action would remove and never deletes data.

## Historical teammate runs

The checked-in Fleet teammate scorecard supplies the curated backfill boundary:
27 Codex delegations and 7 Devin delegations. Run:

```bash
node "$HOME/.local/bin/fleet-skill-run" backfill-teammates \
  --scorecard foundry/ops/teammates/SCORECARD.md
```

These 34 records retain the scorecard note as `summary-only` output, preserve
the date, project/scope, task type, and verdict, and carry
`curated-summary` reconstruction confidence. Re-running the import is
idempotent. It does not mine private historical prompts or invent metric data.
