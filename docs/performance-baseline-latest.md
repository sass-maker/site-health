# Portfolio performance baseline — 2026-10-02

The public desktop Lighthouse sweep completed **49/49 targets, 98 samples,
zero failed samples**. The private refresh receipt is `succeeded`, with
`resultCount: 49` and `finishedAt: 2026-10-02T09:57:56.879Z`.

Run ID: `psi_4227a6bfded94024adcb72c8de06dbb4`. The run began at
`2026-10-02T08:29:58.860Z`, used tag `console-portfolio`, and disabled provider
enrichment and AI reasoning. No authenticated provider refresh or deployment
was performed.

## Findings

**41 targets clear the screened desktop lab thresholds and a mean score of
90; seven miss an LCP or CLS threshold; one misses only the score target.**
With two samples per site, use these as screening evidence, not stable
percentile estimates. The table retains both observed samples rather than
hiding their variance behind an average.

| Surface | LCP samples (ms) | CLS samples | Disposition |
| --- | --- | --- | --- |
| SWE Interview Prep | 8,553 / 3,459 | 0 / 0 | Both paints are slow; maintenance-only product. Diagnose the render path before changing content or scope. |
| SaaS Maker | 3,418 / 1,800 | 0 / 0 | Variable LCP; qualify repeated/mobile evidence before selecting a source or edge fix. |
| High Signal Podcasts | 3,101 / 677 | 0 / 0 | Variable LCP; the slower sample also has 1,571 ms TTFB. This is not proof of a Cloudflare configuration defect. |
| App Health | 2,783 / 1,901 | 0 / 0 | Variable LCP near the boundary; repeat before treating it as a persistent regression. |
| Anime List | 785 / 608 | 1.007 / 1.006 | Consistent severe shift. Local root-height startup repair passed regression tests and browser comparison; not published. |
| AliveVille | 400 / 396 | 0.380 / 0.261 | Consistent shift on the retained landing. Preserve the parked experiment; no product reactivation. |
| Karte | 980 / 740 | 0.110 / 0.119 | Small consistent shift above the 0.1 boundary; investigate the shifted element before changing layout. |

Live clears the LCP/CLS/TBT screen but has a mean Lighthouse score of 84.
Do not confuse a composite-score miss with a measured Core Web Vitals failure.
All samples in this sweep report zero TBT; missing values are separately
guarded against becoming zero in the reporting code.

This is **desktop navigation lab data**, not mobile coverage, field/RUM data,
interaction INP, or evidence of qualified visitors. The performance target set
also contains retained public surfaces; it is not the active acquisition cohort.
No traffic or revenue gain can be attributed to unshipped source fixes.

## Evidence and access

- History: `/Users/sarthak/.psi-swarm/history.db`, table `runs`; filter
  `started_at >= 1790929798860` and `tag = 'console-portfolio'`.
- Terminal receipt: private Site Health store, metadata key
  `evidence-refresh:psi:portfolio`.
- Self-contained HTML reports: `/Users/sarthak/.psi-swarm/reports/`, generated
  October 2. For example,
  [Anime List report](/Users/sarthak/.psi-swarm/reports/psi-swarm-anime.significanthobbies.com_-2026-10-02T08-37-15.html)
  and [SWE Interview Prep report](/Users/sarthak/.psi-swarm/reports/psi-swarm-learn.significanthobbies.com_-2026-10-02T09-54-20.html).
- The reusable `psi-portfolio-delta.mjs` now preserves missing metrics as
  unknown, marks partial samples `incomplete`, and skips malformed history
  timestamps without losing valid samples.

The monthly preflight now sees the performance receipt as succeeded. It still
fails overall for incomplete broad GEO coverage and recorded Clarity/domain
strength collection gaps; this sweep does not close those independent streams.
