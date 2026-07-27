## 1. Contracts and compatibility

- [x] 1.1 Add product-scoped key contracts and bounded environment labels while retaining environment-scoped key decoding.
- [x] 1.2 Add the SDK batch environment field and dual-scope contract fixtures for TypeScript and Go.
- [x] 1.3 Extend OTLP protobuf and JSON projection to read only `deployment.environment.name` and group eligible events by environment.

## 2. Storage and routing

- [x] 2.1 Add repository methods for product-key creation and transactional find-or-create environment resolution.
- [x] 2.2 Implement dual-scope SDK and OTLP ingest routing with product isolation, environment bounds, and legacy conflict rejection.
- [x] 2.3 Add an additive D1 migration for nullable key environment scope and unique product/environment names.
- [x] 2.4 Cover product isolation, environment isolation, bounds, revocation, dedupe, failures, installation state, and legacy-key behavior in local and D1 tests.

## 3. Clients and dashboard

- [x] 3.1 Send explicit environment in Node and Go SDK batches and update package documentation/tests without collecting new request fields.
- [x] 3.2 Change setup to issue one product key while retaining an initial environment for installation guidance.
- [x] 3.3 Add the accessible product environment selector and verify that endpoint, installation, and failure queries switch together.
- [x] 3.4 Run focused UI tests, TypeScript checks, Go tests, formatting, and privacy-contract checks.

## 4. Polaris integration

- [x] 4.1 Configure the Polaris App Health SDK installer with the runtime environment and product key.
- [x] 4.2 Preserve staging auto-enable and production disable behavior without adding a Collector, sidecar, port, or infrastructure setting; the App Health SDK remains the sole integration dependency.
- [x] 4.3 Run Polaris with its normal local startup and dependencies, call an existing route such as `/health`, and verify `polaris / local` without adding or registering any test route.
- [x] 4.4 Run Polaris tests, vet, build, and confirm its PR remains narrowly scoped.

## 5. Approval-gated rollout

- [x] 5.1 Validate the Fleet OpenSpec change and synchronize the affected App Health repository specifications.
- [x] 5.2 Obtain explicit approval before applying the D1 migration or deploying App Health.
- [x] 5.3 Issue the Polaris product key, update the Polaris PR, and verify `polaris / staging` after its normal merge-triggered deployment.
- [x] 5.4 Revoke the superseded environment key only after staging product-key traffic is visible and rollback is no longer required.
