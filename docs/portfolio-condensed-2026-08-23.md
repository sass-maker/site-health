# Fleet portfolio: compressed owner intent

Date: 2026-08-23
Scope: all 56 canonical Fleet identities

This document preserves the meaning of the owner's project review in compact,
decision-oriented language. It deliberately does not retain transcript wording
or duplicate mutable repository facts such as current commits, Git state, and
open issues. Those belong in the canonical catalog, each project's
`PROJECT_STATUS.md`, and GitHub.

## Portfolio summary

| Classification | Count | Meaning |
| --- | ---: | --- |
| Flagship | 2 | Products worth sustained market-level investment. |
| Active | 12 | Being built, integrated, tested, or deliberately dogfooded now. |
| Maintenance | 8 | Complete enough; change only for defects or proven needs. |
| Hold | 22 | Worth retaining, but blocked by a named validation, data, interest, UI, distribution, or economic gate. |
| Dropped | 5 | Superseded or intentionally stopped; retain history without roadmap work. |
| Infrastructure | 8 | Shared systems whose roadmap should be driven by consumer needs. |
| **Total** | **56** | Every canonical Fleet identity appears exactly once. |

These classifications reflect current owner intent. They deliberately override misleading signals such as a live deployment for a held product or an old repository label that says maintenance while the owner is actively building.

## Condensed catalog

