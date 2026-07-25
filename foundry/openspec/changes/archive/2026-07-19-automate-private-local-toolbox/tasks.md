## 1. Baseline

- [x] 1.1 Read Email Manager and Motion AGENTS/status/privacy/operations docs.
- [x] 1.2 Inventory Email auth, local/private storage, search/index, sync jobs,
  live/deploy and error paths without accessing message content or credentials.
- [x] 1.3 Inventory Motion targets, local runtime, build/simulator/signing/device
  and intentional deployment state.

## 2. Email Manager closure

- [x] 2.1 Define/test auth-safe health using metadata only.
- [x] 2.2 Add/fix bounded sync lifecycle, cursor/watermark, concurrency,
  idempotency, retry, freshness and durable failure evidence.
- [x] 2.3 Add/fix sanitized errors and Foundry receipts with tests excluding
  message/private payload fields.
- [x] 2.4 Verify build/live/auth-blocker/sync fixtures and data reconstruction or
  backup treatment.

## 3. Motion closure

- [x] 3.1 Verify repo-native Apple build/test and distinguish build, simulator,
  signing, device and deploy states.
- [x] 3.2 Add/fix privacy-safe crash/build receipts only where meaningful; do not
  introduce hosted telemetry or a backend.
- [x] 3.3 Record signing/device blockers and intentional undeployed state in
  Foundry evidence.

## 4. Handoff

- [x] 4.1 Open separate scoped PRs for each touched repository with checks and
  privacy evidence.
- [x] 4.2 Leave OAuth/signing/device, migrations, backend creation and production
  deployment pending approval.
