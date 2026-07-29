## Why

Fleet relies on locally executed skills, but today it cannot answer which skill
ran, what it produced, whether it succeeded, or how numeric results changed over
time. A durable private run history is needed now so operational scores such as
domain rank and agent quality can become trustworthy project-level time series
instead of isolated snapshots.

## What Changes

- Add a shared machine-local run recorder for Fleet-owned skills.
- Record skill identity, project scope, actor/runtime context, start and finish
  times, status, exit information, and stable correlation identifiers.
- Retain each run's original stdout and stderr as private local artifacts linked
  from its run record.
- Accept explicit structured numeric observations with a metric name, value,
  unit, direction, project/entity scope, and observation time.
- Provide stable human and JSON queries for run history, individual outputs,
  and metric series so future project dashboards can graph change over time.
- Backfill the 27 Codex and 7 Devin delegations already recorded in the Fleet
  teammate scorecard, retaining each curated outcome note as reconstructed
  output and labeling provenance/confidence honestly.
- Add bounded redaction, file permissions, retention controls, and failure
  behavior so logging does not leak credentials or break the underlying skill.
- Integrate the recorder at the shared Fleet Ops execution boundary and define a
  receipt protocol for instruction-only skills that cannot be wrapped directly.
- Keep raw outputs machine-local and out of the tracked Foundry evidence ledger,
  repository, and public SaaS Maker projections.

## Capabilities

### New Capabilities

- `skill-run-observability`: Private local skill run receipts, retained outputs,
  structured numeric observations, and stable history queries.

### Modified Capabilities

None.

## Impact

- Adds a small Fleet Ops library and agent-bin command under `foundry/ops/`,
  a scorecard backfill adapter, focused tests, operator documentation, and
  shared skill instructions.
- Uses the existing `~/Library/Application Support/Fleet Ops/` runtime boundary;
  no cloud service, credential access, production dependency, deployment, or
  public data publication is introduced.
- Future project-level graphs can consume the versioned JSON query contract, but
  building those graphs is outside this change.
- Links implementation work to `sass-maker/fleet-workspace#63`.
