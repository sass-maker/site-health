# Fleet project and infrastructure inventory

[`projects.json`](projects.json) is the only authored source for Fleet project
membership, owner priority, lifecycle, deployment targets, deployment methods,
and provider resources. The generated operator view is
[`../docs/project-catalog.md`](../docs/project-catalog.md).

[`seo-geo-publishing.json`](seo-geo-publishing.json) is the authored external
publishing strategy for every P1 and P2 project plus the selected finished P4
set. Its generated guide is
[`../docs/seo-geo-external-publishing.md`](../docs/seo-geo-external-publishing.md).

The inventory includes maintained, local-only, parked, past, out-of-fleet, and
non-product identities. A Cloudflare or Turso object is accounted for only when
it is assigned to one project or remains explicit under
`infrastructure.unownedResources`.

## Update contract

Update `projects.json` in the same task whenever any of these change:

- a repository or project identity is created, absorbed, parked, or retired;
- owner priority or portfolio attention changes;
- a domain, local release channel, deployment target, or deployment method
  changes;
- a Worker, Pages project, D1 database, R2 bucket, KV namespace, Vectorize
  index, queue, Workflow, tunnel, container, Turnstile widget, Durable Object,
  Analytics Engine dataset, Workers AI binding, Browser Rendering binding,
  service binding, Access application, zone, email route, or Turso database is
  added, removed, renamed, retained, or changes state.

P1 is reserved for CodeVetter, Pace, PostTrainLLM, and Office OS. P2 is the
eligible active-work pool, not an operational queue: choose work from open
GitHub Issues and name at most five P2 projects in one work cycle. P4 is for
owner-finished or archived work; new active identities start at P2 until
Sarthak decides otherwise. Assign one
explicit `portfolio.kind` (`product`, `platform`, or `experiment`),
`portfolio.status`, `portfolio.deployed`, and `portfolio.readyToBeShared`
value plus `portfolio.sharingReadiness.verifiedAt` and a concise evidence or
blocker `reason`; never derive a share-ready claim from optimism. Do not delete
an unexplained provider object from the ledger; move it to `unownedResources`
with current evidence.

For every project, keep these together:

1. The project row in `projects`.
2. One complete `portfolio` object: kind, P1/P2/P4 priority, active/archive
   status, deployed boolean, ready-to-share boolean, and dated readiness reason.
3. Exactly one row under `infrastructure.projects`, including `updatedAt`,
   deployments, and resources.
4. The relevant `cloudflareCoverage` count and evidence when account inventory
   changes.

## Refresh procedure

Use authenticated provider CLIs only through read-only list commands. Never
read token files, print credentials, or log in on behalf of the owner.

```bash
npx --yes wrangler@latest pages project list --json
npx --yes wrangler@latest d1 list --json
npx --yes wrangler@latest r2 bucket list
npx --yes wrangler@latest kv namespace list
npx --yes wrangler@latest vectorize list --json
npx --yes wrangler@latest queues list
npx --yes wrangler@latest workflows list
npx --yes wrangler@latest tunnel list
npx --yes wrangler@latest containers list
npx --yes wrangler@latest turnstile widget list
```

Also inspect tracked Wrangler configuration for bindings that lack an
account-wide list. Probe known Worker names with
`wrangler deployments list --name <worker> --json`; this proves that a known
name exists but cannot prove there are no unknown Workers. Keep that limitation
visible in `cloudflareCoverage` until dashboard or API inventory is available.

The catalog is the operating decision map after reconciliation: P1 receives
continuous owner-led improvement; P2 receives bounded issue-driven agent work;
active P4 receives maintenance and evergreen distribution only; archived P4
receives preservation and retained-resource review. Only active projects with
`readyToBeShared: true` enter product-specific publishing and SEO/GEO planning.

After editing:

```bash
npm run generate:projects
npm run check:projects
```

The check fails when a checkout, priority, infrastructure row, Cloudflare
coverage class, tracked count, or generated view drifts.

When priority, deployment, or sharing readiness changes, update `projects.json`
first and then reconcile `seo-geo-publishing.json`. Keep mutable submission and
completion evidence in GitHub Issues, `growth-program.json`, or the existing
submission receipts rather than in the publishing strategy.
