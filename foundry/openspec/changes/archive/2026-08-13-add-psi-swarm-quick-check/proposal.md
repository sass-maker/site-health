## Why

psi-swarm's browser controller exposes expert controls before it delivers value, so a new user must understand runs, preset groups, and parallelism before starting an audit that can take several minutes. The hosted Larm checker demonstrates the activation advantage of a single obvious action, while psi-swarm can preserve stronger evidence by making its existing two-run desktop smoke test a clearly labeled first step rather than replacing the full swarm.

## What Changes

- Add a first-class **Quick check** action that runs two serial desktop audits and labels the result as directional evidence.
- Keep the full five-run PSI mobile-and-desktop swarm as the trustworthy confirmation path.
- Move custom run controls behind progressive disclosure while preserving every existing option.
- After a quick check, offer a direct **Confirm with full swarm** action using the same URL.
- Add a compact, CWV-based result overview before the detailed percentile tables; do not introduce a proprietary performance score.
- Keep all execution local and reuse the existing local-agent API without new runtime dependencies.

## Capabilities

### New Capabilities

- `quick-check-activation`: A progressive browser workflow that gets users to a directional local result quickly and graduates them to a full distributional swarm.

### Modified Capabilities

None.

## Impact

- Affects the psi-swarm browser controller, primarily `web/src/components/RunDashboard.tsx`.
- Reuses the existing `POST /api/run` contract and current `desktop` and `psi` preset groups; no API or database migration is required.
- Updates focused product documentation and the design-review receipt.
- Adds no production dependency and does not change the CLI's default behavior, local-first boundary, routes, analytics, or deployment configuration.
