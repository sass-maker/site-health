## Why

Fleet Ops now owns machine-level agent scheduling, OpenClaw lifecycle, and the
Wi-Fi Watch product. The current visibility is spread across local cron files,
scripts, and Wi-Fi runtime data, which makes it hard to inspect from another
device or machine.

This change creates a public-safe internet-visible console that shows the real
machine-run schedule set and Wi-Fi Watch health without exposing secrets, raw
logs, local IPs, SSIDs, gateway details, or credentials.

## What Changes

- Add an Astro app at `fleet-ops/apps/ops-console`.
- Render the full converted Codex schedule set from
  `fleet-ops/automation/codex-cron/jobs.tsv`.
- Render a Wi-Fi Watch product summary from `fleet/wifi-watch/data`.
- Render fleet project state, current work queues, smoke status, and
  project-to-project connections from the SaasMaker/Foundry registry.
- Publish the app from this Mac through the existing Cloudflare Tunnel.
- Refresh the published static snapshot every 5 minutes while the Mac is awake.
- Keep local control commands and raw runtime data out of the public surface.

## Capabilities

### New Capabilities

- `fleet-ops-public-console`: Internet-visible Fleet Ops console for cron,
  Wi-Fi Watch, project state, and fleet connection visibility.

### Modified Capabilities

- None.

## Impact

- Adds a new Astro app under `fleet-ops/apps/ops-console`.
- Adds OpenSpec project/change metadata under `openspec/`.
- Uses existing cron registry and Wi-Fi Watch data as build-time sources.
- Uses SaasMaker/Foundry registry, tasks, smoke, audit, and local git state as
  build-time sources.
- Uses `scripts/agent-bin/ops-console` to publish and serve the static app
  locally for the Cloudflare Tunnel.