| Project | Classification | Why it exists | Current state | Next decision or action |
| --- | --- | --- | --- | --- |
| Office OS (`agent-office`) | Hold | Give humans and non-coding agents durable ownership of outcomes. | Built to a credible testable stage, but not yet part of the owner's routine; the category has also become crowded. | Compare the strongest alternatives, define a differentiated wedge, then run a real recurring workflow before adding features. |
| AliveVille | Hold | Create a long-running AI-agent world with memory, conflict, grudges, and open-world behavior. | The simulation thesis remains compelling, but no attempted UI made the game emotionally attractive enough to continue. | Reopen only with a convincing playable visual direction and a small fun loop—not more simulation depth. |
| Anchor | Active | Plan a realistic day, follow it with a focus timer, and explain why the lived day differed. | Now the sole maintained successor to Indulge/Habits, including its visual pattern onboarding and non-moralizing replacement framing; the merged source is verified locally but not yet committed or released. | Dogfood the complete schedule → focus → interruption → review loop; use real divergence evidence to decide the next change. |
| Anime List | Maintenance | Add better anime filtering, discovery, and a personal watchlist. | Complete and frequently used; broader anime-community features are unwanted. | Maintain the directory/watchlist and fix only meaningful regressions or missing core functions. |
| App Health | Active | Replace fragmented Sentry, PostHog, Slack, and cloud-console checking with easy high-level observability. | Good v0/v1 with a coherent OpenTelemetry-friendly model. | Integrate it across owned production services and let observed failures drive improvements. |
| Calorie | Maintenance | Support weight loss through food logging, fasting windows, exercise timing, and daily performance. | Functionally done and connected to the Hub family. | Keep using it; change it only when repeated use reveals a gap. |
| ChatGPT Connections | Infrastructure | Let ChatGPT securely reach selected Fleet projects. | Working shared read-only gateway; ChatGPT is the destination and MCP is the protocol. | Add stronger or additional connections only when a concrete consumer needs them. |
| Memory Map (`chatgpt-memory-insights`) | Active | Analyse exported AI conversations for themes, memory, emotion, and personal change. | Useful but not complete; dashboard and insight quality can improve. | Deepen historical-shift insights, then add Codex, Claude, and other sources without weakening the browser-local privacy boundary. |
| Chess Coach (`chess`) | Dropped | Use a local AI agent as a chess improvement partner. | Complete enough, but the owner has lost interest in chess. | No roadmap; retain the working public artifact. |
| CodeVetter | Flagship | Build a strong local-first reviewer for AI-generated code. | Feature-rich but far from the intended market standard. | Keep iterating toward executable, receipt-backed verification and make it one of the category's best products. |
| Companion Robot | Hold | Explore a future embodied AI companion. | Ideation and planning only. | Reopen when there is an explicit hardware purchase and a bounded Phase 0 experiment. |
| Drank | Infrastructure | Track Domain Rating after the relevant API became freely usable. | Finished and already consumed by Site Health. | Maintain the adapter/data flow; no independent feature roadmap. |
| Email Manager | Maintenance | Understand Gmail volume, identify repeat senders, and unsubscribe efficiently. | Done and performs its intended job. | Maintain authentication and Gmail compatibility; add no speculative features. |
| EverythingRated (`everythingrated`) | Hold | Let people create lists and rate anything. | The build exposed a social-network cold-start and moderation problem. | Reopen only with stronger distribution/marketing ability or a narrow community that solves the chicken-and-egg problem. |
| Field Track | Hold | Give the owner's father an employee-controlled field-location tracker. | A small MVP path exists, but economics and Android work are unresolved. | Validate business economics and test on a physical Android device before expanding. |
| Forecast Lab | Hold | Learn forecasting and model regional/time-based commerce demand. | Valuable as an evaluation-first learning lab, not a credible B2B SaaS without data and domain expertise. | Reopen for a concrete learning or customer problem with suitable data. |
| Free AI | Infrastructure | Aggregate useful free AI tiers behind one resilient interface. | Working well for internal consumers. | Add providers only when they improve capability coverage, reliability, or available free capacity. |
| GitStat | Maintenance | Understand work and code churn across the owner's repositories. | More or less complete; no unanswered recurring question is currently known. | Use it and add analysis only when a specific question is missing. |
| High Signal | Hold | Aggregate news/data sources and derive useful signals. | Product focus is now clearer, but the owner is not using it. | Resume only after regular Daily Brief use identifies a concrete deficiency. |
| India Standards | Hold | Use official data to contextualize how a person is doing in India. | The transparent aggregate calculator exists, but data quality limits expansion. | Reopen when materially better authoritative data becomes available. |
| Habits / Indulge (`indulge`) | Dropped | Earlier visual exploration of intentional enjoyment, automatic patterns, and chosen alternatives. | Superseded by Anchor on 2026-08-24. Useful onboarding artwork and framing moved to Anchor; source, Apple identities, Hub data contracts, and landing resources remain only for history and compatibility. | No roadmap. Preserve compatibility until a separately approved migration or deletion. |
| iOS landings (`ios-landings`) | Infrastructure | Reuse one landing-page engine across native Significant Hobbies products. | Canonical shared factory with multiple product-specific sites. | Add products and capabilities only when a native app actually needs a public landing surface. |
| Journal | Active | Make journaling a durable habit within the Hub. | Currently being built as a private, device-first writing app. | Use it, add features from real practice, and explore careful emotional-pattern detection. |
| Karte | Active | Evolve a link-in-bio page into a greeting card, company profile, and personal agent. | Strong individual profile and conversational foundation already exist. | Make the positioning and workflows company-friendly, then validate real company use. |
| Kith | Active | Provide a beautiful personal relationship-memory app. | Built as a device-first constellation rather than a CRM. | Use it regularly and let relationship-management behavior determine improvements. |
| Knowledge Base | Infrastructure | Supply private, cited retrieval to other Fleet applications. | Working shared RAG service with healthy consumers. | Leave it alone until a consumer failure, retrieval regression, or new corpus requires work. |
| Live | Active | Help people live more by giving them goals, possibilities, and a bucket list to anticipate. | In very good shape after becoming an independent product. | Dogfood it and test whether the catalog, search, and suggestions are exhaustive and genuinely good. |
| Local AI Video Studio | Hold | Translate editing intent into efficient local video effects instead of defaulting to generative video. | A bounded local-first experiment; owner interest faded. | Reopen only around a real creator workflow where deterministic local editing clearly helps. |
| LoopTV | Maintenance | Offer a more controlled, curated, TV-like way to watch YouTube. | Done, including stronger search and handling for unavailable videos. | Keep the catalog healthy; no feature expansion without a new viewing need. |
| Mashup | Hold | Turn a creator's archive into coherent topic-specific comedy, motivation, podcast, or clipping compilations. | Strong local clipper/merger with provenance and approval boundaries. | Reopen around one real creator archive and prove the comedy-topic workflow end to end. |
| Materia | Hold | Build an interactive anatomy and evidence-based remedies encyclopedia. | Technically and editorially ambitious; evidence quality and content maintenance dominate the cost. | Reopen only with a defined evidence standard, medical-safety boundary, and sustained content budget. |
| Mobile Dev Cockpit | Dropped | Supervise desktop development workflows from a phone. | Its required desktop-control dependency was abandoned; the owner now prefers purpose-built apps. | Archive permanently; retain pairing, allowlisting, and approval patterns as reference. |
| Motion | Hold | Turn body movement captured by a phone into games displayed on a TV. | Promising body-as-controller prototype, but physical play quality and distribution remain unproven. | Reopen for focused physical-device playtesting of one genuinely fun control loop. |
| Open Historia | Hold | Recreate an AI grand-strategy game locally and without credit limits. | Durable country memory is compelling, but the map and campaign loop were not enjoyable enough. | Reopen during a live build with a game-quality map and one coherent campaign-turn loop. |
| HeyPace (`pace`) | Hold | Build a fast, privacy-first local Mac assistant inspired by Hey Clicky. | Technically broad and well made, but the owner never formed a usage habit. | Find one or two moments it should own through daily use before building more capabilities. |
| Sarthak Agrawal (`portfolio`) | Maintenance | Maintain the owner's necessary personal website and professional record. | Complete and satisfactory. | Update only when the underlying work, writing, résumé, or positioning changes. |
| PostTrainLLM | Flagship | Explore browser and Mac-local model training, then turn that work into repeatable specialist-model recipes. | Ongoing, ambitious, and rich in experiments and future plans. | Continue measured local training/evaluation recipes and publish reproducible proof rather than chasing scale. |
| Protein Index | Hold | Catalogue and compare protein products available in India. | Product exists, but trustworthy market data is unavailable or too expensive. | Reopen only when authoritative, affordable product data can support current coverage. |
| PSI Swarm | Infrastructure | Measure real product performance across repeated Lighthouse conditions. | Completed operational CLI and Site Health input. | Maintain compatibility and measurement integrity; no independent feature roadmap. |
| Reader | Hold | Capture any article or PDF and prepare it for focused reading and research. | Mature product, but the owner has not been reading or using it enough. | Resume personal reading first; improve only the parts that block the capture-to-reading loop. |
| Recipe Index (`veg-protein-food`) | Hold | Collect higher-protein recipes using Indian ingredients. | The result was not compelling and the owner's current food routine is already optimized. | Keep parked until cooking or meal variety becomes a real priority. |
| Reddit Insights | Hold | Track historical shifts in subreddit signals and emotion. | Blocked by poor access to historical Reddit data. | Either begin collecting forward-looking data now or reopen when a lawful historical source is available. |
| Reel Pipeline | Hold | Automate product-video creation and posting. | Scope spiralled, accumulated features, and never shipped. | Before reopening, reduce it to one publishable video loop with explicit cost and operator-time limits. |
| Research Papers | Maintenance | Maintain a large RAG-assisted library of market and research papers. | Essentially complete as a corpus. | Preserve and analyse it when a concrete research question appears. |
| RolePatch | Hold | Tailor a resume and supporting application material to a job description. | Strong product, but unused because the owner is not job hunting. | Test it against real applications when job-search intent returns; let that test trim unnecessary breadth. |
| SaaS Ideas | Maintenance | Preserve and score the owner's accumulated SaaS ideas. | Complete personal idea catalog rather than a product business. | Use it for prioritization; update when new ideas or selection criteria appear. |
| SaaS Maker | Infrastructure | House reusable packages, public Fleet discovery, feedback tooling, workflows, skills, and operator automation. | Canonical tooling home and public 55-product/95-capability directory after reconciliation. | Stabilize its package boundaries and let real Fleet consumers determine which packages deserve investment. |
| Setline | Active | Execute workouts one set at a time with accurate timing and performance tracking. | Actively being built as a focused native workout player. | Continue the working workout loop and validate it through real sessions. |
| Significant Hobbies | Active | Join six maintained personal applications in one Hub while each retains ownership of its data. | Hub UI, backend, typed sync package, and extracted product boundaries are canonical. The historical `habits` domain remains available as compatibility data but is no longer a separate app card. | Finish unified authentication and complete privacy-safe summaries/actions for the maintained apps without breaking retained domains. |
| Site Health | Infrastructure | Give the owner one local view of Fleet inventory, domain rank, performance, search, and AI visibility. | Actively maintained canonical private catalog and operational dashboard. | Keep it local; improve only the five owner questions and their evidence adapters. |
| Starboard | Active | Replace GitHub Stars' overloaded UI with better personal exploration. | Core synchronization, search, tags, lists, and project-aware discovery are largely complete. | Continue focused exploration improvements without expanding into unrelated alerts or reporting. |
| SWE Interview Prep | Active | Create a learning-by-doing system using Pomodoro, Feynman, retrieval practice, and roadmaps. | Broad active work-in-progress with a strong learning loop and growing scope. | Strengthen practice and retention; resist adding tracks that do not improve personal learning. |
| TrueHire | Dropped | Rank candidates transparently from verified GitHub evidence. | Trust and marketplace adoption remain unsolved, and RolePatch supersedes the active hiring surface. | Preserve the evidence-scoring ideas; do not restart the marketplace without a distribution solution. |
| Verified Bases | Hold | Sell inexpensive, verified versions of the owner's iOS and Mac codebases as templates. | Marketplace and fulfilment prototype exists, but expected ROI is unclear. | Validate buyer demand and support economics before reviving it or folding the idea into a successor. |
| Web Playables | Hold | Learn how idle and HTML-based games are built and distributed. | Research goal was met with a reusable game kit and an idle game; currently parked. | Add another game only when there is a specific mechanic worth studying. |
| What It Takes to Win | Active | Study advantages behind success and turn comparison into evidence-based understanding. | Strong research publication with clear personal motivation and room for deeper coverage. | Continue studying people, improve source-linked life histories, and reconcile stale public dataset counts during the next refresh. |

