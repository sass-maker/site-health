## Why

Email Manager now belongs to the Significant Hobbies product organization, but
its canonical application URL still uses the SaaS Maker domain. Moving it to
`mail.significanthobbies.com` aligns product ownership, public metadata, and
authentication callbacks without changing the privacy model or application
runtime.

## What Changes

- Add `mail.significanthobbies.com` as a custom domain for the existing
  `email-manager` Cloudflare Worker before removing the old hostname.
- **BREAKING** Change the canonical production origin and OAuth callback from
  `mail.sassmaker.com` to `mail.significanthobbies.com`.
- Update application, documentation, SEO/agent surfaces, evidence, Fleet
  registries, and generated project surfaces to the new canonical URL.
- Keep the old hostname until the new domain, TLS certificate, app routes, and
  auth health endpoint are verified.

## Capabilities

### New Capabilities

- `email-manager-domain-migration`: Add-first hostname migration and canonical
  URL contract for Email Manager.

### Modified Capabilities

None.

## Impact

- Email Manager Worker routing and `BETTER_AUTH_URL`.
- Google OAuth authorized redirect URI, which requires an external console
  update before sign-in can be considered complete.
- Email Manager landing metadata, agent-indexing files, docs, operational
  evidence, and Fleet project/automation/site registries.
- Cloudflare Workers Custom Domain configuration; no new Worker code version is
  required to attach the hostname.
