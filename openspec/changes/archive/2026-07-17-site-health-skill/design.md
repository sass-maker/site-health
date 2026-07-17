# Design: site-health-skill

## Routing (parent SKILL.md, target ≤60 lines)

| Intent | Route to | Stays at |
|---|---|---|
| "can AI crawlers read it", llms.txt, GEO surfaces | agent-ready | `fleet-ops/skills/agent-ready/` |
| "check meta/canonical/schema", on-page SEO | seo-audit | `fleet-ops/skills/seo-audit/` |
| "is it fast", CWV, Lighthouse | psi-swarm | `fleet-ops/skills/psi-swarm/` → canonical `fleet-ops/psi-swarm/SKILL.md` |
| "did results move", SERP trend, weekly run | geo-observatory | `fleet-ops/skills/geo-observatory/` |
| "full health check", "audit everything for X" | combined mode (below) | parent |

Parent frontmatter description enumerates all trigger phrases currently
spread across the four children, so session routing quality does not drop
when the children leave the catalog.

## Combined mode

`fleet-ops/scripts/site-health-scorecard.mjs`:
1. Resolve targets via `scripts/lib/registry.mjs` (product id or `--all`).
2. Run: `agent-index-audit.mjs --json`, `seo-audit.sh` per origin
   (FAIL/WARN counts only), psi-swarm runner (p75 LCP/CLS/INP if the
   psi-swarm stack is available — else mark `skipped`), and read the
   latest geo-observatory classes from the ledger (no live probing —
   trend data comes from scheduled runs).
3. Emit `fleet-ops/docs/site-health-latest.md`: one row per product —
   GEO tier | seo FAIL/WARN | perf p75 | trend classes | worst-problem
   one-liner. Exit non-zero if any product regressed to a failing tier.

v1 aggregates existing outputs; it does not re-implement any check.

## Catalog & distribution

- AGENTS.md skill table: remove 4 rows, add
  `site-health | parent | routes to agent-ready / seo-audit / psi-swarm / geo-observatory; combined scorecard`.
- Per user directive (2026-07-17): `fleet-ops/skills/` is the ONLY home —
  nothing is added or changed in `~/.claude/skills`, ever. Fleet-checkout
  project discovery exposes the skills (verified in-session). psi-swarm's
  skill joins `fleet-ops/skills/psi-swarm/` as a relative symlink to its
  canonical `fleet-ops/psi-swarm/SKILL.md`.

## Child edits (minimal)

Each child SKILL.md: description trimmed to one line; body gains a first
line "Subskill of `site-health` — invoked directly or via the parent."
No protocol changes in this change (G10's seo-audit fixes land
independently).