## System and dependency map

### Personal-app system

`Significant Hobbies` is the Hub and shared contract layer for:

- Anchor
- Calorie
- Journal
- Kith
- Live
- Setline

Each app keeps ownership of its immediate data. `iOS Landings` supplies eligible native-app marketing surfaces. The normal integration direction is typed summaries and semantic actions through the Hub—not merging the six applications into one codebase.

Anchor is the deliberate exception to that general boundary: Indulge/Habits
competed for the same schedule and time-tracking loop, so its useful behavioral
onboarding was absorbed into Anchor. Personal Platform's `habits` records and
contracts remain compatibility data rather than a seventh maintained app.

### Fleet operations system

- `Site Health` owns the private canonical catalog and evidence dashboard.
- `Drank` supplies domain-strength evidence.
- `PSI Swarm` supplies repeated performance evidence.
- `SaaS Maker` publishes the privacy-filtered public project projection and owns reusable workflows, skills, scripts, templates, and shared packages.

Drank and PSI Swarm should remain independently testable tools even though Site Health is their primary dashboard consumer.

### Shared AI system

- `Free AI` supplies capability-aware model fallback to internal products.
- `Knowledge Base` supplies private, cited retrieval.
- `ChatGPT Connections` exposes selected product contracts to ChatGPT through MCP.

