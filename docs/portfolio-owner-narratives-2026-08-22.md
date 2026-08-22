# Portfolio owner narratives — 2026-08-22

Private verbatim record of the owner's product review. Text in each block is
captured exactly from the owner's messages; agent assessment and repository
facts belong elsewhere.

## Agent Office

```text
I started this project to hop on the transaction of AI employees and move away from coding-first AI employees instead of focusing on regular non-coder coding employees. Essentially trying to build a company in which humans and agents can live in synergy with each having ownership of an outcome and they just keep focusing on it endlessly. 

 Currently I think it has been built reasonably well but I don't think it is yet to use. It is at the stage where I have to start testing but I have not been able to prioritise it. 

I will start testing this product and see but due to the recent explosion of similar products which are far better, I will first have to check them out and see what valuable badge I can add before moving forward with this.
```

### Agent record

- Assessment: local agent-governance and execution cockpit; technically mature for a POC, but needs a recurring owner workflow before it earns further platform investment.
- Start / latest commit: `9d27fc2` (2026-08-09) / `4564ec2` (2026-08-20).
- Stack: Swift, SwiftUI, SpriteKit, Foundation, local Codex/Claude runtime integration, static site.
- Git snapshot: `sass-maker/agent-office`; 48 commits; `main` matched `origin/main`; the observed worktree had modified `site/api-ai.json`, `site/llms.txt`, and untracked `functions/`.
- Public link: `https://office-os.sassmaker.com`.
- Open issues: #61, #60, #57, #56, #53, #21.

## AliveVille

```text
I started AliveVille with a vision that there will be AI agents that are going on their life in a real-life-based game. It can be a fantasy game also but it will be AI, a long-running AI agent essentially doing actions, getting into fights, all the standard open-world game characteristics. With AI having long-form memory they can hold grudges and they can do things. It was a fairly technical thing to start so I wanted to do it. 

Current status: I really struggled with building a UI that I enjoyed. I tried 3JS, 2GTJS, that fancy Game Development Toolkit. Not sure what it is but I tried a bunch of things. At the UI level itself I was never convinced nor drawn to the game enough to give more time. 

What's next? I would definitely like to pick this up because I think this will be made in the future even if I don't build it. Someone will build it. But as of now it is on hold.
```

### Agent record

- Assessment: technically ambitious AI-native open-world simulation; the decisive unresolved question is human playability and emotional pull, not simulation capability.
- Start / latest commit: `1fa5b64` (2026-06-20) / `896231f` (2026-08-22).
- Stack: TypeScript, Vite, React Three Fiber, Three.js, Rapier, Node simulation server, Cloudflare Worker and Durable Objects, Astro, Vitest, Playwright.
- Git snapshot: `sarthakagrawal927/aliveville`; 48 commits; clean `main` matched `origin/main`.
- Public links: `https://aliveville.com` and `https://aliveville.com/game`.
- Open issues: none.

## Anchor

```text
The purpose of anchor was that I was not focusing on one task at a time and when I did focus on one task at a time, I often got distracted by some things. It can be a doorbell. It can be someone calling me. It can be some Slack message. Anything so I wanted to be conscious of those choices. 

I think it is ready. I have to start using it. 

What's next for this product? This product will be part of my Significant-Hobbies Hub and I intend to actively use it.
```

### Agent record

- Assessment: interruption-first focus analytics, not a generic timer; it is ready for personal dogfooding and Hub integration.
- Start / latest commit: `ee89a4d` (2026-08-16) / `70f73c0` (2026-08-22).
- Stack: Swift, SwiftUI, SwiftData, CloudKit, Swift Charts, Apple Foundation Models with rule fallback, XcodeGen, macOS/iOS/watchOS, Astro landing.
- Git snapshot: `Significant-Hobbies/anchor`; clean `main` matched `origin/main`.
- Public link: `https://anchor.significanthobbies.com`.
- Open issues: #4, #3. iOS 1.0 (2) had completed processing and awaited internal tester assignment.

## Anime List

```text
I started anime-list to talk as just a backend service to have better filters that my anime-list was not providing. With the help of AI I was quickly able to build up content and it is something I use very frequently. 

I think this product is done. I tried and thought about adding a bunch of side features but I don't really think I am invested enough in the anime world to use any of them. This will just be a directory and a watch list. 

This will be done until some major functions, I think. It will be done only.
```

### Agent record

- Assessment: finished personal anime/manga discovery utility; the directory and watchlist are the product, not an anime-community expansion.
- Start / latest commit: `981f17b` (2026-08-01) / `2e45ec2` (2026-08-22).
- Stack: TypeScript, React 19, Vite, TanStack Router/Query, Tailwind, Hono Cloudflare Worker, D1, Google OAuth/JWT, Jikan, PostHog, Vitest, Playwright.
- Git snapshot: `Significant-Hobbies/anime-list`; observed on `fix/agent-edge-api-passthrough` tracking its origin branch, with modified `index.html`.
- Public link: `https://anime.significanthobbies.com`.
- Open issue: #74.

## App Health

```text
I started App Health because in my production server, where I work, we had:
- sentry
- posthog
- Slack messages
- Google Cloud
I personally did not enjoy using these tools. I wanted to build something which was very easy to set up in new projects and also could take open telemetry. Once integrated it just gives me a high-level image very easily and smoothly about what APIs are failing, what is going on, and similar things.

I think it is at a good v1/v0 stage. I have to use it more aggressively throughout my projects and then improve it.
```

### Agent record

- Assessment: a coherent privacy-first endpoint-observability product; adoption across owned services should decide the next improvements.
- Start / latest commit: `3ab09c6` (2026-07-21) / `70a8496` (2026-08-21).
- Stack: TypeScript monorepo, React/Vite, Cloudflare Worker, D1, Analytics Engine, Node Express/Hono/Pages SDK, Go net/http/Echo SDK, OTLP/HTTP, Zod, Vitest, Go tests.
- Git snapshot: `sass-maker/app-health`; `main` matched `origin/main`; observed modified `apps/worker/src/agent-edge.mjs`.
- Public links: `https://health.sassmaker.com` and `https://ingest.sassmaker.com`.
- Open issues: none.

## Calorie

```text
I was trying to lose weight so I built this. It's just a simple calorie tracker in which you can input your food, you can input your log time, and it will tell you:
- how your fasting schedule was
- when the good exercise window is
- how you performed in days

I think it is at a good stage. I would say it's done. For next, this is to just use it more and connect it to the hub that I am building.
```

### Agent record

- Assessment: finished local-first food and timing journal; future work should come from daily use and Hub integration, while preserving its non-medical scope.
- Start / latest commit: `adb0e7c` (2026-08-11) / `d6de133` (2026-08-22).
- Stack: SwiftUI iPhone/iPad app, TypeScript Cloudflare Worker, D1, Better Auth, Sign in with Apple/Google, static landing, deterministic nutrition/timing formulas.
- Git snapshot: `Significant-Hobbies/calorie`; clean local `main` was two commits ahead of `origin/main`.
- Public link: `https://calorie.significanthobbies.com`.
- Open issue: #65. Calorie 1.0.0 (4) was available to internal TestFlight testers.

## ChatGPT Connections

```text
ChatGPT connections: the purpose for this was that I have a lot of projects and there was no solid way for me to connect with them with ChatGPT so this was built. 

I think it is done. It works. Nothing extra to add, just more connections maybe in the future and maybe even a stronger connection. 

While we are at it I want you to go check out this project and see if ChatGPT connections is the correct word or MCP connections would be better.
```

### Agent record

