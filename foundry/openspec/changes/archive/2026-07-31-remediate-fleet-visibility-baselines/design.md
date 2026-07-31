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

`foundry/ops/config/projects.json` is the only inventory. One shared selector
includes maintained public listings plus explicit `metrics.publicSite`
opt-ins, while excluding non-products. The agent-surface registry is a
metadata overlay, ordered and validated against those identities and their
primary domains before any fleet-wide run.

## Audit loop

For each touched project:

1. capture the failing check and current source revision;
2. make the smallest coherent source change;
3. run the narrow project check;
4. re-run the relevant Fleet metric locally;
5. preserve the resulting evidence without claiming production impact.

The Fleet console distinguishes unavailable measurements from real zero values
and shows the latest valid evidence only.

## Portable design-review evidence

A dependency-free Fleet script reads the canonical maintained visibility
inventory and an explicitly selected project-workspace root. Existing
project-owned receipts remain authoritative: each one is validated with the
shared design-review evidence validator before any score is copied. The
snapshot contains only validated scores, accepted owner decisions, canonical
project identities, and SHA-256 hashes for the receipt and every file required
by validation. It excludes free-form receipt content and absolute local paths.

The snapshot is deterministic for identical source bytes and lives under
`foundry/ops/data/design-reviews/latest.json`. Fleet Console and the strict
metric report may use it when an independent project checkout is absent.
When a readable local receipt exists, the normal project-root validation still
runs and its result takes precedence over the snapshot.

Google sitemap readiness is measured independently for every configured
hostname. Only the first domain of each visibility project is a submission
target; private Console, search, and ingestion hosts remain visible in the
report but are not presented as public Search Console properties.

## Rollout boundary

This change ends at locally verified source and evidence. Production deployment
and post-deploy remeasurement require separate authorization.

## Portfolio 90+ completion gate

The portfolio is not complete merely because remediation source exists. A
fail-closed ledger must cover exactly the canonical visibility inventory and
must reject missing evidence, fixture-only AI visibility, failed audits, and
invalid design receipts.

Technical percentage gates require 90 or better. LCP requires 2.5 seconds or
better. Search class A, live AI visibility at 90 or better, and D-Rank at 90 or
better remain external outcome gates: local metadata and content work are
prerequisites, not substitutes for those observations.
