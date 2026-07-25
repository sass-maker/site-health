## Why

The Fleet's public-product audit currently records observed authentication state
but does not know whether authentication is required, optional for
personalization, or only used for persistence. It also treats rate-limit errors
as failures without distinguishing healthy endpoint-specific abuse protection
from broad controls that block ordinary users.

## What Changes

- Add an explicit authentication model to each audited Fleet product:
  `required-user`, `required-service`, `public-personalized`, or
  `public-persistent`.
- Make guest expectations and verdicts depend on the declared authentication
  model.
- Add safe abuse-protection evidence to the audit without load testing or
  intentionally crossing production thresholds.
- Treat ordinary navigation or normal product use hitting `429` or Cloudflare
  `1015` as a customer-visible failure.
- Require rate-limit recommendations to be endpoint-specific and
  evidence-backed; the audit must not recommend blanket site-wide limits.
- Extend the JSON repair handoff with authentication and rate-limit posture.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-product-smoke`: Add authentication-aware guest contracts and
  conservative abuse-protection evidence.

## Impact

Affected surfaces are the Fleet project registry, the
`public-product-smoke` manifest helper and tests, the skill instructions and
interaction policy, and the canonical OpenSpec. No production WAF rule,
rate-limit threshold, credential, deployment, or product runtime changes are in
scope.
