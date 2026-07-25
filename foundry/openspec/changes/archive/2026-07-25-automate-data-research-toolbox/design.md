## Context

Research Papers operates over a large OpenAlex-derived corpus and search/index
surfaces; Starboard organizes GitHub repository/star intelligence. Both depend
on refresh jobs and derived indexes that may be reconstructable but expensive.

## Goals / Non-Goals

**Goals:** search activation, source provenance, refresh/job freshness,
reconstruction/durability, API/live health, indexing and bounded experiments.

**Non-Goals:** corpus expansion, ranking redesign, new paid data, automatic
migration/deploy or promotion into commercial focus.

## Decisions

- Separate authoritative source data from reconstructable indexes/caches and
  irreplaceable user state.
- Model refreshes with source watermark, bounds, idempotency, output counts,
  freshness and unresolved failure.
- Define meaningful activation as successful query/result inspection or
  saved/organized action, without persisting private queries in Foundry.
- Record reconstruction command, expected duration/cost and last proof where a
  backup is intentionally unnecessary.
- Use bounded quiet experiments with exact destination/attribution.

## Risks / Trade-offs

- **Green job writes empty/poor output** → Validate counts and quality/freshness
  thresholds, not exit code alone.
- **Rebuild path is theoretical** → Require a bounded fixture or prior proof.
- **Queries reveal interests/private repos** → Aggregate/redact before Foundry.
