# Tasks: site-health-skill

- [ ] 0. GATE: `fleet-jsonld-emission` task 1 (shared
      `fleet-ops/scripts/lib/registry.mjs`) merged to main. Do not start
      before this; coordinate with glm-5.2's queue.
- [ ] 1. Move psi-swarm's skill to `fleet-ops/skills/psi-swarm/` (from the
      `~/.claude/skills` real copy; diff first, keep newest), symlink back.
- [ ] 2. Author `fleet-ops/skills/site-health/SKILL.md` — routing table +
      combined-mode protocol; frontmatter description covering all child
      trigger phrases (≤60 lines total).
- [ ] 3. `fleet-ops/scripts/site-health-scorecard.mjs` — aggregate
      agent-index-audit JSON, seo-audit FAIL/WARN, psi-swarm p75 (or
      skipped), latest observatory classes → site-health-latest.md.
      Verify: run --all; every registry product has a row; skipped
      dimensions marked.
- [ ] 4. Trim child SKILL.md descriptions + add subskill note (agent-ready,
      seo-audit, psi-swarm, geo-observatory). No protocol changes.
- [ ] 5. Update fleet AGENTS.md skill table (11 → 8 rows); replace user
      symlinks (add site-health; remove agent-ready/seo-audit; psi-swarm →
      symlink). Verify: fresh session lists site-health, and routing a
      "check my SEO" request reaches seo-audit via the parent.
- [ ] 6. Update `fleet-ops/docs/fleet-agent-standards.md` skill section
      pointer; archive this change; PROJECT_STATUS not applicable (fleet
      tooling, tracked here).
