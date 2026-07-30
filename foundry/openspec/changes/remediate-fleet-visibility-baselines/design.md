# Design: Fleet visibility baseline remediation

## Evidence classes

Every weak result is classified before remediation:

1. **Invalid evidence** — a failed, placeholder, or unmeasured run must render as
   unavailable, not as a numerical zero.
2. **Technical coverage gap** — a source-level route, metadata, catalog,
   crawlability, performance, or accessibility defect can be fixed locally.
3. **Outcome gap** — domain authority, rankings, and third-party AI citations
   require deployment and later external observation; local work may improve
   prerequisites but must not be reported as an outcome.

## Shared-first implementation

Shared audit and projection code is fixed before individual projects. Project
changes use existing route/content generators and source data. Large content
corpora expose deterministic dynamic Markdown or catalog routes rather than
committing one duplicate file per public page.

## Audit loop

For each touched project:

1. capture the failing check and current source revision;
2. make the smallest coherent source change;
3. run the narrow project check;
4. re-run the relevant Fleet metric locally;
5. preserve the resulting evidence without claiming production impact.

The Fleet console distinguishes unavailable measurements from real zero values
and shows the latest valid evidence only.

## Rollout boundary

This change ends at locally verified source and evidence. Production deployment
and post-deploy remeasurement require separate authorization.
