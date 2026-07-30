# GitHub Actions Run Policy

Fleet Workspace uses GitHub Actions as a bounded verification surface, not as
an always-on production control plane.

## Run rules

1. Pull-request and `main` push workflows must use path filters so unrelated
   documentation, status, and product changes do not allocate runners.
2. Independent packages and apps use independent workflows. A change to one
   package must not install or build the others.
3. Every workflow supports `workflow_dispatch` for an intentional rerun.
4. CI workflows cancel superseded runs for the same workflow and ref.
   Scheduled workflows that write results may queue instead of cancelling.
5. Every job has a timeout. Heavy macOS/native proof runs only by manual
   dispatch; the portable check remains automatic.
6. Recurring GitHub-hosted audits run no more than weekly unless an incident or
   measured freshness requirement justifies a shorter cadence.
7. Production deployments remain manual and must satisfy the Fleet deploy
   guard. An automatically triggered workflow must not contain a production
   deploy command.

## Workflow ownership

| Workflow | Automatic rule | Manual rule |
|---|---|---|
| Fleet Contracts CI | Fleet ops/contracts and public-directory paths | Available |
| Feedback Package CI | Feedback package paths | Available |
| AI Visibility Package CI | AI Visibility package paths | Available |
| Ops Console CI | Ops Console paths | Available |
| Drank CI | Drank and shared deploy-helper paths | Available |
| PSI Swarm CI | PSI Swarm and shared deploy-helper paths | Available |
| Reel Pipeline CI | Reel Pipeline, Content Factory, and shared deploy-helper paths | Available |
| Mobile Cockpit CI | Mobile Cockpit paths; portable check only | Portable plus macOS proof |
| Workflow Policy CI | Workflow and policy-check paths | Available |
| Fleet Sync Guard | Relevant sync paths and weekly drift check | Available |
| Cloudflare Resilience Audit | None; private provider/source audit | Manual only |
| Fleet PSI Sweep | None; full private PSI/Lighthouse evidence | Manual only |

Credential-free public surface and HTTP performance audits execute weekly from
the public [`sass-maker/workflows`](https://github.com/sass-maker/workflows)
repository. Fleet pins that repository at `foundry/ops/workflows`. A private
caller of a reusable public workflow remains private-billed, so private-source
CI is not routed through the public repository.

Run `npm run check:actions` after editing `.github/workflows/`. The check fails
on unscoped automatic triggers, missing manual dispatch, missing concurrency or
timeouts, daily schedules, automatic macOS jobs, and automatic production
deploy commands.
