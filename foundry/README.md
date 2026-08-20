# Foundry

Foundry is the canonical home for all Fleet-owned source.

## Product model

| Bucket | Canonical components | Responsibility |
|---|---|---|
| Helpers | `helpers/ai-visibility/`, `helpers/chatgpt-connections/` | Focused GEO evidence and read-only ChatGPT connection surfaces |
| Skills | `ops/skills/`, `ops/teammates/skills/` | Agent-operated Fleet capabilities |
| Workflows | `ops/workflows/`, `ops/automation/` | Credential-free public checks and inert private schedule intent |
| Packages | `packages/ai-chat-footer/`, `packages/portfolio-project-strip/` | Reusable UI packages awaiting the SaaS Maker cleanup pass |
| Foundry dashboard | `apps/dashboard/fleet-console/` | Deferred private view of projects, domains, search, GEO, and performance evidence |

SaaS Maker, Feedback, Drank, PSI Swarm, Mashup, Reel Pipeline (including Content
Factory), and Mobile Dev Cockpit are independent sibling repositories. Foundry
may catalog or call their declared interfaces, but does not own their source or
runtime.

`ops/` is the shared substrate beneath those buckets: policy, registries,
automation, scripts, evidence contracts, host support, public workflows, and
runbooks. GitHub Issues hold feature specifications and operational work;
`assets/` holds shared visual assets.

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
| Project catalog | Public projections and Foundry dashboard | Generated privacy-filtered JSON plus direct private reads | Connected | One registry supplies both surfaces without creating another project database |
| AI Visibility helper | Evidence service and Foundry dashboard | Normalized evidence ledger and bounded API | Connected | Manual runs, history, comparison, coverage, cost, citations, and model outcomes are visible |
| Drank | Foundry dashboard | Standalone service/data contract | Connected | Foundry reads domain intelligence without absorbing Drank |
| PSI Swarm | Site Health and Foundry dashboard | Standalone CLI artifacts plus machine-local history | Connected | Skills can call PSI Swarm and Foundry can summarize its evidence |
| Postiz runners | Marketing evidence | Draft/publication/analytics receipts in machine-local state | Partial | Safe runners and receipt contracts exist; live operation remains deliberately gated |
| Skills | Agent runtimes | Repo-local symlinks installed by `agent-stack.sh` | Connected | Canonical Fleet skills are exposed without duplicating helper runtime or domain logic |
| Supported skill executions | Private run store | CLI wrappers and Codex/Devin capture hooks | Connected | Sanitized outputs and numeric observations are retained machine-locally |
| Skill-run store | Foundry dashboard | Sanitized `GET /v1/connections` projection | Connected | Run totals and explicit numeric observations remain private without exposing retained output bodies |
| Feedback | SaaS Maker | Standalone package, service, and viewing UI | Separate | Foundry does not ingest, store, or project submissions |
| Public workflows | Foundry dashboard | Sanitized availability and performance reports | Connected | Current pass/fail totals and report freshness can reach the dashboard |

## Missing product capabilities

The structure is present, but these intended connections are not shipped:

1. Broader comparable project histories beyond the providers and numeric skill
   observations already projected into Fleet Console.
These are Fleet product gaps, not reasons to absorb independent products or add
more top-level buckets. Operational
work remains tracked in the repository's GitHub Issues.

## Workspace entrypoint

The parent directory remains the workspace and agent entrypoint so independent
product repositories can sit beside `foundry/`. After cloning from a new
machine, run:

```bash
./foundry/ops/scripts/agent-stack.sh install-skills
```

That command exposes the canonical skills in root `.agents/skills/` without
duplicating their source.
