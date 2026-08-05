## Why

Fleet Console Marketing currently asks the operator to scan an analytics-heavy 27-project table before reaching the only information needed here: which projects have posts and what those posts are. The page should stay fast and legible by showing the project-to-post relationship directly while leaving traffic and broader marketing diagnostics with their owning surfaces.

## What Changes

- Replace the Marketing coverage table with a compact project ledger whose expandable content is the project's bounded post receipts.
- Remove views, visits, positioning, recommendations, coverage state, and Cloudflare refresh controls from `/marketing`.
- Preserve the existing prompt-first video maker and Explore Gallery inside Fleet Console Marketing.
- Show an explicit no-posts state for projects without publication receipts.
- Keep receipt output sanitized, newest-first, and bounded.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portfolio-strength-console`: Narrow the Marketing directory contract from marketing analytics and recommendation coverage to projects and their post receipts.
- `marketing-control-plane`: Make `/marketing` a project-and-post view while keeping deeper pipeline stages and measured outcomes outside the primary page.

## Impact

- Fleet Console `/marketing` page structure, client renderer, and styles.
- Founder Control's sanitized marketing outcome projection and its focused tests.
- No dependency, credential, scheduling, posting, provider, or deployment changes.
