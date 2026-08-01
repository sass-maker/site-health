## Why

Marketing Studio exposes projects, ideas, video workflows, render engines, review, and Postiz as separate controls, so operators must understand implementation details before they can make a video. The Studio needs one capability-aware production flow that makes every supported finite recipe combination selectable while reserving “Ready” for paths that can actually return a final playable MP4.

## What Changes

- Add a saved four-step production plan: select a Fleet project, select or create an idea, choose a video recipe, and configure bounded recipe options.
- Add a server-owned recipe catalog spanning local compositions, image slideshows, ASCII, Blender, Grok assets, local-model films, stock/faceless rendering, guided app demos, podcast clips, and rights-gated lyric videos.
- Expand each recipe's finite select and boolean options into stable variants, expose every current variant in one grouped format selector, and keep duration as a separate bounded choice.
- Add a style-first Explore Gallery at `/marketing/explore-gallery` inside Fleet Console so the operator can compare real playable outputs before choosing a preset.
- Require gallery entries to name their actual engine and source posture, keep weak baseline fixtures out of premium positions, and let a playable sample copy its stable preset back into the main Marketing maker.
- Add a delivery contract that distinguishes final MP4, local preview, external continuation, missing input, and missing runtime without hiding any supported variant.
- Promote HTML compositions and Blender plates to final local MP4 outputs when their Chrome, FFmpeg, and Blender runtime requirements are ready.
- Consolidate workflow, recipe, and Studio-tool decision metadata into one versioned, secret-free arsenal manifest, then expose one agent-facing snapshot that joins engine readiness and automation policies without duplicating their execution contracts.
- Expose each recipe's actual engine, execution owner, spend posture, local or external requirements, readiness, supported channels, and actionable blockers.
- Persist the selected idea, recipe, and normalized options on the Marketing Studio brief so refreshes and later review retain the operator's intent.
- Unify terminal actions around Edit, Build or Preview, and Prepare in Postiz while preserving specialized Forge, Editorial, and Brand Reel continuations.
- Keep publication credentials and immediate publishing outside Reel Pipeline; Postiz remains the only draft, scheduling, and publishing boundary.
- Preserve the current buildless Studio implementation and add no production dependency.

## Capabilities

### New Capabilities

- `studio-production-planning`: Project, idea, exhaustive finite recipe variants, output contracts, readiness, spend posture, and terminal-action planning for a saved video production.

### Modified Capabilities

- `marketing-video-studio`: Retain the selected stable variant and require locally ready recipes to produce a final MP4 rather than a preview-only artifact.
- `studio-web-ui`: Present every finite recipe combination in one grouped selector, including truthful preview, continuation, input, and runtime states.

## Impact

- Adds a recipe-catalog and production-plan contract under `src/studio/`.
- Adds a versioned arsenal manifest plus read-only API and CLI inspection surfaces for future AI operators.
- Extends the saved brief and idea schemas compatibly with optional project, idea, recipe, and option fields.
- Adds read-only planning endpoints and bounded idea creation to the existing Studio API.
- Reworks the Create view inside `src/studio/ui.js` while preserving Productions, Distribute, Tools, specialized runtime ownership, and the existing navigation.
- Adds focused Node tests and responsive browser evidence. No deployment, credential, cloud configuration, migration, or new production dependency is required.
- Extends the existing dependency-free CDP and FFmpeg capture paths; arbitrary text/path inputs remain explicit follow-up fields rather than fabricated dropdown combinations.
- Adds a versioned, secret-free gallery registry plus range-capable local media delivery; unavailable machine-local samples remain explicit rather than broken cards.
- Tracks the agent-arsenal consolidation in Fleet issue #94.
