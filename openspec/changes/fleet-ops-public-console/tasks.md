## 1. Console App

- [x] 1.1 Add Astro app under `fleet-ops/apps/ops-console`.
- [x] 1.2 Read cron registry and Wi-Fi Watch data at build time.
- [x] 1.3 Render the full machine-run Codex schedule set.
- [x] 1.4 Render Wi-Fi Watch as a first-class Fleet Ops product section.

## 2. Usability And Safety

- [x] 2.1 Polish the UI for desktop and mobile scanability.
- [x] 2.2 Ensure public output omits secrets, raw logs, SSIDs, IPs, and gateway data.
- [x] 2.3 Validate build output and mobile layout.

## 3. Internet Availability

- [x] 3.1 Create the Astro build artifact.
- [x] 3.2 Serve the validated artifact from this Mac.
- [x] 3.3 Route the public hostname through the existing Cloudflare Tunnel.
- [x] 3.4 Wire console start/stop into the Fleet Ops agent stack.

## 4. Project State Expansion

- [x] 4.1 Add a project listing page with state, lane, task, smoke, and dirty counts.
- [x] 4.2 Add per-project detail pages showing current work and operational status.
- [x] 4.3 Add a connection map linking Fleet Ops, SaasMaker, Wi-Fi Watch, and products.
- [x] 4.4 Include cataloged projects even when they are not checked out locally.
- [x] 4.5 Publish and refresh the multi-page static app through the Mac Cloudflare Tunnel.
