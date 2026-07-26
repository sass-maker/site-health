## Why

Fleet's Impeccable adoption provides strong design vocabulary but does not
reliably produce work the owner wants to keep. The current workflow has no
reproducible skill version, enforceable evidence receipt, quality threshold, or
owner-taste feedback loop, so acceptable-but-disappointing work can be treated
as finished.

## What Changes

- Add a concise Fleet-owned design workflow skill that wraps, rather than
  forks, Impeccable.
- Separate meaningful UI work into `preserve` and `overhaul` lanes with
  different direction-approval requirements.
- Add deterministic project review receipts and checks for design context,
  screenshots, critique/audit thresholds, unresolved severity, and owner
  acceptance.
- Keep aesthetic detector findings advisory while allowing objective
  accessibility, responsive, and functional failures to block completion.
- Pin Impeccable in one Fleet configuration file and make installation fail
  closed on version drift.
- Replace generic component-gallery and palette defaults with project-specific
  references, existing design-system authority, and an explicit owner feedback
  loop.

## Capabilities

### New Capabilities

- `fleet-design-quality-workflow`: Defines Fleet's design lanes, direction
  gates, evidence receipt, quality gate, version reproducibility, and owner
  feedback contract.

### Modified Capabilities

None.

## Impact

- Fleet-owned skills and skill exposure under `foundry/ops/skills/`.
- Agent stack installation and Impeccable version configuration.
- Fleet UI and landing-page standards plus new-project guidance.
- A dependency-free validation library/CLI, receipt template, and focused tests.
- No runtime product dependency, product redesign, deployment, or migration.