These are infrastructure. New work should begin with a failing or missing consumer use case, not an infrastructure feature idea.

### Media system

- `Mashup` owns analysis, clipping, merging, provenance, and approved render plans.
- `Local AI Video Studio` explores deterministic local effects.
- `Reel Pipeline` owns the larger publishing workflow but is held because it never found a shippable boundary.

Do not merge their runtimes. If Reel Pipeline is reopened, it should consume explicit finished-media receipts from Mashup or Local AI Video Studio.

### Games and simulation system

`AliveVille`, `Open Historia`, `Motion`, and `Web Playables` share game research but have different reopen gates: enjoyable agent-world UI, a coherent strategy turn, physical control feel, and a new browser-game mechanic respectively. Shared libraries are justified only after two active projects need the same code.

### Career and learning system

- `SWE Interview Prep` owns personal technical learning.
- `RolePatch` owns job-specific application preparation.
- `TrueHire` is a retired evidence-based hiring experiment and should not compete with RolePatch.

### Explicit predecessors and retirements

- Mobile Dev Cockpit depended on an abandoned desktop-control workflow.
- TrueHire was superseded by RolePatch as the active employment-related product.
- Chess Coach was stopped because the underlying personal interest disappeared.
- Habits/Indulge was superseded by Anchor; its original pattern artwork and
  humane replacement framing moved forward, while its separate shell and
  roadmap were retired.
