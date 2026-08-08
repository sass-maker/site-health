## Why

Fleet projects enforce similar Biome rules through copied configuration, while agent guidance is maintained separately and can drift from the rules that actually run. A bounded in-repo pilot can prove a shared Ultracite-backed preset and deterministic parity reporting before any cross-repository rollout.

## What Changes

- Add a Foundry-owned Biome base that extends Ultracite's published presets and preserves approved Fleet exceptions.
- Pilot the shared base in the existing `drank` component without changing its production behavior or deploy path.
- Add a read-only parity command that inventories in-Fleet lint configurations, reports alignment and deliberate divergence, and excludes out-of-Fleet repositories.
- Add a deterministic agent-context generation boundary for the pilot without replacing the Fleet root instructions or hand-maintained product context.
- Record any broader rollout as follow-up GitHub issues rather than changing all product repositories in this change.

## Capabilities

### New Capabilities

- `fleet-lint-standardization`: Defines the shared lint preset, bounded pilot, agent-context generation, and read-only fleet parity reporting contract.

### Modified Capabilities

None.

## Impact

- Adds the public MIT-licensed `ultracite` package as a development-only dependency of the `drank` pilot; no production dependency is added.
- Changes Foundry lint templates and operational scripts plus `drank`'s Biome configuration, development manifest, and lockfile.
- May add generated pilot agent context only where it can coexist with the existing nearest `AGENTS.md` ownership rules.
- Does not deploy, alter runtime code, touch credentials, or modify other product repositories.
