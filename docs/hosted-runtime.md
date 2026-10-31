# Hosted Node runtime

This adapter supports the owner's Mac or a persistent Node 24 host behind
Cloudflare Access. Source support does not mean the Cloudflare connection is live.
Use the final reviewed commit SHA for any deployment, rather than a moving branch.

Build the existing Astro application with the repository's pinned pnpm version,
then run `node apps/backend/scripts/server.mjs serve`. Hosted mode serves the
built UI and `/api/dashboard` API from one server. The listener defaults to
`127.0.0.1:4187`; run cloudflared on the same host and keep the backend port
private.

## Mac-backed Cloudflare access

Keep the Mac as the collector and authoritative store. Set `SITE_HEALTH_TUNNEL=1`
instead of `SITE_HEALTH_HOSTED=1`, with the four Access configuration values below.
One backend process then serves the existing local API on `127.0.0.1:4187` and
the built, authenticated dashboard on `127.0.0.1:4188`. Both use the same stores,
job controller and collectors. The local dashboard at port 4321 keeps working.
Do not start a second backend against the same databases.

Map the owner-only Cloudflare Tunnel hostname to `http://127.0.0.1:4188`,
preserving its public Host header. Use a final `http_status:404` ingress rule.
Protect the entire hostname with Access before publishing its DNS record.
Never expose the development server or either backend port directly to the network.
The origin verifies the signed Access assertion for HTML, assets and API requests.

The Mac must be awake and online to view live data. This mode does not move or
copy the databases, provider credentials or measurement jobs to Cloudflare.
Browser-only drafts remain specific to each browser origin; server-backed scores,
evidence and measurements are shared. There is no separate synchronization delay.

`SITE_HEALTH_TUNNEL_PORT` optionally changes 4188. The CLI port argument changes
the local API port in tunnel mode; it must differ from the tunnel port. `PORT`
continues to apply only to the hosted-only mode. Invalid configuration is rejected
before opening the private databases. Reuse the current private data locations
and reviewed production build; do not use the example `/data` paths below on the Mac.

## Hosted-only configuration

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
Keep the host clock synchronized with NTP. JWT time checks allow 60 seconds of
clock skew. Invalid assertions return 401; unavailable Access signing keys return
generic 503 with operator code `ACCESS_KEYS_UNAVAILABLE`, without token details.

Set durable database locations explicitly on the persistent volume:

```text
DASHBOARD_DB=/data/site-health/dashboard.sqlite
SITE_HEALTH_BRAND_EVIDENCE_DB=/data/site-health/brand-evidence.sqlite
SITE_HEALTH_APP_STORE_DB=/data/site-health/app-store-seo.sqlite
PORT=4187
```

`PORT` is optional and used only in hosted mode. Blank values default to 4187;
configured ports must be integers from 1 through 65535. A CLI port argument takes
precedence. Keep database files, private catalog/evidence files, backups and
provider credentials outside `apps/web/dist`. Preserve the runtime's required
private evidence tree as well as these three databases. Provision provider
credentials separately; this document contains none. Static serving excludes
generated `dist/server` code, dot files and symlinks.

Build each reviewed SHA in a separate versioned release directory. Treat its
build output as immutable while served. Restart the Node process when activating
another release or rebuilding assets, so its startup whitelist matches that build.
Do not rebuild or replace files in the directory an active process serves.

Before activation, verify the reviewed SHA and Node version, take consistent
SQLite backups, confirm persistent-volume ownership, and retain the previous
release and databases for rollback. Confirm unauthenticated HTML/API/asset
denial, valid owner access, rejected cross-origin writes, and a saved update
after a host restart. Remote host, Access policy, durable storage, credential
provisioning and live acceptance remain deployment work.
