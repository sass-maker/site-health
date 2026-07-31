# Verification

## Offline source proof

- `factory autopilot --policy high-signal-daily --dry-run --count 1` discovered the current High Signal source-backed brief and planned both configured channels without writes.
- `factory autopilot --policy significant-hobbies-weekly --dry-run --count 1` discovered the current Significant Hobbies editorial package and planned both configured channels without writes.
- `factory autopilot --policy major-project-changelog --dry-run --count 3` selected at most one latest qualifying major entry per configured project, retained canonical `/changelog` evidence, and reported bounded exclusion counts for ambiguous, maintenance-only, superseded, missing-channel, and missing-status cases.
- Focused tests prove unchanged source content keeps the same fingerprint across discovery time, revised content changes it, unchanged execute retries reuse the same Idea, Brief, render, stable-media evidence, and Postiz receipt, and idempotency collisions never repurpose immutable origin.

## Checks

- `npm test` — pass: 393 Node tests, 68 Rust tests, and 3 additional Rust tests.
- `npm run smoke:render-modes` — pass with local mock, HTML, ASCII, Grok-asset, reel-maker, and contract checks; MoneyPrinterTurbo remained an optional skipped runtime.
- `npm run smoke:postiz` — pass: 23 fixture/fake-client tests, no live publication.
- `npm run docs:validate` — pass: 51 files and 75 internal links.
- `npx --yes @fission-ai/openspec@latest validate automate-studio-content-lanes --strict` — pass.
- `git diff --check` — pass.

## Preserve-mode design evidence

- Before: `artifacts/design/marketing-studio-content-lanes/before-1440.png`.
- After: `after-390.png`, `after-768.png`, and `after-1440.png` in the same directory.
- Browser checks found no horizontal overflow, console errors, or sub-44px lane controls at 390, 768, or 1440 pixels.
- Impeccable detector: no lane-layout findings. Critique: 38/40. Audit: 19/20. Unresolved P0/P1: zero.
- `design-workflow.mjs check --project foundry/marketing/reel-pipeline` — pass with delegated owner feedback.

## External readiness still required

- Blender 5.2.0 and the local Kokoro runtime are ready on this machine.
- MoneyPrinterTurbo was not reachable during the render-mode smoke; current initial policies do not select it.
- The Postiz API and integration mapping are not configured in the current process, so no live draft or schedule was created.
- No stable artifact publisher is configured in the current process, so an execute run would retain a passing local render and stop with the named stable-media recovery action before Postiz.
- This verification does not claim deployment, target-host, credential, live Postiz, or production-publication readiness.
