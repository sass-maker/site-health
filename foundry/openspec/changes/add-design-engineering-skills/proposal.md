## Why

Fleet's design workflow governs direction and review, but agents still have to
improvise how they research references, study unfamiliar components, prepare
web 3D assets, and build expressive animation or shader effects. A focused
skill set can make those jobs repeatable without turning a human tool directory
into a large, duplicative prompt.

## What Changes

- Add `design-inspiration` to gather current references, extract transferable
  design principles, identify anti-references, and feed evidence into the
  existing preserve/overhaul workflow.
- Add `component-pattern-mine` to compare mature component implementations and
  produce project-adapted anatomy, state, accessibility, responsive, and
  implementation guidance.
- Add `web-3d-pipeline` to choose an appropriate rendering tier, inspect and
  optimize web 3D assets, integrate fallbacks, and validate browser performance.
- Add `creative-web-effects` to shape and implement purposeful animation,
  Canvas, SVG, shader, and scroll-linked effects with accessibility and
  performance budgets.
- Add a lightweight `design-engineering` parent router and connect the focused
  skills to Fleet's existing `design-workflow` and Impeccable boundaries.
- Add progressive references, UI metadata, dependency-free diagnostics, and
  focused validation without adding production dependencies or performing live
  deploys.

## Capabilities

### New Capabilities

- `design-engineering-toolkit`: Executable inspiration, component research,
  web 3D, and creative-effects workflows with project-context, provenance,
  accessibility, fallback, and performance requirements.

### Modified Capabilities

- `fleet-design-quality-workflow`: Route specialized research and media-effect
  work through the new skills while preserving project identity, approval, and
  completion gates.

## Impact

- Adds canonical Fleet skills, metadata, references, a small diagnostics
  script, fixtures, and focused tests under `foundry/ops/`.
- Updates the existing design workflow router/documentation and Fleet skill
  inventory.
- Introduces no production package dependency, credential access, production
  configuration, deploy, migration, or release behavior.
