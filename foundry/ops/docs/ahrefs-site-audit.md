# Ahrefs Site Audit health

Fleet keeps Ahrefs Site Audit Health Score separate from Ahrefs Domain Rating,
Fleet on-page checks, and PageSpeed. The unit-free project-health endpoint
returns the latest crawl date/status, total crawled internal URLs, and counts of
URLs with errors, warnings, and notices.

## Run

Provide `AHREFS_API_KEY` through the existing runtime environment and run:

```bash
pnpm report:ahrefs-site-audit
pnpm report:ahrefs-site-audit -- --max-age-days 14
```

The key is sent only as the bearer header. It is never printed or written. The
command prints structured JSON and writes the summarized, secret-free report to
[`ahrefs-site-audit-latest.md`](./ahrefs-site-audit-latest.md).

The current public/free key can fetch Domain Rating but receives HTTP 401 for
Site Audit projects. Live completion therefore requires a standard Ahrefs API
key or workspace entitlement that can read the ten canonical root projects.
The source adapter and its 200/401/403/missing/stale/partial contract tests do
not require that entitlement.

Official provider contract: [Ahrefs Project Health Scores](https://docs.ahrefs.com/en/api/reference/site-audit/get-projects).

## States

- `fresh`: a matching project has a completed crawl within the maximum age.
- `missing-project`: no project targets that canonical root.
- `no-completed-crawl`: the project has no finished crawl date.
- `crawl-not-completed`: the returned crawl status is not `Completed`.
- `stale-crawl`: the latest finished crawl exceeds the maximum age.
- `ambiguous-project`: multiple projects target the same canonical root; the
  newest dated project is shown, but the result remains partial.
- `auth-entitlement-error`: Ahrefs returned 401 or 403. No metric is zero-filled.

Project matching removes protocol, a trailing dot, and an optional `www`
prefix. An audit of an arbitrary subdomain does not satisfy the root-domain
contract.
