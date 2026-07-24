## Context

Most Fleet products are intentionally usable as guests; authentication adds
persistence. The exceptions are Email Manager (`required-user`), support
services such as Free AI, App Health, and Knowledge Base
(`required-service`), and Starboard (`public-personalized`).

The Fleet also has uneven abuse controls. Some costly endpoints have
application-level Durable Object or session limiters, some deliberately defer
limits until evidence exists, and at least one AI proxy is documented as open.
Cloudflare already supplies automatic DDoS mitigation, while custom WAF and
Worker rate limits can create false positives when applied broadly or keyed
only by shared IP addresses.

## Goals / Non-Goals

**Goals:**

- Make guest expectations deterministic from Fleet-owned metadata.
- Surface accidental login walls as failures for public-first products.
- Detect rate-limit harm during ordinary use without producing abusive traffic.
- Distinguish targeted protection of costly mutations from blanket site
  throttling.
- Produce repair guidance that protects cost and availability without degrading
  normal browsing.

**Non-Goals:**

- Creating or changing Cloudflare WAF or rate-limiting rules.
- Load, stress, penetration, or threshold-discovery testing.
- Choosing numeric production thresholds without endpoint traffic evidence.
- Authenticating into products or reading production credentials.

## Decisions

### Authentication model lives in the Fleet registry

Each audited product declares one of:

- `required-user`: external user data cannot be accessed without OAuth or login.
- `required-service`: protected machine/operator capability requires a service
  key; public health, documentation, or marketing may remain available.
- `public-personalized`: a useful public core exists; authentication adds
  imported private/personal data and mutations.
- `public-persistent`: the core journey completes as a guest; authentication
  adds persistence, sync, or identity.

The manifest generator rejects missing or unknown values for included
products. Keeping this in the registry avoids hard-coded exceptions in the
browser procedure.

### The audit does not discover limits by crossing them

The browser performs only normal product interactions and one permitted retry.
It records naturally observed `429`, `Retry-After`, Cloudflare `1015`, challenge
pages, and UI recovery behavior. It never loops requests to estimate a
threshold.

### Abuse protection is classified by scope and user impact

The handoff distinguishes:

- healthy targeted protection on costly mutations;
- expected authentication rejection on protected service routes;
- customer-blocking limits reached through ordinary usage;
- missing protection on an evidenced costly public mutation;
- unknown posture when source or live evidence is insufficient.

Static assets, public HTML, ordinary read-only navigation, and cached public
GETs are not candidates for blanket application limits. Resource-consuming
mutations such as AI generation, uploads, imports, email delivery, and
authentication failures are candidates for endpoint-specific controls.

### Recommendations require evidence and prefer stable identity

The audit recommends a new or stricter limiter only when it identifies the
exact costly endpoint and evidence of exposure. Preferred keys are authenticated
user, service/API key, project, or session plus endpoint. IP is a fallback for
anonymous traffic, not the default identity for authenticated Fleet services.

Rollout guidance is observe/log first, then a generous endpoint-specific
boundary with a recoverable `429` and `Retry-After`. Managed challenges may fit
human submission or login abuse; they are not recommended for APIs or normal
navigation.

## Risks / Trade-offs

- **Registry classification can drift** → manifest tests require valid values,
  and product audits compare the declared model with visible behavior.
- **The audit may miss a high threshold** → it intentionally prioritizes user
  safety; repository/config evidence and production analytics are the correct
  threshold inputs.
- **No blanket limiter leaves application-layer abuse possible** → Cloudflare
  DDoS protection remains the volumetric baseline, while costly mutations are
  reviewed separately.
- **IP fallback can group legitimate users behind NAT** → use generous bursts,
  narrow endpoint scope, and user/session/API-key identities where available.
