# Proposal: site-health — consolidate the website-measurement skills

## Why

Four fleet skills answer the same user question ("how is this website
doing?") from different angles: `agent-ready` (AI/GEO surfaces),
`seo-audit` (on-page), `psi-swarm` (performance), `geo-observatory`
(outcomes over time). Costs of keeping them peers: four frontmatter
descriptions loaded into every session, four near-synonym names competing
for routing ("audit my site" has no obvious front door), no way to ask for
a full health check in one invocation, and drifting conventions (different
target resolution, different report locations). The fleet already has the
fix pattern: `fleet-ops` and `call-teammate` are routing parents over
focused subskills.

## What changes

- New parent skill `foundry/ops/skills/site-health/SKILL.md`:
  - Routes by intent to the four existing skills (which stay in their
    current directories — git history, symlinks, and direct invocation all
    keep working).
  - Adds the missing invocation: **full health check** for one product or
    `--all` — runs surfaces + seo + perf (+ latest trend classes) and emits
    one combined scorecard (`foundry/ops/docs/site-health-latest.md`).
- Children converge on shared plumbing:
  - Target resolution via `foundry/ops/scripts/lib/registry.mjs` (landing in
    `fleet-jsonld-emission` task 1 — hard dependency, do not start before
    it merges).
  - One report-location convention: `foundry/ops/docs/<skill>-latest.md`.
  - Child SKILL.md frontmatter descriptions trimmed to one line each +
    "subskill of site-health" note (they stay invocable directly, but the
    parent is the documented front door).
- Catalog shrinks: fleet AGENTS.md skill table drops agent-ready /
  seo-audit / psi-swarm / geo-observatory rows in favor of one
  `site-health` parent row (11 → 8 rows). User-level `~/.claude/skills`
  symlinks for the absorbed skills are replaced by a single `site-health`
  symlink; psi-swarm's stray real-copy dir is fixed to a symlink at the
  same time.

## Out of scope

- Merging the four protocols into one file (parent routes, children own
  depth — a giant SKILL.md would be a regression).
- Touching fleet-ops family, call-teammate, or standalone skills
  (spec-driven, name-domains, token-budget, daily-learning,
  mobile-task-control) — no overlap.
- Vendor/plugin skills (cloudflare, wrangler, …) — not ours.

## Risks

- Routing regressions for muscle-memory invocations → children remain
  directly invocable; parent is additive.
- Collision with in-flight glm work (seo-audit.sh G10 fix,
  fleet-jsonld-emission scripts) → sequenced: this change starts only
  after registry.mjs lands; G10 touches script internals, not SKILL.md.
