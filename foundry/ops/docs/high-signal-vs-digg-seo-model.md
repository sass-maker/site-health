# High Signal vs Digg — SEO model (not backlinks)

**Intent:** Treat Digg as a **product/SEO architecture reference** for High Signal  
(social/tech story discovery), **not** as a place to drop HS links.

**Digg example story shape:** `https://digg.com/tech/3a488ugi`  
→ category hub (`/tech`) + unique story URL + news headline + discussion.

---

## Product analogy

| Layer | Digg | High Signal |
| --- | --- | --- |
| Category | Tech / news / etc. hubs | `/sectors`, `/signals/types/*`, intelligence guides |
| Story unit | Digg post / discussion | Published **signal** `/signals/{slug}` |
| Daily package | Front page / channel | `/brief`, `/signals/today` |
| Trust surface | Votes / comments (social) | **Track record**, methodology, multi-source gate |
| Domain authority | Strong legacy brand | Early (GSC: ~6 impressions on root) |

High Signal is already closer to Digg than to a static SaaS landing page:  
**~5.5k sitemap URLs**, many of them story-shaped signal pages.

---

## What Digg is “good at” for SEO (steal these)

1. **Indexable story corpus at scale** — every story is its own URL with a  
   human headline, not buried in a SPA feed.
2. **Category hubs** — `/tech` aggregates and passes equity to stories.
3. **Headline-as-title** — titles match how people search/share news.
4. **Story blurbs** — descriptions read as news, not product copy.
5. **Freshness** — news URLs are treated as frequently changing.
6. **Internal graph** — related stories / channel → story → topic.
7. **Brand + velocity** — Digg’s domain rating and share loops amplify what  
   HS must earn with evidence and mentions.

---

## What High Signal already has (good)

| Surface | Status |
| --- | --- |
| `/signals/{slug}` with title = headline | Yes |
| Article JSON-LD on eligible signals | Yes |
| Canonical per signal | Yes |
| Large sitemap (signals + entities + briefs) | Yes (~5.5k URLs observed) |
| `llms.txt` / `/api/ai` / markdown alternates | Yes (agent-ready) |
| Public methodology + track record | Stronger than Digg on **truth**, weaker on **reach** |

---

## Gaps vs Digg-shaped SEO (actionable)

| Gap | Digg pattern | HS today | Do next |
| --- | --- | --- | --- |
| Meta description | Story summary | Was score line (`BULL · 72 · …`) | **Use story blurb** (code change below) |
| Sitemap freshness | News-like | Signals marked `monthly` | **`daily` + priority 0.8** |
| Category landing SEO | `/tech` ranks | Guides exist; less “live feed hub” | Strengthen `/signals/types/*` and sector pages as hubs |
| Root demand | digg.com branded searches | ~6 root impressions | Brand + citable assets; not more llms.txt |
| Share loops | Native digg/social | Weak external loops | Selective placements + original briefs worth citing |
| Description quality on OG | Full story | Improved when blurb used | Same as meta |

**Important:** Digg’s SEO advantage is mostly **corpus + brand + linking**, not  
magic meta tags. HS technical access is already strong; **discovery demand is not**.

---

## GSC reality check (HS)

Latest focus collect (homepage scope, period ~2026-07-08 → 2026-08-04):

- Root impressions: **6**, clicks: **0**
- One long-tail signal URL appeared for a SEC JSON query (not brand demand)

So: **architecture can be Digg-like; authority and branded/category demand are not yet.**

---

## Product SEO roadmap (Digg-informed)

### P0 — Story pages win SERPs

1. Headline + **blurb** meta (ship).
2. Signal sitemap `daily` (ship).
3. Ensure every published signal has ≥2 sources **and** a first-paragraph summary  
   that could stand as a Digg-style lede.

### P1 — Hubs pass equity

1. Treat `/signals/types/{type}` and `/sectors` as Digg “channels”:  
   intro copy, stable titles, links to latest 20 stories.
2. Add “related signals” block on signal pages (internal graph).

### P2 — Demand, not plumbing

1. Publish 1–2 **category-defining** pages per month that match unbranded  
   queries (already started: intelligence guides).
2. Earn mentions with **track-record / methodology** stories, not directory spam.
3. Re-measure GSC: impressions on `/signals/*` and type hubs, not only root.

---

## What not to copy from Digg

- Engagement bait without sources  
- Infinite low-quality story volume for its own sake  
- Soft-404 feeds that look full to users but empty to crawlers  

HS differentiator should remain: **cite-or-kill + public ledger**, while borrowing  
Digg’s **story URL + hub + headline** SEO shape.
