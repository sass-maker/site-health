# Fleet design-workflow assessment

Assessment date: 2026-07-26

This scores the Fleet workflow that governs meaningful visual work, not the
quality of any one product interface.

## Result

| Dimension | Before | Current | Evidence |
| --- | ---: | ---: | --- |
| Taste specificity | 2/4 | 4/4 | `design-workflow/SKILL.md` makes project `PRODUCT.md`/`DESIGN.md` authoritative, separates preserve/overhaul, and requires named references plus owner-selected direction |
| Workflow clarity | 3/4 | 4/4 | One concise Fleet wrapper reduces normal work to classify, shape/build, review, and close; Impeccable remains the underlying engine |
| Enforcement and evidence | 1/4 | 4/4 | `design-workflow.mjs check` validates context, direction, three viewport screenshots, score floors, zero unresolved P0/P1, project check, and owner acceptance |
| Reproducibility | 1/4 | 4/4 | `design-workflow.json` separately pins npm package 3.3.1 and installed skill payload 4.0.2; agent-stack installation repairs drift; self-check and regression tests verify both pins |
| Owner feedback loop | 0/4 | 3/4 | Every receipt records `keep`, `close`, `wrong-lane`, or `delegated`, and only accepted outcomes pass |
| **Total** | **7/20** | **19/20** | **Good enough to adopt; one bounded improvement remains** |

## Why this is materially better

- A project-specific direction now outranks generic palette, component-gallery,
  and detector preferences.
- Preserve work stays lightweight; expensive visual exploration is reserved
  for overhaul and net-new work.
- Meaningful work cannot be called complete with an acceptable-but-low critique,
  unresolved material findings, missing responsive evidence, or owner
  dissatisfaction.
- Detector heuristics remain useful signals without becoming an aesthetic
  authority.
- Fresh machines and existing machines use the same upstream package and skill
  payload versions.

## Remaining point

Owner feedback is durable per project but is not yet aggregated across Fleet.
Do not add an aggregation system until several real receipts exist; then use
recurring `close` and `wrong-lane` notes to update Fleet standards or a small
owner taste reference. This avoids inventing a preference model before there is
evidence.
