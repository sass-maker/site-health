## Context

Email Manager processes private Gmail data through authenticated/local search
and synchronization; Motion is an undeployed Apple-platform body-motion proof
of concept. Their automation contracts must be deliberately sparse and
privacy-first.

## Goals / Non-Goals

**Goals:** reliable builds, truthful deployment state, privacy-safe errors,
bounded Email sync evidence, Motion crash/build evidence and Foundry blockers.

**Non-Goals:** raw email telemetry, hosted Motion backend, product analytics for
vanity, automatic signing, feature development or production deploy.

## Decisions

- Email Manager exposes auth-safe health and aggregate sync lifecycle only:
  trigger, cursor/watermark, counts, bounds, success/failure/retry/freshness.
- Motion remains undeployed unless separately approved; build/simulator/device
  evidence are distinct and device/signing absence is blocked, not failure.
- Neither product sends private content to Foundry.
- Use digest-level maintenance reporting unless data/security risk occurs.

## Risks / Trade-offs

- **Auth probe accesses private data** → Use metadata-only endpoint or local
  dry-run and never print tokens/content.
- **Motion appears broken because undeployed** → Encode undeployed as intentional
  runtime state.
- **Sparse evidence misses UX problems** → Accept manual reactivation testing
  rather than invasive telemetry.
