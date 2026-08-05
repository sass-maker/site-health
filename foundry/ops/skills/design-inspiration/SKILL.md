---
name: design-inspiration
description: Research and synthesize attributable visual references, anti-references, and direction evidence for web interfaces. Use when an agent needs inspiration for a landing page, product surface, dashboard, component family, interaction language, or Fleet overhaul direction, including temporary code-based comparison probes when static evidence cannot demonstrate interaction or responsive behavior. Produces transferable principles and design-workflow receipt inputs without copying another product's brand, content, assets, or proprietary implementation.
---

# Design inspiration

Find evidence for a direction, not a collage of attractive screenshots.

## 1. Establish the search frame

Read the nearest project instructions and the relevant `PRODUCT.md`,
`DESIGN.md`, surface brief, tokens, incumbent UI, and real content. State:

- surface and user outcome;
- preserve or overhaul lane when `design-workflow` is active;
- desired qualities and explicit anti-qualities;
- platform, viewport, content, brand, accessibility, and performance limits.

If meaningful implementation is also requested, invoke `design-workflow`
before changing UI. Research-only work does not need a review receipt.

## 2. Search broadly, then narrow

Read [the research contract](references/research-contract.md). Use current web
research and the parent [source map](../design-engineering/references/source-map.md)
to discover candidates. Search by the actual interaction, content type,
audience, and mood rather than only by product category.

Survey enough candidates to reveal patterns, then keep only two or three
material references. Prefer original product pages and primary explanations.
Record source URL, access date, relevant surface, and why it matters. Verify
drift-prone availability, account, price, and license claims before reporting
them as current.

## 3. Extract principles

For each retained reference, separate:

- transferable hierarchy, composition, density, rhythm, typography, color,
  motion, interaction, and responsive behavior;
- project-incompatible styling, content, assets, or behavior;
- the principle to test in a project-native direction probe.

Name at least one anti-reference or failure mode. Do not copy brand styling,
marketing copy, proprietary code, protected assets, or an entire visual
language. Generated direction probes are new interpretations, not screenshots
to trace.

## 4. Build code probes only when necessary

Use static direction probes unless interaction or responsive behavior is the
decision. When the owner requests or approves working probes for an overhaul:

1. Create two or three materially different probes with the project's existing
   stack, tokens, components, assets, and representative content.
2. Put them behind one temporary comparison surface or switcher that is absent
   from production navigation, analytics, search indexing, and normal user
   journeys.
3. Give every probe the same content and evaluation scenario. Label the
   direction, not the reference it interprets.
4. Do not add a production dependency or silently change protected routes,
   navigation labels, form structure, analytics identifiers, or legal copy.
5. Record probe ids and paths in the existing design-review receipt and obtain
   the normal owner selection or delegation.
6. After selection, integrate the chosen direction into the real surface and
   remove the comparison scaffold and rejected probes. If the owner explicitly
   retains the comparison surface, record that product decision.

Before completion, verify that no temporary route, navigation entry, analytics
event, build artifact, or unreachable probe remains.

## 5. Hand off the evidence

Return the compact output defined in the research contract. When an active
overhaul receipt exists, place only the two or three final reference names in
`direction.references` and keep generated probe paths in `direction.probes`.
Do not put source screenshots in the probe fields or create a second approval
ledger.

Stop after evidence and a recommended next decision unless the user also asked
for probes or implementation. Do not present research as owner approval.
