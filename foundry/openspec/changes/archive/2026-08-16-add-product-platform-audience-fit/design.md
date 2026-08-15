## Context

See `proposal.md` for motivation. The matcher currently consumes accreditation
state and artifact metadata only. The queue consumes the Fleet project catalog
and therefore already has stable product IDs, while the accreditation state has
stable platform IDs. Neither canonical file should absorb a marketing taxonomy
that changes independently of deployment or accreditation evidence.

## Goals / Non-Goals

**Goals:**

- Keep audience judgments explicit, reviewable, and deterministic.
- Preserve artifact routing and accreditation-state behavior as outer gates.
- Make missing evidence visible without allowing it into an execution queue.
- Keep the taxonomy isolated from the canonical project and accreditation data.

**Non-Goals:**

- Inferring audience fit from prose, names, or live web content at runtime.
- Authorizing submissions, bypassing blockers, or changing platform state.
- Replacing campaign-specific editorial judgment with a numeric score.

## Decisions

### Use one small audience-fit overlay

Add a versioned JSON document beside the directory-submission configuration. It
contains an allowed taxonomy plus explicit product and platform tag arrays. A
dedicated loader validates the document and resolves tags by stable ID.

This keeps audience metadata out of `projects.json`, whose job is portfolio and
infrastructure truth, and out of accreditation state, whose job is verification
evidence. Embedding tags in either canonical file was rejected because audience
classification changes on a different cadence and would create broad catalog or
state churn.

### Treat overlap count as a transparent priority signal

After artifact routing, the matcher intersects the product and platform tags.
The overlap count is the fit score and the sorted overlap is the evidence. This
is intentionally simple: weighted or inferred scoring would be harder to audit
and would imply precision the current evidence cannot support.

### Preserve unmatched evidence in an unclassified bucket

Artifact-compatible platforms with a missing product signal, missing platform
signal, or zero overlap are excluded from every matched and verification list
and returned in an `unclassified` bucket with a reason. Rejected and blocked
state remain independently visible, but cannot enter execution queues through
audience scoring.

### Pass fit configuration explicitly

The matcher remains pure and receives validated fit configuration through its
options. The queue renderer receives the same document and the CLI loads it
from the default config path, with an override available for tests and local
inspection. This avoids hidden filesystem reads in matching code.

## Risks / Trade-offs

- **Curated tags can become stale** → Keep evidence visible in generated queue
  lines and fail validation on malformed mappings.
- **Broad tags can still produce broad matches** → Rank by overlap and retain
  campaign-specific confirmation as a final editorial gate.
- **Previously matched destinations can become unclassified** → This is the
  intended safe default; no submission is lost because manifests still require
  separate exact-hash approval.

## Migration Plan

1. Add and validate the overlay against stable product and platform IDs.
2. Add audience-aware matching and queue rendering behind the required overlay
   input.
3. Generate the queue and compare classified/unclassified counts before merge.
4. Roll back by reverting the change; no external state or production data is
   migrated.
