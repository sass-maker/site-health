# Fleet GitHub Actions inventory

Observed through the GitHub API at `not refreshed`. This is the agent-visible index for every locally tracked, GitHub-generated, and remote-only workflow. The per-project YAML files remain canonical for project context and evidence.

Dossier contract: [`schema.json`](./schema.json). Verification means evidence was collected and attributed; workflow health is reported separately.

- Workflows: 160
- Cron/scheduled workflows: 25
- Attention: unclassified 160
- Inventory sources: unknown 160

“Latest” is the latest run of any trigger. “Default branch” checks the latest push run against the exact current default-branch SHA. “Schedule” queries scheduled runs separately so a manual dispatch cannot hide a stopped cron.

## All workflows

| Project | Workflow | File | Inventory | API | Triggers | Cron | Latest | Default branch | Schedule | Disposition | Attention |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [agent-office](./agent-office.yaml) | Native Quality | `.github/workflows/native-quality.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [agent-office](./agent-office.yaml) | Site Check | `.github/workflows/site-check.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [ai-game](./ai-game.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [ai-game](./ai-game.yaml) | Deploy aliveville landing | `.github/workflows/deploy-aliveville.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [ai-game](./ai-game.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [anchor](./anchor.yaml) | Anchor native review | `.github/workflows/native-review.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [anime-list](./anime-list.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [anime-list](./anime-list.yaml) | Deploy anime_list to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [anime-list](./anime-list.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [anime-list](./anime-list.yaml) | Quarterly Anime Sync | `.github/workflows/quarterly-anime-sync.yml` | — | — | schedule, workflow_dispatch | 0 0 1 1,4,7,10 * | unverified | unverified | unverified | — | — |
| [anime-list](./anime-list.yaml) | Quarterly Manga Sync | `.github/workflows/quarterly-manga-sync.yml` | — | — | schedule, workflow_dispatch | 0 1 1 1,4,7,10 * | unverified | unverified | unverified | — | — |
| [anime-list](./anime-list.yaml) | Update Catalog Data | `.github/workflows/update-anime-data.yml` | — | — | schedule, workflow_dispatch | 0 0 * * * | unverified | unverified | unverified | — | — |
| [app-health](./app-health.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [calorie](./calorie.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [chatgpt-connections](./chatgpt-connections.yaml) | ChatGPT Connections CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [chatgpt-connections](./chatgpt-connections.yaml) | ChatGPT Connections Production Monitor | `.github/workflows/production-monitor.yml` | — | — | schedule, workflow_dispatch | 17 3 * * * | unverified | unverified | unverified | — | — |
| [chatgpt-memory-insights](./chatgpt-memory-insights.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [chatgpt-memory-insights](./chatgpt-memory-insights.yaml) | memory-pack release | `.github/workflows/packer-release.yml` | — | — | push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [chess](./chess.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [chess](./chess.yaml) | Deploy to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [chess](./chess.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | Auto-publish release | `.github/workflows/auto-release.yml` | — | — | push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | Deploy Landing Page | `.github/workflows/deploy-landing.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | Native macOS production-candidate qualification | `.github/workflows/native-production-qualification.yml` | — | — | workflow_call, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | Native macOS qualification | `.github/workflows/native-qualification.yml` | — | — | workflow_call, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | OSV Offline Scan | `.github/workflows/osv-offline.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | Release Native macOS App | `.github/workflows/release.yml` | — | — | release, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | Repository Security | `.github/workflows/repository-security.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [codevetter](./codevetter.yaml) | Weekly Quality Check | `.github/workflows/weekly.yml` | — | — | schedule, workflow_dispatch | 0 9 * * 1 | unverified | unverified | unverified | — | — |
| [companion-robot](./companion-robot.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [drank](./drank.yaml) | DRank CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [drank](./drank.yaml) | Update Global DR History | `.github/workflows/update-global-dr.yml` | — | — | schedule, workflow_dispatch | 0 4 * * 1 | unverified | unverified | unverified | — | — |
| [email-manager](./email-manager.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [email-manager](./email-manager.yaml) | Deploy to Cloudflare Workers | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [everythingrated](./everythingrated.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [everythingrated](./everythingrated.yaml) | Deploy Cloudflare | `.github/workflows/cloudflare-deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [everythingrated](./everythingrated.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [everythingrated](./everythingrated.yaml) | Weekly Quality Check | `.github/workflows/weekly.yml` | — | — | schedule, workflow_dispatch | 0 9 * * 1 | unverified | unverified | unverified | — | — |
| [field-track](./field-track.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [forecast-lab](./forecast-lab.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [free-ai](./free-ai.yaml) | Check Provider Catalogs | `.github/workflows/check-models.yml` | — | — | schedule, workflow_dispatch | 0 9 * * 0 | unverified | unverified | unverified | — | — |
| [free-ai](./free-ai.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [free-ai](./free-ai.yaml) | Deploy Cloudflare | `.github/workflows/cloudflare-deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [free-ai](./free-ai.yaml) | Docs Check | `.github/workflows/docs-check.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [gitstat](./gitstat.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | backfill-sources | `.github/workflows/backfill-sources.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | backfill | `.github/workflows/backfill.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-acceptance-monitor | `.github/workflows/cron-acceptance-monitor.yml` | — | — | schedule, workflow_dispatch | 15 5 * * * | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-backtest | `.github/workflows/cron-backtest.yml` | — | — | schedule, workflow_dispatch | 0 9 * * * | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-d2c-opportunities | `.github/workflows/cron-d2c-opportunities.yml` | — | — | schedule, workflow_dispatch | 0 7 * * 1 | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-digg | `.github/workflows/cron-digg.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-equities | `.github/workflows/cron-equities.yml` | — | — | schedule, workflow_dispatch | 30 21 * * 1-5 | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-ingest | `.github/workflows/cron-ingest.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-markets | `.github/workflows/cron-markets.yml` | — | — | schedule, workflow_dispatch | 0 */4 * * * | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-mts | `.github/workflows/cron-mts.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-publish | `.github/workflows/cron-publish.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-reddit-archive | `.github/workflows/cron-reddit-archive.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-score | `.github/workflows/cron-score.yml` | — | — | schedule, workflow_dispatch | 30 22 * * * | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-source-cadences | `.github/workflows/cron-source-cadences.yml` | — | — | schedule, workflow_dispatch | 0 1 * * *<br>0 0 * * 0<br>30 0 1 * * | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | cron-validate-brief | `.github/workflows/cron-validate-brief.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | Deploy API | `.github/workflows/deploy-api.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | Deploy web | `.github/workflows/deploy-web.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | personal-brief | `.github/workflows/personal-brief.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | reddit-archive-redact | `.github/workflows/reddit-archive-redact.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [high-signal](./high-signal.yaml) | Weekly Quality Check | `.github/workflows/weekly.yml` | — | — | schedule, workflow_dispatch | 0 9 * * 1 | unverified | unverified | unverified | — | — |
| [india-standards](./india-standards.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [ios-landings](./ios-landings.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [issue-pages](./issue-pages.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [karte](./karte.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [karte](./karte.yaml) | Deploy to Cloudflare Workers | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [karte](./karte.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [kith](./kith.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [knowledge-base](./knowledge-base.yaml) | ci | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [knowledge-base](./knowledge-base.yaml) | docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [knowledge-base](./knowledge-base.yaml) | worker-eval-on-pr | `.github/workflows/eval.yml` | — | — | pull_request, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [live](./live.yaml) | Browser CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [live](./live.yaml) | Deploy to Cloudflare Workers | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [live](./live.yaml) | docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [live](./live.yaml) | Quality | `.github/workflows/quality.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [live](./live.yaml) | Production Smoke | `.github/workflows/smoke.yml` | — | — | schedule, workflow_dispatch | 0 */6 * * * | unverified | unverified | unverified | — | — |
| [local-ai-video-studio](./local-ai-video-studio.yaml) | Native Quality | `.github/workflows/native-quality.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [local-ai-video-studio](./local-ai-video-studio.yaml) | Site Check | `.github/workflows/site-check.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [looptv](./looptv.yaml) | Build Catalog | `.github/workflows/build-catalog.yml` | — | — | workflow_dispatch, workflow_run | — | unverified | unverified | unverified | — | — |
| [looptv](./looptv.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [looptv](./looptv.yaml) | Deploy to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | pull_request, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [looptv](./looptv.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [looptv](./looptv.yaml) | Fetch Catalog Sources | `.github/workflows/fetch-catalog-sources.yml` | — | — | schedule, workflow_dispatch | 0 6 1,15 * * | unverified | unverified | unverified | — | — |
| [mashup](./mashup.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [materia](./materia.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [materia](./materia.yaml) | Deploy materia to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [mobile-dev-cockpit](./mobile-dev-cockpit.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [motion](./motion.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [on-record](./on-record.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [on-record](./on-record.yaml) | cron-ingest | `.github/workflows/cron-ingest.yml` | — | — | schedule, workflow_dispatch | 0 6 * * *<br>0 7 * * 0 | unverified | unverified | unverified | — | — |
| [on-record](./on-record.yaml) | deploy | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [open-historia](./open-historia.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [open-historia](./open-historia.yaml) | Deploy to Cloudflare Workers | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [open-historia](./open-historia.yaml) | Weekly Quality Check | `.github/workflows/weekly.yml` | — | — | schedule, workflow_dispatch | 0 9 * * 1 | unverified | unverified | unverified | — | — |
| [pace](./pace.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [pace](./pace.yaml) | Deploy pace to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [pace](./pace.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [posttrainllm](./posttrainllm.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [posttrainllm](./posttrainllm.yaml) | Deploy to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [protein-index](./protein-index.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [psi-swarm](./psi-swarm.yaml) | PSI Swarm CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [psi-swarm](./psi-swarm.yaml) | Deploy psi-swarm-web to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [psi-swarm](./psi-swarm.yaml) | Release PSI Swarm CLI | `.github/workflows/release-cli.yml` | — | — | push | — | unverified | unverified | unverified | — | — |
| [reader](./reader.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [reader](./reader.yaml) | Deploy to Cloudflare Workers | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [reader](./reader.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [reader](./reader.yaml) | AI Code Review | `.github/workflows/review.yaml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [reddit-insights](./reddit-insights.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [reel-pipeline](./reel-pipeline.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [reel-pipeline](./reel-pipeline.yaml) | Deploy artifacts worker | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [reel-pipeline](./reel-pipeline.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [research-papers](./research-papers.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [research-papers](./research-papers.yaml) | Deploy research-papers to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [research-papers](./research-papers.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [rolepatch](./rolepatch.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [rolepatch](./rolepatch.yaml) | Deploy to Cloudflare Workers | `.github/workflows/deploy.yml` | — | — | pull_request, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [rolepatch](./rolepatch.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | Drank CI | `.github/workflows/drank-ci.yml` | — | — | workflow_call | — | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | PSI Swarm CI | `.github/workflows/psi-swarm-ci.yml` | — | — | workflow_call | — | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | Site Health CI | `.github/workflows/site-health-ci.yml` | — | — | workflow_call | — | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | Tooling CI | `.github/workflows/tooling-ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | Public Performance Sweep | `.github/workflows/tooling-performance-sweep.yml` | — | — | schedule, workflow_dispatch | 0 9 * * 1 | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | Public Surface Audit | `.github/workflows/tooling-surface-audit.yml` | — | — | schedule, workflow_dispatch | 37 6 * * 3 | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | Verify Local | `.github/workflows/verify-local.yml` | — | — | workflow_call | — | unverified | unverified | unverified | — | — |
| [saas-maker](./saas-maker.yaml) | Weekly Quality Check | `.github/workflows/weekly.yml` | — | — | schedule, workflow_dispatch | 0 9 * * 1 | unverified | unverified | unverified | — | — |
| [sarthakagrawal-personal](./sarthakagrawal-personal.yaml) | Portfolio CI / Deploy | `.github/workflows/deploy.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [sarthakagrawal-personal](./sarthakagrawal-personal.yaml) | Build résumé PDF | `.github/workflows/resume.yml` | — | — | push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [setline](./setline.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [significanthobbies](./significanthobbies.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [site-health](./site-health.yaml) | Site Health CI | `.github/workflows/site-health-ci.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [starboard](./starboard.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [starboard](./starboard.yaml) | Cloudflare operator smoke | `.github/workflows/cloudflare-operator-smoke.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [starboard](./starboard.yaml) | Deploy to Cloudflare Workers | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [starboard](./starboard.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [starboard](./starboard.yaml) | Embed pending repos | `.github/workflows/embed-pending.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [starboard](./starboard.yaml) | Purge Starboard Cache | `.github/workflows/purge-cache.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [starboard](./starboard.yaml) | Seed popular repos | `.github/workflows/seed-popular.yml` | — | — | schedule, workflow_dispatch | 17 3 * * 0 | unverified | unverified | unverified | — | — |
| [swe-interview-prep](./swe-interview-prep.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [swe-interview-prep](./swe-interview-prep.yaml) | Deploy to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [swe-interview-prep](./swe-interview-prep.yaml) | Docs | `.github/workflows/docs.yml` | — | — | pull_request, push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [swe-interview-prep](./swe-interview-prep.yaml) | Refresh Library | `.github/workflows/fetch-library.yml` | — | — | schedule, workflow_dispatch | 0 6 * * 1 | unverified | unverified | unverified | — | — |
| [truehire](./truehire.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [truehire](./truehire.yaml) | Release CLI | `.github/workflows/cli-release.yml` | — | — | push, workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [truehire](./truehire.yaml) | Deploy to Cloudflare Workers | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [veg-protein-food](./veg-protein-food.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [verified-bases](./verified-bases.yaml) | ci | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [verified-bases](./verified-bases.yaml) | Deploy API Worker | `.github/workflows/deploy-api.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [web-playables](./web-playables.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |
| [web-playables](./web-playables.yaml) | Deploy web-playables to Cloudflare Pages | `.github/workflows/deploy.yml` | — | — | workflow_dispatch | — | unverified | unverified | unverified | — | — |
| [what-it-takes-to-win](./what-it-takes-to-win.yaml) | CI | `.github/workflows/ci.yml` | — | — | pull_request, push | — | unverified | unverified | unverified | — | — |

## Cron and schedule view

| Project | Workflow | Cron | Latest scheduled run | Schedule health | Owner disposition |
| --- | --- | --- | --- | --- | --- |
| [anime-list](./anime-list.yaml) | Quarterly Anime Sync | 0 0 1 1,4,7,10 * | — | — | — |
| [anime-list](./anime-list.yaml) | Quarterly Manga Sync | 0 1 1 1,4,7,10 * | — | — | — |
| [anime-list](./anime-list.yaml) | Update Catalog Data | 0 0 * * * | — | — | — |
| [chatgpt-connections](./chatgpt-connections.yaml) | ChatGPT Connections Production Monitor | 17 3 * * * | — | — | — |
| [codevetter](./codevetter.yaml) | Weekly Quality Check | 0 9 * * 1 | — | — | — |
| [drank](./drank.yaml) | Update Global DR History | 0 4 * * 1 | — | — | — |
| [everythingrated](./everythingrated.yaml) | Weekly Quality Check | 0 9 * * 1 | — | — | — |
| [free-ai](./free-ai.yaml) | Check Provider Catalogs | 0 9 * * 0 | — | — | — |
| [high-signal](./high-signal.yaml) | cron-acceptance-monitor | 15 5 * * * | — | — | — |
| [high-signal](./high-signal.yaml) | cron-backtest | 0 9 * * * | — | — | — |
| [high-signal](./high-signal.yaml) | cron-d2c-opportunities | 0 7 * * 1 | — | — | — |
| [high-signal](./high-signal.yaml) | cron-equities | 30 21 * * 1-5 | — | — | — |
| [high-signal](./high-signal.yaml) | cron-markets | 0 */4 * * * | — | — | — |
| [high-signal](./high-signal.yaml) | cron-score | 30 22 * * * | — | — | — |
| [high-signal](./high-signal.yaml) | cron-source-cadences | 0 1 * * *<br>0 0 * * 0<br>30 0 1 * * | — | — | — |
| [high-signal](./high-signal.yaml) | Weekly Quality Check | 0 9 * * 1 | — | — | — |
| [live](./live.yaml) | Production Smoke | 0 */6 * * * | — | — | — |
| [looptv](./looptv.yaml) | Fetch Catalog Sources | 0 6 1,15 * * | — | — | — |
| [on-record](./on-record.yaml) | cron-ingest | 0 6 * * *<br>0 7 * * 0 | — | — | — |
| [open-historia](./open-historia.yaml) | Weekly Quality Check | 0 9 * * 1 | — | — | — |
| [saas-maker](./saas-maker.yaml) | Public Performance Sweep | 0 9 * * 1 | — | — | — |
| [saas-maker](./saas-maker.yaml) | Public Surface Audit | 37 6 * * 3 | — | — | — |
| [saas-maker](./saas-maker.yaml) | Weekly Quality Check | 0 9 * * 1 | — | — | — |
| [starboard](./starboard.yaml) | Seed popular repos | 17 3 * * 0 | — | — | — |
| [swe-interview-prep](./swe-interview-prep.yaml) | Refresh Library | 0 6 * * 1 | — | — | — |

## Interpretation

- `action-required`: current default-branch evidence is failing/missing, a schedule is failing/missed, or the workflow cannot be verified.
- `review-history`: the latest manual-only run failed, but it is not evidence that current `main` is broken.
- `missing-data`: no exact push run exists at the current default-branch SHA; this remains visible without being mislabeled as a failure.
- `reconcile`: GitHub exposes a workflow that is absent from the local working tree.
- `ignored`: explicit owner disposition; retained as evidence rather than hidden.
- `managed`: GitHub-generated automation such as Dependabot or Pages build workflows.
