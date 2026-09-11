# Fleet portfolio: compressed owner intent

Date: 2026-08-23 (lifecycle counts and explicit removals reconciled 2026-09-09)
Scope: all 59 retained canonical identities; archived identities remain recorded for infrastructure ownership but are excluded from Fleet listings.

This document preserves the meaning of the owner's project review in compact,
decision-oriented language. It deliberately does not retain transcript wording
or duplicate mutable repository facts such as current commits, Git state, and
open issues. Those belong in the canonical catalog, each project's
`PROJECT_STATUS.md`, and GitHub.

> **Lifecycle model update (2026-09-06):** The previous six-class system
> (Flagship, Active, Maintenance, Hold, Dropped, Infrastructure) has been
> superseded by a three-field model per the Portfolio Cleanup PRD. Each
> project now carries `status` (primary/active/inactive), `shareable`
> (boolean), and `resumeCondition` (string or null) in the canonical
> catalog. The decision content below is preserved; only the classification
> labels have been remapped.

Project purpose is separately categorized as `utility`, `media`, or `experimental`.
See [the complete category list](project-categories-2026-09-07.md). Categories do not
change lifecycle or sharing decisions.

## Portfolio summary

| Status | Count | Meaning |
| --- | ---: | --- |
| Primary | 2 | Receives focused feature development, experiments and validation. |
| Active | 21 | Supported and kept useful; improvements follow concrete needs. |
| Inactive | 36 | No planned development or autonomous expansion. Preserve relevant software, data and evidence. |
| **Total** | **59** | Every canonical Fleet identity appears exactly once. |

These statuses reflect current owner intent. They deliberately override misleading signals such as a live deployment for an inactive product or an old repository label that says maintenance while the owner is actively building.

## Condensed catalog

