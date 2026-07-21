# Postiz Operations Boundary

Postiz is the sole social draft review, scheduling, publishing, and provider
analytics surface. Fleet owns source packages, rendering, manifests, media
receipts, and sanitized high-level outcomes.

## Approved topology

- Postiz is self-hosted on the designated Fleet machine.
- The pinned, inert deployment contract is in `fleet-ops/host/postiz/`.
- Persistent data, backups, env files, API keys, and provider credentials stay
  outside the checkout.
- Postiz listens on loopback and receives a separate private
  Cloudflare-Access-protected hostname during cutover.
- `fleet.sassmaker.com` remains the Cloudflare Tunnel route for Fleet's
  high-level console.

## Activation gate

1. Clone synchronized `main` on the designated host.
2. Create machine-local persistent and backup paths.
3. Complete a disposable backup/restore rehearsal.
4. Create the machine-local env and readiness files without committing them.
5. Run the Foundry host doctor and Compose validation.
6. Start the pinned manual profile and verify health/API compatibility.
7. Protect the private hostname with Cloudflare Access.
8. Connect exact social accounts in Postiz and create the ignored mapping.
9. Run one draft-only canary; confirm no schedule or publication was created.
10. Enable recurring draft generation only after explicit owner acceptance.

The disabled schedule definitions call:

- `fleet-ops/scripts/postiz-queued-distribution.mjs` for bounded, draft-only
  queue processing;
- `fleet-ops/scripts/postiz-evidence-sync.mjs` for sanitized Postiz analytics
  events.

Both require an absolute `FLEET_MARKETING_RUNTIME_DIR` outside the checkout and
an absolute machine-local `POSTIZ_INTEGRATIONS_CONFIG`. Ambiguous create
results are quarantined and must be reconciled before another request.

Rollback means stopping the Fleet draft submitter and Postiz profile. Source
packages and render receipts remain usable, and existing Postiz drafts remain
reviewable.
