# Foundry

Foundry is the canonical home for all Fleet-owned source.

## Product model

| Bucket | Canonical components | Responsibility |
|---|---|---|
| Packages | `packages/ai-visibility/`, `packages/feedback/` | Shared contracts installed or executed across products |
| Skills | `ops/skills/`, `ops/teammates/skills/` | Agent-operated Fleet capabilities |
| Public apps | `apps/public/mobile-cockpit/`, `apps/public/public-directory/` | Shippable operator client and public SaaS Maker directory |
| Internal apps | `apps/internal/drank/`, `apps/internal/psi-swarm/` | Focused domain-intelligence and performance workflows |
| Marketing | `marketing/reel-pipeline/`, `marketing/content-factory/` | Editorial, rendering, distribution, campaign, and outcome pipeline |
| Final dashboard | `apps/dashboard/fleet-console/` | Cross-bucket owner overview and navigation |

`ops/` is the shared substrate beneath those buckets: policy, registries,
automation, scripts, evidence contracts, host support, public workflows, and
runbooks. `openspec/` holds cross-Fleet specifications and `assets/` holds
shared visual assets.

The buckets do not impose one package manager or release cadence. Each
component keeps its native manifest, lockfile, checks, data boundary, and deploy
identity.

## Connection map

`Connected` means a producer emits a durable contract that a consumer actually
reads. `Partial` means a useful path exists but does not yet fulfill the intended
end-to-end product. `Missing` means the direction exists but no implemented
transport or consumer does.

| Provider | Consumer | Transport | Status | Current truth |
|---|---|---|---|---|
| Project catalog | Public Directory | Generated `ops/public/products.json` imported at build time | Connected | The landing page is a privacy-filtered projection of the canonical registry |
| Project catalog | Fleet Console | Direct read of `ops/config/projects.json` | Connected | Project identity and checkout state appear in the dashboard |
| AI Visibility package | Founder control and Fleet Console | Normalized evidence ledger and Marketing API/view | Connected | Manual fixture-backed runs, history, comparison, cost, and recommendations are visible |
| Drank | Fleet Console | `data/fleet-dr.json` | Connected | Domain-rating history is summarized in the dashboard |
| PSI Swarm | Site Health and Fleet Console | CLI artifacts plus machine-local SQLite history | Connected | Skills can run PSI and the dashboard summarizes tagged runs |
| Editorial | Reel Pipeline | Reel Pipeline `editorial` commands and shared package contracts | Connected | The former Mashup runtime is part of Marketing |
| Content Factory | Reel Pipeline | Direct sibling scripts and manifest fixtures | Connected | Rendering/package commands execute against Reel Pipeline |
| Reel Pipeline | Fleet Console | Marketing registry, proof files, and local readiness reports | Partial | Foundation and readiness appear, but full queue-to-outcome state is not unified |
| Postiz runners | Marketing evidence | Draft/publication/analytics receipts in machine-local state | Partial | Safe runners and receipt contracts exist; live operation remains deliberately gated |
| Skills | Agent runtimes | Repo-local symlinks installed by `agent-stack.sh` | Connected | Canonical Fleet skills are exposed without duplicating their source |
| Supported skill executions | Private run store | CLI wrappers and Codex/Devin capture hooks | Connected | Sanitized outputs and numeric observations are retained machine-locally |
| Skill-run store | Fleet Console | None | Missing | Run history, retained output, and metric graphs have no dashboard consumer |
| Feedback package | Product feedback ingestion | Required consumer-owned `onSubmit` callback | Partial | The widget exists, but Fleet does not yet receive or store submissions |
| Feedback ingestion | Fleet Console | None | Missing | There is no unified feedback inbox or project-level feedback view |
| Public workflows | Fleet Console | None | Missing | Availability and HTTP-performance reports exist in the public module but are not aggregated |
| Mobile Cockpit | Fleet operations | Local authenticated bridge and allowlisted commands | Connected | The client can inspect and operate configured projects |
| Fleet Console | Mobile Cockpit | None | Missing | The final dashboard is not yet presented as a first-class mobile surface |

## Missing product capabilities

The structure is present, but these intended connections are not shipped:

1. Fleet-owned Feedback ingestion, storage, attachments, product SDK
   configuration, and dashboard inbox.
2. Fleet Console views for skill-run history, retained sanitized output, and
   project metric graphs.
3. A normalized adapter from the public workflow reports into Fleet Console.
4. One durable Marketing state model spanning source, approval, render,
   distribution, publication, measurement, and outcome.
5. A first-class Mobile Cockpit view of the final Fleet dashboard.

These are product gaps, not reasons to add more top-level buckets. Operational
work remains tracked in Fleet Workspace GitHub Issues.

## Workspace entrypoint

The parent directory remains the workspace and agent entrypoint so independent
product repositories can sit beside `foundry/`. After cloning from a new
machine, run:

```bash
./foundry/ops/scripts/agent-stack.sh install-skills
```

That command exposes the canonical skills in root `.agents/skills/` without
duplicating their source.
