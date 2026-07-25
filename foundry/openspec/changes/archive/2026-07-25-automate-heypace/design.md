## Context

HeyPace is an Apple-platform, local-first voice agent whose most sensitive
inputs are speech, transcripts, screen context and local actions. Its public
landing and repository CI are centrally observable; signing, physical-device
validation and local activation may remain external evidence.

## Goals / Non-Goals

**Goals:** durable build/release evidence, privacy-safe activation/crash status,
honest signing/device blockers, landing health and Foundry receipts.

**Non-Goals:** hosted backend, screen/voice collection, automatic signing,
device enrollment, App Store/TestFlight action or autonomous product work.

## Decisions

- Separate web, simulator/build, signing, physical-device, distribution and
  local activation contracts; one cannot substitute for another.
- Prefer Apple/GitHub release evidence and on-device aggregate/opt-in signals.
- Keep voice, transcript, screenshots and action context exclusively local.
- Treat unavailable device/signing proof as blocked, not pass.
- Let Foundry prepare diagnostics/PRs while all distribution remains approved.

## Risks / Trade-offs

- **Device proof is not remotely automatable** → Record a durable blocker and
  retain simulator/build evidence separately.
- **Privacy-safe telemetry is sparse** → Accept sparse evidence rather than
  centralize sensitive context.
- **Signing expires** → Track readiness/expiry without reading or exporting key
  material.
