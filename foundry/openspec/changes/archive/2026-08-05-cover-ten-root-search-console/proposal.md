## Why

The Search Console collector and Google Search dashboard currently derive their
scope only from Fleet's 27-project public metric portfolio. The independently
validated ten-root search mission includes two catalog-backed roots outside
that portfolio: `aliveville.com` (`ai-game`) and `sarthakagrawal.dev`
(`sarthakagrawal-personal`). As a result, a successful collection can still
leave the canonical search mission incomplete.

## What Changes

- Define the Search Console measurement set as the stable union of the existing
  public metric portfolio and the validated ten-root query contract.
- Preserve `projects.json` as the sole project identity catalog and keep the
  27-project operational portfolio unchanged.
- Include supplemental root targets in the existing Google Search dashboard,
  even when their global lifecycle excludes them from unrelated public metrics.
- Keep existing project IDs and stored observations unchanged.

## Scope

In scope: target derivation, collector validation, Google Search projection,
focused tests, operator documentation, and durable project status.

Out of scope: sitemap submission, indexing requests, Search Console property
creation, provider credential changes, lifecycle reclassification, other
metrics pages, and rewriting historical evidence.

## Issue

Closes https://github.com/sass-maker/fleet-workspace/issues/196
