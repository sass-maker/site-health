## Context

See `proposal.md` for motivation. Ahrefs documents one unit-free
`GET /v3/site-audit/projects` response containing the fields required by issue
#223. The installed key can call the public Domain Rating endpoint but currently
receives 401 from this workspace endpoint, so live project discovery cannot be
part of source acceptance.

## Goals / Non-Goals

**Goals:**

- Make provider response parsing, canonical mapping, freshness, and error
  semantics deterministic and fixture-testable.
- Keep the credential runtime-only and keep all report output inside the Fleet
  workspace.
- Leave a single live command that completes automatically once the key has the
  required entitlement.

**Non-Goals:**

- Buying or upgrading Ahrefs, creating Site Audit projects, or starting crawls.
- Calling the paid issues or page-explorer endpoints.
- Replacing Domain Rating, Fleet SEO checks, or PageSpeed data.
- Adding the provider response to a production database or public surface.

## Decisions

### Fetch all accessible project health in one request

The adapter will call the unit-free projects endpoint once and match its
`healthscores` array locally. This avoids ten network calls and avoids storing
workspace-specific project IDs. The alternative, one filtered request per root,
adds latency and still cannot prove that a missing response means no project
rather than a filter mismatch.

### Match exact root targets, allowing only an optional `www` prefix

Targets are normalized through URL parsing, lowercasing, trailing-dot removal,
and optional `www` removal. Arbitrary subdomains do not satisfy a root project,
because an audit of an app or docs subdomain is not an audit of the canonical
root.

### Return typed states instead of placeholder values

The adapter keeps numeric zero distinct from null. Missing keys, 401/403,
malformed payloads, missing projects, missing crawl dates, non-completed status,
and stale dates receive explicit codes. The aggregate is `complete` only when
all ten roots have fresh completed crawls; otherwise it is `partial`, while
request-wide failures remain errors.

### Keep provider logic pure and inject transport/time

Collection and report rendering live in a dependency-free Fleet Ops module.
Tests inject `fetch` and `now`; the CLI alone reads `AHREFS_API_KEY`, writes the
Markdown report, and sets the exit code. This permits complete contract testing
without a credential or network.

### Report Markdown plus JSON stdout

The durable operator report is
`foundry/ops/docs/ahrefs-site-audit-latest.md`; structured JSON is printed for
automation. No raw credential, Authorization header, or provider response dump
is stored.

## Risks / Trade-offs

- [Multiple Ahrefs projects target the same root] → Select the newest dated
  project deterministically and report an ambiguity warning.
- [Provider schema changes] → Validate every required container/field and fail
  with `invalid-response`; fixture tests pin the documented contract.
- [A completed crawl is old] → Preserve metrics but mark `stale-crawl`; default
  maximum age is 14 days and is shown in output.
- [Tracked report changes after a live run] → The report is deliberately
  summarized and secret-free; raw provider payloads remain untracked and are
  never written.

## Migration Plan

1. Merge the dependency-free adapter, command, tests, docs, and inert report.
2. When the owner supplies an entitled key, run the command once and inspect the
   ten-root mapping.
3. Create or correct missing Ahrefs projects in the provider UI if needed, then
   rerun. Rollback is removal of the command/report; no data migration exists.
