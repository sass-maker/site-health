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

## Out of Scope

- Production deployment, release, or migration.
- Invented historical results.
- Claims that off-site authority or live search visibility improved before a
  deployed re-observation proves it.
- Broad visual redesigns.
