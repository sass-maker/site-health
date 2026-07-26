# Proposal: Add a minimal recurring spend guard

## Why

The Fleet can inspect Cloudflare and Turso spend on demand, but it has no
durable baseline for detecting quota pressure, newly visible charges, or lost
billing visibility. Daily execution would cost more attention and model usage
than this slow-moving evidence warrants.

## What

- Add a small deterministic recorder for sanitized spend snapshots.
- Store an append-only private ledger plus generated latest JSON and Markdown.
- Register one weekly Codex job, disabled until the operator explicitly
  activates it.
- Alert only for material conditions: at least 85% quota use, a newly positive
  cost, or unavailable provider evidence. Routine successful runs stay quiet.
- Keep all provider access read-only and preserve unknown monetary evidence as
  unknown.

## Out of scope

- Installing or activating cron.
- Configuring notification credentials or delivery adapters.
- Changing provider plans, resources, quotas, schedules, credentials, or
  production configuration.
- Forecasting spend without complete provider pricing and cycle evidence.

## Risks

- Provider evidence can be unavailable. The recorder keeps that state explicit
  and alerts rather than treating it as zero spend.
- A model-run collector could emit sensitive raw data. The recorder accepts
  only a narrow aggregate schema and rejects secret-shaped fields.
