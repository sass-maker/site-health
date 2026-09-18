# SEO fleet sweep — 2026-09-18

One-shot run of every fleet-capable SEO skill against the visibility contract
(20 maintained, live-domain products). Prerequisite fix:
`saas-maker/tooling/lib/visibility-projects.mjs` read a stale scalar
`lifecycle === 'maintained'` and selected zero projects; ported the
object-aware lifecycle handling from `apps/backend/lib/visibility-projects.mjs`
(committed in saas-maker on `feat/clarity-journeys-complete`).

## Results

| Skill | Command | Result |
|---|---|---|
| seo-audit | `seo-audit-fleet.mjs --all` | 20/20 homepages pass |
| agent-ready | `agent-index-audit.mjs --all` | 18/20 S-tier |
| canonical-root audit | `ahrefs-site-audit-health.mjs` | 7 roots, 223 pages, 0 issues |
| geo-observatory | 28 root queries → `--root-search` | 15 A · 1 B · 12 C; 13 movers, all up |
| content-coverage | `content-inventory.mjs --product <id> --live` | inventories below |

Artifacts: `apps/backend/data/seo-audit/latest.json`,
`apps/backend/data/geo-observatory/ledger.jsonl` +
`docs/geo-observatory-latest.md` (committed),
`saas-maker/tooling/docs/ahrefs-site-audit-latest.md`.

## Needs attention

1. **App Health** (`health.sassmaker.com`) — agent tier A:
   `/api/ai` returns an HTML shell instead of the JSON catalog; catalog
   integrity 0/0 surfaces.
2. **Look Sideways** (`paths.significanthobbies.com`) — agent tier C floor:
   JSON-LD declares "Paths" but no identity record holds that name
   (`unrecorded` name_agreement conflict). Either record the name or fix the
   JSON-LD to "Look Sideways".
3. **seo-audit warnings** — `json-ld` warnings on anchor, calorie,
   high-signal, karte, kith, live, setline, starboard, storagedaddy;
   `word-count` thin-content warning on anime-list; `meta-description` on
   storagedaddy.
4. **GEO category/problem gap is systemic** — every product holds A on brand
   and exact-domain queries, but 12 of 14 category/problem queries are C.
   Non-brand discovery is the open SEO front; see Movers in
   `geo-observatory-latest.md`.
5. **Karte brand collision persists** — "Karte AI profile" is B (visible only
   via GitHub at #2; Kart AI/Karta/Karti own the SERP).
6. **SaaS Maker collision watch** — `sassmaker.com` holds #1 for "SaaS Maker
   software studio" but colliding `saasmaker.com` sits #2-3.

## Content inventory (live sitemap + repo pages)

| Product | Pages | Notable archetype mix |
|---|---|---|
| posttrainllm | 310 | how-to 4, integration 5, comparison 4, proof 7 |
| swe-interview-prep | 128 | mostly `other` |
| live | 124 | comparison 4 |
| karte | 100 | glossary/use-case/proof present |
| starboard | 82 | comparison 1, integration 1 |
| pace | 50 | `other` heavy |
| anime-list | 44 | feature 1 |
| high-signal | 44 | feature 2, integration 1 |
| knowledge-base | 33 | feature 2, integration 2 |
| what-it-takes-to-win | 33 | comparison/glossary/proof 1 each |
| free-ai | 28 | how-to 2, feature 2 |
| codevetter | 21 | comparison 3, proof 3 |
| app-health | 19 | integration 2 |
| saas-maker | 9 | `other` only |
| setline, kith, anchor | 7 each | `other` only |
| calorie | 4 | `other` only |
| significanthobbies | 3 | `other` only (SPA; sitemap thin) |
| storagedaddy | 1 | `other` only |

## Follow-ups (not run)

- **seo-research** — per-product keyword/competitor/backlink protocol; the
  category/problem SERPs observed today are its raw input. Best next targets:
  codevetter, pace, high-signal, karte (P1/focus products with C-class
  category visibility).
- **content-coverage verdicts** — fleet inventory is done; gap/create
  decisions need the per-product workflow (competitor evidence + manifest
  approval).
- **link-graph gate** — `link-graph-audit.mjs --sitemap <url> --external` per
  site; canonical-root crawl already covered the 7 root domains.
- **psi-swarm** — performance/CWV pass; adjacent to SEO, not run here.
