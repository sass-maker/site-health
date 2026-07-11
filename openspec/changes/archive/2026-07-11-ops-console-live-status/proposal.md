## Why

The public Fleet console currently rebuilds every 5 minutes and only shows a
compact project summary. For an operational homepage, the snapshot needs to feel
alive from phone and desktop, and it should answer "what changed, how fresh is
this, and what is going on in each project?" without opening child repos.

## What Changes

- Refresh the static console snapshot every minute while this Mac is awake.
- Show a visible "last updated" timestamp and next refresh cadence on every
  top-level console page.
- Expand project cards and detail pages with public-safe operational context:
  local checkout path, repository status, homepage/repo links, task mix,
  schedule/source freshness, and fleet connections.
- Keep the page read-only and public-safe: no raw logs, secrets, local absolute
  paths, SSIDs, IPs, gateway data, or credentials.

## Impact

- Updates `fleet-ops/apps/ops-console` Astro pages and data model.
- Updates `fleet-ops/scripts/agent-bin/ops-console` launchd refresh interval.
- Keeps the Cloudflare Tunnel architecture unchanged.
