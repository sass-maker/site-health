## Why

The current operator catalog groups 24 unrelated identities under “Toolbox,”
mixing product type, operating status, and owner urgency. Fleet needs a complete,
orthogonal classification that remains useful when priorities or deployment
posture change.

## What Changes

- **BREAKING**: Replace owner-facing attention buckets as the primary catalog
  organization with explicit per-project `kind` and `priority` classifications.
- Add complete per-project portfolio state for `status`, `deployed`, and
  `readyToBeShared`, plus a dated sharing-readiness reason, without discarding
  detailed deployment evidence.
- Support priorities P1, P2, and P4 and require every identity to have exactly
  one value; P0 and the indistinguishable P3 tier are intentionally absent.
- Reserve P1 for the four never-finished, owner-built products: CodeVetter,
  Pace, PostTrainLLM, and Office OS. Use P4 for finished or archived work and
  P2 as the single active-focus tier.
- Reactivate Mashup at P2 from its current independent helper source of truth,
  while keeping its local-only deployment and sharing flags conservative.
- Generate the readable catalog by priority first and kind second.
- Split P4 visually into owner-finished active work and archived work without
  adding another priority or duplicating lifecycle state.
- Treat P2 as the eligible active-work pool, with actual agent work selected
  from GitHub Issues in bounded sets of at most five projects.
- Explain how the catalog drives focus, maintenance, publishing, and retained
  infrastructure decisions, including the limits of Cloudflare evidence.
- Reduce project kinds to product, platform, and experiment; remove the
  ambiguous utility category.
- Consolidate Fleet Workflows into Fleet Workspace because it is an extension,
  not a separately prioritized project identity.
- Validate all 46 current identities and all future identities for complete,
  internally consistent classification.
- Update the agent maintenance contract so classification changes are made in
  the canonical catalog and regenerated in the same task.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `fleet-project-coverage`: Extend the canonical project contract and generated
  private inventory with complete priority, kind, operating-status, deployment,
  and sharing-readiness classification.

## Impact

- Canonical schema: `foundry/ops/config/projects.json`
- Catalog validation and generation: `foundry/ops/lib/project-catalog.mjs`
- Generated operator documentation and registry overlays
- Fleet inventory tests and agent maintenance instructions
- No production dependency, provider mutation, deployment, or public release
