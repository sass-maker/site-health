## Why

The Marketing maker exposes many video presets in one dropdown, but the operator cannot see what those choices actually look like before rendering. A first-class gallery is needed now because backend names and weak fixtures are being mistaken for the visual ceiling.

## What Changes

- Add `/marketing/explore-gallery` as a child route inside the existing Fleet Console Marketing product.
- Show real playable samples grouped by visible treatment rather than by renderer name.
- Disclose each sample's actual engine, source posture, spend posture, and quality tier.
- Let reproducible samples open `/marketing` with their stable variant preselected.
- Keep imported, experimental, baseline, missing, and external samples truthful and visually distinct.
- Preserve the current Fleet Console shell, Marketing route, maker, navigation labels, and buildless Astro stack.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `marketing-control-plane`: Add an operator-facing visual exploration surface that reads Reel Pipeline gallery evidence without taking ownership of rendering.

## Impact

- Adds one Astro route and one gallery component under `apps/dashboard/fleet-console`.
- Adds a compact link from the existing Marketing maker and query-driven variant restoration.
- Reads the local Reel Pipeline gallery API at port 4317; no new production dependency, credential, deploy, migration, or publishing behavior.
- Requires responsive browser evidence and a preserve-mode Fleet design receipt.
