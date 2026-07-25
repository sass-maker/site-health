## Why

Fleet health currently measures source, CI, deploy, SEO, performance, and agent
readiness, but it does not verify that a public user can complete the product's
real journeys. The July 2026 manual audit found broken downloads, blank routes,
misleading guest links, failed agent actions, and stale public data that the
existing green health signals did not catch.

## What Changes

- Add a read-only `public-product-smoke` skill for bounded functional browser
  audits of Fleet websites.
- Resolve canonical products, domains, repository ownership, and Fleet
  exclusions from the existing registry and policy.
- Limit each product to at most six genuinely distinct public surfaces selected
  from its actual navigation and product promise.
- Require a safe functional interaction where possible and classify results as
  pass, degraded, fail, or not verified.
- Emit Markdown and JSON evidence that can be used as a per-project repair
  queue without mutating production during the audit.
- Route public usability and guest-journey requests through the existing
  `site-health` and `fleet-ops` parent skills.

## Capabilities

### New Capabilities

- `public-product-smoke`: Bounded, evidence-backed public product journey
  auditing and machine-readable remediation handoff.

### Modified Capabilities

- `site-health`: Add public usability and functional browser auditing to the
  website-measurement routing surface.

## Impact

- Adds `foundry/ops/skills/public-product-smoke/` with one manifest helper and a
  compact interaction policy.
- Updates the `site-health` and `fleet-ops` skill routing tables.
- Adds generated report paths under `foundry/ops/docs/`.
- Reads `foundry/ops/config/projects.json` and Fleet policy; it adds no production
  dependency and performs no deploy, credential, or production mutation.
