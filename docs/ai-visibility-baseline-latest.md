# AI visibility baseline — frozen panel, run 1

The frozen `baseline-panel-v1` panel has been executed against a real model with
real retrieval. This is the canonical record of that number; the panel and its
contract live in
[`apps/backend/config/ai-visibility.json`](../apps/backend/config/ai-visibility.json),
the ingest procedure in
[`ai-visibility-operations.md`](../apps/backend/docs/ai-visibility-operations.md).

Captured 2026-09-05, issue SAR-11. Stored in the private ledger
(`~/Library/Application Support/Fleet Ops/founder-control/foundry.sqlite`) as
seven `visibility.run-recorded` events, run ids
`sar-11-baseline-2026-09-05-<surface>`.

## Headline

**8 of 74 capture units cited — 10.8%.** Mention rate 23.0% (17/74),
recommendation rate **0%**, coverage 74/74, cost **$0.00**.

> **One column, not a panel-wide number.** This was captured on
> `manual-claude-websearch` only — 1 of the 6 declared engine columns. Per
> `engineContract`, a rate is comparable only to another rate on the same
> column. Do not quote 10.8% as a cross-engine figure and do not average it
> against a future ChatGPT or Perplexity reading.

The 6-prompt pilot recorded in SAR-2 read 17% (1 of 6). That was optimistic: it
happened to sample the one Significant Hobbies page that wins. 10.8% supersedes
it.

## Per surface

| Surface | Units | Cited | Mentioned | Recommended | Score |
| --- | ---: | ---: | ---: | ---: | ---: |
| CodeVetter | 16 | 4 (25.0%) | 4 | 0 | 33 |
| PostTrainLLM | 16 | 2 (12.5%) | 4 | 0 | 31 |
| High Signal | 12 | 0 | 4 | 0 | 32 |
| High Signal Podcasts (`on-record`) | 12 | **0** | **0** | 0 | 0 |
| SaaS Maker | 7 | 1 (14.3%) | 2 | 0 | 32 |
| Significant Hobbies | 6 | 1 (16.7%) | 1 | 0 | 28 |
| What It Takes to Win | 5 | 0 | 2 | 0 | 34 |
| **Panel** | **74** | **8 (10.8%)** | **17 (23.0%)** | **0** | — |

`rankedAnswers` is 0 and `averagePosition` null on every surface: no answer
presented these products inside an ordered list, so there is no position to
improve yet. The first job is entering the answer at all.

## The finding: the citation surface is four URLs wide

Across all 74 answers the model emitted **396 citations spanning 236 distinct
URLs on 177 distinct domains**. Exactly **four** of those URLs are ours:

| Cited URL | Surface | Answers citing it |
| --- | --- | ---: |
| `https://codevetter.com/` | CodeVetter | 4 |
| `https://posttrainllm.com/docs/training/` | PostTrainLLM | 2 |
| `https://sassmaker.com/` | SaaS Maker | 1 |
| `https://significanthobbies.com/compare` | Significant Hobbies | 1 |

Two of the four are bare homepages. The 8 citations are not 8 pages earning
their way in — they are **four pages, two of them front doors**, repeated. Every
other page in the portfolio was invisible to all 74 questions.

This reframes the content work in SAR-5/SAR-6: the gap is not ranking, it is
that almost no page in the fleet is retrievable as an answer to any of these
questions.

## Who owns the answer space instead

No incumbent dominates — the top cited domain appears 14 times out of 396.

| Domain | Citations |
| --- | ---: |
| github.com | 14 |
| arxiv.org | 14 |
| en.wikipedia.org | 11 |
| augmentcode.com | 4 |
| dev.to / medium.com / podchaser.com | 3 each |

The leaders are primary sources, not vendors. On the technical surfaces the
model answers out of papers and repositories: PostTrainLLM's 16 answers cite
`arxiv.org` 13 times and `github.com` 4 times, versus one own-domain page. That
is a fragmented answer space, which is the favourable case — there is no
authority to displace, only an absence to fill.