| Project | Classification | Why it exists | Current state | Next decision or action |
| --- | --- | --- | --- | --- |
| Office OS (`agent-office`) | Inactive | Give humans and non-coding agents durable ownership of outcomes. | Paused experiment; no current work or obligation to resume. | Keep: A finished visual experiment in representing agent work. Stop: A staffed virtual company, a new workflow system and autonomous office features. |
| AliveVille | Inactive | Create a long-running AI-agent world with memory, conflict, grudges, and open-world behavior. | Paused experiment; no current work or obligation to resume. | Keep: One small persistent world you can visit and influence. Stop: A sprawling game engine, huge content map and an autonomous civilization platform. |
| Anchor | Active | Plan a realistic day, follow it with a focus timer, and explain why the lived day differed. | Now the sole maintained successor to Indulge/Habits, including its visual pattern onboarding and non-moralizing replacement framing; the owner simplified the daily loop to direct habit tracking, editable/copyable days, project-linked entries and pause recovery. Native builds are under daily-use qualification; account continuity, the distraction-note privacy contract, and production CloudKit compatibility remain release gates. Current installation receipts belong in the canonical catalog. | Dogfood the complete schedule → focus → interruption → review loop; use real divergence evidence to decide the next change. |
| Anime List | Active | Add better anime filtering, discovery, and a personal watchlist. | Complete and frequently used; broader anime-community features are unwanted. | Maintain the directory/watchlist and fix only meaningful regressions or missing core functions. |
| App Health | Active | Replace fragmented Sentry, PostHog, Slack, and cloud-console checking with easy high-level observability. | Good v0/v1 with a coherent OpenTelemetry-friendly model. | Integrate it across owned production services and let observed failures drive improvements. |
| Calorie | Active | Support weight loss through food logging, fasting windows, exercise timing, and daily performance. | Functionally done and connected to the Hub family. | Keep using it; change it only when repeated use reveals a gap. |
| ChatGPT Connections | Active | Let ChatGPT securely reach selected Fleet projects. | Working shared read-only gateway; ChatGPT is the destination and MCP is the protocol. | Add stronger or additional connections only when a concrete consumer needs them. |
| Memory Map (`chatgpt-memory-insights`) | Inactive | Analyse exported AI conversations for themes, memory, emotion, and personal change. | Useful but not complete; dashboard and insight quality can improve. | Deepen historical-shift insights, then add Codex, Claude, and other sources without weakening the browser-local privacy boundary. |
| Chess Coach (`chess`) | Inactive | Use a local AI agent as a chess improvement partner. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The chess implementation as archived learning work. Stop: An alternative chess ecosystem and ongoing coaching features. |
| CodeVetter | Primary | Build a strong local-first reviewer for AI-generated code. | Active product; ongoing investment within the approved narrow scope. | Keep: Execution-backed verification of agent changes, with reproducible evidence for the requested task. Stop: Generic project management, broad coding-assistant features and unsupported verdicts. |
| Companion Robot | Inactive | Explore a future embodied AI companion. | Ideation and planning only. | Reopen when there is an explicit hardware purchase and a bounded Phase 0 experiment. |
| Drank | Inactive | Track Domain Rating after the relevant API became freely usable. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The domain-metric adapter and references used by Site Health. Stop: A separate public dashboard and independent product roadmap. |
| Email Manager | Inactive | Understand Gmail volume, identify repeat senders, and unsubscribe efficiently. | Done and performs its intended job. | Maintain authentication and Gmail compatibility; add no speculative features. |
| EverythingRated (`everythingrated`) | Inactive | Let people create lists and rate anything. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The existing comparison work as a dated historical artifact. Stop: Crowdsourced ratings growth, new directories and a participation-driven platform. |
| Field Track | Inactive | Give the owner's father an employee-controlled field-location tracker. | Paused experiment; no current work or obligation to resume. | Keep: A bounded field-work prototype for your father's operation. Stop: A tracking SaaS or platform before a real field pilot is wanted. |
| Forecast Lab | Inactive | Learn forecasting through reproducible experiments. | Paused experiment; no current work or obligation to resume. | Keep: Reproducible benchmark results and lessons already learned. Stop: A forecasting SaaS or more methods without a concrete research question. |
| Free AI | Active | Aggregate useful free AI tiers behind one resilient interface. | Working well for internal consumers. | Add providers only when they improve capability coverage, reliability, or available free capacity. |
| GitStat | Inactive | Understand work and code churn across the owner's repositories. | More or less complete; no unanswered recurring question is currently known. | Use it and add analysis only when a specific question is missing. |
| High Signal | Active | Aggregate news/data sources and derive useful signals. | Active product; ongoing investment within the approved narrow scope. | Keep: One small source-backed brief that helps you make a real decision. Stop: All-topic coverage, endless feeds and a publishing volume target. |
| High Signal Podcasts (`on-record`) | Inactive | Index what notable people said on podcasts as evidenced claims, including books/apps they use. | Finished experiment; bounded artifact without an active roadmap. | Keep: One attributable cross-podcast insight collection with episode links. Stop: A podcast app, universal transcription service and unlimited aggregation. |
| India Standards | Inactive | Use official data to contextualize how a person is doing in India. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The dated, source-linked demographic comparison as historical work. Stop: Ongoing data-product expansion after your interest has ended. |
| IssuePages (`issue-pages`) | Inactive | Make publishing a public page as simple as opening a GitHub issue. | Finished experiment; bounded artifact without an active roadmap. | Keep: One finished example of publishing a page from a GitHub issue. Stop: A CMS, publishing network and multiple author workflows. |
| iOS landings (`ios-landings`) | Active | Reuse one landing-page engine across native Significant Hobbies products. | Canonical shared factory with multiple product-specific sites. | Add products and capabilities only when a native app actually needs a public landing surface. |
| Journal | Inactive | Make journaling a durable habit within the Hub. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The journal implementation as archived work. Stop: A separate writing application you explicitly do not want to maintain. |
| Karte | Inactive | Evolve a link-in-bio page into a greeting card, company profile, and personal agent. | Strong individual profile and conversational foundation already exist. | Make the positioning and workflows company-friendly, then validate real company use. |
| Kith | Active | Provide a beautiful personal relationship-memory app. | Built as a device-first constellation rather than a CRM. | Use it regularly and let relationship-management behavior determine improvements. |
| Knowledge Base | Active | Supply private, cited retrieval to other Fleet applications. | Working shared RAG service with healthy consumers. | Leave it alone until a consumer failure, retrieval regression, or new corpus requires work. |
| Live | Active | Help people live more by giving them goals, possibilities, and a bucket list to anticipate. | In very good shape after becoming an independent product. | Dogfood it and test whether the catalog, search, and suggestions are exhaustive and genuinely good. |
| Local AI Video Studio | Inactive | Translate editing intent into efficient local video effects instead of defaulting to generative video. | Paused experiment; no current work or obligation to resume. | Keep: A clearly labelled local-effects experiment and a sample output. Stop: A new general video editor or generative studio without a specific unmet editing need. |
| LoopTV | Inactive | Offer a more controlled, curated, TV-like way to watch YouTube. | Done, including stronger search and handling for unavailable videos. | Keep the catalog healthy; no feature expansion without a new viewing need. |
| Mashup | Inactive | Turn a creator's archive into coherent topic-specific comedy, motivation, podcast, or clipping compilations. | Paused experiment; no current work or obligation to resume. | Keep: One convincing thematic edit assembled from an existing archive. Stop: A general content factory, automatic viral clips and a publishing platform. |
| Materia | Inactive | Build an interactive anatomy and evidence-based remedies encyclopedia. | Paused experiment; no current work or obligation to resume. | Keep: A small, carefully sourced example of organizing evidence around one topic. Stop: A whole-body medical encyclopaedia or advice product without expert validation. |
| Mobile Dev Cockpit | Inactive | Supervise desktop development workflows from a phone. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The prototype and any genuinely reusable handoff ideas. Stop: A new mobile control plane for every developer workflow. |
| Nomad Data Adventure (`nomad-data-adventure`) | Active | Explore city data in a bounded local experiment. | Owner confirmed active; local collection and slicing scripts exist, with no verified public product or redistribution rights. | Establish a useful reproducible exploration and data rights before sharing. |
| Motion | Inactive | Turn body movement captured by a phone into games displayed on a TV. | Promising body-as-controller prototype, but physical play quality and distribution remain unproven. | Reopen for focused physical-device playtesting of one genuinely fun control loop. |
| Open Historia | Inactive | Recreate an AI grand-strategy game locally and without credit limits. | Paused experiment; no current work or obligation to resume. | Keep: A small local campaign with meaningful decisions and consistent state. Stop: An unlimited world simulator, enormous map scope and content breadth. |
| HeyPace (`pace`) | Active | Build a fast, privacy-first local Mac assistant inspired by Hey Clicky. | Technically broad and well made, but the owner never formed a usage habit. | Find one or two moments it should own through daily use before building more capabilities. |
| Sarthak Agrawal (`portfolio`) | Inactive | Maintain the owner's necessary personal website and professional record. | Complete and satisfactory. | Update only when the underlying work, writing, résumé, or positioning changes. |
| PostTrainLLM | Primary | Explore browser and Mac-local model training, then turn that work into repeatable specialist-model recipes. | Active product; ongoing investment within the approved narrow scope. | Keep: A reproducible path from private task examples to a measured local-model improvement. Stop: Supporting every model, training method and deployment platform before the core task works. |
| Protein Index | Inactive | Catalogue and compare protein products available in India. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The existing Indian product-data experiment and provenance notes. Stop: Ongoing retailer ingestion, price maintenance and a public comparison business. |
| PSI Swarm | Inactive | Measure real product performance across repeated Lighthouse conditions. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The performance-measurement scripts and reusable evidence format. Stop: An independent performance platform and public controller product. |
| Reader | Inactive | Capture any article or PDF and prepare it for focused reading and research. | Finished experiment; bounded artifact without an active roadmap. | Keep: The current reader as a finished experiment you may revisit if actual reading exposes a need. Stop: Competing feature-for-feature with established reading and annotation products. |
| Recipe Index (`veg-protein-food`) | Inactive | Collect higher-protein recipes using Indian ingredients. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The recipe experiment as historical work. Stop: Maintaining a recipe catalogue you do not want to use. |
| Reddit Insights | Inactive | Track historical shifts in subreddit signals and emotion. | Finished experiment; bounded artifact without an active roadmap. | Keep: A documented experiment answering one historical community question. Stop: A general social-monitoring product and unavailable-data promises. |
| Reel Pipeline | Inactive | Explore automated product-video creation. | Paused experiment; no current work or obligation to resume. | Keep: One reproducible production recipe and its best finished video. Stop: More recipes, automatic distribution and a perpetual output pipeline without a chosen format. |
| Research Papers | Inactive | Maintain a large RAG-assisted library of market and research papers. | Finished experiment; bounded artifact without an active roadmap. | Keep: A bounded paper collection and one reproducible research example. Stop: Universal scholarly search and growing the corpus without a question. |
| Slow SERP (`slow-serp`) | Active | Supply bounded public web extraction and paced search to internal workflows. | Private support tool; local crawler checks pass, while real Google search is blocked by upstream HTTP 429. | Qualify outbound IP infrastructure before treating the search path as usable; retain the existing bounded extraction scope. |
| RolePatch | Inactive | Tailor a resume and supporting application material to a job description. | Strong product, but unused because the owner is not job hunting. | Test it against real applications when job-search intent returns; let that test trim unnecessary breadth. |
| SaaS Maker | Active | House reusable packages, public Fleet discovery, feedback tooling, workflows, skills, and operator automation. | Canonical tooling home; public directory includes only verified shareable surfaces. Private inventory retains all identities. | Stabilize its package boundaries and let real Fleet consumers determine which packages deserve investment. |
| Setline | Active | Execute workouts one set at a time with accurate timing and performance tracking. | Actively being built as a focused native workout player. | Continue the working workout loop and validate it through real sessions. |
| Significant Hobbies | Active | Join retained personal applications in one Hub while each retains ownership of its data. | Hub UI, backend, typed sync package, and extracted product boundaries are canonical. Journal is removed from the lineup; historical data and compatibility domains remain attributable. | Finish unified authentication and complete privacy-safe summaries/actions for the maintained apps without breaking retained domains. |
| Site Health | Active | Give the owner one local view of Fleet inventory, domain rank, performance, search, and AI visibility. | Actively maintained canonical private catalog and operational dashboard. | Keep it local; improve only the five owner questions and their evidence adapters. |
| StorageDaddy (`storagedaddy`) | Active | Build a pretty, efficient native Mac storage analyzer. | Working native Mac app; private local prototype with no public distribution. | Measure correctness and runtime efficiency before expanding scope. |
| Starboard | Active | Replace GitHub Stars' overloaded UI with better personal exploration. | Active product; ongoing investment within the approved narrow scope. | Keep: Find a useful maintained repository from your own saved and discovered tools. Stop: A social network, every developer-tool directory and unrelated intelligence feeds. |
| SWE Interview Prep | Active | Create a learning-by-doing system using Pomodoro, Feynman, retrieval practice, and roadmaps. | Broad active work-in-progress with a strong learning loop and growing scope. | Strengthen practice and retention; resist adding tracks that do not improve personal learning. |
| TrueHire | Inactive | Rank candidates transparently from verified GitHub evidence. | Paused experiment; no current work or obligation to resume. | Keep: A clearly labelled concept demonstration of evidence-based candidate assessment. Stop: A hiring marketplace, candidate scoring authority and ongoing recruiter operations. |
| Verified Bases | Inactive | Sell inexpensive, verified versions of the owner's iOS and Mac codebases as templates. | Archived work; removed from Fleet listings. Hosting and retained resource ownership are unchanged. | Keep: The template/storefront concept as historical work. Stop: A marketplace, support commitments and more inventory without buyers. |
| Web Playables | Inactive | Learn how idle and HTML-based games are built and distributed. | Paused experiment; no current work or obligation to resume. | Keep: A small shared starter used by the games you actually make. Stop: A general game engine or a constant obligation to ship more games. |
| What It Takes to Win | Active | Study advantages behind success and turn comparison into evidence-based understanding. | Strong research publication with clear personal motivation and room for deeper coverage. | Continue studying people, improve source-linked life histories, and reconcile stale public dataset counts during the next refresh. |

