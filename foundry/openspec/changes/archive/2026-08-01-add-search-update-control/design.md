# Design

## Approach

Extend the existing `PortfolioMetricFamily` and metric-run allowlist with one
`search` family. Its portfolio command runs
`foundry/ops/scripts/search-console-collect.mjs` without extra arguments, so
the collector remains the sole owner of Search eligibility, provider access,
normalization, and private-ledger writes.

The page uses the same `startAndPollMetricRun` flow as Domains and Performance.
The service already invalidates its cached connection projection when a metric
run completes; `renderSearch` therefore reads the newly recorded observations
after a successful run.

## Safety

- Portfolio scope only; project scope remains unsupported for `search`.
- The command runs without a shell and concurrent Search updates deduplicate.
- Existing local mutation authentication remains mandatory.
- Credentials and provider responses remain outside the public run result.
- No schedule or deployment is added.
