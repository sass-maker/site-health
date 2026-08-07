# Ten root domains scorecard — 2026-08-07

**Not done.** Technical access is broadly green; **demand, CTR, and authority are not.**

## The 10 roots

From `foundry/ops/config/root-brands.json`:

| # | Domain | Product |
| ---: | --- | --- |
| 1 | aliveville.com | Aliveville |
| 2 | codevetter.com | CodeVetter |
| 3 | heypace.app | Pace |
| 4 | highsignal.app | High Signal |
| 5 | karte.cc | Karte |
| 6 | posttrainllm.com | PostTrainLLM |
| 7 | rolepatch.com | RolePatch |
| 8 | sarthakagrawal.dev | Personal |
| 9 | sassmaker.com | SaaS Maker / portfolio |
| 10 | significanthobbies.com | Significant Hobbies |

## Definition of “good place” (pass bar)

A root is **good** only if **all** hold:

| Layer | Pass |
| --- | --- |
| **T1 Technical** | HTTP 200 homepage, indexed (GSC or inspection), `robots` allows, real title + description, `llms.txt` (or equivalent) |
| **T2 Demand** | ≥100 brand or category impressions / 28d **or** clear upward trend; not only typo/collision queries |
| **T3 CTR** | Homepage or hero asset CTR ≥1% when impressions ≥50, or clicks ≥5 / 28d |
| **T4 Intent** | Ranking pages match intended job (not wrong vertical, e.g. school “ATS exam”) |
| **T5 Authority** | DR ≥15 **or** ≥3 non-owned referring domains with real mentions (manual ledger) |

Today **no root passes T2–T5 together.** Most pass T1 only.

## Live scoreboard (this run)

| Domain | DR | Home | llms | GSC impr | Clicks | Avg pos | Indexed | Verdict |
| --- | ---: | --- | --- | ---: | ---: | ---: | --- | --- |
| aliveville.com | 7 | 200 | 200 | 22 | 0 | 40 | yes | T1 only; typo queries |
| **codevetter.com** | 4.4 | 200 | 200 | 69 | 0 | **8.2** | yes | **Near CTR win** — title shipped |
| **heypace.app** | 2.3 | 200 | 200 | 196 | 1 | 10.4 | yes | Comparisons work; home CTR shipped |
| highsignal.app | 7 | 200 | 200 | 6 | 0 | 3.8 | yes | Tech strong; demand empty |
| karte.cc | 7 | 200 | 200 | 11 | 0 | 31 | yes | Brand collision noise |
| **posttrainllm.com** | 2.3 | 200 | 200 | **1158** | 3 | 12.4 | yes | **Volume leader** — train pages shipped |
| **rolepatch.com** | 4.8 | 200 | 200 | **456** | 0 | **54** | yes | **Wrong-intent ATS traffic** |
| sarthakagrawal.dev | 6 | 200 | 200 | 49–56 | 1 | ~12 | yes | Brand queries weak pos |
| sassmaker.com | 7 | 200 | 200 | 181 | 1 | 17 | yes | Portfolio / site: queries |
| significanthobbies.com | 7 | 200 | 200 | 23–35 | 0 | ~6 | yes | Thin category demand |

GSC window ≈ 2026-07-08 → 2026-08-04 (homepage or property collect). DR from fleet `fleet-dr.json` refresh.

## Owner priority (unchanged)

**P0 core three:** CodeVetter, PostTrainLLM, Pace  
**P1 volume outliers:** RolePatch (456 impr / 0 clicks), SaaS Maker  
**P2 portfolio / brand:** personal, Significant Hobbies, Aliveville, Karte, High Signal  

High Signal is **not** the priority path for “all 10 good.”

## What’s already done (not the end)

- Ahrefs DR path + weekly cron; **Pages secret still blocked** by CF token perms  
- Focus owned pages + IndexNow for core three  
- PostTrainLLM train-intent pages + 3 awesome-list PRs (open)  
- CodeVetter / Pace homepage CTR titles **deployed**  
- Footer links, marketing ownership registry  

## Remaining program (all 10)

### Wave A — Core three (finish)

| Domain | Next actions |
| --- | --- |
| posttrainllm.com | Land awesome PRs; re-IndexNow train URLs; improve DPO/blog titles still ranking mid-SERP; remeasure CTR in 2–4 weeks |
| codevetter.com | Benchmark SERP title/snippet; one code-review awesome list; more internal links to `/benchmark` |
| heypace.app | CTR on top `/compared/*` pages (OpenFelix etc.); ensure competitor pages have unique titles |

### Wave B — High volume / wrong intent

| Domain | Next actions |
| --- | --- |
| rolepatch.com | Retarget `/blog/ats-score-explained` for **resume/job-seeker ATS** (not school exams); title/desc/H1; optional FAQ schema; new page for “resume ATS score” exact intent |
| sassmaker.com | Homepage/category clarity for “SaaS portfolio studio”; product cards with real one-liners; less dependence on `site:` queries |

### Wave C — Brand establishment

| Domain | Next actions |
| --- | --- |
| sarthakagrawal.dev | Own “Sarthak Agrawal” top-3; link all 10 products; projects page as hub |
| significanthobbies.com | One strong hobby-journey pillar; internal links to subproducts |
| aliveville.com | Category page for “AI world simulator”; reduce typo-only impressions |
| karte.cc | Disambiguate brand vs “Elkarte”; category “inbound agent personal page” |
| highsignal.app | Only after A/B capacity: hubs + related signals (Digg shape) |

### Wave D — Authority (all roots, slow)

- Legitimate list PRs / mentions **per product** (already started for PostTrainLLM)  
- Personal hub linking to all 10  
- No bulk directory spam  
- Remeasure DR monthly; expect single digits for months without real mentions |

## Measurement cadence

| Cadence | Action |
| --- | --- |
| Weekly | `search-console-collect` for all 10 projectIds; IndexNow changed URLs |
| Weekly | DR refresh (Actions + drank; set Pages AHREFS key before 2026-08-10) |
| Biweekly | Update this scorecard pass/fail columns |
| Monthly | Authority ledger (referring domains, list acceptances) |

## Immediate next agent batch (recommended)

1. RolePatch resume-ATS blog SEO (in progress)  
2. CodeVetter benchmark page title/CTR  
3. Pace top comparison page titles  
4. Personal site hub links to all 10 roots  
5. Remeasure GSC all 10 after deploys  

**Done criteria for “all 10 in a good place”:** every root passes T1–T4; T5 for at least the P0 three and portfolio hubs.
