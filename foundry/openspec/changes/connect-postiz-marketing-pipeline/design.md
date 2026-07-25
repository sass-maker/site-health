## Context

Fleet owns typed product sources, content packages, renderers, media receipts, brand mappings, and a marketing status page. The former queue and approval workflow lived in SaaS Maker, but those endpoints and UI were removed when SaaS Maker was narrowed to its public directory, feedback product, and one published package. Reel Pipeline still contains dormant SaaS Maker clients and therefore cannot provide an honest live marketing loop.

The owner approved self-hosted Postiz on the designated Fleet machine. Postiz will own draft review, calendar, scheduling, connected social accounts, publication state, and social analytics. Fleet will not fork or embed the AGPL application; it will call Postiz's documented Public API through a narrow adapter.

## Goals / Non-Goals

**Goals:**

- Keep one marketing program registry in Fleet and one social review/scheduling surface in Postiz.
- Preserve source, package revision, brand, variant, media, distribution, publication, and analytics attribution.
- Fail closed for missing mappings, credentials, approvals, ambiguous HTTP failures, or stale receipts.
- Run generation and rendering independently of Postiz availability.
- Make the Fleet console show only truthful aggregate readiness and outcomes.

**Non-Goals:**

- Rebuilding Postiz UI, calendar, scheduler, provider OAuth, or analytics.
- Copying Postiz source into Fleet Workspace.
- Auto-approving drafts, bypassing Postiz review, or enabling live publishing from a repository change.
- Storing Postiz credentials, social tokens, or unpublished post bodies in tracked files or the public Fleet dashboard.

## Decisions

### Postiz owns review and distribution

Fleet submits completed media packages as Postiz drafts. The owner reviews and promotes them in Postiz; Fleet does not maintain a parallel acceptance state. This replaces the deleted SaaS Maker queue and avoids another custom task product.

### Fleet owns immutable generation evidence

Content packages and media receipts remain versioned local artifacts keyed by package, revision, and variant. Postiz IDs and normalized outcome receipts are appended to Fleet's local publication ledger. Postiz remains authoritative for current schedule/publication state.

### A small fetch adapter targets the Public API

The adapter accepts an injected base URL, API key, `fetch`, and account map. It discovers integrations, uploads media from a stable public R2 URL, creates drafts or schedules, reads post state, and reads post analytics. It adds no runtime dependency and works against hosted or self-hosted Postiz.

### Create requests are not blindly retried

An HTTP failure before a response can be ambiguous. The adapter records an indeterminate result and requires reconciliation through list/read APIs before a create is retried. Deterministic validation and authentication failures are not retried.

### The operations machine hosts Postiz and Fleet

Postiz runs as its own supported container stack on the designated machine. `fleet.sassmaker.com` continues through Cloudflare Tunnel to Fleet's read-only console. Postiz receives a separate private Access-protected hostname chosen during provisioning; it is not exposed as a Fleet route.

## Risks / Trade-offs

- **Postiz is operationally heavy** -> pin its release, use the official compose topology, back up its databases and uploads, and keep Fleet generation usable while it is down.
- **Public API payloads vary by provider** -> use explicit Instagram and YouTube translators plus contract fixtures from official API examples.
- **Ambiguous create failure can duplicate a post** -> persist a deterministic Fleet request id and reconcile before retrying.
- **Media URLs can expire or be inaccessible** -> publish stable HTTPS R2 assets before handing them to Postiz.
- **Public dashboard can leak unpublished work** -> expose counts and normalized receipts only; never copy captions, tokens, integration ids, or private media URLs.

## Migration Plan

1. Remove active SaaS Maker task/marketing reads, wrappers, and service autostart.
2. Land and verify the Postiz adapter, account-map contract, fixtures, and local dry run without credentials.
3. Remove remaining obsolete SaaS Maker queue modules and update Reel Pipeline docs/status.
4. On the designated machine, install a pinned official Postiz release, configure storage/backups, and protect its private hostname with Cloudflare Access.
5. Connect exact brand accounts in Postiz and write only non-secret integration mappings to the machine-local config.
6. Add the API key through the machine secret store, run integration discovery and draft-only canaries, then verify the draft in Postiz.
7. Enable scheduling only after explicit owner acceptance of the canary. Roll back by stopping the Fleet adapter; existing Postiz drafts remain reviewable.

## Open Questions

None. The owner approved self-hosted Postiz, a Postiz-only review/scheduling surface, and the designated Fleet machine as the host.
