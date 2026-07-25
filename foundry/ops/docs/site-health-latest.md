# Site health — fleet scorecard

Generated 2026-07-24 by `site-health-scorecard.mjs`. GEO is live-probed;
seo/perf columns read the latest saved artifacts ("–" = no artifact yet — run
the seo-audit / psi-swarm subskills to populate); trend reads the
geo-observatory ledger. Do not edit by hand.

**GEO: 20/25 S-tier.**

| product | GEO | seo | perf p75 | trend |
|---|---|---|---|---|
| codevetter | S 100% | – | – | brand:A |
| rolepatch | S 100% | – | – | brand:B |
| high-signal | S 100% | – | – | brand:C |
| karte | S 100% | – | – | – |
| significanthobbies | S 100% | – | – | brand:C |
| materia | S 100% | – | – | – |
| starboard | S 100% | – | – | – |
| everythingrated | S 100% | – | – | – |
| truehire | S 100% | – | – | – |
| research-papers | S 100% | – | – | – |
| posttrainllm | S 100% | – | – | brand:C |
| pace | S 100% | – | – | brand:C |
| drank | S 100% | – | – | – |
| looptv | S 100% | – | – | – |
| anime-list | A 86% | – | – | – |
| chess | S 100% | – | – | – |
| reader | S 100% | – | – | – |
| email-manager | S 100% | – | – | – |
| free-ai | S 100% | – | – | – |
| swe-interview-prep | S 100% | – | – | – |
| psi-swarm | C 14% | – | – | – |
| protein-index | S 100% | – | – | – |
| open-historia | A 86% | – | – | – |
| knowledgebase-app | C 14% | – | – | – |
| saas-ideas | A 86% | – | – | – |

## Problems (worst first per product)

- **anime-list** — api_ai: HTML shell instead of JSON
- **psi-swarm** — sitemap: https://performance.sassmaker.com/sitemap.xml: HTML/SPA shell, not XML; https://performance.sassmaker
- **open-historia** — api_ai: HTTP 404
- **knowledgebase-app** — sitemap: https://search.sassmaker.com/sitemap.xml: HTTP 404; https://search.sassmaker.com/sitemap-index.xml: H
- **saas-ideas** — api_ai: HTML shell instead of JSON
