## Why

Polaris should emit one standards-based OpenTelemetry trace stream and let
infrastructure route that stream to every approved observability consumer.
Direct application-to-vendor wiring duplicates instrumentation, couples product
code to vendor credentials, and cannot guarantee that GCP and App Health
observe the same source spans.

## What Changes

- Make Polaris export privacy-bounded HTTP server spans to one internal
  OpenTelemetry Collector endpoint.
- Deploy an independently operated Collector that sends the same processed
  trace stream to Google Cloud Trace and App Health, while remaining extensible
  to separately approved consumers later.
- Keep exporter credentials outside Polaris and reference them through the
  existing secret-management path.
- Keep existing Sentry error capture and Prometheus metrics behavior unchanged;
  Sentry is not a consumer of the new traces pipeline.
- Prove the pipeline locally with real Polaris routes, then canary it in staging
  before any separately approved production rollout.
- Replace the direct Polaris-to-App-Health implementation in draft PR #295;
  App Health remains a normal OTLP consumer and requires no new ingest path.

## Capabilities

### New Capabilities

- `shared-otel-trace-fanout`: A single Polaris OTel trace stream is accepted,
  normalized once, and independently exported to GCP and App Health
  with observable delivery behavior and no vendor credentials in Polaris.

### Modified Capabilities

None. App Health's existing product-scoped OTLP intake contract is reused
without changing its requirements.

## Impact

- Polaris server bootstrap, HTTP instrumentation, and OTel dependencies.
- Vault Wealth infrastructure Helm/ArgoCD configuration, Collector workload,
  Workload Identity/IAM for Cloud Trace, and the App Health secret reference.
- Local and staging verification procedures for route normalization,
  environment attribution, fan-out delivery, failure isolation, and privacy.
- No application request headers, cookies, query values, bodies, identities,
  logs, stack traces, or concrete route parameter values are added to App
  Health.
