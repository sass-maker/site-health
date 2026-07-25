## 1. Baseline

- [ ] 1.1 Read HeyPace AGENTS/status/release/privacy docs and inventory landing,
  app targets, signing, distribution, local data, speech/screen/action and
  Companion Robot integration boundaries.
- [ ] 1.2 Record existing build/test, release, crash/error, activation, landing
  and deployed-revision evidence.
- [ ] 1.3 Classify physical-device, signing and distribution evidence as pass,
  blocked, not-applicable or missing without handling credentials.

## 2. Critical gap closure

- [ ] 2.1 Define/test landing acquisition and download/release-interest evidence.
- [ ] 2.2 Define a privacy-safe first successful local action and return signal
  or document why aggregate telemetry is intentionally not applicable.
- [ ] 2.3 Add/fix crash/failure evidence that includes version/build and failure
  class but excludes voice, transcript, screen and action context.
- [ ] 2.4 Make build, simulator, signing, device and distribution statuses
  independently reportable to Foundry.
- [ ] 2.5 Add/fix release-readiness receipts without signing or publishing.

## 3. Verification and handoff

- [ ] 3.1 Run repo-native lint/tests/build and landing checks from a clean branch.
- [ ] 3.2 Run available simulator validation and retain physical-device work as an
  explicit blocker when unavailable.
- [ ] 3.3 Add privacy tests or static assertions for telemetry payload boundaries.
- [ ] 3.4 Open a scoped PR with evidence matrix and leave signing, device
  enrollment, TestFlight/App Store and production deploy unexecuted.