- Assessment: a shared, read-only integration gateway for selected cloud-backed Fleet products. ChatGPT is the current product destination; MCP is the protocol that implements it.
- Start / latest commit: `1b299552a4efed77f3e51ec5e3279fd3e193df52` (2026-08-11) / `10251116fc40d3f0ddb7c1e7240b21667edcdb32` (2026-08-22).
- Stack: TypeScript, Cloudflare Worker, Streamable HTTP MCP, Auth0 OAuth 2.1, jose JWT/JWKS, OpenAI app-listing packages.
- Git snapshot: `sass-maker/chatgpt-connections`; clean `main` matched `origin/main`.
- Public links: `https://reader-mcp.significanthobbies.com/reader/mcp`, `https://mcp.highsignal.app/high-signal/mcp`, and `https://mcp.sassmaker.com/saas-maker/mcp`.
- Open issue: #2, “Publish Fleet Mcp Plugins.”
- Naming decision: retain **ChatGPT Connections**. “MCP Connections” is protocol jargon and suggests a general multi-client product that this project does not yet claim to be. Use “read-only MCP gateway for Fleet products” as the technical descriptor. OpenAI currently frames MCP servers as a way to extend ChatGPT and Codex, supporting the ChatGPT-facing product name ([OpenAI Developers](https://developers.openai.com/)).

## ChatGPT Memory Insights

```text
I started off this product to have a way to analyse my conversations I have with ChatGPT. Its purpose is that I can use an exported version of ChatGPT's conversation and it will give me insights into memory, what I talk about, my emotions, and other relevant things. 

I would say it is at a good stage but I would not call it complete. I think the dashboard and Insights can still use some improvement. In future I would want to include local codecs and cloud agent chats and more cloud services maybe, but add more insights I would say. maybe historical shift
```

### Agent record

- Assessment: a browser-only personal AI-history explorer. Its privacy boundary and evidence-linked claims are the product's differentiators; the next coherent increment is richer historical insight before widening sources.
- Start / latest commit: `3702103f993b6dd7ff87f535b03e6299b2908b0e` (2026-07-28) / `7de17a60706bf131e517daa7a284ee013cd86608` (2026-08-20).
- Stack: Astro, TypeScript, Tailwind CSS, Transformers.js, Observable Plot, ZIP parsing, Cloudflare Pages, browser IndexedDB, browser-loaded embedding and optional local generation models.
- Git snapshot: public `Significant-Hobbies/chatgpt-memory-insights`; `main` matched `origin/main`; observed modified `public/api-ai.json`, `public/llms.txt`, and untracked `functions/`.
- Public link: `https://chatgpt.significanthobbies.com`.
- Open issue: #22, “Allow adding claude chat cloud, Claude Code and codex sessions from local.”

## Chess

```text
I started off to have a chess player on board which can use my local AI agent to help me improve but I would call it B-0 completed. I have no intention of making more progress in this project since I have a bit lost interest in the game.
```

### Agent record

- Assessment: a complete-enough browser chess coach with a deliberately local development-only AI coaching path. The owner's retirement decision is consistent with the catalog's archived state.
- Start / latest commit: `bb732dac8256cb3cff96349a4e54134f4f3ec727` (2026-07-17) / `c4d877ddbbbcaf1096ef31e69e15105a4073dc40` (2026-08-17); 90 commits.
- Stack: React 19, TypeScript, Vite, Stockfish 18 WASM, chess.js, React Chessboard, browser localStorage, optional local Express CLI bridge, Cloudflare Pages.
- Git snapshot: public `Significant-Hobbies/chess`; clean `main` matched `origin/main`.
- Public link: `https://chess.significanthobbies.com`.
- Open issues: none.
- Catalog state: archived experiment (2026-08-20); live public surface retained, not an active sharing target.

## CodeVetter

```text
Ah this is a big one. I think this is the flagship product right now. I started off with trying to build a better AI agent reviewer because I realised that AI code review is the next big thing and I wanted to keep it local first instead of paying for others' people. Currently while it has some good developed features, it is far from done. I will keep iterating on it for what's next on this product: more iterations, more improvement, make it one of the better products in the market.
```

### Agent record

- Assessment: the strongest Fleet flagship candidate. Its defensible direction is executable, receipt-backed verification of agent changes—not a generic LLM review opinion—and local-first operation makes that direction credible.
- Start / latest commit: `d0598f32ced0673f00fcf349ddb76ce531599c38` (2026-08-14) / `a0ece16c3d90487070b697718b0a9d06f0dff7d3` (2026-08-22); 966 commits.
- Stack: Tauri 2, Rust, React 19, TypeScript, Vite, Tailwind, shadcn/ui, local SQLite, Node evaluation and benchmark tooling, Playwright, Astro landing page, Cloudflare Pages.
- Git snapshot: public `Codevetter/codevetter`; `main` matched `origin/main`; observed substantial ongoing local work across the landing page, context-provider benchmark tooling, and related new directories.
- Public links: `https://codevetter.com`, source `https://github.com/Codevetter/codevetter`, and docs `https://codevetter.com/docs/`.
- Open issue: #159, “Compare Code Context Providers.”
- Catalog state: P1 focus product, active, deployed, maintained, and public-ready.

## Companion Robot

```text
Companion robot is a project for the future. I don't think I have done anything yet apart from planning out the future. It is in an ideation state and something that I will pick in the future.
```

### Agent record

- Assessment: a thoughtfully scoped embodied-agent thesis, but it is planning material rather than a product. The concrete reopen gate is an explicit decision to buy the hardware and begin Phase 0.
- Start / latest commit: `606697bfc458b04b57e80c94c8ed8754cd2eaff3` (2026-06-25) / `a7c0cb4fa9ad9e7cce24035ece61d196cf82f46c` (2026-07-17); 7 commits.
- Planned stack: iPhone/Swift head, ESP32/Arduino wheeled base, BLE and Wi-Fi, Apple Vision, and a Mac/Pace local AI brain; no implementation shipped.
- Git snapshot: public `HeyPace/companion-robot`; clean `main` matched `origin/main`.
- Public link: source only, `https://github.com/HeyPace/companion-robot`; no deployed product.
- Open issue: #1, “Non-Destructive Food Nutrition Scanner” (an unrelated later idea, not part of the documented robot v1 plan).
- Status reconciliation: repository status calls the project parked/delayed (not archived), while the Fleet catalog currently classifies it as an archived, undeployed experiment. The owner's current framing supports “parked/ideation” if the catalog is updated later.

## Drank

```text
Drank, I started off because The domain ranking API suddenly got free and I was like I should have a tool to check domain rankings of my products. 

I would say it's done. It is kind of like a skill. It's kind of inside the site health product. I don't see myself doing any further developments on this.
```

### Agent record

- Assessment: a finished, local-first Domain Rating tracker made practical by Ahrefs' free endpoint. It works best as shared portfolio/SEO infrastructure, rather than as a product that needs a roadmap of its own.
- Start / latest commit: `d9ab244717c410a16fe1e6fc5803cc9b93e18e54` (2026-07-02) / `cec8b80a857dbf9a29e72dc0f97f51884059e906` (2026-08-22); 77 commits.
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts, framer-motion, browser localStorage, Cloudflare Pages Functions, Ahrefs free Domain Rating API, and GitHub Actions weekly global-data refresh.
- Git snapshot: public `sass-maker/drank`; `main` matched `origin/main`; observed local work across public discovery assets, middleware, headers, data, and layout.
- Public link: `https://domains.sassmaker.com`.
- Open issues: none.
- Status reconciliation: the source was explicitly restored as a standalone repo on 2026-08-20, and its documented integration is currently with High Signal's `/domains` lens—not Site Health. The Fleet catalog still marks it active/maintained. The owner's “done/infrastructure” framing supports later recategorizing it as maintained shared infrastructure with no planned feature work.

## Elves HQ

```text
Elfs HQ is kind of a drop product. I started off because I wanted a place where elves can work on my products so I wanted a UI in which there would be elves. They would be working on things and they would just notify me on a mobile application when they were done or needed some help. 

I could not build a UI that I was happy with on Mac OS. I think if I had started on the web it would have been more promising but the web would have its own set of issues connecting with the machine. Very soon Claude and Codex have very improved remote control and I don't really see myself changing my current development thing with the product I built so I dropped it.
```

### Agent record

- Assessment: a substantial local task-room cockpit, not merely an unstarted idea. Its job is now being overtaken by the remote-control and orchestration capabilities of the coding agents it was meant to coordinate; retirement is the sound call.
- Start / latest commit: `a40be7edd31c7e80f826e3a34f28d103ffbc67b7` (2026-07-07) / `14bbdd61dc99bb211215f5d9cdeb61c785729b0c` (2026-07-25); 81 commits.
- Stack: pnpm TypeScript workspace, Vite/React local cockpit, Node local daemon, built-in SQLite, local Codex CLI and Git worktrees, with a CodeVetter review-gate adapter.
- Git snapshot: private `sass-maker/elves-hq`; clean `main` matched `origin/main`.
- Public link: none; source is private and no deployment exists.
- Open issues: none.
- Catalog state: archived, undeployed, hidden; explicit reactivation is required.

## Email Manager

```text
Email Manager I built because I was getting a lot of mails and Gmail's UI was not doing it for me to analyse who is spamming me more and how to unsubscribe from them more efficiently. I would say it is done. I don't want to add more features. It just connects and does the job.
```

### Agent record

- Assessment: a finished personal Gmail utility with an unusually strong privacy and safety boundary: mailbox data and embeddings remain in the browser, Gmail access is read-only, and unsubscribes require explicit clicks.
- Start / latest commit: `2e92676c3067630c3b19277705fd80d9f3bdc513` (2026-07-17) / `ade59255e434ff82e78a91e0ff750a5c18f4281f` (2026-08-22); 241 commits.
- Stack: React, TypeScript, Vite, Hono on Cloudflare Workers, Astro landing, better-auth/Google OAuth, Cloudflare D1 for auth sessions, IndexedDB, browser Transformers/ONNX semantic embeddings, Gmail REST API, and PostHog.
- Git snapshot: public `Significant-Hobbies/email-manager`; `main` matched `origin/main`; observed local work across public discovery files, worker edge behavior, headers, and local tooling caches.
- Public link: `https://mail.significanthobbies.com`.
- Open issues: #45, “Migrate Kinetic OAuth to a dedicated Google Cloud project and complete Gmail verification”; #32, “Reduce code-health baseline debt.”
- Operational caveat: #45 is material—until the canonical Google OAuth callback is registered and verified, a fresh production sign-in can fail with `redirect_uri_mismatch`. This is maintenance/connection reliability, not a request for new product features.
- Catalog state: active, deployed, maintained toolbox product.

## Everything Rated

```text
Everything Rated. This is also a fancy project that I had wanted to build for a long time. The purpose of this product was that you can come, make lists, and rate things. After building it out I realised this is a social product. As of now I didn't really have a lot of energy to build out a social product because it's a big chicken-and-egg problem to solve in those cases. This is something I would re-pick again once I'm more confident in my marketing skills.
```

### Agent record

- Assessment: the generic “rate anything” ambition correctly exposed a marketplace bootstrap problem. The retained implementation narrowed to anonymous, multi-axis AI developer-tool adoption decisions; it is a credible POC, but not a substitute for the distribution and moderation needed for a social ratings network.
- Start / latest commit: `d2d3f4f15248e0030ccfc059c160dacab29c3416` (2026-06-20) / `b118c3cc89450eea3026a6275140b41c83363418` (2026-08-22); 154 commits.
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS, Cloudflare Workers via OpenNext, Cloudflare D1, Drizzle ORM, PostHog, and a pnpm monorepo.
- Git snapshot: public `High-Signal-App/everythingrated`; `main` matched `origin/main`; observed substantial local work across the application, data catalog, tooling, configuration, and tests.
- Public link: `https://ratings.highsignal.app`.
- Open issues: none.
- Catalog state: archived experiment, with the deployed public POC retained but not an active sharing target.

## Field Track

```text
Fieldtrack is a product I'm building for my dad but as of now the economics of this do not make sense and I will have to build it out eventually. I am kind of delaying it because I did not want to deal with android application building. It's a product in which you can track the employees by installing an application on their phone. They can choose when they want to track
```

### Agent record

- Assessment: a private field-operations MVP with a real implementation path, but no business/deployment validation yet. Android physical-device testing and a clear economic case are both prerequisites to treating it as an active rollout.
- Start / latest commit: `b0008e0f02fa126d95260cbe6287c11a77961a18` (2026-08-12) / `87936b7e87dc8a37c23d43e97fca358e9b4e9504` (2026-08-20); 5 commits.
- Stack: React Native Android, native Kotlin foreground location service, Android SQLite, Astro/React manager dashboard, Cloudflare Worker and D1, MapLibre, and Cloudflare Access for the intended production manager boundary.
- Git snapshot: private `sass-maker/field-track`; clean `main` matched `origin/main`.
- Public link: none; no verified production deployment.
- Open issues: #4, “Build Employee Location Tracker Mvp”; #2, “Verify Android debug APK on physical pilot devices.”
- Product-boundary discrepancy to resolve before rollout: the written product contract intentionally has **no employee start/stop/pause control** after administrator enrollment; server policy chooses which continuous points are retained. Your description says employees can choose when to track. That consent/control decision is material for product, legal, and technical design, so it needs an explicit later decision rather than being assumed.
- Catalog state: active private P2 MVP, undeployed and not ready to share.

## Forecast Lab

```text
Forecast lab is also a very interesting product. This is also a product I wanted to build for a long time. The purpose for this was to study statistics and understand how demand works in places like Zepto or other e-commerce stores based on region, timestamp, frequency, and other parameters and try to predict the future. This is a very complicated B2B SaaS product and since I did not have expertise and I had better things, I put a pause on this product so this will be on definite hold.
```

### Agent record

- Assessment: the original B2B demand-forecasting thesis was deliberately reframed into an eval-first ML learning lab. Its durable asset is the honest benchmark-and-baseline discipline, not a deployable forecasting SaaS; holding it is the sound decision absent data access, domain expertise, and a customer need.
- Start / latest commit: `87852bf2d06acb2ca08a5d1c025f842ed26eec9a` (2026-06-21) / `2aff0d8da3bd4272bb590441963442dee1f55034` (2026-07-04); 8 commits.
- Stack: Python/uv demand-forecast and recommender labs (numpy, pandas, scikit-learn, optional PyTorch), Rust/Rocket event forecasting, PostgreSQL/TimescaleDB locally, and a Vite/React CSV forecasting UI; datasets remain local and gitignored.
- Git snapshot: `sarthakagrawal927/forecast-lab`; clean `main` matched `origin/main`.
- Public link: source `https://github.com/sarthakagrawal927/forecast-lab`; no deployed product.
- Open issues: none.
- Catalog state: archived, undeployed experiment. Repository status calls it parked rather than archived, with reopen triggers of a concrete product/hiring need or return to systematic ML study.

## Free AI

```text
Free AI is also a really good product. There are a lot of free AI providers which give you a decent daily free tier. I aggregated them into what kind of tool they can provide and put them behind a load balancer type thing. I can get access to a free AI whenever I want. So far it has been working well for my internal products. In future I would want to add hopefully more free AI options.
```

### Agent record

- Assessment: a useful internal platform rather than a generic AI chat product. Its durable value is capability-aware, health-based fallback across free tiers behind one OpenAI-compatible contract, with explicit rate and cost safeguards.
- Start / latest commit: `0679a37df649075b667ace953630d994e7ed16a3` (2026-07-18) / `cd0ed06a4d98b1fbe1c5d676a27d55e6b3965215` (2026-08-22); 226 commits.
- Stack: TypeScript, Hono, Cloudflare Workers, D1 aggregate analytics, Durable Objects for health/rate/budget state, KV, Workers AI, Zod, React/Vite and Astro/Starlight documentation surfaces.
- Git snapshot: public `sass-maker/free-ai`; `main` matched `origin/main`; observed local work in the worker agent edge, public LLM discovery file, and a tooling cache.
- Public link: `https://ai-gateway.sassmaker.com`.
- Open issues: none.
- Operating boundary: this is best-effort free-tier routing, not an SLA. Providers can throttle or disappear and all capable options can be unavailable; the gateway is designed to fail over or return a transparent failure rather than promise uninterrupted free inference.
- Catalog state: active, deployed, maintained public platform/toolbox product.

## GitStat

```text
Gitstat is, I think, the newest addition. I just wanted to see the churn of all my work across the projects. I built this out. It takes in all the commits I have done in the past and does some analysis on them. In the future I might add something but otherwise it is more or less done for now. Not sure what I would do more.
```

### Agent record

- Assessment: a focused contribution-history and churn dashboard. It already covers the important personal questions—activity, churn, AI involvement, collaboration, commit patterns, PRs, issues, and repositories—so additional features should come only from a recurring unanswered question.
- Start / latest commit: `c6fdd01bdd5d5d5072a7186c0af20cc8eb1fee30` (2026-08-21) / `44f2af1ee3c4b8b9b862964eff94ef7e43e1171a` (2026-08-22); 5 commits.
- Stack: React 19, TypeScript, Vite, Tailwind CSS, Cloudflare Pages Functions, and GitHub REST/GraphQL APIs.
- Git snapshot: public `sass-maker/gitstat`; clean `main` matched `origin/main`.
- Public link: `https://git.significanthobbies.com`.
- Open issues: none.
- Operational caveat: anonymous public analysis is live, but the optional GitHub connection flow is currently not repaired; catalog sharing remains gated until it is. This limits private-repository coverage and the user's own GitHub rate-limit path, but not the public-analysis surface.
- Catalog state: active P2 deployed product, intentionally hidden from public listing while the connection flow is repaired.

## High Signal

```text
High-Signal is kind of started with very wide things but now I have focused it into just a data and news application. Currently it just aggregates information from a lot of sources and tries to derive signals. As of now I am not actively using it but I do see its potential. For now it's on hold and once I start using it then I will pick it up again.
```

### Agent record

- Assessment: the broad product has been usefully narrowed to an evidence-qualified Daily Brief across technology, startups, finance, and public markets. It has substantial operational machinery, but owner usage—not another source or lens—is the right reopen gate.
- Start / latest commit: `1f8aa26d2b1f74efd538e74ce92dbc7ecfa480fc` (2026-08-12) / `124f2fcb10094bac77c95138746f25fbc77075fe` (2026-08-22); 712 commits.
- Stack: Next.js 16/OpenNext, TypeScript, Tailwind, Hono, Cloudflare Workers and D1, Drizzle, Python/uv ingestion and scoring, GitHub Actions schedules, Git-backed signal records, and an OpenAI-compatible AI endpoint for bounded tasks.
- Git snapshot: public `High-Signal-App/high-signal`; `main` matched `origin/main`; observed modified `apps/web/src/app/layout.tsx`.
- Public links: `https://highsignal.app` and `https://highsignal.app/api-docs`.
- Open issues: none.
- Status reconciliation: the catalog currently calls High Signal active, deployed, maintained, and public-ready (P2), while the owner says it is on hold pending personal use. The portfolio should later distinguish “live and maintained technically” from “not receiving product investment until the owner uses it.”

## Indulge

```text
Indulge is also quite interesting. I had this idea sitting in, just purely for an iOS application. Imagine an app in which you can select your various indulgences, like TV, adult content, or whatever. You can select multiple and you get a hybrid image of those two things. For example, TV and gaming: you get a TV and a gaming console. You add food and you get popcorn on the side.

I had this idea for beautiful onboarding so I was like, let's build it out. It turned out fine. Now I have kind of built it into a habit, because breaking bad habits inherently needs something to replace. It's an idea on that. It is also part of Significant Hobbies Hub so I intend to use and build on it.
```

### Agent record

- Assessment: an unusually well-formed personal habit product whose core mechanism is non-moralizing replacement, not suppression or streak scoring. The visual onboarding and evolving Life → Trade → History scene are integral to that proposition, not cosmetic work.
- Start / latest commit: `f2a7aad100fd82d5b0b7ff7dfb3b2543fe0be149` (2026-08-11) / `aa3597a35390f88741077f97a7e7e5f016e1f58c` (2026-08-22); 41 commits.
- Stack: native SwiftUI and RealityKit iPhone/iPad app, SwiftData, optional Sign in with Apple and Cloudflare Personal Platform synchronization, optional Apple Image Playground, XcodeGen, and an Astro static landing surface.
- Git snapshot: private `Significant-Hobbies/indulge`; `main` matched `origin/main`; observed local landing/site validation, layout, and OpenAPI changes.
- Public link: `https://habits.significanthobbies.com` (`https://indulge.significanthobbies.com` is a compatibility landing).
- Open issues: none.
- Release state: Habits 0.1.0 (6) was available to internal TestFlight testers on 2026-08-22; no public TestFlight or App Store release is approved.
- Naming reconciliation: the user-facing product has been renamed **Habits**; Indulge remains the repository, bundle, and historical implementation identity for safe transition. The portfolio should show “Habits (formerly Indulge)” while retaining the historical origin story.

## India Standards

```text
India Standards: this is also a very interesting product. The purpose of building this was that I wanted to see how well a person is doing in India. Basically just see overall coverage by using the official data. I think if I, in the future, unlock more data quality, I would want to expand on this. Otherwise it's on hold for now.
```

### Agent record

- Assessment: a transparent demographic-calculator experiment whose integrity depends on strict aggregate-only and uncertainty boundaries. The right reopen trigger is materially more authoritative, jointly usable data—not broader filters or more confident claims.
- Start / latest commit: `73a290011fb4527f7f874d998b43578b1e25be23` (2026-07-27) / `ed39fa6988e17121cf42d3ac92c0ab936bfb269d` (2026-08-21); 32 commits.
- Stack: Next.js, React, TypeScript, DuckDB local ETL/parity tests, MotherDuck aggregate-only serving tables through PostgreSQL, Cloudflare Workers/OpenNext, and PLFS 2025 controlled local input.
- Git snapshot: public `Significant-Hobbies/india-standards`; `main` matched `origin/main`; observed local worker, agent-edge, layout, and public discovery-file changes.
- Public link: `https://india-standards.significanthobbies.com` (`india-numbers.significanthobbies.com` is a compatibility alias).
- Open issues: #31, “Import Official Survey Data”; #30, “Deploy Motherduck Cloudflare”; #29, “Build Local India Standards Calculator.”
- Data boundary: the live calculator is explicitly a PLFS-backed preview, not fully survey-backed; NFHS access and height modelling remain unavailable, and person-level records are never served. The product must retain those disclosures.
- Status reconciliation: the catalog calls it active, deployed, and maintained (P4), while the owner places it on hold pending better data quality. That owner gate should control future investment.

## Materia

```text
Materia is also kind of an over-ambitious project. I wanted to have an encyclopaedia-like product in which you can come to visit, click on any body parts you have issues with, go deep into it, and see what all herbs and medicines are there to treat it. This is a product I will very actively pursue in the future but for now I don't have time or focus for
```

### Agent record

- Assessment: a strong but exceptionally demanding evidence-reference thesis: interactive anatomy joined to an evidence-graded remedy graph. Its trust and content-maintenance burden, rather than software capability, is the central constraint; pausing until there is a defined evidence/content budget is prudent.
- Start / latest commit: `48b4b3269bbaee8ea83a0214a1848391929e6678` (2026-06-21) / `3f61c2223c7e930c78595a25330b658538d11d17` (2026-08-22); 47 commits.
- Stack: Astro static site, React 19 islands, Tailwind CSS, TypeScript, Three.js/react-three-fiber, nanostores, Zod content collections and graph references, Vitest, and Cloudflare Pages.
- Git snapshot: public `Significant-Hobbies/materia`; `main` matched `origin/main`; observed substantial local work across content importers, safety checker, content pages, tests, and project configuration.
- Public link: `https://materia.significanthobbies.com`.
- Open issues: none.
- Safety boundary: educational reference only—not diagnosis or medical advice. Every efficacy claim requires a citation at build time; remedies are graded conservatively per condition, safety is separate, and the product describes study ranges rather than prescribing doses.
- Catalog state: archived P4 experiment, with the 555-page public reference retained but not an active sharing target. Repository closure says reopen only with sustained traffic and a defined evidence/content budget.

## Open Historia

```text
I played a game called Historia. I really liked it but it was limited on credits so I was like, let's build a version in which I can use things locally. That is, it uses a local codex AI agent and it works in the browser and it works for free. After playing 1 or 2 games and the map quality not being good enough, I dropped it but this is something I would want to pick up in the future when I do a live build because it is also kind of like long-form memory but for countries.
```

### Agent record

- Assessment: a compelling AI-native grand-strategy experiment whose novel core is durable, compressed country-level history (“story so far”) combined with natural-language orders. The current prototype has a broad system surface, but the single coherent campaign turn loop and a map that feels game-quality are the actual reopen gates.
- Start / latest commit: `7b052aa7b2796f838fbedbc5855fd40ab12be0fb` (2026-06-04) / `5fe61f4147fb48cfbbd42e000bb8bb0cb053e9f0` (2026-08-22); 207 commits.
- Stack: Vite 8, React 19, TypeScript, Tailwind CSS, MapLibre with hierarchical TopoJSON map levels, Hono/Cloudflare Workers, Turso/libSQL, Drizzle, better-auth/Google OAuth, browser localStorage, multi-provider AI and a local development bridge, Astro landing, Vitest, and Playwright.
- Git snapshot: public `sarthakagrawal927/open-historia`; local `main` was clean and two commits ahead of `origin/main`.
- Public link: `https://historia.aliveville.com`.
- Open issues: none.
- Scope correction: the local AI bridge is a development mode; the deployed game is architected to use server-side multi-provider AI through its gateway. Offline local saves work without authentication, but AI turns themselves are not an offline runtime guarantee.
- Catalog state: archived P4 experiment in the AliveVille/AI-game family; its live surface is retained, but it is not an active sharing target.

## Pace

```text
Pace. It started off as a fork of a product called Hey Clicky. I also wanted to build a personal assistant. I copied most features. I added some features of my own. I wanted to make it a local-first product. I think it's pretty well made also. I tried training my own model. It has a lot of features, it has a lot of abilities, but I've never really used it myself. I don't know why. I don't really have a solid answer why I did not use it but since I did not use it, it kept falling in priority. I would definitely want to work on this more in the future.
```

### Agent record

- Assessment: Pace has a serious differentiated thesis—fast, privacy-first, on-device Mac assistance with screen context and approved actions. Its gating problem is not capability breadth but product pull: regular owner use must expose the one or two moments it should own before more feature expansion is justified.
- Start / latest commit: `3efd1a265dc94816bd78d998c37c9bbd4b9028d8` (2026-07-13) / `12b1ff1a8cf844a23c5bd26e419bc30fc81f3dd0` (2026-08-22); 50 commits.
- Stack: native Swift/SwiftUI and AppKit macOS menu-bar app, Apple Speech/WhisperKit, ScreenCaptureKit, on-device VLM/planners through MLX and Apple Foundation Models, local TTS, Accessibility/CGEvent automation, persistent local JSON memory, typed MCP/automation catalog, XCTest/evaluation harnesses, and Astro/Cloudflare Pages website.
- Git snapshot: public `HeyPace/pace`; `main` matched `origin/main`; observed untracked local build and Personal Platform/PersonalSyncKit directories.
- Public links: `https://heypace.app`, source `https://github.com/HeyPace/pace`, and releases `https://github.com/HeyPace/pace/releases/latest`.
- Open issue: #157, “Build Spatial Teach Mode and evidence-rich compiled flows.”
- Local-first boundary: its default/aspirational posture is fully on-device, but optional explicit off-device tiers (CLI bridge or direct API) exist and must stay visibly disclosed. Public Mac distribution also still needs Developer ID signing, notarization, and a real-hardware smoke gate.
- Catalog state: active P1 focus product, deployed, maintained, and public-ready—despite the owner's current lower personal-use priority.

## PostTrainLLM

```text
Ahha! Another flagship product. It started off as a curiosity exploration that I wanted to see what all we can do on the web. Chrome had been shipping a lot of things. There were a lot of improvements in WebGL so I was like, let's try to train a model in the browser. I succeeded, built something decent, then ambition grew and I started training on my Mac, built Mac applications, tried building a lot of things. I think that this product will be ongoing as I keep finding more experiments to do. It has a lot of recipes and a lot of future plans so yeah I will be working on it. I think it's a parallel product along with CodeVetter, one of the flagships.
```

### Agent record

- Assessment: correctly a flagship alongside CodeVetter. The active product is now a Mac-local specialist-model factory—target → data → post-training → evaluation → package → report—while browser/WebGPU training remains the origin story and a valuable parked research asset. Its strength is measured, reproducible local capability rather than trying to outscale frontier training.
- Start / latest commit: `567a3715003c98c4ed68e773b2a2b122b92903a1` (2026-07-26) / `595f3516bddba1e1a7d0ef877274d5d10854b613` (2026-08-22); 755 commits.
- Stack: Swift/MLX native Mac CLI and app, Python reference/data tooling, browser Astro/WebGPU/WGSL/WASM playground, Rust helper tools, LoRA/distillation/evaluation harnesses, local OpenAI-compatible serving, and Cloudflare Pages public documentation/playground.
- Git snapshot: public `PostTrainLLM/posttrainllm`; `main` matched `origin/main`; observed local browser-site configuration and layout changes.
- Public links: `https://posttrainllm.com`, docs `https://posttrainllm.com/docs/`, source `https://github.com/PostTrainLLM/posttrainllm`.
- Open issues: #125, “Build 50m Character Chess Specialist”; #111, “Evaluate parakeet.wgsl for local browser transcription”; #110, “Evaluate Needle 2 as the tiny tool-calling baseline”; #101, “Build a privacy-first personal-style dataset pilot from ChatGPT and Codex history.”
- Operating boundary: heavy GPU or model-training loops require explicit owner approval; active experiments must enter the factory loop with frozen evaluation and a reportable ship/reject decision, while broad browser polish and other research tracks remain parked unless needed.
- Catalog state: active P1 focus product, deployed, maintained, and public-ready.

## Protein Index

```text
Protein index is something I wanted to build to see what all protein products are available in India, see them, catalogue them, and sort them. It is a decent product but the data is expensive and is unavailable right now for me so I kind of put a pause on this product until the data thing is better sorted. Might pick up in the future when things are clear.
```

### Agent record

- Assessment: a high-integrity Indian protein-product intelligence project whose actual moat is evidence provenance and canonical product identity, not the catalog UI. Its data-access problem is fundamental: commercial GS1/DataKart and retailer-authorized sources are needed to support trustworthy current-market coverage, so pausing is correct.
- Start / latest commit: `71d860be5034b3b7c4992585ce67c394ea15c827` (2026-07-18) / `ec15b4fef1006f47506acbe43ba3e8076e1a6361` (2026-07-25); 233 commits.
- Stack: Vite, React, TypeScript, Hono, Cloudflare Workers, D1, private R2 evidence storage, GTIN-based canonicalization, controlled ingestion/evidence pipelines, and Open Food Facts bootstrap data.
- Git snapshot: local `protein-index` checkout tracks public `Significant-Hobbies/protein-index`; local `main` was one commit ahead of `origin/main`, with modified public discovery files, Worker code, and Wrangler configuration.
- Public link: `https://protein.significanthobbies.com`.
- Open issues: none.
- Source mapping: this checkout/repository is the documented historical alias. The Fleet catalog identifies `Significant-Hobbies/protein-index-resilience` as the canonical public source, with `Significant-Hobbies/protein-index` retained as an alias.
- Catalog state: retired/archived P4 experiment. GitHub Actions, scheduled producers, publication jobs, CI, and deployment automation were removed; explicit reactivation is required.

## PSI Swarm

```text
Size Swarm is essentially a tool using Google's APIs, basically the Lighthouse API. Its purpose is to detect the performance we get in our products. It's kind of like a skill or whatever you can call it and it's a CLI tool and is also part of the Sight Health Tooling. I don't see myself further improving this product.
```

### Agent record

- Assessment: a completed local-first performance-measurement tool. Its key contribution is replacing a single noisy Lighthouse score with distributions across realistic conditions, so it belongs in ongoing fleet operations rather than a feature-product roadmap.
- Start / latest commit: `cfee3d77f26582ff2c9185e7cacdb86a052dea28` (2026-06-03) / `9664f3400cceca9dcc28750efc426d0f645bb86a` (2026-08-22); 59 commits.
- Stack: Node/TypeScript CLI, Lighthouse 13, headless Chrome, SQLite local history, Ink/React terminal UI, Astro/React/Tailwind local controller, optional OpenAI-compatible/local reasoning, Ahrefs free Domain Rating, and Cloudflare Pages static site.
- Git snapshot: public `sass-maker/psi-swarm`; `main` matched `origin/main`; observed local public-discovery files and an untracked web Functions directory.
- Public link: `https://performance.sassmaker.com`.
- Open issue: #18, “Publish a supported public local-agent distribution.”
- Ownership correction: PSI Swarm is a standalone Sass Maker repository that owns its CLI, runtime, documentation, and canonical skill. Site Health/Fleet may invoke it, but it is not implemented inside Site Health.
- Catalog state: active, deployed, maintained P4 toolbox platform. The completed operational stance is maintenance and use, not new feature investment.

## Kith

```text
Keetha! It is also something I wanted to build. I saw a tweet in which someone has built a very beautiful relationship management app. I was like, I also need a relationship management app so I decided to build it out. In terms of the future I intend to use it and see how it goes.
```

### Agent record

- Assessment: a deliberately personal, device-first relationship memory app. Its distinctive choice is an explicit closeness-based constellation and human notes/logs rather than CRM mechanics or inferred relationship scores; daily use should determine its next iteration.
- Start / latest commit: `b8a622e9e26fa5ac71e86ade558647a9cf857fca` (2026-08-16) / `844cac0ec89209dd789e2a78bed3d8e002e129fe` (2026-08-22); 30 commits.
- Stack: native SwiftUI iPhone app, local JSON document, XCTest, XcodeGen, optional private CloudKit mirror, Sign in with Apple and Cloudflare Personal Platform synchronization, and Astro static landing.
- Git snapshot: public `Significant-Hobbies/kith`; clean `main` matched `origin/main`.
- Public link: `https://kith.significanthobbies.com`.
- Open issues: #15, “Assign Kith 1.0.0 (3) to internal TestFlight testers”; #11, “Create a constellation-building onboarding journey for Kith.”
- Release state: Kith 1.0.0 (3) completed processing on 2026-08-22 but still requires internal tester assignment; no public TestFlight or App Store release is approved.
- Catalog state: active P2 maintained personal product, part of the Significant Hobbies Personal Platform family.

## Local AI Video Studio

```text
Local AI video studio. I think I started off this project because there are a lot of video editor tools which I was also researching, various video effects you can add, and how people using AI might be overkill for a lot of them. I wanted to build a system in which you can set up local video effects but with the help of an AI agent you can just tell it. It uses the best most optimised tool to add that effect for you without using current generative AI technologies. It's a product kind of like the past but it will also have fallbacks to go to the latest technology. It's an experiment. I lost interest after some time and might continue later.
```

### Agent record

- Assessment: a well-bounded local-first editing experiment, distinguished from generative video tools by converting intent into validated, reproducible Core Image/AVFoundation effect graphs and side-by-side variants. It should remain parked unless there is a real creator workflow it improves.
- Start / latest commit: `594f39fc751b32190d4485e09da8b74efdc02b5e` (2026-08-09) / `bdf14aa0b369bb48f8cdf6834053205972087653` (2026-08-21); 17 commits.
- Stack: Swift 6, SwiftUI, AVFoundation, Core Image, Core Media, VideoToolbox, XCTest, on-device Apple Foundation Models when available with deterministic local fallback, plus an Astro informational site.
- Git snapshot: private `sass-maker/local-ai-video-studio`; `main` matched `origin/main`; observed local public-discovery-file changes and an untracked `functions/` directory.
- Public link: `https://local-ai-video-studio.sassmaker.com` (informational site only).
- Open issues: #26, “Build Planner Training Corpus”; #25, “Build Local Video Studio Mvp”; #24, “Add Apple Foundation Planner.”
- Release state: local macOS app bundle only. Public direct distribution is closed pending an approved support contact and a Developer ID-signed, notarized, stapled, Gatekeeper-accepted DMG with a matching checksum.
- Status reconciliation: catalog calls it active/maintained and approves its informational site for sharing, while the owner calls the product an experiment that may resume later. Treat product investment as parked while retaining the site and local source.

## LoopTV

```text
Loot tv, I wanted a better experience of watching YouTube more controlled so I picked the top few video channels and decided to get their top videos in a tv5 format. This is done and I also added a much better search on this so that is also looking good. I don't see myself further improving this product and I would call it done for now.
```

### Agent record

- Assessment: a finished lean-back alternative to algorithmic YouTube browsing. Curation, stations, search, watched-state, and automatic handling of unembeddable videos make it complete for its constrained viewing use case.
- Start / latest commit: `a6ba2a0704f628756faf7cf6c0897d751eb9cc3d` (2026-07-17) / `a05335a6da30493387d2ece1e7baa4d01a79ee59` (2026-08-22); 240 commits.
- Stack: Astro static pages, React islands, TypeScript, Tailwind CSS, static JSON catalog, browser localStorage, YouTube IFrame and Data APIs, yt-dlp fallback, Free AI CI tagging, Python/Hugging Face NER fallback, and Cloudflare Pages.
- Git snapshot: public `Significant-Hobbies/looptv`; local `main` was clean and one commit ahead of `origin/main`.
- Public link: `https://tv.significanthobbies.com`.
- Open issues: none.
- Catalog state: active, deployed, maintained P4 toolbox product. Repository status independently calls the current scope feature-complete, limiting work to maintenance and catalog freshness.

## Reader

```text
I think Reader is one of the earliest products in the fleet and a product that started before all this by the way. Its purpose was to essentially let me post any website link and it just downloads everything and gets it ready for my viewing. While it is a good product, I also expanded it to have boards and other things. I've never really used it a lot. I have not been reading much. I will definitely want to pick and improve its tooling. I think there are a lot of tools that can improve the product once I start using it more.
```

### Agent record

- Assessment: a mature personal research library, not merely a read-later app: it captures articles and PDFs, supports annotations and AI-assisted work, and has the organisational depth the owner describes. The correct next move is personal-use validation, because the key unknown is whether the capture-to-reading loop actually earns a place in the owner's routine.
- Start / latest commit: `9607d0c8c7469f37ccade42380c5ac89e8bc4fc7` (2026-07-17) / `e8e1043c731dc783eaa6668fe772d71d8bf17f19` (2026-08-22); 317 commits.
- Stack: Vite, React 19, TypeScript, Tailwind CSS, Hono on Cloudflare Workers, Cloudflare D1 with Drizzle, Cloudflare R2 for PDFs, better-auth Google OAuth, AI SDK with free gateway/BYOK/local-AI paths, and a Chrome MV3 capture extension.
- Git snapshot: public `Significant-Hobbies/reader`; local `main` matched `origin/main`, with an owner-local modification to `app.html`.
- Public link: `https://read.significanthobbies.com`.
- Open issues: none.
- Catalog state: active, deployed, share-ready P2 Significant Hobbies product; repository truth says personal-use, maintenance-first support. This agrees with improving it only after renewed personal reading use shows what is missing.

## Reel Pipeline

```text
Reel pipeline, I don't know. It had the purpose of automating video building and just ensuring the videos were built for each product. They were auto-posted so this product kept spiralling into more and more features but never really got shipped. This is something I would definitely want to break and fix in the future but for now it is on hold.
```

### Agent record

- Assessment: the repository has substantial, real production infrastructure, but it over-expanded from a simple per-product reel and posting loop into a provider-neutral production suite. Its most valuable future direction is therefore a deliberately smaller end-to-end lane: one approved brief, one deterministic render path, human review, and one policy-gated publishing destination.
- Start / latest commit: `f5e9d65cd10f9433418a928f55b619d63e496add` (2026-06-24) / `a7663ef1fbb858134997d8db6ca73b6da4821a68` (2026-08-22); 91 commits.
- Stack: Node.js/JavaScript, Cloudflare Worker and R2 artifacts, FFmpeg and Chromium, optional Blender and Kokoro, contract-driven source packages and VideoBriefs, browser Studio, YouTube and Instagram adapters, plus policy-gated Postiz handoff.
- Git snapshot: public `sass-maker/reel-pipeline`; clean `main` matched `origin/main`.
- Public link: none approved. The retained Worker has no public domain or share-approved product surface.
- Open issues: #14, truthful cartoon-hand-pointer demo; #13, representative proof-gallery coverage; #11, creative-quality improvement from reviewed output/performance; #10, reproducible local-video recipes and episode assembly.
- Catalog state: active/deployed P2 with retained artifacts, but hidden from the public directory and explicitly not ready to share. The owner’s hold status should govern new investment; existing records show real foundations, not a shipped public product.

## Mashup

```text
Mashup's purpose was that I was thinking about how comedy videos can be used. For a comic artist he has many videos. For those videos I want to get a single video on a particular topic so Mashup would go check the video, cut and paste, and get the final video. It can also be used as a clipping tool, a motivation tool, and a clipper. It's a good clipper and a good merger. Essentially I want to spend more time on it in the future.
```

### Agent record

- Assessment: a standalone local-first, source-respecting video and podcast editing helper. Its core is stronger than a generic clipper: it analyses an owned archive, plans coherent multi-clip edits, preserves provenance and source hashes, requires approval before rendering, and can hand a finished result to another product without sharing runtime state. The owner’s comedy-video use case is a compelling concrete wedge for the broader machinery.
- Start / latest commit: `f53c484e97677d8473cc36a9259679717d921e10` (2026-07-25) / `c362195ceb801123b22ba7e5a797a3ce40770165` (2026-08-20); 35 commits.
- Stack: Python 3.11 with uv, SQLite, FFmpeg, optional local MLX/WhisperKit/Torch/Transformers, and an Astro/React loopback editorial interface.
- Git snapshot: public `sass-maker/mashup`; clean `main` matched `origin/main`.
- Public link: none; it is intentionally local-only and never publishes media itself.
- Open issues: #11, validate a hosted URL-to-clips product loop; #10, validate a zero-API-cost RSS-to-personalized-podcast loop.
- Catalog state: active P2 maintained experiment, undeployed, hidden, and not share-ready. It was extracted from Reel Pipeline on 2026-08-09 and restored as its own canonical repository on 2026-08-20; the only integration is an explicit finished-media receipt.

## Mobile Dev Cockpit

```text
Mobile dev cockpit is kind of in beta and also stopped for now. The purpose for this was for it to act as the mobile version of elf's HQ but since elf's HQ never fanned out I doubt mobile cockpit will ever. Its also purpose was to view the website on mobile but I have decided to go for building the apps instead so this will probably be stopped forever.
```

### Agent record

- Assessment: a technically thorough native iPhone/iPad companion for supervising a laptop’s bounded development workflows: pairing, repository enrollment, previews, coding-agent supervision, Git review, tests, and guarded deploy approval. It is not a thin Elves HQ client, but its product premise still depends on a workflow the owner has abandoned. Archive it rather than develop it further; the useful ideas are its strict pairing, command allowlisting, and approval model.
- Start / latest commit: `7cefa3132b15e7ae6a39e57ab52718b1a19c5571` (2026-07-13) / `746ebd33349e81287fb2d4c03b5f1ceeb72c6866` (2026-08-22); 31 commits.
- Stack: Expo Router SDK 57, React Native, TypeScript, Node.js WebSocket bridge with node-pty, shared TypeScript protocol, SecureStore/WebView, optional Tailscale, and native iOS support through Xcode/CocoaPods.
- Git snapshot: public `sarthakagrawal927/mobile-dev-cockpit`; clean `main` matched `origin/main`.
- Public link: none; no approved distribution surface.
- Open issues: none.
- Catalog state: archived P4, hidden and not share-ready. The catalog retains legacy Cloudflare Worker/container inventory only; it confirms there is no active physical-device, deployment, or Fleet Console work. This is fully aligned with the owner’s decision to stop it permanently.

## Motion

```text
Notion was another fancy thing that I wanted to build. Its purpose was to have mobile games playable on TV. For example you will set the mobile along with the TV. The mobile will record things and your actions will be transferred on the screen. You can play games like Subway while also getting a workout done. This is something I would definitely want to pursue in the future but for now it's on hold due to lack of time.
```

### Agent record

- Name mapping: the matching Fleet product and repository are named **Motion**, not Notion. The owner narrative above remains preserved exactly as stated.
- Assessment: a body-as-controller game concept with a sensible v1 reduction: the iPhone/iPad runs Vision body-pose detection and hosts the game locally, then mirrors to a TV. The repository deliberately parks multiplayer/browser-display infrastructure until the basic control feel is enjoyable. It is a promising physical-play experiment, but owner-held is the right status until there is time for physical-device playtesting.
- Start / latest commit: `4132b18acf32cc23566ca39a2065615230805aaf` (2026-07-19) / `a6431e9febbae0bb8e6a3bed939e7cfba148dd8a` (2026-08-22); 83 commits.
- Stack: Swift/iOS 17+, Apple Vision and AVFoundation body-pose capture, WebKit JavaScript bridge, ReplayKit, Vite/TypeScript Canvas game, optional PartyKit v2 relay, XcodeGen/CocoaPods, and Astro public landing.
- Git snapshot: public `Significant-Hobbies/motion`; clean `main` matched `origin/main`.
- Public link: `https://motion.significanthobbies.com` (public landing only; the game app remains unreleased).
- Open issue: #20, create the personal App Store Connect record and upload to TestFlight (deferred).
- Catalog state: active/deployed/share-ready P2 because the landing is live, while physical-device validation and app distribution remain parked. There is a technical ownership conflict to resolve before any landing work: the catalog points to the `ios-landings` factory, but Motion’s status document says this repository most recently deployed the same Pages project and one source must be retired.

## Significant Hobbies

```text
OK we need to move things outside and significanthobbies will be the hub and its backend, create a task for this reconcilliation

So hub backend is the backend for seven applications and its purpose is to join the applications and show it on a UI. It is currently being built and it would be an important project for future
```

### Agent record

- Identity: **Significant Hobbies** is now the Hub and its backend. The old standalone Hub Backend repository has been absorbed into `services/hub-backend`; stable Worker and D1 identifiers remain `personal-platform` to avoid an operational migration.
- Assessment: the canonical seven-app control plane. It serves the public Hub UI, composes privacy-safe summaries and actions, and versions `PersonalSyncKit` for native consumers while each app retains ownership of its immediate data.
- Start / latest commit: `7bb85f44783a9ee66ebe0f9111e3254c7d3b0348` (2026-08-21) / `56bf264b8bcf2aed5230398b34f9250f0de5c14a` (2026-08-23).
- Stack: TypeScript, Cloudflare Workers and D1, typed service bindings, Better Auth session verification, read-only MCP contracts, HTML Hub UI, and the Foundation-only Swift `PersonalSyncKit` package.
- Git snapshot: public `Significant-Hobbies/significanthobbies`; reconciliation merged in PR #140.
- Public link: `https://significanthobbies.com`; signed-out private Hub access redirects to login.
- Open issues: reconciliation issue #138 is complete; remaining product work stays in this repository.

## Portfolio

```text
Portfolio, as the name suggests, is my personal website. It needs to exist so it's there. I am happy with how it is so no major changes.
```

### Agent record

- Assessment: a complete, intentionally low-maintenance personal site. It does more than a landing page—case studies, writing, résumé, command palette, GitHub-sourced project archive, and agent-readable content—but its current focused scope is appropriate. Update it only when the underlying work or professional positioning changes.
- Start / latest commit: `0f894141e4dafa387416fb9808eb14be99d38cb5` (2026-06-04) / `37b02d4ac587076c8dd595441ca18e9e8fcd5e2f` (2026-08-22); 74 commits.
- Stack: Astro 5 static site, React 19 islands, TypeScript, Tailwind CSS v4, MDX content collections, GitHub build-time project data, LaTeX résumé generation, and Cloudflare Pages.
- Git snapshot: public `sarthakagrawal927/portfolio`; clean `main` matched `origin/main`.
- Public link: `https://sarthakagrawal.dev`.
- Open issues: none.
- Catalog state: live, maintained personal P2 site; public directory identity is **Sarthak Agrawal** with `portfolio` as its source repository.

## Recipe Dashboard

```text
Recipe Dashboard: It's just a product which has some higher protein recipes with Indian ingredients. I thought it would be more but I was not happy with the overall result and currently my food is optimised. I am not looking to expand into cooking so it will be on hold for now.
```

### Agent record

- Name mapping: the local folder is `recipe-dashboard`, while the product and public repository are named **Recipe Index** / `veg-protein-food`.
- Assessment: a carefully constrained vegetarian, egg-free protein-recipe directory rather than a meal-planning product. Its source links, two nutrition gates, and India-fit filtering make the current result trustworthy, but there is no reason to expand it without an active cooking problem to solve.
- Start / latest commit: `956606907a13faae337f0f38b752893490d5ee0a` (2026-08-15) / `36d1251b3aad3627bd5a65fdb81c3474fc1ba2a2` (2026-08-20); 4 commits.
- Stack: Astro 7 static site, checked-in source-linked nutrition dataset, Node.js admission checks, and Cloudflare Pages.
- Git snapshot: public `Significant-Hobbies/veg-protein-food`; `main` matched `origin/main`, with an untracked local `functions/` directory.
- Public link: `https://veg-protein-food.significanthobbies.com`.
- Open issues: none.
- Catalog state: live P4 experiment but hidden from the maintained portfolio. Owner status is on hold, which is the correct investment state; retain the public reference without adding cooking-product scope.

## Reddit Insights

```text
Reddit Insights is a product in which I was trying to see how historically signals and emotions have changed in a subreddit but I was not able to finish because of a lack of data or lack of historical data. Reddit does not provide the historical data easily so that is why it kind of got blocked but I might reopen it and start storing the data soon.
```

### Agent record

- Assessment: a data-observatory experiment for measuring topic, tone, engagement, and moderation shifts over time within a subreddit. The blocker is real: historical coverage cannot be reconstructed reliably on demand from Reddit alone. The credible next step is a small compliant daily collector with clear retention/provenance rules, not expanding the visualization before the time series exists.
- Start / latest commit: `0b9124d95e1c5fad3165f5e4ad15d9a697d3d0c0` (2026-08-07) / `e30b67d9f0fedefcba79195ec339d532aaaba403` (2026-08-20); 11 commits.
- Stack: Node.js ES modules, Reddit API ingestion with an optional Cloudflare Worker proxy/daily collector, `@huggingface/transformers` local analysis, generated static JSON display artifacts, vanilla HTML/SVG dashboard, and Cloudflare Pages.
- Git snapshot: private `High-Signal-App/research-subreddit`; local `main` matched `origin/main`, with a modification to `scripts/build-pages.mjs`.
- Public link: `https://reddit-insights.highsignal.app`.
- Open issues: #9 daily collector; #10 compact community reports; #11 research-workbench overhaul; #12 browser-mode relevant-post search.
- Catalog state: live but hidden P4 High Signal experiment. The static observatory exposes curated compact artifacts only; raw research corpus remains private. Owner status should be treated as blocked/on hold until prospective collection creates sufficient history.

## Research Papers

```text
Research paper was my attempt to understand what all there is in the market by adding some RAG on top of it. It has a huge amount of papers. I would want to do some more analysis in the future but for now I think it is done. It's just a lot of research papers.
```

### Agent record

- Assessment: a substantial academic-paper intelligence product, not merely a paper list. It combines a ~488k-paper multi-source corpus with semantic search, citation-graph ranking, clustering, tags, curated reading paths, and a cited RAG answer surface. “Done for now” is credible: the future work is optional analytical depth, not core product completion.
- Start / latest commit: `0535593b367fa3a770a5bfe64317873c5ad9d5f5` (2026-06-24) / `14063ecb59d561dc8ae255bed2dba7892f821375` (2026-08-20); 97 commits.
- Stack: Python/uv, ClickHouse, FastAPI, Typer CLI, sentence-transformers MiniLM embeddings, MLX Qwen tagging, spaCy, scipy PageRank, Astro/React/Tailwind dashboard, Cloudflare Pages Functions, and a cited Knowledge Base RAG path with static-data fallback.
- Git snapshot: public `High-Signal-App/research-papers`; local `main` matched `origin/main`, with modified public-discovery files and untracked Pages Function/API files.
- Public link: `https://papers.highsignal.app`.
- Open issues: none.
- Catalog state: active, live, maintained P2 High Signal product and publicly share-ready. Its public runtime is static Pages/Functions; ClickHouse and FastAPI are operator-side refresh machinery, not a production availability dependency.

## RolePatch

```text
Role patch was my attempt to build a tool for generating a resume for a job description. I am not actively looking for a job so I am not using it but it's a good product and I will test and start using it soon.
```

### Agent record

- Assessment: a feature-rich, review-first job-application assistant whose core loop is already testable: paste a job description or URL, tailor a resume, generate supporting material, and review the result before any application action. It has expanded beyond the original resume-tailoring wedge into job discovery, campaign management, interview preparation, and guarded ATS assistance; personal testing against real applications should now decide which of that breadth is worth retaining.
- Start / latest commit: `7bd897ba2fc6b084697e3b65ac0fff9cc4c4d5bd` (2026-07-17) / `c2d26ce461b7ff5227587c622896cb137a181b22` (2026-08-22); 406 commits.
- Stack: Next.js 16, React 19, TypeScript, Tailwind, CodeMirror, Cloudflare Workers/OpenNext, D1, better-auth Google OAuth, Vercel AI SDK through Free AI, Browser Rendering PDF export, Dodo Payments, PostHog, Vitest, Playwright, and an Astro landing overlay.
- Git snapshot: public `Significant-Hobbies/rolepatch`; local `main` matched `origin/main`, with active local auth/checkout/discovery changes and a pending better-auth migration.
- Public link: `https://rolepatch.com`.
- Open issues: none.
- Catalog state: active, live, maintained P2 product and publicly share-ready. Owner intent is use/testing-first—not more feature expansion—until an actual job-search workflow gives evidence.

## SaaS Ideas

```text
SaaS ideas is just my dump of ideas that I had collected over time into a website.
```

### Agent record

- Assessment: a personal decision-support catalog, not a startup product. It turns collected ideas into a sortable, scored set of tech-heavy, solo-feasible SaaS bets, retaining detailed specs for a few candidates. Its value is recall and prioritisation; it does not need active feature development unless the owner resumes deliberate idea selection.
- Start / latest commit: `9135013e1cf1dcaad52def14537a6a6f308c76dc` (2025-10-29) / `649b8c693b84981472e06436d04dde8ed43e862d` (2026-08-22); 80 commits.
- Stack: Python standard-library build/scoring script, generated JSON/static HTML, documentation in Markdown/Blume, and Cloudflare Pages.
- Git snapshot: `sass-maker/saas-ideas`; local `main` was clean and one commit ahead of `origin/main`.
- Public link: `https://ideas.sassmaker.com`.
- Open issues: none.
- Catalog state: live Pages site but archived/hidden P4 personal catalog. The repository calls it a personal tool rather than something for sale; this matches the owner’s concise description.

## SaaS Maker

```text
SaaSmaker started off as a plate workspace. It kind of has an on-and-off relationship but currently its purpose is to harbour the feedback package and I think two other packages. This is a project in which I have to dig deep soon.

Workflows and skills, I think I am going to merge it in SaaSmaker and have SaaSmaker list them out as well so they won't be existing in the future. Just create an issue for it.
```

### Agent record

- Assessment: SaaS Maker is the public product directory, reusable package/feedback boundary, and now the canonical home for Fleet workflows, skills, scripts, templates, and public tooling contracts. The former standalone tooling repository was absorbed with full history and is exposed through a searchable Tools surface.
- Start / latest commit: `ca726ae4e9f6bb1fcfc38d5f4727ba6c1098090a` (2026-07-20) / `361d53fb4faa570f2fd43a6108a96317e37d3e5a` (2026-08-23).
- Stack: pnpm monorepo, Astro/React, Blume documentation, Cloudflare Pages/Workers/D1/R2, reusable GitHub Actions, Node/Shell operator tooling, Fleet agent skills, and generated privacy-filtered Site Health catalog.
- Git snapshot: public `sass-maker/saas-maker`; tooling consolidation merged in PR #59.
- Public link: `https://sassmaker.com`.
- Open issues: #52, publish `@saas-maker/feedback` with hosted project key; #46, restore Feedback as an agent-native hosted service. Tooling consolidation issue #58 is complete.
- Catalog state: public directory and Tools catalog are live, maintained, and share-ready P2. Reusable tooling is no longer a separate Fleet identity.

## Setline

```text
Setline is an iOS app whose purpose is to help me exercise, have better timings, and show my workouts and track my workouts. I am still working on it.
```

### Agent record

- Assessment: a focused device-first workout player rather than a generic fitness tracker. It executes an authored programme one set at a time, keeps actual performance distinct from targets/calculations, controls rest and set timing, and records explicit skips, extras, partials, and deferrals. That precision gives it a real reason to continue.
- Start / latest commit: `793ed2125d0de9b041f54e787dacba2263d6a7a0` (2026-07-31) / `de536e62239693dfc5a4b51ea1ecbec3c3827bfc` (2026-08-22); 82 commits.
- Stack: SwiftUI iPhone app, Swift Charts, local JSON document/export, local notifications, XCTest/XcodeGen, optional Sign in with Apple plus Hub Backend session sync, temporary CloudKit transition sync, Astro static landing, and Cloudflare Pages.
- Git snapshot: public `Significant-Hobbies/setline`; local `main` was two commits behind `origin/main`, with active native workout-domain changes, generated Xcode package updates from the Hub Backend rename, and an untracked OpenAPI file.
- Public link: `https://setline.significanthobbies.com` (landing only; no public App Store or TestFlight distribution).
- Open issues: none.
- Release/catalog state: active maintained P2 iOS product. Setline 1.0.0 (3) was processed for internal TestFlight on 2026-08-22; public distribution is not approved. Continue work around actual workouts and physical-device use, keeping network out of the active workout path.

## Site Health

```text
Scythe Health is essentially a local-only dashboard which has 5 main things:
- Domain rank
- Size swarm (basically it's LCP, TTFP, and some other things)
- AI awareness
- Search console results
- Other thingsIt is being actively worked on and it will continue as is.
```

### Agent record

- Name mapping: the repository and product are **Site Health**. The owner narrative above remains verbatim.
- Assessment: the private operating dashboard for Fleet, answering five owner questions: what exists, domain strength, public performance, Google Search evidence, and AI-answer visibility. It integrates Drank and PSI Swarm through explicit adapters rather than absorbing them, and it is the canonical private catalog for the 58 retained identities.
- Start / latest commit: `1a475d932eaf0d88c0a905ced8e89c5070d397e5` (2026-08-17) / `00d7bb046471009c6dd53c696f4afcbe69b40bd0` (2026-08-22); 938 commits.
- Stack: Astro UI, Node.js backend, private JSON catalog, local evidence storage/adapters, Drank domain evidence, PSI Swarm performance evidence, Google Search Console, model-provider AI-visibility observations, and local process orchestration.
- Git snapshot: private `sass-maker/site-health`; local `main` matched `origin/main`, with catalog changes and this untracked owner-narratives document.
- Public link: none by design; it is loopback-only.
- Open issues: none.
- Catalog state: active maintained P2 local-only platform. Its former public hostname, tunnel route, DNS, and Access application were retired on 2026-08-22; active work should continue locally rather than reopening a public dashboard.

## Starboard

```text
GitHub stars were not working for me due to the volume so I decided to build my own UI. I am still adding some interesting features to it for better exploring but otherwise it is more or less done.
```

### Agent record

- Assessment: a good answer to star-library overload that has grown into project-aware open-source discovery. It synchronizes personal stars, supports tags/lists/search, and can connect a public project to make evidence-backed repository and tool recommendations. The focused current product is more coherent than the earlier broad vision: exploration improvements are justified, while alerts, reports, stack generation, and unrelated Fleet coupling are explicitly out of scope.
- Start / latest commit: `58d163b499a73a3ac684398d3678498c690e8fb3` (2026-08-08) / `e4f57349b0dfb0ea1a96ba2629aa3895e44d755f` (2026-08-22); 377 commits.
- Stack: Next.js 16, React 19, TypeScript, Tailwind, Cloudflare Workers/OpenNext, D1 with FTS5, Vectorize 768-dimensional search, NextAuth GitHub OAuth, Cloudflare Workers AI embeddings, optional Knowledge Base retrieval, SWR, nuqs, Vitest, and Playwright.
- Git snapshot: public `Codevetter/starboard`; local `main` matched `origin/main`, with active public-discovery and build-runtime changes.
- Public link: `https://starboard.codevetter.com`.
- Open issues: none.
- Catalog state: active, live, maintained P2 public-personalized product. D1 is authoritative and Turso is only rollback-held; it is appropriate to keep refining discovery rather than rebuilding basic star management.

## SWE Interview Prep

```text
SWE Interview Prep. This project's purpose was to give me a platform for learning by doing a lot of techniques (permodoro, Feynman's, and others). I have added a lot more roadmaps and it is doing a lot more now. This is still a work in progress and working.
```

### Agent record

- Assessment: an unusually complete learning-by-doing system. It unifies practice, coding and diagramming, concept roadmaps, hands-on labs, Socratic hints, Feynman explain-back gates, and FSRS review across interview fundamentals and wider systems/AI-engineering learning. The major risk is scope sprawl, so the next work should strengthen the learning loop and personal use rather than add more tracks indiscriminately.
- Start / latest commit: `7830bd36337f1f8dfb77a5ed57a813644054bb69` (2026-07-30) / `3fab059afdb7670c5b1eeea226969705c9629cf7` (2026-08-22); 415 commits.
- Stack: React 19/Vite/TypeScript/Tailwind, React Router, Monaco, Excalidraw, Cloudflare Pages Functions/D1/R2, Google One Tap JWT auth, ts-fsrs, PostHog, in-browser TypeScript/Go execution, optional OpenAI-compatible Socratic hints, Vitest, and Playwright.
- Git snapshot: public `Significant-Hobbies/swe-interview-prep`; active `fix/79-untouched-concepts-count-as-gaps` branch with modified public discovery files.
- Public link: `https://learn.significanthobbies.com`.
- Open issues: #86, complete Fanout-inspired learning surfaces; #79, breadth triage.
- Catalog state: active, live, maintained P2 product. The repository bootloader says maintenance-only since 2026-07-10, but current active branch work and the owner’s statement establish it as an active work-in-progress; reconcile the stale maintenance-only wording when this portfolio review concludes.

## Today Little Log

```text
Today little log was one of the first five coded products I have coded with loveable. It got superseded by the Significant-Hobbies project.
```

### Agent record

- Assessment: a real predecessor to Significant Hobbies, not a parallel active product. Its daily scoreboard, habits, journal, AM/PM rituals, focus timer, and reflection tools were deliberately merged into the Significant Hobbies Daily dimension on 2026-07-02. Retain this repository for history only.
- Start / latest commit: `d5b599837974a30a764f68ba32a5dc2c84475d69` (2026-05-23) / `135e85d4256d4d3d3b067f2aad09f6da8b19b52d` (2026-07-03); 310 commits.
- Stack: React 19, Vite, TypeScript, Tailwind/shadcn, Cloudflare Pages Functions, Turso/libSQL with Drizzle, better-auth Google OAuth, PWA tooling, and Playwright.
- Git snapshot: public `sarthakagrawal927/today-little-log`; clean `main` matched `origin/main`.
- Public link: none active. The former `today-little-log.pages.dev` deployment was retired when the Pages project was deleted on 2026-07-18.
- Open issues: none.
- Catalog state: archived P4, outside current Fleet scope, with a deleted deployment. The new Significant Hobbies reconciliation issue #138 may eventually extract the embedded Daily/Journal concerns again, but this historical repository itself should not be revived.

## TrueHire

```text
True hire is more like a concept application but it again needs trust in the economy and some chicken-and-egg problem to have recommendations or something so I delayed it for the future.
```

### Agent record

- Assessment: a transparent, GitHub-evidence-based candidate scoring and recruiter workflow—not an empty concept. It deliberately rejects self-declared resumes, titles, and skills in favour of explainable signals: recognition, depth, craft, breadth, and specialization. The owner’s trust and marketplace concerns are the central product constraint, and explain why this should remain delayed rather than be treated as a purely technical build to finish.
- Start / latest commit: `f2a9acd9c9e1d0a160631b8788d056c5659214f3` (2026-06-24) / `e1eed7d2e6ca39e65b32c1c4b2d6431ab72bab1a` (2026-07-20); 170 commits.
- Stack: Next.js 16/App Router, React 19, TypeScript, Tailwind v4, Drizzle with Turso/libSQL, NextAuth v5 GitHub OAuth, GitHub GraphQL/REST via Octokit, Vitest, Playwright, pnpm workspaces, and Cloudflare Workers through OpenNext.
- Git snapshot: public `sarthakagrawal927/truehire`; clean local `main` matched `origin/main`.
- Public link: [repository](https://github.com/sarthakagrawal927/truehire). The README still identifies `https://truehire.rolepatch.com` as the historical live app, while the canonical catalog classifies the product as archived and does not list an active deployment.
- Open issues: none.
- Catalog state: archived P4, out of Fleet, and superseded by RolePatch. Retain it as the earlier verified-candidate/hiring experiment; do not represent it as an active marketplace without first resolving the recommendation, trust, and two-sided adoption problem the owner identified.

## Verified Bases

```text
VerifiedBases was also more of a concept application. I was thinking since I am building so many iOS applications or Mac applications, might as well sell their codebase for very cheap, kind of like selling templates. I'm not sure about its ROI so I kind of put it on pause but I might pick it up again or just make something that supersedes this.
```

### Agent record

- Assessment: a curated marketplace prototype for selling verified software Bases, with a clear bet that buyers still pay for judgment, verification, packaging, ownership, and launch help even if generating code becomes cheap. It was built far enough to support catalog entries, purchase intent, Dodo checkout, fulfilment workflows, and creator submissions; the paused ROI question is the important unanswered validation, not a missing technical feature.
- Start / latest commit: `3b601240789a1bb0425f79790b501d82e00361b5` (2026-06-16) / `1160d1ed875511c34d0f5c68050f7c86bf7db60d` (2026-07-18); 16 commits.
- Stack: Astro 5, React 19 islands, TypeScript, Tailwind v4, Cloudflare Pages/Functions, Go 1.22 compiled with TinyGo/WASM on Cloudflare Workers, D1, KV, R2 delivery storage, Dodo Payments, Resend, and GitHub Actions CI.
- Git snapshot: `sass-maker/verified-bases`; clean local `main` matched `origin/main`.
- Public link: [repository](https://github.com/sass-maker/verified-bases). No current routed public product or checkout was found.
- Open issues: none.
- Catalog state: archived P4 retained-resources identity, outside current Fleet. The `verified-bases-api` Worker remains live but unrouted, with retained D1/R2 and an active-bound rate-limit KV; it should be treated as dormant infrastructure until demand validation justifies revival or a successor.

## Web Playables

```text
Web-playables I built to study idle games, how idle games are built, and I was also doing research on HTML-based games since they are everywhere. Now I might add more games to it in the future but for now it's on hold.
```

### Agent record

- Assessment: a compact game platform rather than a single throwaway prototype. `gamekit` supplies the browser/YouTube adapter, saves, offline progress, loop, pause, and formatting; the current Idle Startup simulator proves the framework and the arcade hub distributes games under `/play/<id>/`. Adding another game later is the natural expansion path, but the existing system already meets its research goal.
- Start / latest commit: `71d705d035d430de7541819d955bd0a78ea7c7aa` (2026-07-10) / `3e6f760eb272b78f388e43531c0c3d415b307721` (2026-08-22); 33 commits.
- Stack: TypeScript pnpm monorepo, Vite, React, Vitest, Biome, Cloudflare Pages, localStorage web saves, and a YouTube Playables-compatible platform adapter/bundling pipeline.
- Git snapshot: public `sarthakagrawal927/web-playables`; clean local `main` matched `origin/main`.
- Public link: [Idle arcade](https://idle.aliveville.com) and [repository](https://github.com/sarthakagrawal927/web-playables).
- Open issues: none.
- Catalog state: archived P4 historical game collection, with a retained live Cloudflare Pages surface. Treat it as on hold: source changes require explicit reactivation, while the public arcade can remain as evidence of the experiment.

## What It Takes to Win

```text
The purpose for this project was to research what are the advantages held by people who are successful and also to help my habit of comparison to die down. I think I will invest a lot more time in this to study people.
```

### Agent record

- Assessment: an evidence-led public research exhibit, internally titled Look Sideways, that reframes comparison into inspection. It visualizes source-linked starting conditions, inherited and built leverage, luck, milestones, and trajectories across athletes, creators, founders, and researchers—and deliberately avoids claiming a causal formula for individual success. This is an excellent match for the stated motivation, and further study/coverage is its core product work.
- Start / latest commit: `25cca210c275ab0311e5c177f5399bab158b4114` (2026-07-24) / `2698a17dd81591eace5f76dad1e5a994e5cb7536` (2026-08-22); 248 commits.
- Stack: Astro, TypeScript, Cloudflare Pages, source-linked research data, static/AI discovery surfaces (`llms.txt`, Markdown mirrors, structured data, sitemap, `/api/ai`), and custom interactive visualization including Three.js-style marble-world work.
- Git snapshot: public `Significant-Hobbies/what-it-takes-to-win`; active `feat/look-sideways` branch with modified story/visual files and a new marble-audio script.
- Public link: [paths.significanthobbies.com](https://paths.significanthobbies.com) and [repository](https://github.com/Significant-Hobbies/what-it-takes-to-win).
- Open issues: #30, interview accomplished people and add their past-life accounts; #29, external submissions and edits; #28, better 3D animation.
- Catalog state: active, live, maintained P4 secondary Significant Hobbies research publication. The rendered project dataset currently says 3,577 paths while the public catalog description says 2,585, so reconcile that stale public count when the next data refresh is published.

## Live

```text
Help me understand: where was the lab repository and is it still inside Significant Hobbies?

live*
```

### Agent record

- Verbatim coverage: the correction above is the only separate owner statement about Live captured during this review; its motivation/status/next narrative still needs an owner pass.
- Assessment: the independently owned original Significant Hobbies experience. It retains the existing user data, authentication, timelines, bookmarks, and deeper app routes; only the apex Hub routes are proxied to the Hub backend.
- Start / latest commit: `7bb85f44783a9ee66ebe0f9111e3254c7d3b0348` (2026-08-21) / `62c42a7b4acdbcb74f042da4eaa0f792020d1da9` (2026-08-23).
- Stack: Next.js, React, TypeScript, OpenNext, Cloudflare Workers, D1, Workers AI, Better Auth, Vitest, and Playwright.
- Git snapshot: public `Significant-Hobbies/live`; clean `main` matched `origin/main` after extraction.
- Public link: `https://live.significanthobbies.com`; existing deeper routes also remain available on the apex domain.
- Open issues: none.

## Journal

No separate owner narrative for Journal was captured in this review. This is recorded explicitly so the verbatim archive does not invent one.

### Agent record

- Assessment: the private daily-writing iPhone product extracted from the old combined Significant Hobbies repository. It is now independently owned while retaining its history, bundle identity, local document/export behavior, and Hub sync integration.
- Start / latest commit: `31193ef743e2e0ed740fc19b90b8644c6a95c51f` (2026-08-11) / `e2d514bbca21c81c6ae03dc255077d182ee18da4` (2026-08-23).
- Stack: Swift 6, SwiftUI, XcodeGen, XCTest/XCUITest, local JSON document/export, and `PersonalSyncKit` from the Significant Hobbies Hub repository.
- Git snapshot: public `Significant-Hobbies/journal`; clean `main` matched `origin/main` after extraction.
- Public link: `https://journal.significanthobbies.com` (landing); the native app remains internal-only.
- Open issues: none.

## iOS Landings

```text
IOS Landings is the core name. It is essentially a landing page template which we will use for a lot of our projects. Everywhere we have a setting page, might as well use it.
```

### Agent record

- Assessment: the shared marketing-site factory for the Significant Hobbies native-app family. One Astro engine produces separate, product-specific static sites rather than a combined storefront; each product supplies a small configuration and real screenshots. It currently covers Kith, Setline, Anchor, Motion, Indulge/Habits, Calorie, Journal, and Habits, while Significant Hobbies, Pace, and Live retain their own application surfaces.
- Start / latest commit: `7f3cda21f43e8e1d4d2ec74d11e4d128b6f26c56` (2026-08-17) / `9d9877f8f75d38891a3fe6ba54dd12f2086b3ebd` (2026-08-23); 22 commits.
- Stack: Astro, TypeScript, pnpm, product-scoped site configuration/content/screenshot folders, static builds, Cloudflare Pages, and product-specific `llms.txt` agent/discovery surfaces.
- Git snapshot: private `Significant-Hobbies/ios-landings`; clean local `main` matched `origin/main`.
- Public links: [Kith](https://kith.significanthobbies.com), [Setline](https://setline.significanthobbies.com), [Anchor](https://anchor.significanthobbies.com), [Motion](https://motion.significanthobbies.com), [Habits](https://habits.significanthobbies.com), and [Journal](https://journal.significanthobbies.com). The factory repository itself is private.
- Open issues: none.
- Catalog state: active, live, maintained P2 internal platform and hidden from the public directory. Continue using it as the canonical landing engine where an eligible Significant Hobbies native product needs a marketing surface; do not invent App Store/TestFlight links before those releases are approved.

## Karte

```text
Karte is a product which is supposed to be a greeting card for a person, agent, or a company. I built this because I wanted to build a link tree clone but evolved it further so that it is now better. I will spend some time on it to make it company friendly. Since it also has a chat mechanism and everything is already sorted, it will also act as a personal agent for people so it is quite fancy.
```

### Agent record

- Assessment: a live AI-native public profile and inbound-assistant platform, evolved materially beyond a link-in-bio clone. A Karte profile carries links, projects, proof, and contextual information, with optional chat, encyclopedia, roast, and newspaper modes; public visitors can converse through a streaming assistant rather than only click out. Company-facing capability and language are the right next focus because the individual profile foundation and agent-readable surfaces already exist.
- Start / latest commit: `3f27987469ae5129bfab77a3542eec657e40df4b` (2026-07-20) / `8111a5dafac4b2fd7e1ee30b22ec830a609a35dc` (2026-08-22); 487 commits.
- Stack: Next.js 16/App Router, React 19, TypeScript, Cloudflare Workers/OpenNext, Cloudflare D1 via Drizzle, better-auth Google OAuth, R2, Durable Object rate limiting, Cloudflare Analytics Engine, PostHog, Free AI gateway through AI SDK, Knowledge Base RAG, Vitest, Playwright, and GitHub Actions.
- Git snapshot: public `Significant-Hobbies/karte`; local `main` matched `origin/main` with modified agent-indexing artifacts (`agent-edge.mjs`, `public/api-ai.json`, `public/llms.txt`).
- Public link: [karte.cc](https://karte.cc) and [repository](https://github.com/Significant-Hobbies/karte).
- Open issues: none.
- Catalog state: active, live, maintained P2 secondary product, with all 30 sitemap URLs verified live on 2026-08-14. The documented PLAID KARTE name-collision risk was accepted for sharing on 2026-08-16, but company-facing work should continue to identify the canonical `karte.cc` product clearly.

## Knowledge Base

```text
Knowledge base is my internal rack service which powers other applications. It has been working fine so as long as it works fine I am not going to touch it.
```

### Agent record

- Assessment: shared private-corpus retrieval infrastructure for Fleet applications, not a standalone knowledge-management app. Authorized consumers receive isolated scopes plus ranked, cited evidence through search and grounded-query APIs; it combines schema-aware extraction, lexical/vector retrieval, reranking, provenance, and answer support checks. The user’s maintenance-only posture is sensible while its dependent applications remain healthy.
- Start / latest commit: `cac148ee91ea0b21c825884c4967aa4caba468ab` (2026-06-26) / `a1379a3c1df96e6ad4d3a354329a3fe0edb22088` (2026-08-20); 201 commits.
- Stack: Cloudflare Workers, Pages, D1, R2, Vectorize, Queues, Workflows, Workers AI, Free AI gateway, TypeScript/Hono worker APIs, a service-key-authenticated RAG contract, retrieval evaluations, and cited-provenance storage.
- Git snapshot: public `sass-maker/knowledge-base`; local `main` matched `origin/main` with uncommitted agent-discovery files and a new middleware file.
- Public links: [knowledgebase.sassmaker.com](https://knowledgebase.sassmaker.com) and [search.sassmaker.com](https://search.sassmaker.com); the shared retrieval APIs remain authenticated.
- Open issues: none.
- Catalog state: active, live, maintained P2 internal platform with a live landing, app/search surface, and shared RAG Worker. Leave it untouched unless a consumer failure, retrieval-quality regression, or an explicit new corpus/use-case supplies a concrete reason to change it.
