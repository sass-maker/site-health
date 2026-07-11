## Context

The console is an operational/admin UI, so Fleet standards prefer dense,
scannable, accessible, and fast presentation over marketing-style copy. The app
must be usable on mobile because the user wants phone-visible fleet operations.

## Goals / Non-Goals

**Goals:**

- Show the real machine-run Codex cron set, not a reduced example list.
- Show Wi-Fi Watch as a Fleet Ops product with current summary telemetry.
- Make the first viewport useful on desktop and mobile.
- Keep the public site safe by redacting local network details and omitting raw
  logs.
- Serve as an Astro app from this Mac through Cloudflare Tunnel.
- Show every Fleet registry project with state, work queue, smoke, workflow,
  local change count, and project relationships.

**Non-Goals:**

- Live remote control of the machine.
- Public access to local OpenClaw, Telegram, Tailscale, or Wi-Fi APIs.
- Publishing secrets, runtime credentials, raw logs, SSIDs, IPs, or gateway
  details.
- Replacing the local Wi-Fi Watch app.

## Decisions

- Use Astro static output with a small generated worker wrapper so Sites can
  deploy it while the UI stays simple and fast.
- Read `jobs.tsv` and prompt files at build time so the deployed app reflects
  the versioned Fleet Ops source of truth.
- Read Wi-Fi Watch event/sample JSON at build time and publish only aggregate
  status values.
- Use compact cards, tables, and disclosure panels instead of a landing page.
- Use responsive CSS with explicit mobile breakpoints and no viewport-scaled
  fonts.

## Risks / Trade-offs

- Build-time Wi-Fi data is a snapshot, not live telemetry. This is intentional
  until a secure authenticated delivery path exists.
- The public console can show operational intent, so prompts are summarized
  rather than published in full.
- The public app is a build-time snapshot. A launchd refresh job rebuilds it
  every 5 minutes while the Mac is awake; live mutation and raw local data stay
  out of scope.
- Project task titles are visible because they are operational status. Raw task
  descriptions, prompts, local paths, IPs, SSIDs, and logs are not published.

## Updated Decisions

- Keep `saas-maker` as the fleet registry/task engine for now. The console is
  the read-only visibility layer, not a replacement for Foundry/Symphony.
- Prefer a Cloudflare Tunnel-hosted local service over Sites because the user
  wants the machine-run version and start/pause portability across machines.
- Serve the whole Astro `dist/` tree locally so `/projects`,
  `/projects/<slug>`, and `/connections` are directly addressable.
