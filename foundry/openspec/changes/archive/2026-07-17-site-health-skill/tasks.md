# Tasks: site-health-skill

- [x] 0. GATE: `fleet-jsonld-emission` task 1 (shared
      `foundry/ops/scripts/lib/registry.mjs`) merged to main. Do not start
      before this; coordinate with glm-5.2's queue.
- [x] 1. Move psi-swarm's skill to `foundry/ops/skills/psi-swarm/` (copied from the
      `~/.claude/skills` real copy). Per user directive 2026-07-17, nothing
      is added or changed in ~/.claude/skills — fleet-ops is the only home;
      the user manages ~/.claude exposure themselves.
- [x] 2. Author `foundry/ops/skills/site-health/SKILL.md` — routing table +
      combined-mode protocol; frontmatter description covering all child
      trigger phrases (≤60 lines total).
- [x] 3. `foundry/ops/scripts/site-health-scorecard.mjs` — aggregate
      agent-index-audit JSON, seo-audit FAIL/WARN, psi-swarm p75 (or
      skipped), latest observatory classes → site-health-latest.md.
      Verify: run --all; every registry product has a row; skipped
      dimensions marked.
- [x] 4. Trim child SKILL.md descriptions + add subskill note (agent-ready,
      seo-audit, psi-swarm, geo-observatory). No protocol changes.
- [x] 5. Update fleet AGENTS.md skill table (11 → 8 rows); ~/.claude/skills
      left untouched per user directive (no additions there, ever).
      Verified: child descriptions now self-identify as subskills.
- [ ] 6. Update `foundry/ops/docs/fleet-agent-standards.md` skill section
      pointer; archive this change; PROJECT_STATUS not applicable (fleet
      tooling, tracked here).
