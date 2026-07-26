---
name: design-workflow
description: Use for meaningful Fleet frontend work that creates or changes visual language, layout, navigation, interaction patterns, responsive behavior, multi-state components, landing pages, dashboards, app shells, or substantial UI polish. Classifies preserve versus overhaul, wraps Impeccable, and requires direction alignment, browser evidence, objective quality gates, and owner feedback. Skip for copy-only edits, invisible refactors, and trivial CSS corrections.
---

# Fleet design workflow

Use Impeccable for design mechanics. Use this skill for Fleet's approval and
shipping contract. Project `PRODUCT.md` and `DESIGN.md` outrank generic
component, palette, or detector recommendations.

## 1. Classify

Choose exactly one lane before implementation:

- `preserve`: keep the established visual language. Capture a before
  screenshot, follow existing design context, and do not manufacture alternate
  directions.
- `overhaul`: create or materially replace a visual language. Name 2-3 concrete
  references and anti-references, generate 2-3 materially different direction
  probes, and stop until the owner approves one or explicitly delegates the
  choice.

If `PRODUCT.md` or `DESIGN.md` is missing, run `$impeccable init` before
meaningful work. Do not initialize untouched projects fleet-wide.

Create the receipt:

```bash
node foundry/ops/scripts/design-workflow.mjs create \
  --project <project-root> \
  --mode <preserve|overhaul> \
  --register <brand|product> \
  --target "<surface>"
```

When invoked inside an independent child repo, call the same script through the
relative Fleet root.

## 2. Shape and build

- Preserve: use the tracked system and before evidence as the contract.
- Overhaul: record reference names, probe ids/paths, selected probe, and
  `approved` or `delegated` in `.fleet/design-review.json` before code.
- Use real product content and assets. Do not substitute a component-gallery
  aesthetic for project identity.
- Invoke the relevant Impeccable commands for the task. For a new surface,
  prefer `$impeccable craft`; for bounded improvement, use the narrow command
  that matches the issue.

## 3. Review

Before completion:

1. Inspect the running surface in a browser.
2. Capture after screenshots at 390, 768, and 1440 pixels.
3. Run `$impeccable critique`, fix all P0/P1 findings, then run
   `$impeccable polish` and `$impeccable audit`.
4. Run the project's smallest relevant build/check.
5. Fill the receipt with evidence paths, scores, unresolved counts, and check
   command.

The minimum floors come from
`foundry/ops/config/design-workflow.json`: critique 32/40, audit 16/20, and zero
unresolved P0/P1. Scores are floors, not proof of taste.

Detector findings are advisory. Record them, but never rewrite an intentional
`DESIGN.md` decision only to silence an aesthetic heuristic.

## 4. Close with owner feedback

Ask for one final decision:

- `keep`: accepted;
- `close`: direction is near but needs another iteration;
- `wrong-lane`: return to direction selection;
- `delegated`: the owner explicitly delegated final judgment.

Only `keep` or `delegated` can pass. Preserve the note in the receipt so the
next design pass can learn from it.

Validate:

```bash
node foundry/ops/scripts/design-workflow.mjs check --project <project-root>
```

Do not claim the meaningful visual change is complete until this command
passes. Report the lane, evidence, scores, owner decision, and any advisory
detector findings.
