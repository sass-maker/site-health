## Why

Marketing Studio currently models ideas and recipes, but it does not distinguish where content work originates and still requires an operator to assemble each production manually. The operator wants the normal path to be unattended while preserving conversation-created work and personal automations as separate, attributable lanes.

## What Changes

- Add three first-class content lanes: project automation, operator requests made through an agent, and operator-owned automation for non-project content.
- Store the lane as orthogonal scope and trigger metadata so an item can remain project-attributed or personal without coupling provenance to a renderer.
- Add a policy-driven autopilot that discovers eligible source items, deduplicates them, selects a ready recipe within the configured spend posture, creates the production brief, renders, quality-gates, retries bounded failures, and prepares the Postiz handoff.
- Enable project automation initially for Significant Hobbies, High Signal, and major Fleet project changelog entries. High Signal uses its existing reel-brief source, Significant Hobbies uses its existing editorial source, and changelogs preserve the canonical public `/changelog` evidence link.
- Keep Studio as the monitoring, exception, review, and override surface rather than requiring normal production setup clicks.
- Allow a standing automation policy to authorize render execution and a future Postiz schedule. Missing rights, source evidence, stable media, account mapping, runtime readiness, or policy authority still fails closed.
- Keep immediate publication and direct social-provider integration out of Reel Pipeline; Postiz remains the scheduling and publication owner.
- Add no production dependency and no second task database.

## Capabilities

### New Capabilities

- `studio-content-lanes`: Origin, scope, trigger, provenance, and display semantics for project automation, operator requests, and personal automation.
- `studio-autopilot`: Policy-driven source discovery, deterministic recipe selection, bounded execution, quality handling, idempotency, and Postiz preparation or future scheduling.

### Modified Capabilities

- `studio-factory`: Extend the conveyor from manually selected backlog items to lane-aware, project-scoped unattended runs with receipts and bounded retries.
- `marketing-video-studio`: Permit execution and future scheduling from an explicit standing automation policy while keeping manual requests reviewable and all evidence gates intact.
- `studio-web-ui`: Show the three content lanes, automation run state, exceptions, selected recipe, spend posture, and next recovery action without turning the UI into a required wizard.

## Impact

- Extends Idea Store and Marketing Studio brief contracts compatibly with optional origin metadata.
- Adds a versioned repository-owned automation policy plus run receipts under the existing Studio artifact/state boundaries.
- Reuses `src/content-extractors.js`, Significant Content handoffs, High Signal reel briefs, project catalog identities, the production recipe catalog, current render adapters, quality reports, and Postiz distribution contracts.
- Adds focused Node tests, CLI/API entrypoints, and Studio read models. No deployment, credential change, cloud configuration, migration, direct provider adapter, or new production dependency is included.
