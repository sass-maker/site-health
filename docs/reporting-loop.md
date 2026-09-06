# The reporting loop — cadence contract

The recurring measurement program stood up in SAR-8. The owner reads one report
a month; they do not drive any of this.

Two Paperclip routines run it. Neither has a human in the loop.

| Cadence | Routine | Runbook | Scope |
| --- | --- | --- | --- |
| Weekly, Mon 09:00 IST | *Weekly GEO observatory run* | [reporting-loop-weekly.md](reporting-loop-weekly.md) | The 40-query root contract |
| Monthly, 1st 09:00 IST | *Monthly SEO/GEO scorecard* | [reporting-loop-monthly.md](reporting-loop-monthly.md) | Full scorecard + month-over-month report to SAR-1 |

Everything below is the contract both runbooks share. Neither runbook repeats it.

## The preflight gate is not optional

Every run starts with:

```bash
cd ~/Desktop/fleet/saas-maker
node tooling/scripts/reporting-loop-preflight.mjs [--weekly|--monthly] [--json]
```

Exit 0 = clear to run. Exit 1 = a stream failed. Exit 2 = the preflight itself
crashed, which is also a failure, not silence.

This exists because of a specific incident. `geo-observatory-record.mjs` crashed
on startup for **20 days** (2026-08-21 → 2026-09-05, commit `fabaa599` moved
`tooling/` a level deeper and left the fleet-root resolution one segment short)
and *nothing noticed*, because "the recorder ran" was an assumption rather than
a checked precondition. The preflight checks:

- every tooling path resolves — the exact failure mode above
- the recorder still starts, as a real child process
- the GEO ledger's latest run, its age, and whether it covers the full root contract
- *(monthly)* the frozen AI-visibility panel is intact and append-only
- *(monthly)* when the panel last ran, and against how many capture units
- *(monthly)* every scorecard evidence stream's refresh receipt, per scope

**A failing stream is never reported as if it were current.** Either fix the
collector inside the run, or state plainly in the report that the stream is
stale and give its real age. Silence about a dead collector is the failure this
whole gate exists to prevent.

## Two headline metrics, never blended

The report leads with two numbers that **move independently**:

1. **AI-citation rate** — share of frozen-panel capture units where a model's
   answer cites one of our URLs.
2. **Search visibility (A/B/C)** — share of GEO queries where the product's own
   origin ranks in the top 3 organic results.

You can rank #1 and still be invisible in AI answers. That is the entire point
of running both panels; averaging them into one "visibility score" destroys the
only signal worth having. The report gives each its own headline line.

### Citation-rate comparability rules

A citation rate is comparable **only to another rate on the same engine
column**. From `baselinePanel.engineContract` in
[`../apps/backend/config/ai-visibility.json`](../apps/backend/config/ai-visibility.json):

- Six engine columns are declared. Only `manual-claude-websearch` has readings.
- **Run `manual-claude-websearch` every month, unconditionally.** It costs $0
  and zero operator minutes, and it is the only column with history. Dropping
  it for a month puts a hole in the only trend line that exists.
- Never quote a single column's rate as a panel-wide number.
- Never average two columns together. They are different retrieval backends.
- If a second column is ever bought, buy one engine across **all seven
  surfaces** (74 captures), not a slice of two flagship surfaces. A partial
  column cannot be compared to anything, including itself next month.

### The frozen sets are append-only

Both panels are frozen contracts. Rewording an existing prompt id or query id
silently invalidates every prior reading under that id — the trend keeps
rendering and quietly means nothing.

| Panel | File | Frozen contract |
| --- | --- | --- |
| AI visibility | `apps/backend/config/ai-visibility.json` | `baseline-panel-v1` — 46 prompts × personas = 74 capture units, 7 surfaces |
| GEO root contract | `apps/backend/config/root-search-queries.json` | 10 roots × 4 intents = 40 active queries |
| GEO broad set | `apps/backend/config/geo-observatory.json` | 47 products, 98 active queries |

The two GEO configs overlap by 16 queries, so the **full set is 122 active
queries across 48 products** — not the sum. The preflight reports coverage
against both denominators; use its numbers rather than recomputing them.

To track something new: **add** a query with a new id and keep the old one.
Never edit in place. Amendments to the AI panel go in
`baselinePanel.amendments` with a dated reason.

## Set expectations honestly, every month

SEO compounds on a **3–6 month lag**. Months 1 and 2 are effort spent against
flat numbers. That is the normal shape of the curve, not a failure of the
program, and the report says so plainly rather than manufacturing movement.

Two corollaries the report must respect:

- **SERPs are noisy.** A single-step class change is signal only if it persists
  two runs. Say "moved, unconfirmed" rather than announcing a win.
- **Flat is a valid month.** Report the flat number, note what shipped that has
  not yet had time to land, and move on. Do not go looking for a metric that
  did move in order to have something to say.

## What gets escalated

The report is read, not acted on, by default. Flag something for a decision
only when it genuinely needs one:

- a collector failed and the fix is not the reporter's to make
- a competitor or collision materially worsened on a priority surface
- a class C that should be class A given work already shipped — with a stated
  likely cause: not deployed, not indexed, or blocked
- a cost or credential decision (e.g. buying a second engine column)

Everything else: just report.

## Boundaries

- **Site Health stays local and private.** Nothing from it is published, and
  the private evidence store is never exported. The monthly report goes to the
  Paperclip issue thread, which is not a public surface.
- **Reusable scripts live in `saas-maker/tooling/`**, never the fleet root.
- **Product work is filed in the owning repo's GitHub Issues**, via
  `spec-driven` — not as findings buried in a monthly report.
- If public metadata changes, update `projects.json` **and** regenerate SaaS
  Maker's checked-in public projection in the same task.
- Never `npx biome` in a fleet repo — use `pnpm exec biome`.
