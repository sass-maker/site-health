# Tasks: geo-observatory

- [x] 1. `foundry/ops/config/geo-observatory.json` — tracked products + stable
      queries (brand/category/citation) + classification rubric.
- [x] 2. `foundry/ops/scripts/geo-observatory-record.mjs` — validate, append to
      `foundry/ops/data/geo-observatory/ledger.jsonl`, regenerate
      `foundry/ops/docs/geo-observatory-latest.md`. Verify: rejects bad entry;
      idempotent report regen.
- [x] 3. `foundry/ops/skills/geo-observatory/SKILL.md` — agent protocol
      (probe → classify → record → commit).
- [x] 4. Seed baseline from the 2026-07-17 audit discoverability results.
- [x] 5. Register skill in fleet AGENTS.md skill table.
- [ ] 6. Create weekly scheduled routine (cloud agent) running the protocol.
      BLOCKED on user: connect GitHub to claude.ai + install the Claude
      GitHub App on sass-maker/fleet-workspace (browser queue B7). Routine
      body ready at `foundry/ops/skills/geo-observatory/routine.json`.
- [ ] 7. After 2 real runs: review noise level, tighten queries if volatile,
      then archive this change.
- [ ] Phase 2 (separate change): edge AI-crawler telemetry via agent-edge +
      Workers Analytics Engine — start only after fleet-jsonld-emission
      lands in apply-agent-surfaces.mjs.
