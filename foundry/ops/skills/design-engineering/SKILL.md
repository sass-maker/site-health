---
name: design-engineering
description: Route focused design-engineering work for inspiration research, component pattern mining, web 3D delivery, creative browser effects, and evidence-heavy interfaces. Use when a Fleet task needs attributable visual references or working direction probes, comparison of unfamiliar UI components, glTF or real-time 3D work, purposeful animation or graphics, or trustworthy reports, benchmarks, comparisons, dashboards, calculators, and decision pages. This skill complements design-workflow and Impeccable; it does not replace their direction, craft, or completion gates.
---

# Design engineering

Route the request to the smallest focused workflow. Read only the selected
child skill and its directly relevant references.

## Routing

| Primary job | Child skill | Path |
|---|---|---|
| Find visual references, anti-references, or direction evidence | `design-inspiration` | `../design-inspiration/SKILL.md` |
| Compare an unfamiliar component or interaction pattern | `component-pattern-mine` | `../component-pattern-mine/SKILL.md` |
| Create, inspect, optimize, or integrate models, scenes, glTF, or real-time 3D | `web-3d-pipeline` | `../web-3d-pipeline/SKILL.md` |
| Shape, audit, discover, specify, or build animation, SVG, Canvas, shader, pointer, or scroll effects | `creative-web-effects` | `../creative-web-effects/SKILL.md` |
| Shape, audit, specify, or build an evidence-heavy report, benchmark, comparison, dashboard, calculator, or decision page | `evidence-interface-design` | `../evidence-interface-design/SKILL.md` |

If a shader is part of a scene with models, cameras, or 3D interaction, route
through `web-3d-pipeline` first and hand its rendering boundary to
`creative-web-effects`. For other multi-job requests, order research before
implementation and state the handoff between child outputs.

## Shared boundary

1. Read the nearest `AGENTS.md`, relevant project status, and existing
   `PRODUCT.md`, `DESIGN.md`, tokens, components, and assets before advising or
   editing.
2. For meaningful Fleet visual implementation, invoke `design-workflow` and
   keep its preserve/overhaul lane and review receipt authoritative.
3. Use Impeccable for shaping, craft, critique, polish, and audit. Use these
   children for specialized research and delivery mechanics.
4. Treat [the source map](references/source-map.md) as discovery help, not a
   trusted catalog. Verify drift-prone availability, pricing, licensing, and
   compatibility before relying on an external tool or asset.
5. Reuse the project's current stack. Do not add a production dependency, paid
   tool, or licensed asset without explicit approval.
6. Return planning and research inline by default. Do not create another status
   document or approval ledger.

## Toolchain diagnostics

When 3D or effects implementation needs local tooling, run the read-only
doctor from the Fleet root or resolve the same script through this skill's
installed base directory:

```bash
node foundry/ops/skills/design-engineering/scripts/doctor.mjs \
  --project <project-root> --json
```

The doctor only inspects executable availability and declared package
dependencies. It does not install, execute, or modify any tool.

## Completion

- Research-only work ends with attributable findings, constraints, and a clear
  next decision; it does not claim that implementation shipped.
- Implementation work ends through the owning project's checks and, when the
  work is meaningful visual work, the `design-workflow` receipt.
- Record completed Fleet-owned skill runs through the installed
  `fleet-skill-run` boundary or supported host hook.
