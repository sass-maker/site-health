# Add Google Search Update Control

## Why

The Google Search ledger now exposes useful provider evidence and history, but
unlike Domains and Performance it cannot refresh that evidence from the page.
The operator should not need to leave Fleet Console to run the existing
read-only collector.

## What Changes

- Add one `Update` control to the Google Search page header.
- Allowlist one portfolio-scoped `search` metric run that invokes the existing
  Search Console collector once for its canonical project set.
- Rebuild and redraw the bounded Search outcome projection after success.
- Reuse the existing disabled, progress, duplicate-run, success, and failure UI
  behavior used by the other portfolio refresh controls.

## Out of Scope

- Project-by-project Search refresh controls.
- Recurring schedules, new credentials, provider mutations, deployments, or a
  second Search Console collector.

## Impact

The change touches Fleet Console, the existing local metric-run controller,
and focused tests. It has no production deployment or configuration impact.
