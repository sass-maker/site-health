## Context

The `email-manager` Worker currently serves `mail.sassmaker.com`. Its tracked
Worker route, auth base URL, Google OAuth callback documentation, landing
metadata, agent-indexing documents, monitoring evidence, and Fleet catalog all
use that origin. Cloudflare Workers Custom Domains can attach another hostname
to the existing Worker without deploying a new script, and Cloudflare creates
the DNS record and certificate.

## Goals / Non-Goals

**Goals:**

- Make `https://mail.significanthobbies.com` the canonical Email Manager origin.
- Preserve service while the new certificate and route become available.
- Keep application, operational, public, and Fleet metadata on one origin.
- State the manual Google OAuth redirect dependency honestly.

**Non-Goals:**

- Changing Email Manager behavior, data storage, auth scopes, or Worker code.
- Moving D1 data or secrets.
- Deploying a new Worker version merely to attach the hostname.
- Silently editing Google Cloud OAuth settings.

## Decisions

### Attach the new Custom Domain before detaching the old domain

Cloudflare's Workers Domains API will attach
`mail.significanthobbies.com` to the existing `email-manager` service. Both
hostnames may temporarily coexist. This avoids a DNS/certificate gap and makes
rollback a domain detach rather than a Worker rollback.

### Update tracked canonical-origin configuration as one coherent change

`wrangler.toml`, auth fallbacks, landing metadata, agent files, evidence
scripts, documentation, and Fleet registries will use the new origin. Generated
Fleet surfaces are regenerated from `projects.json`.

### Treat OAuth console configuration as an explicit external gate

The new callback is
`https://mail.significanthobbies.com/api/auth/callback/google`. The hostname can
serve the application before that callback is registered, but sign-in is not
reported complete until the authorized redirect URI is updated outside this
workspace.

### Keep component-only Fleet apps out of the project catalog

Mobile Dev Cockpit and Reel Pipeline remain internal Foundry components under
Dashboard and Marketing. Their standalone catalog identities are removed; the
six-bucket connection model continues to describe them by path.

## Risks / Trade-offs

- **OAuth redirect is missing** → Keep this as a named blocker and retain the
  old hostname until the callback is registered and verified.
- **Certificate issuance is delayed** → Poll the new hostname and leave the old
  custom domain attached.
- **A stale URL survives in generated or hand-authored content** → Search the
  workspace, regenerate canonical surfaces, and run focused builds/tests.
- **Removing component identities hides their code** → Preserve the component
  paths in the system-map projection and remove only project-level records.

## Migration Plan

1. Confirm `significanthobbies.com` is an active Cloudflare zone, the hostname
   is unoccupied, and `mail.sassmaker.com` currently targets `email-manager`.
2. Attach `mail.significanthobbies.com` to the existing Worker through the
   Workers Domains API.
3. Verify TLS, landing, `/app`, and `/api/health`.
4. Replace tracked canonical-origin references and regenerate Fleet surfaces.
5. Register the new Google OAuth redirect URI manually.
6. After auth verification, detach `mail.sassmaker.com`; until then it remains
   a compatibility route.

Rollback is to detach the new custom domain and retain the old route and
configuration.

## Open Questions

- Google OAuth console access is external to the repository and must be
  confirmed before final old-domain removal.