## System and dependency map

### Personal-app system

`Significant Hobbies` is the Hub and shared contract layer for:

- Anchor
- Calorie
- Kith
- Live
- Setline

Each app keeps ownership of its immediate data. `iOS Landings` supplies eligible native-app marketing surfaces. The normal integration direction is typed summaries and semantic actions through the Hub—not merging the five applications into one codebase.

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
- Chess Coach and Journal were explicitly removed from Fleet; preserve their history without promotion or new work.
- Habits/Indulge was superseded by Anchor; its original pattern artwork and
  humane replacement framing moved forward, while its separate shell and
  roadmap were retired.
- SaaS Ideas was absorbed into SaaS Maker; its catalog lives only at SaaS Maker's `/ideas` surface.
- Workflows and Skills and Hub Backend are no longer separate Fleet identities; their responsibilities now live in SaaS Maker and Significant Hobbies respectively.

## Portfolio-level conclusions

1. **The main bottleneck is use, not implementation.** Several active products describe some version of "built, but not used enough." Another feature pass will not answer their central question.

2. **The portfolio has two primary projects.** CodeVetter and PostTrainLLM deserve sustained ambition, market comparison, public proof, and the majority of discretionary product-building time.

3. **The Hub family is the strongest dogfooding opportunity.** Active products in the Significant Hobbies family share one owner, a coherent life-improvement thesis, and a control plane. Daily use can generate evidence across several products without creating separate acquisition problems.

