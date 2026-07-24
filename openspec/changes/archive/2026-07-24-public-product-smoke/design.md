## Context

The existing Fleet audit stack treats repository, workflow, deployment, SEO,
performance, and agent-indexing evidence as separate dimensions. Those checks
can all be green while a guest-facing workflow is broken because HTTP success
does not prove that navigation, asynchronous content, downloads, or product
actions work.

The browser audit must remain bounded enough to run across the Fleet and safe
enough to execute against production. It must also distinguish a true guest
test from a browser profile that is already authenticated.

## Goals / Non-Goals

**Goals:**

- Define a repeatable, read-only product-journey audit.
- Select at most six meaningful surfaces per product instead of crawling.
- Resolve scope from canonical Fleet inventory and policy.
- Produce human-readable findings and structured repair handoff.
- Preserve evidence about authentication state, retries, and blocked actions.

**Non-Goals:**

- Automated production repair or deployment.
- Exhaustive crawling, visual regression testing, or synthetic load testing.
- Native Mac, mobile, or desktop application testing.
- Replacing SEO, performance, agent-readiness, CI, or deploy audits.
- Entering credentials, completing purchases, or submitting production data.

## Decisions

### Keep the audit as a `site-health` subskill

Public usability is a website-health dimension, but it requires browser
judgment rather than a static probe. A sibling skill keeps its protocol isolated
while allowing `site-health` and `fleet-ops` to route broad requests to it.

Alternative considered: add the protocol directly to `fleet-audit`. Rejected
because `fleet-audit` owns source and operational health, not user journeys.

### Use a deterministic manifest and agent-driven journey selection

The helper script reads the Fleet registry and emits product, domain, repository,
status, and exclusion data. The agent then chooses actual journeys from visible
navigation and product promises. Static route lists would drift and cannot
represent one-page applications well.

### Cap each product at six distinct surfaces

The default categories are landing/browse, search/filter, detail, primary
action, secondary workflow, and access boundary. Products with fewer unique
surfaces use fewer checks. A failure on the core action can end that product's
pass after reproduction and evidence capture.

### Keep audit and repair separate

The skill emits a repair queue but does not edit product repositories. A later
repair pass re-enters each owning repository, reproduces locally, applies the
smallest fix, and runs its targeted validation. This preserves audit integrity
and repo-local instructions.

### Emit Markdown and JSON

Markdown is the operator summary. JSON is the handoff contract with project,
repository, surface, action, expectation, observation, status, guest state,
reproduction count, evidence, and next action.

## Risks / Trade-offs

- **Authenticated browser state can hide guest failures** → Record guest state
  explicitly and use `not_verified` when a clean guest boundary is unavailable.
- **Async applications can look blank during startup** → Wait for normal
  hydration and retry one time before classifying a core failure.
- **A six-surface budget can miss long-tail defects** → Select surfaces by
  product promise and prioritize the primary action over route count.
- **Production interaction can mutate data** → Ban submissions, purchases,
  OAuth, ratings, emails, destructive controls, and credential entry.
- **Registry drift can mis-scope the audit** → Report missing or contradictory
  ownership rather than silently guessing.

## Migration Plan

1. Add and validate the new skill and manifest helper.
2. Route matching requests through `site-health` and `fleet-ops`.
3. Run the manifest and one bounded audit to establish the initial report.
4. Use the report as the repair queue; no production migration is required.

Rollback is removal of the routing rows and skill directory. Existing health
skills and reports remain unaffected.

## Open Questions

- Whether recurring scheduled execution is valuable after two or three manual
  runs establish stable product-specific journeys.
- Whether stable journeys should later become project-owned Playwright smoke
  tests rather than remain browser-agent-only checks.
