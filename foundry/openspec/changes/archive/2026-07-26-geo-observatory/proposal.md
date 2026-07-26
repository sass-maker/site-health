# Proposal: GEO Observatory — outcome measurement for the fleet

## Why

The fleet has now invested heavily in GEO/SEO plumbing (surfaces, canonicals,
sitemaps, IndexNow, content queues) but has **zero outcome measurement**: no
one can say whether any product gained SERP position, index coverage, or AI
citations. The 2026-07-17 audit's discoverability check was a one-off manual
snapshot. The user's stated end goal is results — results require a trend
line, not a snapshot.

## What

A recurring, agent-executed measurement system:

1. **Query config** (`foundry/ops/config/geo-observatory.json`): per tracked
   product, the exact brand/category/citation queries to probe, stable
   across runs so results are comparable.
2. **Observation protocol** (`foundry/ops/skills/geo-observatory/SKILL.md`):
   how an agent (the designated host's versioned Codex cron) runs the probes with live web
   search, classifies each query A/B/C, and records evidence. Judgment +
   web access is why this is an agent protocol, not a cron script.
3. **Ledger + report** (`foundry/ops/scripts/geo-observatory-record.mjs`):
   appends validated observations to
   `foundry/ops/data/geo-observatory/ledger.jsonl` and regenerates
   `foundry/ops/docs/geo-observatory-latest.md` — per-product trend table
   (last runs side by side), movers, and regressions.
4. **Weekly schedule**: the designated operations host runs the protocol
   through Fleet's versioned Codex cron. A fresh clone remains inert until the
   operator explicitly installs the checked-in schedule.
5. Baseline: the 2026-07-17 audit discoverability results are seeded as
   observation #1 so week 2 already shows deltas.

## Phase 2 (deferred, separate apply)

Edge AI-crawler telemetry (count GPTBot/ClaudeBot/PerplexityBot hits per
host via the agent-edge layer + Workers Analytics Engine). Deferred until
the fleet-jsonld-emission work in `apply-agent-surfaces.mjs` lands, to avoid
colliding in the shared distribution scripts.

## Out of scope

- GSC API ingestion (needs GSC onboarding B2 + a service account first;
  natural phase 3).
- Automated Perplexity/ChatGPT probing via their products' UIs (ToS risk);
  citation checks use engine APIs only where keys exist, else web-search
  proxies (documented per-engine in the skill).

## Risks

- SERP volatility/personalization noise → mitigated by stable queries,
  A/B/C coarse classes (not rank positions), and weekly cadence.
- Scheduled-agent cost → explicitly accepted by the user ("a lot of
  credits"); one run ≈ one focused search session.
