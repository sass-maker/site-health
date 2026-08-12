## Why

Fleet's design stack already owns direction, craft, research, and review, but
several common UI jobs are not routed explicitly enough. Public ui.sh
documentation exposes useful task boundaries that can sharpen Fleet's existing
skills without copying ui.sh's token-gated payload or expanding Fleet's skill
catalog.

## What Changes

- Expand `design-engineering` routing so nine recurring jobs resolve to the
  existing Fleet skill or Impeccable command that already owns the work.
- Strengthen `design-workflow` with explicit handoffs for new UI, component
  extraction, dark mode, raster variants, and responsive adaptation while
  preserving its review and owner-acceptance authority.
- Extend `design-inspiration` to support multiple direction probes and compact
  brand-direction boards, using imagegen only when a visual board is requested.
- Add bounded, conservative inline recipes to `design-engineering` for
  Tailwind class canonicalization and semantic markup reconstruction, the two
  jobs that do not warrant a new Fleet skill or Impeccable command.
- Update existing metadata, references, and routing-contract tests. Do not add
  skills or dependencies, copy proprietary prompts or code, change production
  config, or deploy anything.

## Capabilities

### New Capabilities

- `ui-workbench`: Existing-skill routing and project-native execution contracts
  for recurring UI design, refactoring, theme, responsive, utility-class,
  raster, and semantic-markup jobs under Fleet's design-quality gates.

### Modified Capabilities

None.

## Impact

- Updates existing `design-engineering`, `design-workflow`, and
  `design-inspiration` instructions, relevant metadata or references, and the
  focused design-engineering tests.
- Reuses the installed Impeccable and imagegen skills without modifying their
  external payloads; no new skill directory, package, API, credential, runtime,
  migration, release, or deployment impact.
