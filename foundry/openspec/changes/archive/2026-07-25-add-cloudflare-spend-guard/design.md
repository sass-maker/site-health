## Context

Fleet already knows which Cloudflare Pages projects, Workers, and domains belong
to each product through `foundry/ops/config/projects.json`. The resilience audit
reconciles that inventory and scans deploy/background-job safety, while
`report-workers-cpu.mjs` can attribute one Workers metric when local credentials
are available. None of those surfaces reconciles fixed subscriptions,
usage-based charges, free allowances, per-product telemetry, current pricing,
and product necessity into a cost decision.

Cloudflare's billing surfaces have different meanings and permissions. The
Billable Usage dashboard is invoice-aligned for usage overages but excludes
fixed subscriptions. Its APIs are restricted and may omit cost fields.
Product analytics often attributes usage more precisely than billing data but
does not prove a charge. Free-plan limits can fail closed, while paid plans can
continue into overages. Pricing and billing start dates can also change through
the Cloudflare changelog.

The skill therefore needs to preserve uncertainty instead of forcing a single
numeric estimate.

## Goals / Non-Goals

**Goals:**

- Answer whether Fleet is paying now, likely to incur usage charges this billing
  cycle, merely exposed to future spend, unlikely to spend, or missing evidence.
- Separate fixed recurring subscriptions from usage-based charges.
- Attribute usage and optimization advice to Fleet projects when provider
  evidence contains a script, zone, bucket, database, or other resource key.
- Judge necessity from the owning project's current status and Fleet attention
  model rather than from low traffic alone.
- Reuse current Cloudflare documentation, authenticated read-only tools, Fleet
  inventory, and existing resilience evidence.
- Keep helper scripts dependency-free, deterministic, credential-free, and
  useful on fixtures or sanitized provider responses.

**Non-Goals:**

- Delete, pause, resize, migrate, deploy, or reconfigure Cloudflare resources.
- Change subscriptions, payment methods, alerts, limits, production config, or
  credentials.
- Promise exact future invoices when provider cost fields or billing-cycle data
  are unavailable.
- Replace the Cloudflare dashboard, Cloudflare's official skill, the Fleet
  project registry, App Health, or the resilience audit.
- Optimize product architecture solely to save negligible amounts.

## Decisions

### Compose provider truth instead of maintaining a price table

The skill will explicitly load the official Cloudflare skill and retrieve the
current pricing, limits, usage-billing documentation, relevant changelog items,
and API schemas for every metered product observed in scope. No price or
allowance number will be stored in the Fleet skill.

This avoids stale estimates and captures announced billing changes. A local
price table was rejected because it would become a second, drift-prone billing
authority.

### Use a three-layer evidence model

The audit will gather:

1. **Money evidence:** invoice-aligned Billable Usage, subscriptions, invoices,
   or a user-provided billing view.
2. **Usage evidence:** product analytics grouped by resource and billing cycle.
3. **Exposure evidence:** tracked Wrangler configuration, bindings, schedules,
   queues, storage, AI, and repository lifecycle state.

Money evidence can confirm spend. Usage evidence can establish trajectory and
attribution. Exposure evidence can identify risk and missing telemetry, but can
never prove either a charge or zero usage.

Alternatives that infer spend from configured resources or public traffic were
rejected because Cloudflare products have different free allowances, fixed
fees, and billing dimensions.

### Keep spend likelihood and necessity as separate axes

Each account/product/project row will receive:

- a spend state: `paying-now`, `likely-this-cycle`, `watch`,
  `unlikely-on-current-evidence`, or `unknown`;
- a separate exposure risk: `low`, `watch`, or `high`;
- a necessity decision: `keep`, `optimize`, `pause-candidate`, or
  `insufficient-evidence`;
- a confidence level and explicit evidence age.

This prevents an inactive but free resource from looking urgent, and prevents
an important paid resource from being labeled waste solely because it costs
money. It also prevents a permission gap from being mislabeled as a monetary
`watch`: spend remains `unknown` while configured risk is reported separately.

### Make account-level and project-level attribution explicit

The canonical Fleet registry will map Pages/Worker names and domains to owners.
Bindings discovered from tracked configuration will add database, bucket,
namespace, queue, workflow, vector, AI, and service relationships. Provider
records will only be allocated to a project when they carry a matching resource
identifier. Shared or unattributed usage will remain account-level.

Proportional allocation based on request counts was rejected because different
products and operations have different prices and free allowances.

### Add two small credential-free helpers

One script will scan tracked Fleet project configuration and emit a normalized
cost-surface inventory. It will reuse the canonical registry and will label all
findings as configuration exposure, not usage.

A second script will normalize Cloudflare FOCUS-style billable-usage JSON from
stdin or a named input file. It will aggregate only compatible units, preserve
missing cost fields, and never project fixed fees or future charges.

Both scripts will use Node.js standard-library APIs and fixture tests. They will
not call Cloudflare, read token files, inspect environment-variable values, or
write reports automatically.

### Fail open for analysis, fail closed for claims

If Billing Read or a restricted API is unavailable, the skill will continue
with usage/configuration evidence and give the user a precise dashboard handoff.
It will not retry credential failures repeatedly and will classify monetary
status as `unknown`, not `$0`.

If current documentation cannot be retrieved, the skill may inventory exposure
but must not quote prices, thresholds, projected charges, or savings.

### Recommend changes, never apply them

Recommendations will name the exact resource and why it appears unnecessary or
expensive, estimate savings only when current billing data supports it, and
include the smallest verification required before action. Any deletion,
subscription change, alert creation, or production edit remains a separate,
explicitly authorized task.

## Risks / Trade-offs

- **Restricted billing APIs leave cost fields unavailable** → Preserve
  `unknown`, use the invoice-aligned dashboard as a handoff, and distinguish
  usage from charges.
- **Cloudflare metrics do not always include project identifiers** → Keep shared
  spend account-level and avoid proportional guesses.
- **Static configuration produces false urgency** → Label it exposure-only and
  require runtime or billing evidence before declaring waste.
- **Pricing can change between audits** → Retrieve pricing and changelog data on
  every run and include retrieval dates in the report.
- **Optimization can harm a live product** → Read `PROJECT_STATUS.md`, respect
  the Fleet attention model, and recommend rather than mutate.
- **Billing data is financially sensitive** → Report aggregates needed for the
  decision, avoid payment/profile data, and do not persist raw responses by
  default.

## Migration Plan

Add the skill, references, helpers, tests, Fleet routing, and skill-discovery
metadata. Link it through the existing `agent-stack.sh install-skills` wildcard
flow and validate discovery from the repo. No production rollout or data
migration is required. Removing the skill folder and routing/docs entries
restores the prior state.

## Open Questions

None for the first version. Automatic scheduled audits, dashboard UI, and
provider-side budget-alert creation remain out of scope until repeated manual
use demonstrates a clear need.
