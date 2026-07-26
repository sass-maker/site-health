# Design: GEO Observatory

## Shape

The Observatory deliberately separates judgment from storage:

- `foundry/ops/config/geo-observatory.json` owns stable query identifiers and
  product origins.
- The `geo-observatory` skill owns the live-search protocol and A/B/C
  classification judgment.
- `geo-observatory-record.mjs` validates a complete observation batch before
  appending it and regenerates the report from the append-only ledger.
- The designated operations host owns scheduling. A clone does not activate
  recurring work by itself.

## Classification

- A: the product origin is in the top three organic results.
- B: the product has partial page-one visibility, either through its own origin
  below the top three or through a hub, repository, or directory.
- C: the product is absent from the first page.

The coarse classes are intentional. Exact rank is too volatile for a weekly
agent-observed trend, while A/B/C still distinguishes owned visibility,
indirect visibility, and absence.

## Data integrity

Queries are immutable once observed. A better query receives a new `qid`; old
history remains in the ledger. The recorder validates the entire input before
writing so failed or partial runs do not change either the ledger or report.

## Operational boundary

This change measures public search outcomes only. Search Console ingestion,
AI-product UI scraping, and edge crawler telemetry remain outside this change.
