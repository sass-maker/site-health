# Weekly runbook — GEO observatory run

Fired by the Paperclip routine *Weekly GEO observatory run*, Mondays 09:00 IST.
No human in the loop. One focused session: probe, classify, record, commit,
summarise.

Shared contract — preflight, frozen sets, honesty rules, escalation — lives in
[reporting-loop.md](reporting-loop.md). Read it once; this page does not repeat it.

## Scope: the 40-query root contract, not the full set

The weekly run probes **only the active queries in
`apps/backend/config/root-search-queries.json`** — 10 root domains × 4 intents
(brand, exact-domain, category, problem). The broader 98-query product set is a
**monthly** job, folded into the scorecard.

This split is a deliberate cost decision made in SAR-8, and it is worth stating
because `geo-observatory.json` still carries `"cadence": "weekly"` from before
SAR-15 widened it to every live product:

- 40 live search probes weekly is one focused session. 122 is not.
- The root contract is the trend line with the longest history and the strictest
  validation — the recorder's `--root-search` mode rejects a run that is
  missing, duplicated, extended, rewritten, or mixed-date.
- The wider set answers "is this surface still indexed at all", which does not
  meaningfully change week to week on parked products.

If the owner wants the full 122 weekly, that is a cadence change to make
explicitly, not a default to drift into.

## Steps

**1. Preflight.**

```bash
cd ~/Desktop/fleet/saas-maker
node tooling/scripts/reporting-loop-preflight.mjs --weekly
```

Exit non-zero → fix the cause before probing. A run recorded on top of a broken
recorder is worse than a skipped week, because it looks like data.

**2. Probe.** Follow `saas-maker/tooling/skills/geo-observatory/SKILL.md`
verbatim. The parts that are most often got wrong:

- Use the **WebSearch tool** against live search. Never a scraper, a cached
  SERP, a generic fallback, or another engine's inferred answer.
- Use each configured query **verbatim** and record it as `query` with
  `"source": "web-search"`.
- At least two captured results must plausibly answer or collide with the query.
  If the result set is plainly unrelated, rerun that one query; if it is still
  unusable, **fail the run rather than record it**.

**3. Classify** each query A / B / C:

| Class | Meaning |
| --- | --- |
| **A** | the product's own origin is in the top 3 organic results |
| **B** | partial page-1 visibility — own origin below top 3, or reachable only via sassmaker.com, GitHub, or a directory |
| **C** | absent from page 1 entirely |

Record the top 2–3 result URLs as evidence plus a one-line note (who owns the
SERP, collisions, anything surprising). An empty result list is permitted **only**
for class C, and only when the note says the exact query returned no organic
results.

**4. Record.** Write all 40 entries to a temp file under the run scratch dir as
`[{date, product, qid, query, source, class, top, notes}]`, then:

```bash
cd ~/Desktop/fleet/saas-maker
node tooling/scripts/geo-observatory-record.mjs --root-search <file>
```

All-or-nothing. Root mode requires exactly the 40 configured pairs on a single
date; anything unknown, duplicated, rewritten, or extra rejects the whole batch
and writes nothing. A valid batch appends to
`apps/backend/data/geo-observatory/ledger.jsonl` and regenerates
`apps/backend/docs/geo-observatory-latest.md`.

**5. Commit** the ledger and the regenerated report in the **`site-health`**
repository (never the fleet root, which is not a repo):

```bash
cd ~/Desktop/fleet/site-health
git add apps/backend/data/geo-observatory/ledger.jsonl apps/backend/docs/geo-observatory-latest.md
git commit -m "geo-observatory: <date> run (40 observations)"
```

Do not push if the working tree carries other agents' in-flight changes —
pushing is outward-facing. Commit locally and say so.

**6. Summarise** into the run issue: the Movers section verbatim, the A/B/C
split, and anything needing a decision. A one-step class change is signal only
if it persists two runs — say "moved, unconfirmed" rather than announcing a win.

## Known state to carry forward

- **High Signal Podcasts** is class C on all four probes and its brand name is
  taken by an established data-science podcast that owns Apple Podcasts, Amazon
  Music, Podchaser, Rephonic and Fireside. `highsignal.io` — an unrelated
  newsletter — has also taken #1 on our own brand token. This is a naming
  collision, not a ranking deficit; do not report it as one improving.
- **Fleet-wide class A rate is 1.7%** (2 of 117, 2026-09-05). The root-40
  baseline reads 5.0% (2 A / 11 B / 27 C). The two numbers have different
  denominators — quote the scope with the number, every time.
- Five configured active queries were not probed in the 2026-09-05 full-set run
  (`codevetter-category`, `highsignal-category`, `pace-brand`, `pace-category`,
  `rolepatch-category`). The weekly root run does not cover them; the monthly
  full-set run must.
