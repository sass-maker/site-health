# Tasks: geo-observatory

- [x] 1. `fleet-ops/config/geo-observatory.json` — tracked products + stable
      queries (brand/category/citation) + classification rubric.
- [x] 2. `fleet-ops/scripts/geo-observatory-record.mjs` — validate, append to
      `fleet-ops/data/geo-observatory/ledger.jsonl`, regenerate
      `fleet-ops/docs/geo-observatory-latest.md`. Verify: rejects bad entry;
      idempotent report regen.
- [x] 3. `fleet-ops/skills/geo-observatory/SKILL.md` — agent protocol
      (probe → classify → record → commit).
- [x] 4. Seed baseline from the 2026-07-17 audit discoverability results.
- [x] 5. Register skill in fleet AGENTS.md skill table.
- [x] 6. Create weekly scheduled routine (cloud agent) running the protocol.
- [ ] 7. After 2 real runs: review noise level, tighten queries if volatile,
      then archive this change.
- [ ] Phase 2 (separate change): edge AI-crawler telemetry via agent-edge +
      Workers Analytics Engine — start only after fleet-jsonld-emission
      lands in apply-agent-surfaces.mjs.