Named competitors appear where the analyzer was told to look for them:

- **CodeVetter** — CodeRabbit in 37.5% of answers, Greptile in 25%. CodeVetter
  itself is mentioned in 25%. *Its closest competitor is named more often than
  it is, on its own panel.*
- **PostTrainLLM** — Axolotl 12.5%, Unsloth 12.5%, against a 25% mention rate.
- **SaaS Maker** — Indie Hackers 14.3%.
- The other four surfaces returned an empty `competitorShare`: no configured
  competitor was named either. Those questions are being answered by nobody in
  the category.

## Two structural problems the run exposed

**1. The High Signal name is taken, and it costs citations.** High Signal has a
33% mention rate and a **0% citation rate** — it gets talked about but never
linked. Its answers cite `highsignal.io` (2), `high-signal.delphina.ai` (1) and
`highsignal.fireside.fm` (1) — an unrelated startup newsletter and a
same-named podcast. This independently reproduces the organic-search finding in
[`geo-observatory-latest.md`](../apps/backend/docs/geo-observatory-latest.md)
(`highsignal-brand` → class C, `.io` taking four of ten slots). Two channels now
agree, which makes it an entity problem, not a ranking problem — SAR-9.

**2. Recommendation rate is 0/74.** Not one answer recommended a fleet product,
including the four surfaces where we were cited. Being retrievable and being
recommended are separate thresholds, and the panel has only cleared the first.

Note also that What It Takes to Win's answers cite `significanthobbies.com`
once, but the surface's own host is `paths.significanthobbies.com`, so it scores
0. Sibling-property citations do not accrue to the surface — a canonicalization
question for SAR-9.

## Method and provenance

Route A (operator-captured observations), as decided by Sarthak on 2026-09-05.
No credential was read, `liveProvidersAllowed` stays `false` on every project,
and no live provider was called.

- One retrieval per distinct panel prompt through this session's grounded web
  search, then ingested through
  `apps/backend/scripts/ai-visibility-provider-observations.mjs`, which makes no
  network request and retains no raw answer text.
- `evidenceMode: provider-observation`, `promptSetId: baseline-panel-v1`,
  `analyzerFingerprint: ai-visibility:0.1.0`.
- `provenance.source: operator-supplied-provider-export`, model string
  `claude-opus-5 + web_search (agent session, grounded retrieval)`.
- Guard suite: `node --test apps/backend/test/dashboard-ai-visibility.test.mjs`
  — 10/10 pass, including `offline observations do not enable direct live
  provider execution`.

The `manual-claude-websearch` column was added to the frozen engine set by
amendment on 2026-09-05 (SAR-11) rather than being folded into the `claude`
column, because agent-session retrieval and the claude.ai web UI are different
backends and the web UI carries account personalization this capture does not.

## What this reading cannot tell you

- **It is one column.** Five declared columns (ChatGPT, Claude web UI,
  Perplexity, Gemini, Copilot) have never been run. 370 captures remain if all
  five are wanted.
- **Per-prompt outcomes are not recoverable.** The ledger retains aggregates,
  the citation URL set, and per-attempt status — deliberately, since raw answers
  are not stored. We know CodeVetter was cited in 4 of 16 answers; we cannot
  reconstruct *which* 4 from the ledger alone.
- **It is a single capture date.** Grounded retrieval varies day to day. One
  reading is a baseline, not a trend; the trend starts at run 2.

## Next run

Owned by SAR-8 (monthly reporting loop). The contract for comparability:

1. Same frozen prompt set (`baseline-panel-v1`, append-only).
2. Same column — `manual-claude-websearch` — kept every month regardless of what
   else is added. It costs $0 and it is the only column with a prior reading.
3. If a second column is bought, buy **one engine across all seven surfaces (74
   captures)**, not a slice of two flagship surfaces across five engines. A
   partial column is comparable to nothing; a whole column is comparable to
   itself next month.
4. Append the run to `baselinePanel.baselineRuns` in the config and refresh this
   document.
