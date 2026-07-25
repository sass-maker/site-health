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
      Run 1 (live) done 2026-07-25 — 16 observations, no class changes vs the
      seeded baseline, so no volatility signal yet. Retargeting done early for
      a different reason than volatility: `pace-category` returned macOS
      VoiceOver docs and `highsignal-category` returned sports tipsters, i.e.
      mistargeted rather than noisy. Added `pace-category-2`,
      `pace-brand-exact`, `highsignal-category-2` as NEW qids (old ones kept —
      rephrasing breaks trend history). Dropped `materia` (archived to
      `~/Desktop/fleet-inactive-projects/`); the report now has a Retired
      section so dropped queries stay visible instead of vanishing from the
      trend table. Needs one more live run before archiving.
- [ ] Phase 2 (separate change): edge AI-crawler telemetry via agent-edge +
      Workers Analytics Engine — start only after fleet-jsonld-emission
      lands in apply-agent-surfaces.mjs.