4. **Inactive projects have identifiable gates.** The largest groups are data/evidence access, enjoyable UI or playability, distribution/marketplace trust, personal routine, and economics. An inactive project should not receive feature work until its gate changes and the owner explicitly reallocates attention.

5. **Infrastructure is already abundant.** Free AI, Knowledge Base, ChatGPT Connections, SaaS Maker, Site Health, and iOS Landings form a strong internal platform. Their roadmaps should remain consumer-led to avoid building infrastructure for infrastructure's sake.

6. **Completed tools should stay boring.** Several active products have achieved their current purpose. Keeping them working is success, not neglect.

7. **Four retained identities are removed or retired.** Chess Coach, Journal, Mobile Dev Cockpit, and TrueHire should remain historical artifacts unless the owner explicitly changes the underlying decision.

## Recommended operating policy

- Protect two primary lanes: CodeVetter and PostTrainLLM.
- Run one shared dogfooding lane for the Significant Hobbies family.
- Allow at most three additional active validation lanes at a time.
- Require every active project to name its next proof, not merely its next feature.
- Inactive projects receive no unattended feature work, new corpora, bulk enrichment, or inferred reactivation. Meeting a resume condition prompts an owner decision, not automatic work.
- Start infrastructure work only from a named consumer requirement.

With the lifecycle cleanup complete, the immediate portfolio move is a
structured dogfooding cycle that measures which already-built products
repeatedly earn attention.

