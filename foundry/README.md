# Foundry

Foundry is the canonical home for all Fleet-owned source.

## Product model

| Bucket | Canonical components | Responsibility |
|---|---|---|
| Helpers | `helpers/ai-visibility/`, `helpers/drank/`, `helpers/psi-swarm/`, `helpers/chatgpt-connections/` | Focused domain, performance, visibility, and cross-product connection systems |
| Skills | `ops/skills/`, `ops/teammates/skills/` | Agent-operated Fleet capabilities |
| Public apps | `apps/public/public-directory/` | Public SaaS Maker directory and landing surface |
| Packages | `packages/feedback/`, `packages/ai-chat-footer/`, `packages/portfolio-project-strip/` | Public reusable product contracts and UI components |
| Fleet Console | `apps/dashboard/fleet-console/` | Private cross-project operational interface |

Mashup, Reel Pipeline (including Content Factory), and Mobile Dev Cockpit are
independent sibling repositories. Fleet catalogs and monitors their declared
boundaries, but does not own their source or runtime.

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
| Project catalog | Public Directory | Generated `ops/public/products.json` imported at build time | Connected | The landing page is a privacy-filtered projection of the canonical registry |
| Project catalog | Fleet Console | Direct read of `ops/config/projects.json` | Connected | Project identity and checkout state appear in the dashboard |
| AI Visibility helper | Founder control and Fleet Console | Normalized evidence ledger and Marketing API/view | Connected | Manual fixture-backed runs, history, comparison, cost, and recommendations are visible |
| Drank | Fleet Console | `data/fleet-dr.json` | Connected | Domain-rating history is summarized in the dashboard |
| PSI Swarm | Site Health and Fleet Console | CLI artifacts plus machine-local SQLite history | Connected | Skills can run PSI and the dashboard summarizes tagged runs |
| Mashup | Reel Pipeline | Versioned finished-media receipt | Separate | Mashup is independent; Reel Pipeline may consume approved finished media without owning its runtime |
| Content Factory | Reel Pipeline | Direct sibling scripts and manifest fixtures | Connected | Rendering/package commands execute against Reel Pipeline |
| Reel Pipeline | Fleet Console | Direct source reads and embedded Marketing creation UI | Partial | This is temporary repository coupling; extraction issue #460 must replace or remove it |
| Postiz runners | Marketing evidence | Draft/publication/analytics receipts in machine-local state | Partial | Safe runners and receipt contracts exist; live operation remains deliberately gated |
| Skills | Agent runtimes | Repo-local symlinks installed by `agent-stack.sh` | Connected | Canonical Fleet skills are exposed without duplicating helper runtime or domain logic |
| Supported skill executions | Private run store | CLI wrappers and Codex/Devin capture hooks | Connected | Sanitized outputs and numeric observations are retained machine-locally |
| Skill-run store | Fleet Console | Sanitized `GET /v1/connections` projection | Connected | Run totals, captured-output metadata, recent executions, project rollups, dated history, and numeric observations reach the dashboard without exposing retained output bodies |
| Feedback package | Product feedback ingestion | Consumer-owned `onSubmit` callback or compatible caller-selected `ingestionUrl` | Separate | Products choose and own their destination; Fleet Console does not ingest, store, or project submissions |
| Public workflows | Fleet Console | Sanitized latest availability and performance reports through `GET /v1/connections` | Connected | Current pass/fail totals and report freshness reach the dashboard |
| Mobile Cockpit | Fleet operations | Retained local authenticated bridge and allowlisted commands | Parked | Source and resource inventory remain, but no active product or Console integration work is planned |

## Missing product capabilities

The structure is present, but these intended connections are not shipped:

1. Broader comparable project histories beyond the providers and numeric skill
   observations already projected into Fleet Console.
These are Fleet product gaps, not reasons to absorb independent products or add
more top-level buckets. Operational
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
