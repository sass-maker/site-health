# Fleet readiness journey — where each project stands

Generated 2026-09-27 from live evidence: catalog, local checkouts, deploy status, DRANK, fresh SEO audit (today), agent-index audit (today), Clarity cached health, GSC/PSI/AI-awareness caches, and the launch-submission ledger.

The journey is sequential: a project's **current stage** is the first step that is not yet passing. Stages marked ➖ are intentionally not applicable (internal tools, app-only surfaces).

| # | Stage | What "passing" means |
|---|---|---|
| 1 | Catalog | Registered, has domains + purpose contract |
| 2 | Repo | Checkout present, PROJECT_STATUS/README, CI, tests |
| 3 | Deploy | Production deploy live |
| 4 | Domain | Public domain configured on a live deploy |
| 5 | SEO | Fresh technical audit, 0 failures |
| 6 | GEO/agents | Agent-index audit S-tier (llms.txt, /api/ai, markdown, HEAD parity) |
| 7 | Analytics | Clarity wired and measured |
| 8 | Evidence | PSI, GSC, DRANK and AI-awareness observations present |
| 9 | Launch | ≥5 directory submissions recorded |

## How to read this

- **Current stage** = the first step not fully passing. Everything after it can still have gaps — see the per-project gap list.
- **Stage 8 (Evidence) partial** is dominated by collector coverage, not product defects: DRANK has only observed a handful of root domains, and some subdomains have no GSC property. Widening the collectors moves most stage-8 projects forward without product work.
- **➖ not applicable** marks stages intentionally out of scope — e.g. Fleet Social is internal, so SEO/GEO/analytics/launch do not apply.
- The checklist is computed, not hand-maintained: every cell traces to a catalog field or a dated evidence artifact.

## Portfolio matrix

| Project | Cat | Repo | Dep | Dom | SEO | GEO | Ana | Evid | Lch | Current stage |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| CodeVetter | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 2 · Repo |
| HeyPace | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ | 5 · SEO |
| PostTrainLLM | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ | 5 · SEO |
| Live | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| ChatGPT Connections | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 🟡 | 🟡 | 5 · SEO |
| SaaS Maker | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 🟡 | ✅ | 6 · GEO/agents |
| GitStat | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ | ❌ | 🟡 | ✅ | 2 · Repo |
| Fleet Social | ✅ | 🟡 | ✅ | ✅ | ❌ | ➖ | ➖ | 🟡 | ➖ | 2 · Repo |
| Kinetic | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ❌ | 🟡 | ✅ | 5 · SEO |
| Memory Map | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | ✅ | 5 · SEO |
| Free AI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | ✅ | 7 · Analytics |
| High Signal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| High Signal Podcasts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 7 · Analytics |
| IssuePages | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ❌ | 🟡 | 🟡 | 5 · SEO |
| Research Papers | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 6 · GEO/agents |
| Knowledge Base | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 2 · Repo |
| Significant Hobbies | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| Anime List | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ | 5 · SEO |
| LoopTV | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | ✅ | 7 · Analytics |
| Reader | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 7 · Analytics |
| SWE Interview Prep | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| Calorie | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| Setline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| Kith | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 2 · Repo |
| RolePatch | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 🟡 | 🟡 | ✅ | 5 · SEO |
| Karte | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| Starboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| AliveVille | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ❌ | 🟡 | 🟡 | 5 · SEO |
| App Health | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| Mashup | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | 5 · SEO |
| Motion | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 7 · Analytics |
| Open Historia | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ | 🟡 | 🟡 | 6 · GEO/agents |
| Web Playables | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ | 🟡 | 🟡 | 6 · GEO/agents |
| Paths | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ | 5 · SEO |
| Sarthak Agrawal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | ✅ | 7 · Analytics |
| Field Track | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 7 · Analytics |
| Reddit Insights | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | 🟡 | 2 · Repo |
| Anchor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| Nomad Data Adventure | ✅ | 🟡 | ✅ | ✅ | ❌ | 🟡 | ❌ | 🟡 | ✅ | 2 · Repo |
| storagedaddy | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ | 5 · SEO |
| BrowserDaddy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| PerformanceDaddy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 8 · Evidence |
| Unified Portfolio | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 🟡 | 🟡 | 5 · SEO |
| Meme Lab | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | ✅ | 🟡 | 🟡 | 5 · SEO |
| Browser Agent Testing | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | ❌ | 🟡 | 🟡 | 5 · SEO |
| Formula Composition Engine | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | ✅ | 🟡 | 🟡 | 5 · SEO |
| Every Song Is a Website | ✅ | ❌ | ✅ | ✅ | ❌ | 🟡 | ✅ | 🟡 | 🟡 | 2 · Repo |
| ContextDaddy | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 2 · Repo |
| MentionPilot | ✅ | 🟡 | ✅ | ✅ | ❌ | 🟡 | ✅ | 🟡 | 🟡 | 2 · Repo |
| DaddyRad | ✅ | ❌ | ✅ | ✅ | ❌ | 🟡 | ✅ | 🟡 | 🟡 | 2 · Repo |

## Journey positions

### Stage 2 · Repo — 11 projects

