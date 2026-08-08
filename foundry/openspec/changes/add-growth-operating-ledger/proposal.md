## Why

Fleet can measure search, traffic, marketing, and post-ship outcomes, but the
operator still has to reconstruct which products are actively being grown,
what changed, and what should be measured next. The missing layer is a compact
portfolio operating ledger that connects existing evidence without inventing
conversion or revenue data.

## What Changes

- Add one validated growth program that reuses the existing four-product focus
  set and maps every maintained product to `focus`, `maintain`, or `observe`.
- Give each focus product one explicit target Search query and owned destination
  by reference to existing canonical registries.
- Project a bounded growth row joining the latest shipped Search change,
  Search Console outcome, Cloudflare traffic, marketing proof, directory
  submission attempts, verified-link evidence, and next measurement.
- Add a sortable, expandable Growth page in Fleet Console while preserving the
  current visual language and keeping Marketing as its own detailed surface.
- Keep conversions, revenue, and earned links explicitly unmeasured until an
  authoritative product or provider receipt exists.
- Do not add automatic product mutation, publication, deployment, indexing, or
  link submission.

## Capabilities

### New Capabilities

- `growth-operating-ledger`: Defines focus allocation, target ownership,
  evidence joins, attribution boundaries, and the portfolio Growth view.

### Modified Capabilities

- `portfolio-strength-console`: Adds Growth as a primary owner view and groups
  it with Marketing outside the Metrics views without weakening existing page
  responsibilities.

## Impact

- Fleet configuration gains one small validated growth overlay; project identity
  and operational state remain owned by their existing registries.
- Founder-control projections and the bounded outcomes API gain a `growth`
  family assembled from existing evidence.
- Fleet Console gains `/growth`, one navigation entry, rendering logic, and
  responsive styles.
- No production dependency, credential, external mutation, migration, or
  deployment is introduced.
