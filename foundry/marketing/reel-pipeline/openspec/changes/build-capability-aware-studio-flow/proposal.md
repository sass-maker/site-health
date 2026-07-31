## Why

Marketing Studio exposes projects, ideas, video workflows, render engines, review, and Postiz as separate controls, so operators must understand implementation details before they can make a video. The Studio needs one capability-aware production flow that makes cost posture, runtime ownership, prerequisites, and the next valid action explicit before execution.

## What Changes

- Add a saved four-step production plan: select a Fleet project, select or create an idea, choose a video recipe, and configure bounded recipe options.
- Add a server-owned recipe catalog spanning local compositions, image slideshows, ASCII, Blender, Grok assets, local-model films, stock/faceless rendering, guided app demos, podcast clips, and rights-gated lyric videos.
- Consolidate workflow, recipe, and Studio-tool decision metadata into one versioned, secret-free arsenal manifest, then expose one agent-facing snapshot that joins engine readiness and automation policies without duplicating their execution contracts.
- Expose each recipe's actual engine, execution owner, spend posture, local or external requirements, readiness, supported channels, and actionable blockers.
- Persist the selected idea, recipe, and normalized options on the Marketing Studio brief so refreshes and later review retain the operator's intent.
- Unify terminal actions around Edit, Build or Preview, and Prepare in Postiz while preserving specialized Forge, Editorial, and Brand Reel continuations.
- Keep publication credentials and immediate publishing outside Reel Pipeline; Postiz remains the only draft, scheduling, and publishing boundary.
- Preserve the current buildless Studio implementation and add no production dependency.

## Capabilities

### New Capabilities

- `studio-production-planning`: Project, idea, recipe, options, readiness, spend posture, and terminal-action planning for a saved video production.

### Modified Capabilities

- `marketing-video-studio`: Replace the flat workflow choice with a capability-aware plan that retains selections and routes execution truthfully.
- `studio-web-ui`: Present the ordered Project → Idea → Recipe → Options flow and terminal Edit, Preview, and Postiz actions without removing existing tools.

## Impact

- Adds a recipe-catalog and production-plan contract under `src/studio/`.
- Adds a versioned arsenal manifest plus read-only API and CLI inspection surfaces for future AI operators.
- Extends the saved brief and idea schemas compatibly with optional project, idea, recipe, and option fields.
- Adds read-only planning endpoints and bounded idea creation to the existing Studio API.
- Reworks the Create view inside `src/studio/ui.js` while preserving Productions, Distribute, Tools, specialized runtime ownership, and the existing navigation.
- Adds focused Node tests and responsive browser evidence. No deployment, credential, cloud configuration, migration, or new production dependency is required.
- Tracks the agent-arsenal consolidation in Fleet issue #94.
