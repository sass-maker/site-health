---
title: Fleet Resilience Dashboard
owner: Devin 4
status: ready-for-implementation
---

# Fleet Resilience Dashboard

## Objective

Add a read-only resilience view to the existing Fleet Ops console so the
operator can see early warning signals across projects without opening every
repository or Cloudflare page manually.

## Repository and surface

Own only:

- `foundry/apps/ops-console`
- its local data adapter, styles, tests, and route documentation

The target route is:

`https://fleet.sassmaker.com/resilience`

The existing public console must remain sanitized. Private operational detail
must not be exposed publicly; if a private view is needed, define the auth
boundary and leave the production Access/deployment step for consolidation.

## In scope

1. Add a `/resilience` route linked from the existing Fleet Nav.
2. Define a typed, versioned resilience snapshot contract based on the JSON
   emitted by `foundry/ops/scripts/cloudflare-resilience-audit.mjs`.
3. Display, at minimum:
   - overall status and last audit time;
   - Pages/domain probe coverage and failures;
   - high/medium/low findings by category;
   - background-job evidence and missing contract fields;
   - build/deploy failures and smoke status;
   - queue/workflow/deployment inventory evidence;
   - a forward-looking risk register with early signals and operator action.
4. Show stale-data state clearly. A dashboard must never imply that an old
   snapshot is live.
5. Keep the public view free of tokens, headers, IPs, private payloads,
   terminal links, raw provider responses, and destructive controls.
6. Add fixture-driven rendering tests or the repo’s existing equivalent and
   make the route resilient to missing/partial report fields.
7. Document how a future consolidation step can replace the fixture/source
   adapter with a signed artifact or private API without redesigning the UI.

For v1, a checked-in sanitized fixture or local adapter is acceptable. Do not
invent a new database, queue, credential, or Cloudflare storage binding in this
PRD. Live ingestion and private auth are consolidation work after all four
agents report back.

## Out of scope

- Cloudflare Access setup, DNS, deploys, secrets, API tokens, or production
  configuration.
- Destructive actions, rollback buttons, retry buttons, rate-limit controls,
  WAF controls, or direct Cloudflare mutations.
- Rewriting the audit script or changing the fleet manifest.
- Public exposure of raw logs or incident-sensitive data.

## Acceptance criteria

- [ ] `/resilience` renders through the existing ops-console build.
- [ ] Navigation and responsive/accessible states work on desktop and mobile.
- [ ] The UI distinguishes healthy, warning, blocked, stale, and unknown.
- [ ] Every displayed metric has a source timestamp and an empty/error state.
- [ ] High/medium findings are visually prominent; low findings remain
      inspectable without overwhelming the overview.
- [ ] No secret-shaped or private operational data is present in the fixture,
      rendered HTML, or browser-visible payload.
- [ ] Existing ops-console routes remain unchanged and its build passes.
- [ ] The handoff includes the exact future ingestion/auth seam.

## Validation and handoff

From `foundry/apps/ops-console` run the existing build and preview checks.
Inspect the generated route and run any available accessibility/type checks.
Return screenshots or route evidence, fixture schema, test output, known stale
data behavior, and the recommended consolidation path. Do not deploy.
