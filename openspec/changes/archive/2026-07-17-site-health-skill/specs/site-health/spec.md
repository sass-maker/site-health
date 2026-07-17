# Spec: site-health

## ADDED Requirements

### Requirement: Single front door for website measurement

A `site-health` parent skill SHALL route measurement intents (AI surfaces,
on-page SEO, performance, outcome trends) to the corresponding subskill,
and its description SHALL cover the trigger phrases of all absorbed skills.

#### Scenario: intent routing

- GIVEN a user asks "is my site readable by AI crawlers?"
- WHEN the site-health skill is invoked
- THEN it routes to the agent-ready subskill without loading the other
  subskills' protocols

### Requirement: Combined scorecard

The skill SHALL produce a single per-product scorecard combining GEO tier,
SEO FAIL/WARN counts, performance p75, and latest trend classes, for one
product or the whole registry.

#### Scenario: full fleet health check

- GIVEN "run a full health check --all"
- WHEN the combined mode runs
- THEN `fleet-ops/docs/site-health-latest.md` is regenerated with one row
  per registry product and a worst-problem note, and unavailable
  dimensions are marked skipped rather than silently omitted

### Requirement: Back-compatible consolidation

Absorbed skills SHALL remain individually invocable (directories, git
history, and direct invocation preserved) while leaving the top-level
skill catalog.

#### Scenario: direct child invocation

- GIVEN an agent invokes seo-audit directly by name or path
- WHEN the skill loads
- THEN it works exactly as before consolidation

### Requirement: One source of truth for skill files

All subskills SHALL live under `fleet-ops/skills/` with user-level
exposure via symlinks only (no real copies), eliminating drift.

#### Scenario: psi-swarm copy fixed

- GIVEN the current `~/.claude/skills/psi-swarm` real directory
- WHEN consolidation lands
- THEN it is a symlink to the fleet-ops location and `diff -r` shows no
  divergence
