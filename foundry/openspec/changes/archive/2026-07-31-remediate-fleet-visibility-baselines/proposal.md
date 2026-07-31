# Change: Remediate Fleet visibility baselines

## Why

The first complete Fleet Metrics baseline now covers all 27 projects, but some
low values mix real product gaps with missing or invalid evidence. Acting on
those values without separating the two would produce misleading improvements.

## What Changes

- Reject failed or placeholder evidence instead of presenting it as a zero score.
- Improve the shared agent-readable surface tooling so projects can expose
  canonical machine-readable routes without copying generated content.
- Apply bounded, project-local SEO, GEO, performance, and design fixes where the
  current baseline identifies a concrete source-level issue.
- Re-run the local audits and keep the latest evidence attributable to the
  project and source revision.
- Preserve validated design-review results as a deterministic, sanitized Fleet
  snapshot so a fresh Fleet checkout does not depend on colocated product
  repositories to render or gate the latest scores.
- Carry each project's exact tracked brand and category search intents into the
  generated public agent catalog and full agent brief from one canonical
  registry, without rewriting or keyword-stuffing the queries.
- Keep raw Domain Rating visible while evaluating the portfolio goal against a
  dated, attributable external benchmark percentile rather than treating a raw
  rating of 90 as synonymous with the 90th percentile.

## Out of Scope

- Production deployment, release, or migration.
- Invented historical results.
- Claims that off-site authority or live search visibility improved before a
  deployed re-observation proves it.
- Self-referential percentile ranking across only the Fleet portfolio, or an
  unattributed benchmark that cannot be reproduced.
- Broad visual redesigns.
