# Devin PRD handoff set

These four PRDs are parallel implementation packets for the Cloudflare fleet
resilience change. Each agent must work in its assigned repository branch or
worktree, preserve unrelated dirty work, and report evidence back rather than
deploying.

## Ownership and non-overlap

| PRD | Owner | Primary scope |
| --- | --- | --- |
| [01-background-jobs.md](./01-background-jobs.md) | Devin 1 | Queue, Workflow, cron, and replay safety in Knowledge Base, Reader, and Email Manager |
| [02-provider-runtime.md](./02-provider-runtime.md) | Devin 2 | AI/provider calls, ingestion fan-out, CPU/cost bounds, and data-pipeline failure handling |
| [03-build-deploy.md](./03-build-deploy.md) | Devin 3 | CI/build/deploy/preview/rollback evidence across the remaining fleet surfaces |
| [04-resilience-dashboard.md](./04-resilience-dashboard.md) | Devin 4 | Read-only `/resilience` view in the Fleet Ops console |

Shared files owned by the consolidating agent: the root resilience audit,
OpenSpec proposal/design/spec/tasks, Cloudflare account settings, DNS/WAF/
rate-limit policy, credentials, and production deploys.

Each agent should return: changed files, tests/checks run, failures or
assumptions, and a short evidence matrix mapped to its acceptance criteria.
