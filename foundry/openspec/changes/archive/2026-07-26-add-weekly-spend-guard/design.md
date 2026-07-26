# Design: Minimal recurring spend guard

## Decisions

### Weekly and disabled by default

Spend and quota state changes slowly enough that a weekly run is the smallest
useful cadence. The registry entry is disabled so installing the Fleet cron
block cannot activate this job without a deliberate source change.

### Deterministic private recorder

The agent gathers current read-only provider evidence and passes only sanitized
aggregates to a Node.js recorder. The recorder validates the envelope, derives
alerts, appends an idempotent JSONL entry, and regenerates `latest.json` and
`latest.md`.

Runtime state lives under the ignored Codex-cron state directory. It is local
to the designated operations host and is never committed.

### Small alert policy

- `critical`: any known quota is at least 95% used.
- `warning`: any known quota is at least 85% used, a cost becomes newly
  positive, or consequential provider evidence is unavailable.
- `ok`: none of the above.

The job emits an existing Fleet notification only for warning or critical
results. Delivery remains the responsibility of the existing notification
adapters.

### Honest partial evidence

Cloudflare and Turso retain separate billing/reset periods. Missing billing
access remains `unknown`; a successful Turso observation does not make an
unavailable Cloudflare observation successful.

## Alternatives rejected

- Daily execution: unnecessary model and operator overhead for current usage.
- A database or dashboard service: more code and operations than the first
  useful version needs.
- Automatic remediation: outside the read-only safety contract.
