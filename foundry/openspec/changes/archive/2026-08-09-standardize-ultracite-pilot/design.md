## Context

See `proposal.md` for motivation. Fleet Workspace is one Git repository with independently installable Foundry components, while many product checkouts are separate repositories. The `drank` component already uses Biome 2.5 with the same rule exceptions described by issue #213 and has an existing `pnpm check` boundary. Root and project `AGENTS.md` files also carry product and safety guidance that a third-party initializer must not replace.

Ultracite 7.10.2 is the current public MIT-licensed release observed during planning. It publishes Biome presets through package exports and supports non-interactive `init` options including `--linter`, `--agents`, `--frameworks`, `--skip-install`, and `--quiet`.

## Goals / Non-Goals

**Goals:**

- Prove that a Foundry-owned base can extend upstream presets while retaining Fleet exceptions.
- Make the pilot and parity report reproducible with existing package-manager and registry boundaries.
- Use Ultracite's generator as the lint-context source without surrendering ownership of Fleet instructions.
- Keep dependency and implementation changes confined to Fleet Workspace.

**Non-Goals:**

- Migrating every Biome or ESLint project in this change.
- Changing application runtime behavior, deploy paths, or production dependencies.
- Replacing all hand-maintained agent instructions with generated prose.
- Normalizing the known chess or karte divergences without an owner-specific rollout decision.

## Decisions

### Put the Ultracite development dependency at the Fleet Workspace root

The canonical preset and generator are Foundry tooling, so the root manifest and lockfile will pin the exact Ultracite version. Config resolution can then walk from both the Foundry template and the in-repo pilot to the root `node_modules` package. Adding the package separately to every product would duplicate versions and lockfile churn before the pilot proves value.

Alternative considered: install Ultracite only in `drank`. That makes the Foundry template unable to resolve its own package export reliably from sibling paths and incorrectly assigns shared-tool ownership to the pilot.

### Extend published presets instead of running the initializer in place

`foundry/ops/templates/biome.base.json` will extend the upstream core preset and contain the approved Fleet formatter, import, accessibility, and generated-output layer. The pilot's `biome.json` will extend the shared base plus only the framework presets it needs, then retain any truly project-specific override.

Alternative considered: run `ultracite init` directly in every project. It can rewrite configuration and instruction files broadly, which conflicts with small diffs and makes deliberate divergence harder to inspect.

### Stage agent generation and copy only a managed lint artifact

A Foundry script will create a temporary minimal project description, invoke the pinned local Ultracite CLI with explicit non-interactive flags, and normalize the generated lint guidance into a tracked companion artifact. The pilot `AGENTS.md` will reference that companion while retaining all current package-boundary text. Check mode will compare regenerated content without writing.

Alternative considered: allow Ultracite to overwrite the pilot `AGENTS.md`. That would discard package safety and release constraints unrelated to linting. Reimplementing the upstream rule prose locally was also rejected because it recreates the drift this issue targets.

### Drive parity from the canonical project registry

The parity command will read the existing project registry, resolve active checkout paths, inspect only recognized lint configuration files, and apply a small version-controlled exception map for deliberate divergences. Human output will lead with counts and actionable paths; JSON output will be stably sorted for tests and automation.

Alternative considered: scan every directory under the workspace. That would include parked and out-of-Fleet repositories and would not distinguish missing checkouts from missing lint configuration.

### Stop the implementation at the in-repo pilot boundary

Passing the pilot creates repository-scoped follow-up issues grouped by linter family or deliberate divergence. Independent repository edits require their own branches, checks, and PRs and are not necessary to prove this capability.

## Risks / Trade-offs

- [Upstream preset changes create new diagnostics on upgrade] → Pin an exact version and require the pilot check plus dependency review for later upgrades.
- [Biome package-export resolution differs across nested configs] → Test resolution through the pilot's real `pnpm check` command and keep the original local config recoverable in git.
- [Generated agent prose is unstable across platforms] → Use the pinned CLI, fixed inputs, normalization, and a deterministic fixture test.
- [Parity classification overstates adoption] → Report `aligned`, `deliberate-divergence`, `unmanaged`, and `unavailable` separately; do not turn missing evidence into success.
- [Strict upstream rules create a broad cleanup diff] → Limit fixes to small behavior-preserving changes; otherwise report the incompatibility and keep the pilot open.

## Migration Plan

1. Add and review the exact development dependency at the workspace root.
2. Add the shared base, parity/context scripts, fixtures, and focused tests.
3. Switch only `drank` to the shared base and regenerate the managed context artifact.
4. Run the pilot check, parity checks, root component checks, dependency guard, and strict OpenSpec validation.
5. Create bounded follow-up issues for non-pilot repositories, then archive this change after its PR merges.

Rollback is a normal revert of the root dev dependency, shared tooling files, and `drank` config/context reference. No runtime data or production state is involved.
