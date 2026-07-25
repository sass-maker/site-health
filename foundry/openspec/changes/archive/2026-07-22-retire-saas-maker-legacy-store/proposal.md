## Why

SaaS Maker no longer has a coherent standalone product boundary after Fleet
absorbed shared operations and public portfolio metadata. Keeping a public
directory, a separate documentation site, and an independent repository for
one feedback package creates deployment and maintenance overhead without enough
user value.

## What Changes

- Move the retained feedback package, API, private inbox, shared contracts,
  tests, and release tooling into a self-contained Fleet component at
  `fleet-ops/services/feedback/`.
- Keep the existing `@saas-maker/feedback` package name and the existing
  `saasmaker-api` and `saasmaker-dashboard` Workers during the migration; do
  not create another Worker or change production data, bindings, domains, or
  credentials in the source-migration phase.
- Make the package README published on npm the only public documentation.
- **BREAKING** Retire the `sassmaker.com` directory and the standalone
  `saas-maker-packages` documentation surface after Fleet deployment parity and
  redirect requirements are verified.
- Remove SaaS Maker as a public Fleet product, spotlight, marketing target, and
  public-projection consumer; keep Feedback classified as private shared Fleet
  infrastructure.
- Remove obsolete source from the SaaS Maker repository and archive the
  repository only after Fleet owns the retained source and passes its native
  checks.
- Treat Cloudflare project deletion, DNS changes, npm publication/deprecation,
  D1/R2 deletion, and repository archival as explicit finalization actions,
  performed only after the non-destructive migration is proven.

## Capabilities

### New Capabilities

- `fleet-feedback-service`: Fleet owns one self-contained feedback component
  containing the npm widget, existing API, private inbox, contracts, tests, and
  guarded deployment commands.
- `saas-maker-retirement`: The standalone SaaS Maker directory, documentation
  deployment, public product identity, and repository are retired without
  breaking active feedback consumers or deleting production data prematurely.

### Modified Capabilities

- None in this store. The existing `spotlight-products` contract in the
  `portfolio-spotlight-unification` store must be revised as a coordinated
  downstream cleanup because it currently requires SaaS Maker as a spotlight
  and directory destination.

## Impact

- Repositories: private `sass-maker/fleet-workspace`, public
  `sass-maker/saas-maker`, and downstream portfolio/profile references to
  `sassmaker.com`.
- Cloudflare: existing `saasmaker-api` and `saasmaker-dashboard` Workers remain;
  `saas-maker-home` and `saas-maker-packages` Pages projects become retirement
  candidates after cutover proof.
- npm: `@saas-maker/feedback` remains the compatible package identity, with its
  README as the public documentation surface.
- Data: existing D1 and R2 resources remain untouched during migration.
- Operations: Fleet registry, spotlight, marketing, public projection, smoke
  checks, and project-status documentation must stop presenting SaaS Maker as a
  standalone product.
