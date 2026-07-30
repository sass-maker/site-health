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

`foundry/ops/config/projects.json` is the only inventory. The agent-surface
registry is a metadata overlay, ordered and validated against the maintained
catalog identities and their primary domains before any fleet-wide run.

## Audit loop

For each touched project:

1. capture the failing check and current source revision;
2. make the smallest coherent source change;
3. run the narrow project check;
4. re-run the relevant Fleet metric locally;
5. preserve the resulting evidence without claiming production impact.

The Fleet console distinguishes unavailable measurements from real zero values
and shows the latest valid evidence only.

Google sitemap readiness is measured independently for every configured
hostname. Only the first domain of each maintained project is a submission
target; private Console, search, and ingestion hosts remain visible in the
report but are not presented as public Search Console properties.

## Rollout boundary

This change ends at locally verified source and evidence. Production deployment
and post-deploy remeasurement require separate authorization.
