# Deployment accounting and releases — 2026-09-10

Scope: 82 implementation repositories with the majority of retained default-branch commits in 2026. The complete inventory retains 110 repositories.

Four deployment states: current, needs-attention, unverified, not-applicable. Current includes component-scoped application parity when the remaining commits change only documentation, native clients, tests or unrelated monorepo components. HTTP 200 alone never establishes revision parity or product readiness.

Counts: 44 current, 10 unverified, 22 not-applicable, 6 needs-attention.

Nine projects released: GitStat, PostTrainLLM, Recipe Index, IssuePages, High Signal web, Backpropagate (Timeline Guardian), Ludo Pass & Play, AliveVille, and Clash Royale Meta. Provider/source receipts are in `qualification/deployment-accounting-progress-2026-09-10.json`.

The original parity log is a historical input, not the current verdict. Scope comparisons are recorded in `qualification/deployment-source-diffs-2026-09-10.json`. Native installation, login and complete product qualification remain separate.

| Repository | Deployment | Evidence or remaining work |
| --- | --- | --- |
| [Codevetter/codevetter](https://github.com/Codevetter/codevetter) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [Codevetter/starboard](https://github.com/Codevetter/starboard) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [HeyPace/pace](https://github.com/HeyPace/pace) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [High-Signal-App/everythingrated](https://github.com/High-Signal-App/everythingrated) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [High-Signal-App/high-signal](https://github.com/High-Signal-App/high-signal) | current | Production web deployment verified at 100% traffic with the released source revision. Other components are application-current where only documentation changed. |
| [High-Signal-App/research-papers](https://github.com/High-Signal-App/research-papers) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [High-Signal-App/research-subreddit](https://github.com/High-Signal-App/research-subreddit) | current | Pages are already current; remaining repository changes do not touch scripts/reddit-proxy. |
| [PostTrainLLM/posttrainllm](https://github.com/PostTrainLLM/posttrainllm) | current | Production redeployed from current main; deployment receipt verified. |
| [sarthakagrawal927/agent-resume](https://github.com/sarthakagrawal927/agent-resume) | unverified | Recorded website responds; deployment provenance and core behavior are not verified. |
| [sarthakagrawal927/ai-badges](https://github.com/sarthakagrawal927/ai-badges) | unverified | Recorded website responds; deployment provenance and core behavior are not verified. |
| [sarthakagrawal927/aliveville](https://github.com/sarthakagrawal927/aliveville) | current | Production Worker verified at 100% traffic and exact released source revision; live page returns HTTP 200. Product qualification remains separate. |
| [sarthakagrawal927/backpropagate](https://github.com/sarthakagrawal927/backpropagate) | current | Release repaired, exact-head CI passed, and production deployment verified. Local game smoke passed. |
| [sarthakagrawal927/clash-royale-meta](https://github.com/sarthakagrawal927/clash-royale-meta) | current | Production Worker verified at 100% traffic and exact released source revision; live page returns HTTP 200. Product qualification remains separate. |
| [sarthakagrawal927/dev-workflow-migration](https://github.com/sarthakagrawal927/dev-workflow-migration) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/forecast-lab](https://github.com/sarthakagrawal927/forecast-lab) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/headcount](https://github.com/sarthakagrawal927/headcount) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/issue-pages](https://github.com/sarthakagrawal927/issue-pages) | current | Production web deployment verified at 100% traffic with the released source revision. Other components are application-current where only documentation changed. |
| [sarthakagrawal927/loadtesting](https://github.com/sarthakagrawal927/loadtesting) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/local-ai](https://github.com/sarthakagrawal927/local-ai) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/ludo-pass-play](https://github.com/sarthakagrawal927/ludo-pass-play) | current | Release repaired, exact-head CI passed, and production deployment verified. Local game smoke passed. |
| [sarthakagrawal927/mentionpilot](https://github.com/sarthakagrawal927/mentionpilot) | needs-attention | Provision and verify the API, authentication database and OAuth configuration. Credentials were not accessed or modified. |
| [sarthakagrawal927/mobile-dev-cockpit](https://github.com/sarthakagrawal927/mobile-dev-cockpit) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/open-historia](https://github.com/sarthakagrawal927/open-historia) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [sarthakagrawal927/ph-catalog](https://github.com/sarthakagrawal927/ph-catalog) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/pinpoint](https://github.com/sarthakagrawal927/pinpoint) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/placard](https://github.com/sarthakagrawal927/placard) | unverified | Recorded website responds; deployment provenance and core behavior are not verified. |
| [sarthakagrawal927/port-whisperer](https://github.com/sarthakagrawal927/port-whisperer) | unverified | Recorded website responds; deployment provenance and core behavior are not verified. |
| [sarthakagrawal927/portfolio](https://github.com/sarthakagrawal927/portfolio) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [sarthakagrawal927/reel-maker](https://github.com/sarthakagrawal927/reel-maker) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [sarthakagrawal927/side-machine](https://github.com/sarthakagrawal927/side-machine) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sarthakagrawal927/society-relay](https://github.com/sarthakagrawal927/society-relay) | unverified | Recorded website responds; deployment provenance and core behavior are not verified. |
| [sarthakagrawal927/subreddit-research](https://github.com/sarthakagrawal927/subreddit-research) | needs-attention | Restore and verify the PostgreSQL-backed AgentData API and its frontend connection. |
| [sarthakagrawal927/taste](https://github.com/sarthakagrawal927/taste) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [sarthakagrawal927/temp-splitwise](https://github.com/sarthakagrawal927/temp-splitwise) | unverified | Recorded website responds; deployment provenance and core behavior are not verified. |
| [sarthakagrawal927/today-little-log](https://github.com/sarthakagrawal927/today-little-log) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [sarthakagrawal927/truehire](https://github.com/sarthakagrawal927/truehire) | unverified | Recorded website responds; deployment provenance and core behavior are not verified. |
| [sarthakagrawal927/web-playables](https://github.com/sarthakagrawal927/web-playables) | unverified | Recorded website responds; deployment provenance and core behavior are not verified. |
| [sass-maker/agent-office](https://github.com/sass-maker/agent-office) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [sass-maker/app-health](https://github.com/sass-maker/app-health) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [sass-maker/chatgpt-connections](https://github.com/sass-maker/chatgpt-connections) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [sass-maker/drank](https://github.com/sass-maker/drank) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [sass-maker/elves-hq](https://github.com/sass-maker/elves-hq) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sass-maker/field-track](https://github.com/sass-maker/field-track) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [sass-maker/free-ai](https://github.com/sass-maker/free-ai) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [sass-maker/gitstat](https://github.com/sass-maker/gitstat) | current | Deployed current main cb9d0ff; live API confirms the corrected analytics disclosure. |
| [sass-maker/knowledge-base](https://github.com/sass-maker/knowledge-base) | needs-attention | Deployment guard cannot establish source-backed build/test evidence from the current workflow structure. No guard override used. |
| [sass-maker/local-ai-video-studio](https://github.com/sass-maker/local-ai-video-studio) | current | Only native Swift implementation, tests and local code-health tooling changed; the hosted landing surface is unchanged. |
| [sass-maker/mashup](https://github.com/sass-maker/mashup) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [sass-maker/psi-swarm](https://github.com/sass-maker/psi-swarm) | needs-attention | Deployment guard cannot establish source-backed build/test evidence from the current workflow structure. No guard override used. |
| [sass-maker/reel-pipeline](https://github.com/sass-maker/reel-pipeline) | current | The artifact-serving Worker is unchanged; differences are local rendering, fixtures and adapter work. |
| [sass-maker/saas-ideas](https://github.com/sass-maker/saas-ideas) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [sass-maker/saas-maker](https://github.com/sass-maker/saas-maker) | needs-attention | Working checkout includes active owner changes. Existing main and three deployment components need isolated release verification; owner changes were preserved. |
| [sass-maker/site-health](https://github.com/sass-maker/site-health) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [sass-maker/verified-bases](https://github.com/sass-maker/verified-bases) | unverified | No hosted destination confirmed; this is not proof of a failed deployment. |
| [sass-maker/workflows-and-skills](https://github.com/sass-maker/workflows-and-skills) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [Significant-Hobbies/anchor](https://github.com/Significant-Hobbies/anchor) | current | Shared landing source changes affect Kith configuration and deployment tooling; Anchor landing content is unchanged. |
| [Significant-Hobbies/anime-list](https://github.com/Significant-Hobbies/anime-list) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [Significant-Hobbies/calorie](https://github.com/Significant-Hobbies/calorie) | current | Only native iOS code/tests and a local Miniflare dependency override changed; no deployed web implementation changed. |
| [Significant-Hobbies/chatgpt-memory-insights](https://github.com/Significant-Hobbies/chatgpt-memory-insights) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [Significant-Hobbies/chess](https://github.com/Significant-Hobbies/chess) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [Significant-Hobbies/email-manager](https://github.com/Significant-Hobbies/email-manager) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [Significant-Hobbies/hub-backend](https://github.com/Significant-Hobbies/hub-backend) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [Significant-Hobbies/india-standards](https://github.com/Significant-Hobbies/india-standards) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [Significant-Hobbies/indulge](https://github.com/Significant-Hobbies/indulge) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [Significant-Hobbies/ios-landings](https://github.com/Significant-Hobbies/ios-landings) | not-applicable | Local tool, research project or shared tooling; a public web deployment is not required. |
| [Significant-Hobbies/journal](https://github.com/Significant-Hobbies/journal) | not-applicable | Archived, superseded or previously removed; no active deployment obligation assumed. |
| [Significant-Hobbies/karte](https://github.com/Significant-Hobbies/karte) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [Significant-Hobbies/kith](https://github.com/Significant-Hobbies/kith) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. This checks the shared web surface, not native distribution. |
| [Significant-Hobbies/live](https://github.com/Significant-Hobbies/live) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [Significant-Hobbies/looptv](https://github.com/Significant-Hobbies/looptv) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [Significant-Hobbies/materia](https://github.com/Significant-Hobbies/materia) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. This checks the shared web surface, not native distribution. |
| [Significant-Hobbies/motion](https://github.com/Significant-Hobbies/motion) | current | Shared landing source changes affect Kith configuration and deployment tooling; Motion landing content is unchanged. |
| [Significant-Hobbies/on-record](https://github.com/Significant-Hobbies/on-record) | current | The API is deployed; remaining web comparison changes are API code/tests and development-only Node type resolution. |
| [Significant-Hobbies/protein-index](https://github.com/Significant-Hobbies/protein-index) | not-applicable | Related/historical repository; assess deployment on the owning product, not as another independent app. |
| [Significant-Hobbies/protein-index-resilience](https://github.com/Significant-Hobbies/protein-index-resilience) | current | Compared against the canonical protein-index-resilience repository instead of its retired historical alias; the only difference is release documentation. |
| [Significant-Hobbies/reader](https://github.com/Significant-Hobbies/reader) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [Significant-Hobbies/rolepatch](https://github.com/Significant-Hobbies/rolepatch) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [Significant-Hobbies/setline](https://github.com/Significant-Hobbies/setline) | unverified | Live SHA belongs to a different source history from the shared landing checkout; source migration must be reconciled before claiming drift or deploying. |
| [Significant-Hobbies/significanthobbies](https://github.com/Significant-Hobbies/significanthobbies) | current | Application source is current; the older deployment SHA differs only in non-application changes. |
| [Significant-Hobbies/swe-interview-prep](https://github.com/Significant-Hobbies/swe-interview-prep) | current | Provider deployment revision matches current GitHub source. Product workflows remain separately qualified. |
| [Significant-Hobbies/veg-protein-food](https://github.com/Significant-Hobbies/veg-protein-food) | current | Production redeployed from current main; deployment receipt verified. |
| [Significant-Hobbies/what-it-takes-to-win](https://github.com/Significant-Hobbies/what-it-takes-to-win) | needs-attention | Existing quality:dependencies gate rejects GHSA-rgj7-g3m4-5g8c, GHSA-w27v-7q3p-w38r, GHSA-7w5x-hrqm-74c2. No deployment performed. |

## Follow-up resolution of the 16 flagged rows

11 cleared; 5 blocked. Default view: 54 current, 5 needs-attention, 0 unverified, 23 not-applicable. These counts supersede the historical initial-pass counts above. All 10 formerly unverified rows have an evidence-backed disposition.

Released Look Sideways, PSI Swarm, Setline landing and TrueHire archive. Verified five existing deployments, proved SaaS Maker component parity, and preserved Verified Bases as intentionally parked.

| Project | State | Result |
| --- | --- | --- |
| agent-resume | current | Exact-head GitHub Pages deployment; public documentation responds. CLI execution not assessed. |
| port-whisperer | current | Exact-head GitHub Pages deployment; public documentation responds. Native tool execution not assessed. |
| ai-badges | current | Exact-head production deployment; percentage and PR endpoints return SVG badges. |
| placard | current | Exact-head production deployment; live card endpoint returns a valid PNG. |
| web-playables | current | Production Pages source matches main; public hub opens the playable Idle Startup game. Existing saved game was preserved. |
| what-it-takes-to-win | current | Release checks and exact-head CI passed; production Pages source verified; public URL responds HTTP 200. |
| psi-swarm | current | Release checks and exact-head CI passed; production Pages source verified; public URL responds HTTP 200. |
| setline | current | Release checks and exact-head CI passed; production Pages source verified; public URL responds HTTP 200. This verifies the shared-factory landing, not a new iPhone build. |
| saas-maker | current | All three hosted components are source-equivalent to current main. API and inbox source, workspace dependencies and lockfile have no changes since their deployed revision; directory inputs have no changes since its release. Public directory responds. |
| verified-bases | not-applicable | Owner-approved inactive storefront prototype; no active web launch required. Removed dead GitHub homepage. Retained API/resources are not deleted or claimed healthy. |
| knowledge-base | needs-attention | Explicit migration approval pending for 0008_file_artifact_ownership.sql, 0009_file_publication_visibility.sql and 0010_file_dispatch_recovery.sql. Existing production left running. |
| temp-splitwise | needs-attention | Authenticated Vercel logs confirm LibsqlError SERVER_ERROR: Turso returns HTTP 502 at api/rooms.ts:15 (first database write). Restore the database service/connection and retry room creation; redeploying the unchanged frontend will not fix it. |
| society-relay | needs-attention | Live activity evidence: failed after 20.01 seconds, gateway / command-r-plus-08-2024, EventLoopException. Source defaults to auto; hosting configuration and deployed revision require verification. No false success based on yesterday's acceptance record. |
| mentionpilot | needs-attention | Restore API and provision the web/authentication deployment with D1 bindings and OAuth configuration. Production configuration and credentials are outside current authorization. |
| subreddit-research | needs-attention | Restore the AgentData Worker, its Turso and provider configuration, then verify frontend-to-API requests. Production configuration and credentials are outside current authorization. |
| truehire | current | Archived research Worker deployed at current main with 100 percent traffic. Live synthetic sample profile loads with explicit demo/archive labels. No marketplace relaunched. |

TrueHire release automation still lacks its GitHub Cloudflare token; the production release was completed through the existing local login. Modified source repositories are clean and synchronized with main. Owner review edits remain local and preserved. Site Health full check and all 57 dossier checks pass. Deployment state does not assert native installation or full shareability.
