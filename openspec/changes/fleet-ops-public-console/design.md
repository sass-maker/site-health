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
- Deploy as an Astro app through Sites.

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
- Sites deployment requires packaging a worker entry even though the Astro app
  itself is static.

