## Why

SaaS Maker has no standalone product boundary, and the only retained artifact is
a small React feedback widget. A hosted API, database, object storage, project
keys, authentication system, and private inbox are disproportionate when no
Fleet product currently consumes that service.

## What Changes

- Keep only `@saas-maker/feedback` under `foundry/packages/feedback/`.
- **BREAKING** Replace the package's required project key and hosted API with a
  required `onSubmit` callback. The integrating product decides where feedback
  goes.
- Keep Pinpoint as structured page-element context and expose an optional
  screenshot `File` to the callback without uploading it.
- Remove the API Worker, inbox Worker, D1 migrations, R2 integration, auth,
  project keys, service tests, smoke scripts, and deploy configuration from
  Fleet source.
- Remove SaaS Maker and Fleet Feedback as independently deployed products from
  active Fleet registries and documentation.
- Delete the standalone local checkout after the package source is secured in
  Fleet. Repository archival and live Cloudflare/npm changes remain named
  external actions.
- Generate the public `sassmaker.com` directory from Fleet's canonical project
  metadata and deploy that static projection to Cloudflare Pages.
- Keep the operational Fleet Console machine-hosted at
  `fleet.sassmaker.com` through the existing Cloudflare Tunnel, and use npm,
  not `packages.sassmaker.com`, for package documentation.

## Capabilities

### New Capabilities

- `fleet-feedback-package`: Fleet owns one backend-free React package that
  collects feedback and hands a structured payload to its consumer.
- `saas-maker-retirement`: SaaS Maker's repository, sites, hosted feedback
  service, and product identity are retirement targets.
- `fleet-public-directory`: Fleet emits a static public directory, changelog,
  and roadmap projection without exposing its operational console.

## Impact

- Fleet source: `services/feedback/` is replaced by
  `foundry/packages/feedback/`.
- Package: `@saas-maker/feedback` moves from project-key/API configuration to an
  `onSubmit` callback.
- Cloudflare: `saas-maker-packages`, `saasmaker-api`, and
  `saasmaker-dashboard` are deleted. `saas-maker-home` is replaced in place by
  Fleet's static public projection; no replacement Worker is created.
- Data: D1/R2 data is not migrated because the hosted service is retired.
- npm: the package README remains the only public documentation.