## Owner future-form decisions — 2026-09-10

The reviewed export supersedes older continuation wording for these 51 non-personal items. The 25 personal-tool decisions are deferred and unchanged. Future form is separate from lifecycle and shareability. Paused means no current work and no obligation to restart.

- **active-product**: CodeVetter, Starboard, High Signal, PostTrainLLM.
- **finished-experiment**: Research Papers, Reddit Insights, IssuePages, High Signal Podcasts, Reader, Look Sideways.
- **paused-experiment**: AliveVille, Forecast Lab, Open Historia, ph-catalog, TrueHire, Web Playables, Office OS, Field Track, Local AI Video Studio, Mashup, Reel Pipeline, Materia.
- **archived-work**: EverythingRated, agent-resume, ai-badges, backpropagate, clash-royale-meta, dev-workflow-migration, headcount, loadtesting, local-ai, ludo-pass-play, mentionpilot, Mobile Dev Cockpit, pinpoint, placard, port-whisperer, side-machine, society-relay, subreddit-research, temp-splitwise, today-little-log, DRank, elves-hq, PSI Swarm, Verified Bases, chess, India Standards, journal, Protein Index, Recipe Index.

Source and exact scope boundaries: [reviewed decisions](qualification/nonpersonal-owner-decisions-2026-09-10.json). GitHub receipts: [archive verification](qualification/nonpersonal-github-archive-2026-09-10.json).
