## 1. Normalize Query-Page Evidence

- [x] 1.1 Extend Search Console term collection to request query and page
  dimensions while retaining the existing 25-row bound.
- [x] 1.2 Add an optional validated landing-page field to the private search
  observation contract with backward-compatible reads.
- [x] 1.3 Cover query-page collection, invalid pages, and legacy observations in
  focused tests.

## 2. Derive Advisory Actions

- [x] 2.1 Add centralized project and query action definitions with explicit
  sample floors, ordered rules, reasons, and sort priorities.
- [x] 2.2 Project landing pages and derived actions through the bounded Search
  outcome endpoint without persisting recommendations.
- [x] 2.3 Cover missing, zero, low-sample, snippet, ranking, relevance, and
  protect-and-expand boundaries in projection and service tests.

## 3. Present an Action Ledger

- [x] 3.1 Add a sortable Next action column to the portfolio Google Search
  ledger without adding summary chrome or a new route.
- [x] 3.2 Add landing-page links and advisory actions to expanded query rows,
  with honest unavailable and privacy-filtered states.
- [x] 3.3 Preserve accessible disclosure, table semantics, and readable 390,
  768, and 1,440 pixel layouts.
- [x] 3.4 Replace the expanded observation table with hoverable impressions,
  clicks, and average-position history graphs.

## 4. Refresh and Close

- [x] 4.1 Run the read-only collector once and confirm all 27 public projects
  remain represented with query-page evidence where Google returns it.
- [x] 4.2 Pass focused tests, the Console build, strict OpenSpec validation,
  browser review, detector scan, design receipt, and diff checks.
- [x] 4.3 Update `PROJECT_STATUS.md`, prepare the completed change for archive,
  and keep deployment outside this change.
