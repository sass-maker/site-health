Run the Fleet GEO Observatory weekly measurement from the Fleet workspace root.

Read `foundry/ops/skills/geo-observatory/SKILL.md` and follow its protocol
exactly.

Boundaries:

- Load `foundry/ops/config/geo-observatory.json`; never rephrase or remove an
  existing query.
- Use live web search for every configured query and classify only from the
  observed first page.
- Record the configured query text verbatim and `source: "web-search"` for
  every observation. Never substitute a scraper, cached SERP, or generic
  fallback result set.
- Rerun any query whose results are plainly unrelated. If at least two
  results do not plausibly answer or collide with the query after a focused
  rerun, fail the run instead of recording false evidence.
- Every observation must include two or three evidence URLs and a short factual
  note. The only exception is a class C exact query with no organic results;
  record an empty list and state that explicitly.
- Do not scrape AI-product UIs or use a paid search/API provider.
- Record through `foundry/ops/scripts/geo-observatory-record.mjs`; never edit
  the ledger or generated report manually.
- If any query cannot be observed or validation fails, do not commit a partial
  run. Report the failure and stop.
- Commit and push only
  `foundry/ops/data/geo-observatory/ledger.jsonl` and
  `foundry/ops/docs/geo-observatory-latest.md` with the skill's prescribed
  commit message. Preserve all unrelated work.
- End with the generated Movers section and only evidence-backed indexing
  concerns.
