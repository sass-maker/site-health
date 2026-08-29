# Fleet web landing qualification

Checked 2026-08-29. This report covers the canonical Fleet catalog, excluding Apple-native application surfaces.

## Outcome

- Canonical projects reviewed: **56/56**
- Independently qualified web surfaces: **49**
- Surfaces meeting every numeric gate at 90 or above: **49/49**
- Sub-90 numeric gates: **0**
- Projects with no applicable public web surface: **6**
- Shared private landing factory: **1** — `ios-landings`; Anchor and Motion are qualified individually
- Full landing migrations deferred: **0**
- Standalone pages deferred: **0** — Chess `/faq` was repaired in place without a template migration
- Production landing deployments performed by this work: **3** — Chess, Materia, and TrueHire

The ranking is purpose-first: content and product-purpose truth is weighted 40%, design 20%, SEO 15%, GEO/agent readiness 15%, and performance 10%. The 90-point floor remains non-compensating: a strong weighted score cannot hide a weak gate.

## Ranked web surfaces

Production links are the stable public surfaces. They are not represented as latest-source previews where local changes remain undeployed.

| Rank | Product | Priority | Purpose | Design | SEO | GEO | Perf | Weighted | Floor | Public surface |
|---:|---|:---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | What It Takes to Win | P4 | 100 | 97 | 100 | 100 | 98 | 99.2 | 97 | [Open](https://paths.significanthobbies.com/) |
| 2 | Karte | P2 | 100 | 97 | 99 | 100 | 97 | 99.0 | 97 | [Open](https://karte.cc/) |
| 3 | Reddit Insights | P4 | 99 | 97 | 100 | 100 | 98 | 98.8 | 97 | [Open](https://reddit-insights.highsignal.app/) |
| 4 | Verified Bases | P4 | 100 | 95 | 100 | 100 | 97 | 98.7 | 95 | [Latest candidate](https://vary-veteran-century-command.trycloudflare.com/) |
| 5 | Kith | P2 | 99 | 97 | 98 | 100 | 100 | 98.7 | 97 | [Open](https://kith.significanthobbies.com/) |
| 6 | Reader | P2 | 99 | 97 | 98 | 100 | 100 | 98.7 | 97 | [Open](https://read.significanthobbies.com/) |
| 7 | Local AI Video Studio | P2 | 100 | 94 | 100 | 100 | 98 | 98.6 | 94 | [Open](https://local-ai-video-studio.sassmaker.com/) |
| 8 | RolePatch | P2 | 100 | 94 | 99 | 100 | 100 | 98.6 | 94 | [Open](https://rolepatch.com/) |
| 9 | Journal | P2 | 99 | 97 | 98 | 100 | 99 | 98.6 | 97 | [Open](https://journal.significanthobbies.com/) |
| 10 | Setline | P2 | 99 | 97 | 98 | 100 | 99 | 98.6 | 97 | [Open](https://setline.significanthobbies.com/) |
| 11 | Email Manager | P4 | 99 | 96 | 99 | 100 | 99 | 98.6 | 96 | [Open](https://mail.significanthobbies.com/) |
| 12 | Calorie | P2 | 99 | 96 | 98 | 100 | 100 | 98.5 | 96 | [Open](https://calorie.significanthobbies.com/) |
| 13 | India Standards | P4 | 100 | 94 | 100 | 100 | 96 | 98.4 | 94 | [Open](https://india-standards.significanthobbies.com/) |
| 14 | Significant Hobbies | P2 | 99 | 97 | 96 | 100 | 100 | 98.4 | 96 | [Open](https://significanthobbies.com/) |
| 15 | High Signal Podcasts | P2 | 98 | 96 | 99 | 100 | 100 | 98.3 | 96 | [Open](https://podcasts.highsignal.app/) |
| 16 | Sarthak Agrawal | P4 | 99 | 96 | 100 | 100 | 94 | 98.2 | 94 | [Open](https://sarthakagrawal.dev/) |
| 17 | TrueHire | P4 | 99 | 95 | 100 | 100 | 96 | 98.2 | 95 | [Open](https://truehire.rolepatch.com/) |
| 18 | Research Papers | P2 | 98 | 96 | 99 | 100 | 98 | 98.1 | 96 | [Open](https://papers.highsignal.app/) |
| 19 | Knowledge Base | P2 | 98 | 95 | 99 | 100 | 100 | 98.1 | 95 | [Open](https://knowledgebase.sassmaker.com/) |
| 20 | Web Playables | P4 | 99 | 94 | 100 | 100 | 95 | 97.9 | 94 | [Open](https://idle.aliveville.com/) |
| 21 | Open Historia | P4 | 98 | 95 | 100 | 100 | 97 | 97.9 | 95 | [Open](https://historia.aliveville.com/) |
| 22 | PostTrainLLM | P1 | 98 | 94 | 100 | 100 | 99 | 97.9 | 94 | [Open](https://posttrainllm.com/) |
| 23 | SaaS Maker | P2 | 97 | 96 | 100 | 100 | 99 | 97.9 | 96 | [Open](https://sassmaker.com/) |
| 24 | Mashup | P2 | 99 | 94 | 98 | 100 | 96 | 97.7 | 94 | [Open](https://mashup.highsignal.app/) |
| 25 | PSI Swarm | P4 | 99 | 94 | 98 | 100 | 96 | 97.7 | 94 | [Open](https://performance.sassmaker.com/) |
| 26 | Memory Map | P2 | 98 | 96 | 99 | 100 | 94 | 97.7 | 94 | [Open](https://chatgpt.significanthobbies.com/) |
| 27 | Anime List | P4 | 100 | 94 | 96 | 96 | 99 | 97.5 | 94 | [Open](https://anime.significanthobbies.com/) |
| 28 | Recipe Index | P4 | 100 | 95 | 100 | 96 | 91 | 97.5 | 91 | [Open](https://veg-protein-food.significanthobbies.com/) |
| 29 | Free AI | P4 | 99 | 93 | 96 | 100 | 99 | 97.5 | 93 | [Open](https://ai-gateway.sassmaker.com/) |
| 30 | Anchor | P2 | 99 | 92 | 98 | 100 | 98 | 97.5 | 92 | [Open](https://anchor.significanthobbies.com/) |
| 31 | High Signal | P2 | 98 | 95 | 100 | 100 | 93 | 97.5 | 93 | [Open](https://highsignal.app/) |
| 32 | IssuePages | P4 | 100 | 96 | 97 | 90 | 99 | 97.2 | 90 | [Open](https://issues.sarthakagrawal.dev/) |
| 33 | Office OS | P1 | 96 | 96 | 100 | 100 | 96 | 97.2 | 96 | [Open](https://office-os.sassmaker.com/) |
| 34 | LoopTV | P4 | 100 | 92 | 100 | 96 | 90 | 96.8 | 90 | [Open](https://tv.significanthobbies.com/) |
| 35 | AliveVille | P4 | 98 | 94 | 97 | 100 | 91 | 96.6 | 91 | [Open](https://aliveville.com/) |
| 36 | App Health | P2 | 97 | 93 | 100 | 100 | 92 | 96.6 | 92 | [Open](https://health.sassmaker.com/) |
| 37 | CodeVetter | P1 | 96 | 91 | 100 | 100 | 99 | 96.5 | 91 | [Open](https://codevetter.com/) |
| 38 | GitStat | P2 | 96 | 92 | 99 | 100 | 97 | 96.4 | 92 | [Open](https://git.significanthobbies.com/) |
| 39 | Materia | P4 | 99 | 95 | 99 | 92 | 91 | 96.4 | 91 | [Open](https://materia.significanthobbies.com/) |
| 40 | Motion | P2 | 99 | 91 | 94 | 100 | 94 | 96.3 | 91 | [Open](https://motion.significanthobbies.com/) |
| 41 | EverythingRated | P4 | 99 | 94 | 98 | 92 | 93 | 96.2 | 92 | [Open](https://ratings.highsignal.app/) |
| 42 | Live | P2 | 94 | 94 | 99 | 100 | 98 | 96.1 | 94 | [Open](https://live.significanthobbies.com/) |
| 43 | HeyPace | P1 | 94 | 93 | 100 | 100 | 99 | 96.1 | 93 | [Open](https://heypace.app/) |
| 44 | Chess | P4 | 97 | 93 | 96 | 100 | 93 | 96.1 | 93 | [Open](https://chess.significanthobbies.com/) |
| 45 | Protein Index | P4 | 96 | 94 | 96 | 100 | 94 | 96.0 | 94 | [Open](https://protein.significanthobbies.com/) |
| 46 | SWE Interview Prep | P2 | 96 | 93 | 97 | 100 | 94 | 96.0 | 93 | [Open](https://learn.significanthobbies.com/) |
| 47 | Starboard | P2 | 95 | 95 | 94 | 100 | 96 | 95.7 | 94 | [Open](https://starboard.codevetter.com/) |
| 48 | Drank | P4 | 95 | 91 | 96 | 100 | 98 | 95.4 | 91 | [Open](https://domains.sassmaker.com/) |
| 49 | Field Track | P2 | 94 | 90 | 100 | 100 | 98 | 95.4 | 90 | [Open](https://field-track.sassmaker.com/) |

## Latest-source candidates currently online

These Cloudflare Tunnel links were re-probed and returned HTTP 200 on 2026-08-29. They are temporary and may expire. Candidates that returned 502, 530, or timed out are intentionally omitted.

- [Anime List](https://realized-die-juvenile-waiting.trycloudflare.com/)
- [EverythingRated](https://silicon-tunnel-buttons-over.trycloudflare.com/)
- [Free AI](https://regularly-pools-liberty-fully.trycloudflare.com/)
- [India Standards](https://commitments-contractor-sole-light.trycloudflare.com/)
- [IssuePages](https://predicted-recognize-bridge-knowledgestorm.trycloudflare.com/)
- [LoopTV](https://quarter-quick-variance-rivers.trycloudflare.com/)
- [Open Historia](https://varied-wines-alice-located.trycloudflare.com/)
- [Sarthak Agrawal](https://usage-modeling-cattle-offshore.trycloudflare.com/)
- [Protein Index](https://varieties-threatened-carb-attacked.trycloudflare.com/)
- [PSI Swarm](https://adoption-boots-belts-york.trycloudflare.com/)
- [Recipe Index](https://goat-administrator-joan-feat.trycloudflare.com/)
- [Reddit Insights](https://mirror-fossil-cash-honey.trycloudflare.com/)
- [Significant Hobbies](https://follow-quoted-hence-correctly.trycloudflare.com/)
- [Verified Bases](https://vary-veteran-century-command.trycloudflare.com/)
- [Web Playables](https://magazines-tommy-picks-pointed.trycloudflare.com/)
- [What It Takes to Win](https://contained-heath-partially-backup.trycloudflare.com/)

## Non-public and shared cases

- ChatGPT Connections — shared infrastructure; audit its consuming products instead
- Companion Robot — no public web surface
- Forecast Lab — no public web surface
- Mobile Dev Cockpit — archived local tool; no public web surface
- Reel Pipeline — held operator workflow with no proven public loop
- Site Health — private portfolio dashboard
- `ios-landings` — private shared factory, not an independent product page; Anchor and Motion are scored above

## Performance qualification notes

- **Chess (P4): performance 93.** A five-run, four-profile PSI Swarm through the gzip-enabled candidate tunnel scored 93 on slow mobile and 100 on every other profile. Coverage-weighted LCP is 1.07 seconds, CLS is 0.000, and TBT is 1 ms. Stockfish remains absent from initial traffic and loads only after **Start practice**.
- **Materia (P4): performance 91.** A five-run, four-profile PSI Swarm through the gzip-enabled candidate tunnel scored 91 on slow mobile and 100 on every other profile. Coverage-weighted LCP is 1.21 seconds, CLS is 0.008, and TBT is 0 ms. The 3D renderer and model remain absent from initial traffic and load only after intent.
- The superseded 88 scores measured uncompressed Vite localhost responses. Cloudflare Pages and Cloudflare Tunnel compress the actual HTML delivery, so those localhost results were not production-equivalent evidence.
