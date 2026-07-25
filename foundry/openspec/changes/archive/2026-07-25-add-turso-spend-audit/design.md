## Context

The current skill separates Cloudflare money, usage, and configuration evidence.
Turso needs the same discipline but has different authorities and failure
modes. Current Turso plans reset on a calendar-month boundary, measure row
scans as rows read, and may either block excess usage or charge overages
depending on the plan and overage setting. `turso plan show`, `turso db list`,
`turso db inspect`, and the Platform API expose useful read-only evidence while
keeping authentication material hidden.

Several Fleet projects use `@libsql/client`, but repository configuration does
not prove a live database, current usage, or a charge. Conversely, a live Turso
database may be retired or unowned even when its original repository is absent.

## Goals / Non-Goals

**Goals:**

- Answer whether Turso is charging now, can charge through overages, is likely
  to hit a fail-closed quota, or lacks consequential evidence.
- Attribute row reads, row writes, storage, sync usage, database count, groups,
  and locations to exact databases and Fleet projects where possible.
- Identify high-read queries, full scans, duplicate schedules, stale databases,
  and storage or replication exposure without inspecting application data.
- Keep the existing Cloudflare workflow intact while producing a combined
  decision-first report when both providers are in scope.

**Non-Goals:**

- Enable overages, change plans, create or delete databases, run SQL, modify
  indexes, migrate data, rotate tokens, or change production configuration.
- Store Turso prices, quotas, plan names, or reset dates as durable constants.
- Persist raw SQL query bodies, URLs, tokens, database dumps, or application
  records.
- Recommend moving from Turso to D1 solely because Turso is present or free
  quota usage is non-zero.

## Decisions

### Keep the existing skill name and add a provider lane

`cloudflare-spend-guard` remains the Fleet entry point because it already owns
the spend, necessity, and optimization workflow the user asked to extend. Its
metadata will explicitly include Turso triggers. Renaming the skill would break
existing routing and create needless migration work.

### Retrieve Turso plan truth on every audit

The skill will use current Turso documentation plus authenticated read-only CLI
or Platform API output. It will not store a price or quota table. The audit must
capture the plan, overage mode, current calendar-month reset, and used/limit
values before classifying spend or outage risk.

If authenticated evidence is unavailable, the skill will provide the exact
CLI/dashboard handoff and keep monetary state `unknown`.

### Separate spend risk from fail-closed quota risk

A free plan with overages disabled and 97% rows read is not `paying-now`; it is
an availability risk because Turso may block further queries. A paid plan or
confirmed overage cost is money evidence. Reports will keep spend state and
operational exposure risk separate.

### Extend the tracked scanner without reading connection values

The scanner will detect Turso/libSQL SDK dependencies in tracked
`package.json` files and safe variable names in tracked `.env.example` files.
It will report the variable names and source files, never the values or a local
environment file. This proves configuration exposure only.

### Use database inspection before query inspection

Start with organization totals and `turso db inspect <database>` for database
attribution. Use `--queries` only when one database materially drives row
usage and query-level evidence would change an optimization decision. Do not
include raw SQL or literals in the report; describe sanitized query shape,
row-scan behavior, and verification steps instead.

### Avoid a Turso usage normalizer until an export workflow repeats

The current CLI supplies compact human-readable totals and the Platform API
supplies structured current-cycle usage. A new normalizer would add surface
area without solving a repeated problem. The deterministic scanner and tests
are sufficient for this iteration; a normalizer can be added after real export
reuse demonstrates need.

## Risks / Trade-offs

- **CLI and API output can drift** → Retrieve current documentation/help and
  preserve unknown fields rather than assuming a schema.
- **Database names may not match Fleet project IDs** → Use exact registry,
  dependency, and status evidence; keep unmatched resources unowned.
- **`--queries` may reveal sensitive literals** → Make it conditional and
  never persist or quote raw SQL by default.
- **High row reads may be legitimate product work** → Read the owning product
  status and inspect query shape before recommending architecture changes.
- **Overages can turn quota pressure into spend** → Verify overage mode on every
  audit and never infer it from the plan name alone.

## Migration Plan

Update the existing skill, reference, scanner, fixtures/tests, and UI metadata;
validate the skill and scanner; forward-test against the current read-only
Turso account; then archive this OpenSpec change. Removing the Turso-specific
instructions and scanner detection restores the previous behavior.

## Open Questions

None. Scheduled audits and provider-side changes remain out of scope.
