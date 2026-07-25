## Why

HeyPace is a personally directed, local-first macOS voice agent. Its automation
must prove that the app builds, releases, activates, and fails safely while
protecting screen, voice, transcript, and on-device context from fleet
telemetry.

## What Changes

- Inventory landing, macOS/iOS-adjacent targets, signing/release, update,
  speech, screen-context, local storage, Companion Robot integration, and any
  scheduled or distribution paths.
- Define privacy-safe acquisition, download, first successful local action,
  crash/error, update, and return evidence.
- Verify CI, build, signing readiness, release artifacts, landing deployment,
  source revision, and blocked physical-device evidence without fabricating a
  pass.
- Add only critical missing automation and route sanitized status to Foundry.
- Preserve Sarthak's control over product direction, signing, device testing,
  distribution, and production release.

## Capabilities

### New Capabilities

- `heypace-automation-readiness`: Privacy-safe build, release, activation,
  failure, distribution, and Foundry evidence contracts for HeyPace.

### Modified Capabilities

None.

## Impact

- Primary repository: `HeyPace/pace`; Companion Robot remains a frozen input,
  not a separately automated product.
- No backend introduction, private-context collection, automatic signing,
  App Store/TestFlight action, device enrollment, or production deployment.
