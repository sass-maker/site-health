## MODIFIED Requirements

### Requirement: Canonical audit manifest

The skill SHALL resolve products, canonical domains, repository ownership, live
status, policy exclusions, and the declared authentication model from
Fleet-owned configuration before browser testing begins. Every included product
MUST declare exactly one of `required-user`, `required-service`,
`public-personalized`, or `public-persistent`.

#### Scenario: Explicit Fleet Workspace exclusion

- **WHEN** an operator requests a Fleet audit excluding `fleet-workspace`
- **THEN** the manifest omits that project while retaining other eligible live
  public products

#### Scenario: Missing authentication model

- **WHEN** an otherwise eligible product has no valid authentication model
- **THEN** manifest generation fails instead of silently assuming a guest
  contract

### Requirement: Safe functional interaction

The skill SHALL perform a meaningful read-only interaction on each selected
surface where possible and SHALL NOT submit production data, enter credentials,
complete OAuth, purchase, rate, email, invoke destructive controls, or generate
repeated traffic to discover a production rate-limit threshold.

#### Scenario: Mutation required

- **WHEN** verifying a workflow would require a production mutation or private
  credential
- **THEN** the workflow is marked `not_verified` with the blocking reason

#### Scenario: Rate-limit evidence

- **WHEN** ordinary navigation or the permitted single retry produces `429`,
  `Retry-After`, Cloudflare `1015`, or a challenge page
- **THEN** the audit records the natural evidence and stops without sending
  additional threshold-seeking requests

### Requirement: Reproducible status classification

The skill SHALL classify each product as `pass`, `degraded`, `fail`, or
`not_verified` and SHALL retain the expected result, observed result, declared
authentication model, guest state, reproduction count, and naturally observed
rate-limit evidence.

#### Scenario: Core action fails twice

- **WHEN** a primary public action fails on an initial attempt and one retry
- **THEN** the product is classified `fail` with exact reproduction evidence

#### Scenario: Existing authenticated session

- **WHEN** the browser profile is already signed in and cannot provide a clean
  guest check without altering user state
- **THEN** guest access is recorded as unverified rather than inferred

#### Scenario: Public-first product is login-walled

- **WHEN** a `public-personalized` or `public-persistent` product blocks its
  declared public core journey behind authentication
- **THEN** the product is classified `fail`

#### Scenario: Required authentication boundary

- **WHEN** a `required-user` or `required-service` product exposes its expected
  public explanation or health surface and rejects protected access safely
- **THEN** the boundary passes while the authenticated core remains
  `not_verified`

## ADDED Requirements

### Requirement: Evidence-first abuse-protection guidance

The skill MUST distinguish targeted protection from customer-blocking controls
and MUST NOT recommend a new or stricter production limiter without identifying
an exact costly endpoint and endpoint-specific evidence.

#### Scenario: Ordinary user hits a limit

- **WHEN** a normal selected journey reaches `429`, Cloudflare `1015`, or an
  unrecoverable challenge
- **THEN** the product is classified `fail` and the handoff identifies whether
  the observed control is broad, endpoint-specific, or unknown

#### Scenario: Costly public mutation has no visible protection

- **WHEN** repository evidence shows an unauthenticated AI, upload, import,
  messaging, or other costly mutation with no bounded protection
- **THEN** the audit records a security/cost finding without exercising the
  endpoint repeatedly or choosing an unsupported threshold

#### Scenario: Static and read-only surfaces

- **WHEN** public HTML, cached assets, or ordinary read-only navigation have no
  application-level rate limiter
- **THEN** the audit does not report absence alone as a defect

#### Scenario: Rate-limit recommendation

- **WHEN** endpoint-specific evidence justifies protection
- **THEN** the handoff prefers user, session, service-key, or project identity,
  specifies graceful `429` and `Retry-After` behavior, and recommends an
  observe-first rollout before enforcement
