# Hosted Node runtime

This adapter is prepared for a persistent Node 24 host behind Cloudflare Access.
It has not been deployed. No remote VM is currently configured by this work.
Use the final reviewed commit SHA for any deployment, rather than a moving branch.

Build the existing Astro application with the repository's pinned pnpm version,
then run `node apps/backend/scripts/server.mjs serve`. Hosted mode serves the
built UI and `/api/dashboard` API from one server. The listener defaults to
`127.0.0.1:4187`; run cloudflared on the same host and keep the backend port
private. No Mac process or Mac tunnel is required on that host.

Required nonsecret runtime configuration, with example placeholders:

```text
SITE_HEALTH_HOSTED=1
SITE_HEALTH_PUBLIC_ORIGIN=https://health.example.com
ACCESS_TEAM_DOMAIN=https://your-team.cloudflareaccess.com
ACCESS_AUD=your-access-application-audience
ACCESS_OWNER_EMAIL=owner@example.com
```

Both URLs must be exact HTTPS origins with no trailing slash or path. Configure
one Access application covering the entire hostname, including every asset and
API path, with an owner-only policy. The origin additionally verifies Access's
RS256 signature, issuer, audience, expiration, subject, issue time and owner
email. Forwarded email headers and local-loopback requests grant no hosted
authorization. Mutations require the exact public Origin and JSON content type.

Set durable database locations explicitly on the persistent volume:

```text
DASHBOARD_DB=/data/site-health/dashboard.sqlite
SITE_HEALTH_BRAND_EVIDENCE_DB=/data/site-health/brand-evidence.sqlite
SITE_HEALTH_APP_STORE_DB=/data/site-health/app-store-seo.sqlite
PORT=4187
```

`PORT` is optional and used only in hosted mode. A CLI port argument takes
precedence. Keep database files, private catalog/evidence files, backups and
provider credentials outside `apps/web/dist`. Preserve the runtime's required
private evidence tree as well as these three databases. Provision provider
credentials separately; this document contains none. Static serving excludes
generated `dist/server` code, dot files and symlinks.

Before activation, verify the reviewed SHA and Node version, take consistent
SQLite backups, confirm persistent-volume ownership, and retain the previous
release and databases for rollback. Confirm unauthenticated HTML/API/asset
denial, valid owner access, rejected cross-origin writes, and a saved update
after a host restart. Remote host, Access policy, durable storage, credential
provisioning and live acceptance remain deployment work.
