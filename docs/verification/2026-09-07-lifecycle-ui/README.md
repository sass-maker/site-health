# Local Projects lifecycle verification — 7 September 2026

Private owner dashboard, preserved visual system. No public release or provider collection.

The real local service used the canonical catalog and file-backed evidence with a temporary SQLite database. The normal startup prefill was not invoked. Browser requests were limited to local GETs; external shared widgets were blocked. Existing servers were preserved, and owned browsers, servers and SQLite were cleaned up.

[Browser assertions](receipt.json) cover 390, 768 and 1440 pixels: all 22 shareable projects, lifecycle counts 2 primary / 19 active / 36 inactive, resume-condition counts 0 defined / 57 not defined, combined filters, clear/reset, the canonical Reel experiment reason, qualified Protein Index detail, and no horizontal overflow or JavaScript errors. A separate response-only synthetic fixture proves non-null resume-condition rendering; no canonical condition was invented.

Before: [directory desktop](before-projects-1440.png), [Reel mobile](before-reel-390.png).
After: [directory desktop](after-filter-1440.png), [directory mobile](after-filter-390.png), [Reel rationale mobile](after-reel-390.png).

Ten focused directory/service/presentation tests and the 63-page web build passed. Collection, provider availability and existing owner-database refresh receipts were not qualified by this run.

The bounded [freshness presentation receipt](freshness-receipt.json) verifies real local Domains, Google Search and AI pages. Missing attempt receipts now say “no refresh attempt recorded”; absent observations say “Not measured”. AI finishes loading with that state instead of implying ongoing model checks. [Mobile AI result](after-ai-awareness-390.png). Unit scenarios preserve fresh/stale observations and actual refreshing/failed/unavailable states. No freshness policy or collection behavior changed.
