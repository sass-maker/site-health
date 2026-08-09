## Why

Fleet's three video products contain structured internals, but an AI agent still
has to know product-specific commands or drive SwiftUI to complete important
work. Agents need one discoverable, safe, machine-readable operation contract
that exposes every supported capability without granting arbitrary execution.

## What Changes

- Add one versioned agent-operation envelope shared conceptually by Reel
  Pipeline, Mashup, and Local AI Video Studio.
- Add product manifests that enumerate capabilities, input schemas, readiness,
  side effects, cost posture, and supported operation states.
- Add non-interactive JSON commands for discovery, validation, execution,
  status, cancellation, and result inspection.
- Refactor Local AI Video Studio orchestration out of `StudioViewModel` into a
  headless domain service and executable CLI used by both agents and SwiftUI.
- Wrap Mashup's supported Typer workflows in a stable JSON operation surface
  while preserving its existing human CLI.
- Consolidate Reel Pipeline's registries and execution adapters behind an
  agent-facing JSON command instead of requiring script-name knowledge.
- Extend that command through channel-aware packaging, draft creation,
  scheduling, publication, and post-receipt inspection when a configured
  distribution channel and its explicit automation policy permit the action.
- Require stable error codes, job/operation identities, provenance, artifact
  manifests, fallback disclosure, dry-run validation, and idempotent reads.
- Keep all current local-media, rights, approval, and arbitrary-code safety
  boundaries. No model may emit or execute shell commands.

## Capabilities

### New Capabilities

- `agent-video-operation-contract`: Cross-product discovery, request, lifecycle,
  evidence, error, and safety contract for agent-operated video work.

### Modified Capabilities

- `local-video-effect-control`: Requires a headless agent surface with parity to
  supported Studio import, planning, graph editing, rendering, and export.
- `marketing-video-execution`: Requires complete agent discovery and execution
  coverage for every registered Reel Pipeline variant plus configured-channel
  packaging and publication.
- `podcast-editorial-pipeline`: Requires non-interactive, resumable agent control
  over supported Mashup planning, approval inspection, and rendering stages.
- `mashup-media-handoff`: Extends receipts with operation identity and stable
  machine-readable result/error linkage.

## Impact

- Fleet Workspace: `foundry/helpers/mashup`,
  `foundry/marketing/reel-pipeline`, shared OpenSpec requirements, tests, and
  project documentation.
- Local AI Video Studio: new executable/product target, domain orchestration
  service, SwiftUI integration, tests, README, and agent instructions.
- GitHub work queues: Fleet issue #279 and Local AI Video Studio issue #1.
- No new production dependencies, cloud service, account, deployment, model
  runtime, or unrestricted plugin surface. Existing configured distribution
  providers remain the only external publication boundary.
