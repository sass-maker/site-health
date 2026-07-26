## Context

Fleet currently exposes a machine-installed Impeccable skill and asks agents to
run `init`, `critique`, `polish`, and `audit`. The upstream skill is capable but
large and intentionally general. Fleet neither pins the installed version
reliably nor records whether a project followed its chosen visual direction,
cleared material findings, or satisfied the owner. Current detector output can
also contradict an intentional `DESIGN.md` decision.

The solution must remain repository-owned, dependency-free, useful across
independent child repositories, and lightweight enough that agents actually use
it. Impeccable remains the implementation and review vocabulary; Fleet owns the
quality contract.

## Goals / Non-Goals

**Goals:**

- Make meaningful Fleet UI work follow one short, discoverable workflow.
- Preserve existing identity without ceremony for bounded refinements.
- Require explicit direction selection before new or overhauled visual systems.
- Make completion independently checkable from a small durable receipt.
- Separate objective blockers from advisory taste heuristics.
- Make the installed Impeccable version reproducible.
- Capture owner satisfaction so future work can learn from rejection.

**Non-Goals:**

- Forking or editing Impeccable.
- Redesigning existing Fleet products for conformance.
- Requiring design receipts for copy-only, invisible, or trivial CSS fixes.
- Treating a numeric score as a substitute for owner approval.
- Adding runtime or production dependencies.

## Decisions

### Add one Fleet-owned `design-workflow` skill

The skill will be canonical under `foundry/ops/skills/design-workflow/` and
exposed by the existing agent-stack linker. It will reduce the normal path to:

1. classify `preserve` or `overhaul`;
2. establish direction;
3. implement using Impeccable and project conventions;
4. capture browser evidence;
5. run critique, polish, and technical audit;
6. validate a receipt;
7. record owner feedback.

This wrapper is preferred over modifying upstream Impeccable because Fleet's
quality contract and owner taste are local policy, while the upstream skill can
continue to evolve independently.

### Use two lanes with different approval costs

`preserve` work must follow existing `PRODUCT.md` and `DESIGN.md`, capture a
before state, and avoid changing the visual language. It does not require a
multi-direction exploration.

`overhaul` and net-new work must name two or three references, produce two or
three materially different direction probes, and record explicit owner
approval or owner-delegated judgment before implementation. This concentrates
interaction where divergence is expensive without slowing every small UI fix.

### Store policy centrally and evidence per project

`foundry/ops/config/design-workflow.json` will own the pinned upstream version,
minimum review scores, accepted final owner decisions, required viewport widths,
and detector posture.

Each reviewed project will store a `.fleet/design-review.json` receipt. A
dependency-free library and CLI will create/check receipts, validate referenced
files, and report every failed gate. The receipt stores paths and summaries,
not screenshots or critique bodies.

### Gate objective quality and owner acceptance

A valid receipt requires:

- `PRODUCT.md` and `DESIGN.md`;
- the lane-specific direction evidence;
- browser screenshots at 390, 768, and 1440 pixels;
- critique score at least 32/40;
- technical audit score at least 16/20;
- zero unresolved P0 or P1 findings;
- a successful relevant build/check;
- final owner feedback of `keep` or an explicit `delegated` decision.

Detector findings are recorded but never fail the receipt because aesthetic
heuristics can conflict with intentional design. Accessibility, responsive,
functional, and unresolved severity gates remain blocking.

### Verify the upstream version instead of install-once behavior

The agent-stack installer will read the exact Impeccable version from the Fleet
policy. It will return only when the installed `SKILL.md` reports that version;
otherwise it will reinstall the pinned version. A self-check will detect drift
without running installation.

### Remove generic house-style defaults

Fleet standards will stop preferring component-gallery aesthetics or one
default palette strategy. Existing `DESIGN.md` wins. Net-new direction must be
anchored to named references, anti-references, real product material, and the
owner-selected lane. Accessible primitives remain preferred when they fit the
current stack.

## Risks / Trade-offs

- **Receipts become checkbox theatre** → Require referenced evidence files and
  owner acceptance; keep the receipt intentionally small.
- **Score thresholds reward gaming** → Treat thresholds as floors and retain
  explicit direction/final owner decisions as stronger gates.
- **Meaningful work is misclassified as trivial** → Define visual-language,
  layout, interaction, and multi-state changes as meaningful in the skill and
  tests.
- **Upstream Impeccable changes receipt assumptions** → Pin one version and
  update policy, tests, and the wrapper together.
- **Independent repos do not yet contain design context** → Initialize context
  only when meaningful UI work begins; do not create fleet-wide churn.
- **Owner feedback blocks unattended work** → Allow an explicit delegated
  decision while preserving `close` and `wrong-lane` as hard failures.

## Migration Plan

1. Add and validate the Fleet policy, receipt library/CLI, template, and tests.
2. Add the wrapper skill and expose it through agent-stack installation.
3. Update Fleet and landing standards plus new-project guidance.
4. Re-score the workflow against the five audit dimensions with repository
   evidence.
5. Apply the workflow prospectively when meaningful UI work is touched.

Rollback removes the wrapper, policy, and receipt checker and restores the prior
standards; product runtimes and existing design files are unaffected.

## Open Questions

None. Thresholds can be revised from real owner feedback without changing the
receipt shape.
