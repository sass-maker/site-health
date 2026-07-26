---
name: site-health
description: Route site health, AI indexing, SEO, performance, visibility trends, and public guest-journey audits to the relevant Fleet subskill.
---

# site-health — fleet website measurement (routing parent)

Route by intent. Each subskill's SKILL.md is the full protocol — read the
one you need, not all four.

| Intent | Read and follow |
|---|---|
| AI/agent readiness: llms.txt, /api/ai, index.md, robots vs AI crawlers, GEO surfaces | `foundry/ops/skills/agent-ready/SKILL.md` |
| On-page SEO: title/meta/canonical/OG/JSON-LD/hreflang/sitemap coverage | `foundry/ops/skills/seo-audit/SKILL.md` |
| Performance: Core Web Vitals, Lighthouse distributions, "why is X slow" | `foundry/ops/skills/psi-swarm/SKILL.md` |
| Outcome trends: SERP classes over time, "did results move", weekly run | `foundry/ops/skills/geo-observatory/SKILL.md` |
| Public usability: click around, guest journeys, blank/broken pages, navigation, search/detail, downloads, primary product actions | `foundry/ops/skills/public-product-smoke/SKILL.md` |

## Combined mode — "full health check"

For "audit everything", "full health check", "fleet health scorecard", one
product or `--all`:

```bash
node foundry/ops/scripts/site-health-scorecard.mjs --all       # whole registry
node foundry/ops/scripts/site-health-scorecard.mjs --id pace   # one product
```

This live-probes GEO surfaces (agent-index-audit), reads the latest
geo-observatory trend classes from the ledger, and folds in the most recent
seo/perf artifacts when present (it does not re-run those heavier audits —
invoke their subskills for fresh data). Output:
`foundry/ops/docs/site-health-latest.md` — one row per product with a
worst-problem note. Report the Problems section to the user, not the raw
table dump.

## Conventions (all subskills)

- Targets resolve via `foundry/ops/scripts/lib/registry.mjs`
  (agent-surfaces-registry.json is the canonical product list).
- Reports land at `foundry/ops/docs/<skill>-latest.md`.
- Evidence over vibes: cite URLs/numbers for every failing grade.
