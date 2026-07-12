## Why

Fleet marketing already has domain plans, a SaaS Maker Marketing Queue, Reel Pipeline production, posting receipts, and a twice-weekly idea generator. They do not form an operating loop. The queue currently contains 85 generated ideas and no accepted, scheduled, or sent work; stale project identities remain; and the declared focus products have no queue coverage. Generating more ideas increases review debt without improving distribution.

## What Changes

- Add one versioned Fleet marketing program registry with canonical project identity, aliases, domain, operating mode, trusted content base, CTA, brand channels/accounts, cadence, and current focus status.
- Make marketing automation consume that registry instead of duplicating hard-coded project priorities.
- Add review-debt backpressure: idea generation pauses when the actionable review queue is above a configured ceiling and reports the exact review action instead.
- Add a sanitized marketing snapshot containing only aggregate counts, freshness, readiness, and next actions; post bodies and private credentials never enter the public dashboard.
- Add a read-only `/marketing` page to Fleet Ops showing the full funnel per project: foundation, queued, approved, produced, published, measured.
- Link the Marketing lane to the new page and link review actions to the authenticated SaaS Maker Marketing Queue.
- Add a concise mobile notification brief for review debt, failures, and stale focus projects.
- Add a source-backed content-package contract so each brand owns topic truth while renderers and publishers consume immutable approved variants.
- Keep Reel Pipeline as the shared media factory, remove its auto-accept path, and require explicit receipts for render outcomes.
- Put multi-account, multi-platform scheduling behind a publisher adapter. Evaluate self-hosted Postiz as the first adapter; do not install or connect accounts in this release without explicit approval.
- Preserve SaaS Maker as the approval and queue system of record and Reel Pipeline as the media-production handoff.

## Scope

In scope for the first release: Fleet Ops registry/snapshot/dashboard, content-base and brand-channel contracts, SaaS Maker aggregate queue reads, automation priority/backpressure, identity aliases, OpenClaw dry-run orchestration, Reel Pipeline approval safety, publisher-adapter contract, mobile review notifications, tests, and documentation.

Out of scope: auto-acceptance, auto-posting, social credentials, DNS/domain changes, production queue mutation, installing Postiz, connecting social accounts, generating marketing documents in every repo, and implementing the separate Significant Hobbies content flywheel.

## Impact

- `fleet-ops`: canonical registry, marketing snapshot command, cron prompt/wrapper changes, notification integration, and public aggregate dashboard.
- `saas-maker`: existing authenticated Marketing Queue remains authoritative; only an aggregate/sanitized read contract may be added if the current API cannot provide it safely.
- `reel-pipeline`: no first-release behavior change; accepted video work continues through its existing intake and receipt path.
- `openclaw`: one bounded, observable dry-run job contract for source selection, package proposal, status reporting, and approval handoff; it receives no authority to accept or publish.
- Public dashboard: aggregate operational state only. Content bodies, unpublished campaigns, account identifiers, and credentials remain private.