- Workflows and Skills and Hub Backend are no longer separate Fleet identities; their responsibilities now live in SaaS Maker and Significant Hobbies respectively.

## Portfolio-level conclusions

1. **The main bottleneck is use, not implementation.** Anchor, App Health, Calorie, GitStat, High Signal, Kith, Live, HeyPace, Reader, RolePatch, and Starboard all describe some version of “built, but not used enough.” Another feature pass will not answer their central question.

2. **The portfolio has two true flagships.** CodeVetter and PostTrainLLM deserve sustained ambition, market comparison, public proof, and the majority of discretionary product-building time.

3. **The Hub family is the strongest dogfooding opportunity.** Six maintained products share one owner, a coherent life-improvement thesis, and a control plane. Daily use can generate evidence across several products without creating six separate acquisition problems.

4. **Held products have identifiable gates.** The largest groups are data/evidence access, enjoyable UI or playability, distribution/marketplace trust, personal routine, and economics. A held project should not receive feature work until its gate changes.

5. **Infrastructure is already abundant.** Free AI, Knowledge Base, ChatGPT Connections, SaaS Maker, Site Health, Drank, PSI Swarm, and iOS landings form a strong internal platform. Their roadmaps should remain consumer-led to avoid building infrastructure for infrastructure's sake.

6. **Completed tools should stay boring.** Anime List, Calorie, Email Manager, GitStat, LoopTV, Sarthak Agrawal, Research Papers, and SaaS Ideas have achieved their current purpose. Maintenance is success, not neglect.

7. **Four projects should have no active roadmap.** Chess Coach, Habits/Indulge, Mobile Dev Cockpit, and TrueHire should remain historical or superseded artifacts unless the owner explicitly changes the underlying decision.

## Recommended operating policy

- Protect two flagship lanes: CodeVetter and PostTrainLLM.
- Run one shared dogfooding lane for the Significant Hobbies family.
- Allow at most three additional active validation lanes at a time.
- Require every active non-infrastructure project to name its next proof, not merely its next feature.
- Review holds quarterly by gate; do not continuously groom their backlogs.
- Treat maintenance products as closed scopes unless usage or breakage supplies evidence.
- Start infrastructure work only from a named consumer requirement.

With the Anchor consolidation complete in source, the immediate portfolio move
is a structured dogfooding cycle that measures which already-built products
repeatedly earn attention.