- **CodeVetter** — gaps: Repo (partial: tests); Evidence (partial: DRANK)
- **GitStat** — gaps: Repo (partial: tests); SEO (partial); Analytics; Evidence (partial: PSI, GSC, DRANK)
- **Fleet Social** — gaps: Repo (partial: project_status); SEO; Evidence (partial: PSI, GSC, DRANK)
- **Knowledge Base** — gaps: Repo (partial: tests); Evidence (partial: GSC, DRANK)
- **Kith** — gaps: Repo (partial: tests); Evidence (partial: DRANK)
- **Reddit Insights** — gaps: Repo (partial: project_status); Analytics; Evidence (partial: GSC, DRANK); Launch (partial)
- **Nomad Data Adventure** — gaps: Repo (partial: project_status); SEO; GEO/agents (partial: B 36%); Analytics; Evidence (partial: PSI, GSC, DRANK)
- **Every Song Is a Website** — gaps: Repo (project_status, readme, tests); SEO; GEO/agents (partial: A 55%); Evidence (partial: PSI, GSC, DRANK); Launch (partial)
- **ContextDaddy** — gaps: Repo (partial: project_status); Evidence (partial: PSI, GSC, DRANK); Launch
- **MentionPilot** — gaps: Repo (partial: project_status); SEO; GEO/agents (partial: A 55%); Evidence (partial: PSI, GSC, DRANK); Launch
- **DaddyRad** — gaps: Repo (project_status, readme, tests); SEO; GEO/agents (partial: A 55%); Evidence (partial: PSI, GSC, DRANK); Launch

### Stage 5 · SEO — 16 projects

- **HeyPace** — gaps: SEO (partial); Evidence (partial: DRANK)
- **PostTrainLLM** — gaps: SEO (partial); Evidence (partial: DRANK)
- **ChatGPT Connections** — gaps: SEO; GEO/agents (C 18%); Analytics; Evidence (partial: PSI, GSC, DRANK); Launch
- **Kinetic** — gaps: SEO (partial); Analytics; Evidence (partial: DRANK)
- **Memory Map** — gaps: SEO (partial); GEO/agents (partial: A 92%); Analytics (partial); Evidence (partial: DRANK)
- **IssuePages** — gaps: SEO (partial); GEO/agents (partial: A 82%); Analytics; Evidence (partial: PSI, GSC, DRANK); Launch (partial)
- **Anime List** — gaps: SEO (partial); Evidence (partial: DRANK)
- **RolePatch** — gaps: SEO (partial); Analytics (partial); Evidence (partial: DRANK)
- **AliveVille** — gaps: SEO (partial); GEO/agents (partial: A 75%); Analytics; Evidence (partial: DRANK); Launch
- **Mashup** — gaps: SEO (partial); Analytics (partial); Evidence (partial: PSI, GSC, DRANK); Launch (partial)
- **Paths** — gaps: SEO (partial); Evidence (partial: DRANK)
- **storagedaddy** — gaps: SEO (partial); Evidence (partial: PSI, GSC, DRANK)
- **Unified Portfolio** — gaps: SEO; GEO/agents (C 9%); Analytics; Evidence (partial: PSI, GSC, DRANK); Launch
- **Meme Lab** — gaps: SEO; GEO/agents (partial: A 45%); Evidence (partial: PSI, GSC, DRANK); Launch
- **Browser Agent Testing** — gaps: SEO; GEO/agents (partial: A 55%); Analytics; Evidence (partial: PSI, GSC, DRANK); Launch (partial)
- **Formula Composition Engine** — gaps: SEO; GEO/agents (partial: A 55%); Evidence (partial: PSI, GSC, DRANK); Launch

### Stage 6 · GEO/agents — 4 projects

- **SaaS Maker** — gaps: GEO/agents (partial: A 92%); Evidence (partial: DRANK)
- **Research Papers** — gaps: GEO/agents (partial: A 83%); Analytics (partial); Evidence (partial: GSC, DRANK); Launch (partial)
- **Open Historia** — gaps: GEO/agents (partial: A 83%); Analytics; Evidence (partial: GSC, DRANK); Launch
- **Web Playables** — gaps: GEO/agents (partial: A 82%); Analytics; Evidence (partial: PSI, GSC, DRANK); Launch (partial)

### Stage 7 · Analytics — 7 projects

- **Free AI** — gaps: Analytics; Evidence (partial: DRANK)
- **High Signal Podcasts** — gaps: Analytics (partial); Evidence (partial: GSC, DRANK); Launch (partial)
- **LoopTV** — gaps: Analytics; Evidence (partial: DRANK)
- **Reader** — gaps: Analytics (partial); Evidence (partial: DRANK); Launch
- **Motion** — gaps: Analytics (partial); Evidence (partial: GSC, DRANK); Launch
- **Sarthak Agrawal** — gaps: Analytics; Evidence (partial: DRANK)
- **Field Track** — gaps: Analytics (partial); Evidence (partial: GSC, DRANK); Launch

### Stage 8 · Evidence — 12 projects

- **Live** — gaps: Evidence (partial: DRANK)
- **High Signal** — gaps: Evidence (partial: DRANK)
- **Significant Hobbies** — gaps: Evidence (partial: DRANK)
- **SWE Interview Prep** — gaps: Evidence (partial: DRANK)
- **Calorie** — gaps: Evidence (partial: DRANK)
- **Setline** — gaps: Evidence (partial: DRANK)
- **Karte** — gaps: Evidence (partial: DRANK)
- **Starboard** — gaps: Evidence (partial: DRANK)
- **App Health** — gaps: Evidence (partial: DRANK)
- **Anchor** — gaps: Evidence (partial: DRANK)
- **BrowserDaddy** — gaps: Evidence (partial: PSI, GSC, DRANK)
- **PerformanceDaddy** — gaps: Evidence (partial: PSI, GSC, DRANK)

### Fully passing — 0 projects

