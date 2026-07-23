## Why

SaaS Maker has no standalone product boundary, and the only retained artifact is
a small React feedback widget. A hosted API, database, object storage, project
keys, authentication system, and private inbox are disproportionate when no
Fleet product currently consumes that service.

## What Changes

- Keep only `@saas-maker/feedback` under `fleet-ops/packages/feedback/`.
- **BREAKING** Replace the package's required project key and hosted API with a
  required `onSubmit` callback. The integrating product decides where feedback
  goes.
- Keep Pinpoint as structured page-element context and expose an optional
  screenshot `File` to the callback without uploading it.
- Remove the API Worker, inbox Worker, D1 migrations, R2 integration, auth,
  project keys, service tests, smoke scripts, and deploy configuration from
  Fleet source.
- Remove SaaS Maker and Fleet Feedback as deployed products from active Fleet
  registries and documentation.
- Delete the standalone local checkout after the package source is secured in
  Fleet. Repository deletion and live Cloudflare/npm changes remain named
  external actions.

## Capabilities

### New Capabilities

- `fleet-feedback-package`: Fleet owns one backend-free React package that
  collects feedback and hands a structured payload to its consumer.
- `saas-maker-retirement`: SaaS Maker's repository, sites, hosted feedback
  service, and product identity are retirement targets.

## Impact

- Fleet source: `fleet-ops/services/feedback/` is replaced by
  `fleet-ops/packages/feedback/`.
- Package: `@saas-maker/feedback` moves from project-key/API configuration to an
  `onSubmit` callback.
- Cloudflare: `saas-maker-home`, `saas-maker-packages`, `saasmaker-api`, and
  `saasmaker-dashboard` become deletion candidates; no replacement Worker is
  created.
- Data: D1/R2 data is not migrated because the hosted service is retired.
- npm: the package README remains the only public documentation.

