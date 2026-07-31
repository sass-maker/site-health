## Why

Reel Pipeline can already make several useful kinds of video, but the operator
experience is split across `/studio`, `/forge`, `/review`, the podcast editor,
and CLI-only Postiz handoff. The operator needs one honest creation surface
where a natural-language request becomes a reviewable production brief, the
right existing workflow is obvious, and approved output can continue to the
Postiz scheduling surface without implying that Reel Pipeline publishes it.

## What Changes

- Turn the local `/studio` page into the unified **Marketing Studio** while
  preserving the existing studio tools and their stable API routes.
- Add a conversational brief composer that converts an operator request into a
  saved, editable video plan with an explicit video kind, duration, channel,
  source/rights posture, creative direction, and next action.
- Present the supported creation workflows in one catalog: faceless/lesson,
  product or brand reel, guided app demo, coherent generated film, and podcast
  short. Each workflow exposes truthful readiness and launches or links to its
  existing authoritative execution surface.
- Keep the faceless workflow directly runnable from Marketing Studio and make
  all other workflows produce an actionable handoff rather than a fake render.
- Consolidate generated scripts, saved ideas, rendered artifacts, quality
  state, review actions, and distribution readiness into one operator flow.
- Add a UI action that prepares or submits an approved compatible artifact as
  a **Postiz draft**, then directs the operator to Postiz for calendar,
  scheduling, publication, and provider analytics.
- Preserve the current fail-closed distribution boundary: Reel Pipeline does
  not connect social accounts, set schedules, auto-approve, or auto-publish.
- Add no production dependency and keep deterministic offline fallbacks for
  conversational brief creation.

## Capabilities

### New Capabilities

- `marketing-video-studio`: Unified conversational video planning, workflow
  routing, saved creation state, artifact review, and Postiz draft handoff.

### Modified Capabilities

- `studio-web-ui`: Expand the existing browser tool page into an accessible,
  responsive operator workspace without removing its current tools or API
  behavior.

## Impact

- Affects `src/studio/`, the local control server, distribution handoff
  adapters, focused Node tests, product documentation, and the `/studio`
  design-review receipt.
- Reuses the existing Studio LLM chain, idea store, faceless renderer, Forge,
  review UI, podcast editor, content-package contracts, and Postiz client.
- Adds no provider credentials, social tokens, production dependency, deploy,
  schedule, or publication action.
- Implements Fleet Workspace issue #75; live Postiz host/account/canary work
  remains separately tracked by Fleet Workspace issue #40.
