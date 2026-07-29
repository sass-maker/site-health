## 1. Shared campaign contract

- [x] 1.1 Add a dependency-free campaign-manifest library with canonical
  validation, hashing, lifecycle state, material-change detection, deterministic
  item identities, and sanitized receipt normalization
- [x] 1.2 Add a CLI that validates and renders complete previews, records an
  explicit owner approval reference for one hash, gates individual items, and
  reports reconciled status without executing arbitrary manifest commands
- [x] 1.3 Store campaign bodies, approvals, evidence, and receipts in a
  private machine-local runtime root outside the checkout
- [x] 1.4 Add fictional fixtures and focused tests for incomplete previews,
  unchanged approval, invalidation, partial resume, duplicate suppression,
  blocked items, ambiguous outcomes, and public-summary sanitization

## 2. Content coverage skill

- [x] 2.1 Initialize `ops/skills/content-coverage` with `skill-creator`, concise
  trigger metadata, generated `agents/openai.yaml`, scripts, and references
- [x] 2.2 Add a deterministic inventory helper for one product or the Fleet
  registry that resolves repository context, sitemap URLs, local content
  sources, page archetypes, internal links, and explicit unavailable evidence
- [x] 2.3 Define the competitive archetype, intent-coverage, prioritization,
  cannibalization, claim-ledger, and keep/update/merge/create/prune protocol
- [x] 2.4 Define preview-first page drafting and owning-repository publication,
  including target agent instructions, existing content-model reuse,
  spec-driven escalation for a missing article surface, checks, and exact
  commit/push/deploy approval boundaries
- [x] 2.5 Add a fixture CodeVetter audit that demonstrates an inventory,
  competitor/archetype evidence, coverage verdict, blocked comparison claim,
  complete page preview, and no repository or public write

## 3. Launch campaign skill

- [x] 3.1 Initialize `ops/skills/launch-campaign` with `skill-creator`, concise
  trigger metadata, generated `agents/openai.yaml`, scripts, and references
- [x] 3.2 Define launch readiness, new-product versus major-feature scope,
  flagship content quality gates, secondary destination fields, exclusions,
  timing, attribution, and 7-day/30-day reporting
- [x] 3.3 Define connector-first execution using Postiz for mapped social work
  and the connected Browser skill for remaining normal UI workflows
- [x] 3.4 Reconcile the directory registry as seed evidence with live
  eligibility, audience fit, cost, policy, authentication, CAPTCHA, and
  automation-mode checks; explicitly exclude legacy force-submit and
  automation-evasion scripts
- [x] 3.5 Add a fictional campaign fixture that previews all content/actions,
  approves one unchanged hash, executes fixture connectors, blocks CAPTCHA and
  payment changes, records receipts, and resumes without duplicates
- [x] 3.6 Add protected, article-syndication, broad-backlink, and enablement
  queue contracts to the launch skill without expanding the manifest approval
  boundary
- [x] 3.7 Add a deterministic channel-inventory helper that exposes protected
  and article destinations plus the curated and long-tail directory seeds
  without preloading the full registry
- [x] 3.8 Extend the fictional fixture and focused tests to prove a blocked
  article platform does not stop another syndication or backlink item

## 4. Fleet integration

- [x] 4.1 Add content-coverage routing and latest verdict support to
  `site-health` and its combined scorecard without breaking existing child
  skills
- [x] 4.2 Update the marketing control-plane implementation and tests so an
  exact approved campaign manifest can execute while all unapproved or changed
  work remains blocked
- [x] 4.3 Register both skills in Fleet capability discovery, route content
  coverage through the existing `site-health` parent, and leave runtime skill
  loading and preload linkage unchanged
- [x] 4.4 Reuse existing product, agent-surface, content-package, Postiz, and
  receipt authorities without adding secrets, production dependencies, or a
  second scheduler

## 5. Validation and handoff

- [x] 5.1 Run `skill-creator` quick validation for both skill folders and
  validate their `agents/openai.yaml` metadata
- [x] 5.2 Run the focused manifest, content inventory, launch fixture,
  marketing-control-plane, capability-catalog, and site-health tests
- [x] 5.3 Run strict OpenSpec validation and `git diff --check`
- [x] 5.4 Forward-test both skills on fixture-only preview tasks without live
  browser submission, repository publication, credentials, or production
  deployment
- [x] 5.5 Update durable Fleet documentation, leave main-spec synchronization
  to the separate archive step, and report the exact live actions that remain
  separately approval-gated
- [x] 5.6 Validate the strengthened launch skill, channel inventory, fixture
  execution, strict OpenSpec change, and touched-file whitespace
