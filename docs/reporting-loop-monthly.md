# Monthly runbook — full scorecard and month-over-month report

Fired by the Paperclip routine *Monthly SEO/GEO scorecard*, 1st of the month
09:00 IST. No human in the loop. The output is **one report the owner reads**,
posted to [SAR-1](/SAR/issues/SAR-1).

Shared contract — preflight, the two headline metrics, comparability rules,
frozen sets, honesty framing, escalation — lives in
[reporting-loop.md](reporting-loop.md). This page is the sequence and the
report shape only.

## Steps

**1. Preflight, monthly scope.**

```bash
cd ~/Desktop/fleet/saas-maker
node tooling/scripts/reporting-loop-preflight.mjs --monthly --json
```

Keep the JSON. Its per-stream ages and states become the report's *Data health*
section — the owner should be able to see at a glance which numbers are current
and which are stale, without asking.

**2. AI-visibility panel — the citation-rate headline.**

Re-run the frozen `baseline-panel-v1` panel on the
**`manual-claude-websearch`** column: all 46 prompts × personas = **74 capture
units** across the 7 surfaces. Procedure in
[`../apps/backend/docs/ai-visibility-operations.md`](../apps/backend/docs/ai-visibility-operations.md).

```bash
cd ~/Desktop/fleet/site-health
# fillable slots for every expanded prompt x frozen engine
node apps/backend/scripts/ai-visibility-capture-kit.mjs template --out "$SCRATCH/capture.json"
# fold filled captures into a provider-observations bundle
node apps/backend/scripts/ai-visibility-capture-kit.mjs build --input "$SCRATCH/capture.json" --out "$SCRATCH/bundle.json"
node apps/backend/scripts/ai-visibility-capture-kit.mjs validate --input "$SCRATCH/bundle.json"
node apps/backend/scripts/ai-visibility-provider-observations.mjs --input "$SCRATCH/bundle.json"
```

The package is a **calculation** package: it reads no credential, contacts no
provider, and retains no raw answers. `liveProvidersAllowed` is `false` for
every project and a test enforces it. Captures are operator/agent-grounded
retrieval, folded in through the kit. Keep the capture and bundle files in the
run scratch dir, outside Git.

Then refresh `../docs/ai-visibility-baseline-latest.md` in place — the `-latest`
naming is deliberate, one canonical page rather than accumulating dated files.

**3. GEO — full set.** Run the broad scope over all 122 active queries
(`geo-observatory.json` plus the root contract), classify A/B/C, and record with
the **broad** invocation — no `--root-search` flag:

```bash
node tooling/scripts/geo-observatory-record.mjs <file>
```

The weekly root-40 run already covers 40 of these; re-probing them on the
monthly date is correct — one observation per product/query per day, and the
monthly date needs a complete set.

**4. Authority and rankings.** Read the `drank` (domain rating) and `search`
(Search Console) streams from the private store. **Check the preflight verdict
for both before quoting either.** Two live caveats as of 2026-09-05:

- The DR collector is under investigation for a decline (SAR-16) and has a known
  defect — silent failure, placeholder values, per-host double counting (SAR-20).
  Do not report a DR movement as real until SAR-20 lands.
- Search Console evidence last succeeded 2026-08-22 and today's refresh hung in
  `running`. Report its true age, not the run date.

**5. Technical health.** Run the relevant `site-health` subskills — `seo-audit`
for on-page, `psi-swarm` for Core Web Vitals, `agent-ready` for AI-crawler
readiness. Route via `saas-maker/tooling/skills/site-health/SKILL.md`. Fold the
result into one *technical health* line plus any regressions.

**6. Diff against last month** and write the report.

**7. Post to SAR-1**, then file anything actionable as a child issue or, for
product work, in the **owning repo's** GitHub Issues via `spec-driven`. Findings
must not live only inside a monthly report.

## Report shape

Keep it short. The owner reads this and nothing else.

```markdown
## <Month> — SEO/GEO scorecard

**AI-citation rate: X.X%** (n/74 capture units, manual-claude-websearch)
  — vs Y.Y% last month. <one line: what moved, or "flat">

**Search visibility: Z.Z% class A** (n/122 queries)
  — vs W.W% last month. <one line>

These two move independently. <Say so explicitly whenever they diverge —
ranking gains with a flat citation rate, or vice versa, is the normal case and
the reason both panels exist.>

### What moved
<Only changes that persisted or are large enough to be real. A one-step SERP
change on a single query is noise; say "moved, unconfirmed".>

### What shipped this month
<Work landed that has not yet had time to show up. This is where months 1–2
earn their keep.>

### Data health
<Per-stream: fresh / stale / failed, with real ages, straight from the
preflight JSON. Name anything being reported stale.>

### Needs a decision
<Only genuine decisions. If none: "Nothing — this is a reporting month.">
```

## Expectations, stated every month

SEO compounds on a **3–6 month lag**. The program started 2026-09-05, so:

| Month | What the numbers should look like |
| --- | --- |
| Month 1 (Oct) | Flat. Effort against no movement. Normal. |
| Month 2 (Nov) | Flat to marginal. Still normal. |
| Month 3–4 (Dec–Jan) | First real movement expected, if content shipped |
| Month 5–6 (Feb–Mar) | Compounding becomes visible |

Say this in the report while it is true. A flat month reported as flat, with
what shipped, is a good report. A flat month dressed up by finding some metric
that happened to move is a bad one.

## Starting line — the numbers to diff against

Baseline captured 2026-09-05.

| Metric | Baseline | Source |
| --- | --- | --- |
| AI-citation rate | **10.8%** (8/74) | `manual-claude-websearch` column only |
| AI-mention rate | 23.0% (17/74) | same column |
| AI-recommendation rate | **0%** | same column |
| Ranked answers | 0, average position null | no answer used an ordered list |
| Search class A (root-40) | 5.0% (2 A / 11 B / 27 C) | root contract |
| Search class A (full set) | **1.7%** (2/117) | all live products |
| Panel cost | $0.00 | |

The finding underneath the citation rate, which the monthly report should keep
tracking: across all 74 answers the model emitted **396 citations over 236
distinct URLs on 177 domains, and exactly four of those URLs are ours** — two of
them bare homepages. The gap is not ranking, it is that almost no page in the
fleet is retrievable as an answer. The answer space is fragmented (top cited
domain appears 14/396 times, and the leaders are arxiv/GitHub/Wikipedia, not
vendors), which is the favourable case: there is no authority to displace, only
an absence to fill.

Watch item: on CodeVetter's own panel, **CodeRabbit is named in 37.5% of
answers against CodeVetter's own 25% mention rate**. Its closest competitor is
named more often than it is.
