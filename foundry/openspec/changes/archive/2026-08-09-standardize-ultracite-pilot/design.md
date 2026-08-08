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

### Keep the Ultracite development dependency in the independently installed pilot

The Drank component has an independent CI install boundary, so its manifest and lockfile pin the exact Ultracite version used by both the pilot config and the Foundry generator. The generator locates that same pilot-local binary explicitly, keeping the shared output deterministic without requiring an uninstalled workspace-root package.

Alternative considered: pin Ultracite at the Fleet Workspace root. Independent component CI installs do not install root development dependencies, so the Drank config could not resolve the published presets in that environment.

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

1. Add and review the exact development dependency in the Drank pilot.
2. Add the shared base, parity/context scripts, fixtures, and focused tests.
3. Switch only `drank` to the shared base and regenerate the managed context artifact.
4. Run the pilot check, parity checks, root component checks, dependency guard, and strict OpenSpec validation.
5. Create bounded follow-up issues for non-pilot repositories, then archive this change after its PR merges.

Rollback is a normal revert of the pilot dev dependency, shared tooling files, and `drank` config/context reference. No runtime data or production state is involved.
