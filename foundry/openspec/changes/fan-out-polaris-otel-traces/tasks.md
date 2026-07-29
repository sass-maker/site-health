## 1. Polaris producer

- [x] 1.1 Revise Polaris PR #295 to export standard OTLP/HTTP traces only to a configured Collector endpoint.
- [x] 1.2 Keep Echo instrumentation privacy-bounded and cover normalized, unmatched, error, and fail-open request behavior.
- [x] 1.3 Remove the new Sentry OpenTelemetry integration while preserving existing Sentry error capture unchanged.
- [x] 1.4 Run Polaris unit tests, full Go tests, vet, formatting, and diff checks.

## 2. Collector infrastructure

- [x] 2.1 Add a dedicated, pinned OpenTelemetry Collector workload and internal service with health probes and bounded resources.
- [x] 2.2 Configure one traces pipeline with shared processors and independent Google Cloud Trace and App Health exporters only.
- [x] 2.3 Keep only the managed App Health credential reference; add no Sentry trace credential.
- [x] 2.4 Enable the Cloud Trace API and grant the Collector service account the least-privilege trace-writing role through Workload Identity.
- [x] 2.5 Point staging Polaris at the internal Collector endpoint while leaving production rollout separately gated.
- [x] 2.6 Render and validate all affected Helm and Terraform configurations without using live credentials.

## 3. End-to-end evidence

- [x] 3.1 Reuse the credential-free local Collector harness with two recording OTLP consumers.
- [x] 3.2 Exercise real Polaris routes and prove matching trace/span identity, normalized route, status, service, and environment at both consumers.
- [x] 3.3 Fail one consumer and prove the other continues receiving spans while Polaris requests remain unaffected.
- [x] 3.4 Document the operator-owned App Health staging secret and exact two-consumer canary verification.

## 4. Delivery

- [x] 4.1 Run scoped code-cleanup and dependency review for the touched repositories.
- [x] 4.2 Commit and push the revised Polaris branch and update PR #295 with current architecture and proof.
- [x] 4.3 Update the infrastructure PR with the corrected consumers, secret prerequisite, rollout order, and rollback steps.
- [x] 4.4 Record completed work and remaining production rollout gates in the durable Fleet planning surface.
