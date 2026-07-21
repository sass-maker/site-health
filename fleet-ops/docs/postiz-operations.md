# Postiz Machine Deployment And Operations

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

## Host prerequisites

- A Linux host with Docker Engine and the Compose v2 plugin.
- At least 2 vCPU and 4 GB RAM for the pinned Postiz, PostgreSQL, Redis,
  Temporal, and Elasticsearch topology; allocate more before adding volume.
- A dedicated external data root and backup root with enough space for all six
  bind mounts. Never place either root inside the Git checkout.
- A private Cloudflare Tunnel hostname reserved for Postiz. Do not reuse
  `fleet.sassmaker.com`.
- Cloudflare Access default-deny protection with an allow rule for the owner.

The repository deliberately does not prescribe the final private hostname. Set
it once on the host in the machine-local Postiz env file and in the Tunnel and
Access configuration.

## First installation

1. Clone Fleet `main` and verify it is clean and synchronized.
2. Review `fleet-ops/host/postiz/images.json`; update image pins only through a
   separately reviewed change.
3. Create external data, backup, runtime, and env-file directories owned by the
   service account. Restrict env files to that account.
4. Populate the four env files described in
   `fleet-ops/host/postiz/README.md`. Generate unique database and JWT secrets;
   never copy values into the checkout, shell history, tickets, or chat.
5. Set `MAIN_URL` and `FRONTEND_URL` to the private HTTPS hostname and
   `NEXT_PUBLIC_BACKEND_URL` to its API origin. Keep registration disabled and
   Postiz cron disabled until the canary is accepted.
6. Export the four absolute env-file paths and `POSTIZ_DATA_ROOT`, then run:

   ```sh
   docker compose -f fleet-ops/host/postiz/compose.yaml config --no-interpolate
   ```

7. Run a disposable backup/restore rehearsal in an explicit empty external
   directory:

   ```sh
   node fleet-ops/host/postiz/rehearsal.mjs --root "$POSTIZ_REHEARSAL_ROOT"
   ```

   Create the machine-local readiness JSON referenced by the Foundry role file.
   It contains paths and private probe URLs, never credentials:

   ```json
   {
     "schemaVersion": 1,
     "dataRoot": "/srv/fleet/postiz/data",
     "backupRoot": "/srv/fleet/postiz/rehearsal/backup",
     "restoreReceiptFile": "/srv/fleet/postiz/rehearsal/restore-rehearsal-receipt.json",
     "healthUrl": "http://127.0.0.1:4007/",
     "apiCompatibilityUrl": "http://127.0.0.1:4007/api/public/v1/is-connected",
     "privateReachabilityUrl": "http://127.0.0.1:4007/"
   }
   ```

   Then run the Foundry doctor using the external role file from
   `fleet-ops/host/README.md`:

   ```sh
   node fleet-ops/host/hostctl.mjs doctor --role-file "$ROLE_FILE"
   ```

   Do not proceed unless every Postiz check passes.
8. Start only the explicit manual profile:

   ```sh
   docker compose -f fleet-ops/host/postiz/compose.yaml \
     --profile postiz-manual up -d
   ```

9. Confirm all containers are healthy, Postiz responds on `127.0.0.1:4007`,
   and no database, Redis, Elasticsearch, or Temporal port is publicly bound.
10. Attach the loopback service to the dedicated Cloudflare Tunnel hostname,
    add the Access application, and prove unauthorized requests are denied.

## Fleet integration

1. Sign in through Access and create the single owner account.
2. Connect each social channel in Postiz. The UI calls these channels; the API
   calls them integrations.
3. Create a Postiz API key under Settings > Developers > Public API and store it
   only in the machine secret store.
4. Verify the self-hosted API with `GET /public/v1/is-connected`, then list
   integrations with `GET /public/v1/integrations`.
5. Build the ignored machine-local `POSTIZ_INTEGRATIONS_CONFIG` by mapping every
   Fleet brand/channel pair to exactly one returned integration ID. Reject
   disabled, duplicate, or ambiguous mappings.
6. Set `FLEET_MARKETING_RUNTIME_DIR` to an external runtime path and run one
   package through `postiz-queued-distribution.mjs` manually.
7. In Postiz, verify the result is a draft: it must have no schedule and must not
   be published. Run `postiz-evidence-sync.mjs` and inspect the sanitized receipt
   for identifiers or post content before accepting the canary.

Postiz's self-hosted API base is the configured backend URL followed by
`/public/v1`. Fleet uses an API key, not Postiz OAuth, because this is one
owner-controlled installation rather than a multi-tenant integration.

## Activation and steady state

- Keep Postiz's own social scheduler authoritative. Fleet may submit drafts and
  read sanitized analytics; it must not publish directly to providers.
- Enable Fleet recurring draft submission only after the manual canary passes.
- Keep generation, rendering, and draft submission as separate jobs so one
  failure cannot retry a possibly successful Postiz create operation.
- Quarantined ambiguous submissions require bounded list/reconciliation before
  any new create request.
- Back up every bind-mounted state directory together. Test restore into a
  disposable candidate stack before relying on a backup.
- Review disabled integrations, failed posts, storage growth, backup age, and
  API compatibility weekly. Apply version upgrades only after backup and
  rollback rehearsal.

## Failure and rollback

1. Disable Fleet draft-submission schedules first.
2. Preserve the external runtime directory and Postiz draft records for
   reconciliation.
3. Stop the manual Compose profile; do not delete bind-mounted state.
4. If an upgrade caused the incident, restore the previous pinned images. If
   state is damaged, restore the last verified backup into a candidate data
   root and validate it before switching roots.
5. Keep provider publishing disabled until draft creation, scheduling, and
   analytics each pass independently.

This runbook intentionally stops before account-specific secrets, social OAuth
consent, and schedule activation. Those steps are performed on the designated
machine with owner review.
