## Why

Fleet can measure technical site health and generate isolated marketing assets,
but it cannot answer whether a product covers the search-intent pages expected
in its category, publish the missing durable pages, or turn a major
product/feature launch into one previewable and executable cross-channel
campaign. The owner needs two reusable skills that perform those jobs end to
end without requiring daily manual marketing work.

## What Changes

- Add a `content-coverage` skill that inventories a product's live and
  repository-owned pages, discovers current search competitors and standard
  page archetypes, scores intent and topic coverage, and proposes exact
  keep/update/merge/create/prune actions.
- Make `content-coverage` produce complete source-backed page drafts and, after
  approval of an immutable execution manifest, write them into the owning
  product repository, run its required checks, and perform only the explicitly
  approved publish steps.
- Add a `launch-campaign` skill for one-off new-product and major-feature
  launches. Its first phase shows the complete execution sequence, every
  flagship post in full, every eligible secondary destination and submission,
  timing, account mapping, costs, blockers, exclusions, and measurement plan.
- Allow one explicit campaign approval to authorize the exact immutable
  manifest shown in preview. Changed content, destinations, accounts, timing,
  repository writes, or deploy commands require a new approval.
- Execute approved social work through the existing Postiz boundary, use
  purpose-built connectors or APIs where available, and use the connected
  browser for remaining normal UI workflows.
- Treat CAPTCHA, anti-bot challenges, unavailable authentication, payment,
  press outreach, community moderation, fake-review requests, irrelevant
  destinations, and deceptive or duplicate posting as blocked or separately
  gated rather than bypassing them.
- Record per-item receipts and reconcile confirmed, queued, manual, blocked,
  failed, indeterminate, and published outcomes without blindly retrying
  ambiguous creates.
- Keep both skills preview-only by default and store unpublished campaign
  bodies, approvals, browser evidence, and receipts in private machine-local
  state rather than public Fleet snapshots.

## Capabilities

### New Capabilities

- `approved-campaign-manifest`: Versioned preview, approval, change invalidation,
  item execution, reconciliation, and receipt contracts shared by both skills.
- `content-coverage-publishing`: Competitive content inventory, page-archetype
  coverage, source-backed drafting, repository publication, and coverage
  reporting for one product or the Fleet registry.
- `launch-campaign-execution`: One-off product/feature launch planning,
  flagship and secondary distribution generation, approved browser/API/Postiz
  execution, and outcome reporting.

### Modified Capabilities

- `site-health`: Route content sufficiency, competitive page coverage, topic
  gaps, and article inventory requests to `content-coverage` and include its
  latest verdict in combined health reporting.
- `marketing-control-plane`: Replace the blanket no-auto-post rule with a
  fail-closed rule that permits execution only after explicit approval of the
  exact immutable campaign manifest and preserves Postiz/account isolation.

## Impact

- Adds two canonical Fleet skills under `foundry/ops/skills/` plus UI metadata,
  references, deterministic scripts, fixtures, and focused tests.
- Adds a shared private campaign-manifest/approval/receipt library and CLI under
  `foundry/ops/`.
- Extends the Fleet site-health router, combined scorecard, capability catalog,
  and marketing-control-plane contracts without changing runtime skill loading.
- Reuses the product/agent-surface registries, existing product repository
  instructions, Postiz adapter, content package evidence, and directory
  inventory.
- Introduces no production package dependency, does not store credentials, and
  does not deploy, publish, buy placement, or bypass platform controls during
  implementation or fixture validation.
