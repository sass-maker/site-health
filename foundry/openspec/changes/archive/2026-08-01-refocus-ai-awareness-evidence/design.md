## Context

See `proposal.md` for motivation. Founder Control already separates
provider-backed model observations from fixture runs and Cloudflare discovery
outcomes. The current owner projection exposes only aggregate model metrics,
while the retained run keeps citation hosts and provider/model attempts. Raw
answers are intentionally excluded from the ledger and must remain excluded.

## Goals / Non-Goals

**Goals:**

- Make the portfolio row answer whether a core project appears in real model
  answers, not whether a bot reached its site.
- Provide bounded evidence for the questions, provider/model coverage, and
  owned versus independent source mix behind each result.
- Preserve the existing additive owner-outcome API and responsive table
  interaction.

**Non-Goals:**

- Starting provider runs, adding credentials, enabling a schedule, or choosing
  a paid provider.
- Treating crawler traffic, referrals, search traffic, or technical readiness
  as model awareness.
- Persisting raw answers or inventing ownership for incomplete historical data.

## Decisions

### Retain a bounded normalized citation set

The run recorder will deduplicate citation URLs, retain no more than 50, and
derive hosts from the same normalized set. This is enough for source inspection
without retaining raw answer text or unbounded provider payloads. Existing
host-only runs remain readable.

Alternative: keep aggregate hosts only. Rejected because shared hosts such as
GitHub cannot be attributed to the project's repository without the URL path.

### Classify source ownership in the projection

Founder Control will classify a normalized citation as project-owned when its
hostname matches a canonical project domain or its URL falls under the
project's canonical repository URL. Other normalized citation URLs are
independent external sources. Host-only evidence that cannot prove ownership is
unclassified. The stored observation remains provider-normalized and does not
embed presentation categories.

Alternative: classify during ingestion. Rejected because project ownership
metadata can evolve independently from immutable provider observations.

### Keep discovery evidence subordinate

The main table will show model status, mention, recommendation, citation, rank,
and independent source count. The expanded row will lead with questions and
provider/model observations, then citation sources, then Cloudflare discovery
signals and exact provider links. No composite score will blend these layers.

Alternative: keep crawler requests and referrals in the main table. Rejected
because their visual prominence implies awareness even when no model answer has
been observed.

### Extend the existing API additively

The existing `fleet.owner-outcome.v1` response will add bounded question,
attempt, citation-source, and coverage fields to AI Awareness rows. No new route
or client dependency is required.

## Risks / Trade-offs

- **Historical citation hosts lack URL paths** → Preserve them as Unclassified
  and improve source ownership only on future provider observations.
- **A product can be externally cited but not mentioned in the sampled
  answers** → Keep source counts beside, not inside, the awareness state.
- **Provider/model evidence may grow** → Bound questions, attempts, citation
  URLs, and rendered source lists with explicit totals.
- **Official sources beyond website and repository are not yet registered** →
  Classify only what current canonical metadata proves; add npm or directory
  ownership later through the registry rather than UI exceptions.

## Migration Plan

1. Extend the event payload and projection additively; existing events remain
   valid.
2. Update the AI Awareness API and page, then verify empty and measured fixtures.
3. Ship code without running providers or deploying. A future approved run will
   populate URL-level source ownership.
