---
target: src/pages/domains.astro
total_score: 32
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
timestamp: 2026-07-31T16-21-00Z
slug: src-pages-domains-astro
---
Method: dual-agent (A: outcome_design_review · B: outcome_detector_audit)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Outcome summary is visible; no direct next action. |
| 2 | Match system / real world | 4 | D-Rank scale and comparison period are explained. |
| 3 | User control and freedom | 3 | Sorting, scope, and drawer controls are clear. |
| 4 | Consistency and standards | 4 | Foundry tokens and interaction patterns are coherent. |
| 5 | Error prevention | 3 | Read-only states are explicit and domain identity is no longer misleading. |
| 6 | Recognition rather than recall | 4 | Summary, labels, and mobile field names remove interpretation burden. |
| 7 | Flexibility and efficiency | 3 | Sortable columns and URL scope support repeat use. |
| 8 | Aesthetic and minimalist design | 3 | Dense, quiet presentation with capped product links. |
| 9 | Error recovery | 3 | Local service failure includes a recovery command. |
| 10 | Help and documentation | 2 | Inline context is sufficient, but no deeper metric methodology is linked. |
| **Total** | | **32/40** | **Good** |

## Design Specificity Verdict

The shell and owner-question framing are recognizably Foundry. The revised
domain summary, risk-first ordering, D-Rank explanation, and registrable-root
grouping make the analytical core specific to Fleet domain ownership rather
than a generic asset table. The deterministic detector returned zero findings
for the Astro route shell.

## Overall Impression

The page now answers the owner question before exposing the ledger. Desktop
retains dense comparison; mobile changes to a labeled stacked ledger instead
of hiding key facts behind horizontal scrolling.

## What's Working

- Metrics is a visible sidebar group; Projects and Feedback remain standalone.
- Declining, improving, unchanged, and baseline-only counts partition the
  domain set before the detailed table.
- Sort controls, project scope, status text, focus rings, and live announcements
  have clear accessible semantics.

## Priority Issues

- **P2 — Broad projection payload:** Domains still reads the full Connections
  payload. A future narrow endpoint would improve time to useful evidence.
- **P3 — Local favicon request:** The development browser reports one harmless
  favicon 404.

## Persona Red Flags

- **Alex, power user:** The risk-first default is efficient, though sort state
  is not persisted between visits.
- **Sam, keyboard user:** The drawer now contains focus; table controls and
  statuses remain announced.
- **Casey, mobile user:** All domain facts are visible in a stacked ledger with
  44px project targets and no document or table overflow.

## Minor Observations

- The tablet table intentionally scrolls by roughly one column with a visible
  hint.
- The methodology explanation is deliberately terse; project detail remains
  the deeper evidence destination.

## Questions to Consider

- Should Domains eventually have its own narrow projection endpoint?
- Should sort state persist in the URL for repeat owner workflows?
