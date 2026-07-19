# Design

## Source of truth

`fleet-ops/config/projects.json` remains the canonical product/deployment
manifest. The audit treats `saas-maker/cloudflare.targets.json` as a legacy
partial map and reports drift instead of silently using it as truth.

## Audit layers

1. **Manifest layer** — validate unique project IDs, unique canonical domains,
   valid deploy kinds, mapped repositories, and intentional out-of-fleet or
   non-product entries.
2. **Repository layer** — inspect only tracked source/config/workflow files,
   never secrets or generated dependency trees. Detect Wrangler bindings,
   cron/queue/workflow/DO handlers, deploy commands, preview paths, smoke
   checks, timeouts, concurrency, permissions, lockfile/build contracts, and
   observability settings.
3. **Cloudflare layer** — use authenticated Wrangler/API capabilities without
   exposing tokens to reconcile Pages projects, domains, queues, and workflows.
   Worker deployment evidence is recorded when a per-Worker deployment query is
   available; account-wide Worker inventory is reported as a follow-up when the
   authenticated CLI capability does not expose it.
4. **Live layer** — probe canonical domains and declared health surfaces with
   bounded timeouts, retries for transient transport errors, and expected
   status ranges that distinguish an intentional API-root 404 from a broken
   product homepage.
5. **Evidence layer** — emit JSON for automation and Markdown for operators;
   every finding includes `severity`, `surface`, `evidence`, `owner`, and
   `next_action`.

## Safety model

- Read-only by default; no delete, deploy, DNS, migration, or secret commands.
- CI uses least-privilege permissions and redacts credential-shaped output.
- Known exceptions are explicit and scoped, not hidden by broad allowlists.
- A finding is actionable only when it has reproducible evidence and a
  concrete next action.
- Product runtime changes are handled separately and must pass the existing
  repo-local tests plus the resilience contract tests.

## Rollback evidence

For Worker-backed projects, the report records deployment/version evidence when
the authenticated per-Worker query is available and checks that the repo has a
documented rollback command or runbook. It does not invoke rollback. Pages
surfaces record the deployed commit and the last successful smoke target when
the deployment system exposes it.

## Initial exception policy

- Direct-upload Pages projects are valid when their GitHub Actions workflow is
  the deployment source of truth.
- Personal/non-product surfaces may be marked intentional exceptions.
- Expected API-root 404s are accepted only when declared in the manifest or
  smoke contract.
- Out-of-fleet products remain visible in reports but do not block the in-fleet
  gate unless explicitly promoted into scope.
