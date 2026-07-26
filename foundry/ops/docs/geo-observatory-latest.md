# GEO Observatory — latest report

Generated from `foundry/ops/data/geo-observatory/ledger.jsonl` (43 observations, 3 run(s): 2026-07-17, 2026-07-25, 2026-07-26).
Rubric: A = own domain top-3 · B = partial page-one visibility · C = absent.
Do not edit — regenerate via `geo-observatory-record.mjs`.

## Movers (vs previous run)

- 📉 **codevetter / codevetter-brand**: A → C
- 📈 **rolepatch / rolepatch-brand**: B → A
- 📈 **high-signal / highsignal-brand**: C → A
- 📈 **posttrainllm / posttrainllm-brand**: C → A
- 📈 **significanthobbies / sighobbies-brand**: C → A
- 📈 **high-signal / highsignal-category**: C → B
- 📈 **high-signal / highsignal-category-2**: C → A

## Trend

| product | query (kind) | 2026-07-17 | 2026-07-25 | 2026-07-26 |
|---|---|---|---|---|
| codevetter | CodeVetter (brand) | A | A | C |
| codevetter | AI code review benchmark agent-written bugs (category) | · | C | C |
| rolepatch | RolePatch (brand) | B | B | A |
| rolepatch | free ATS resume checker (category) | · | C | C |
| high-signal | highsignal.app (brand) | C | C | A |
| high-signal | daily brief with prediction hit rates (category) | · | C | B |
| high-signal | daily tech finance brief with public accuracy tr (category) | · | C | A |
| pace | heypace (brand) | C | C | C |
| pace | heypace.app (brand) | · | C | C |
| pace | Mac voice agent reads your screen (category) | · | C | C |
| pace | macOS AI agent that sees your screen and runs ta (category) | · | C | C |
| posttrainllm | posttrainllm (brand) | C | C | A |
| posttrainllm | fine-tune LLM specialists on Mac Apple Silicon (category) | · | C | C |
| significanthobbies | Significant Hobbies planner (brand) | C | C | A |
| anime-list | Fullmetal Alchemist Brotherhood filter by episod (category) | · | C | C |
| anime-list | anime discovery multi-field filter watchlist (category) | · | C | C |
| drank | free domain rating dataset weekly (category) | · | C | C |

## Retired (in ledger, no longer in config)

- **materia / materia-brand** — last observed 2026-07-25 at C (1 observation(s)). History kept; not probed on new runs.
- **materia / materia-category** — last observed 2026-07-25 at C (1 observation(s)). History kept; not probed on new runs.
- **saas-maker-showcase / sassmaker-brand** — last observed 2026-07-17 at A (1 observation(s)). History kept; not probed on new runs.

## Latest run notes (2026-07-26)

- **codevetter / codevetter-brand** → C. Top: https://codevet.dev/, https://codevet.dev/pricing — CodeVet now owns the exact-name SERP with its home and pricing pages; codevetter.com was absent from page 1, a material A→C regression that should be rechecked next run before treating it as persistent.
- **codevetter / codevetter-category** → C. Top: https://arxiv.org/abs/2603.23448, https://www.qodo.ai/blog/how-we-built-a-real-world-benchmark-for-ai-code-review/ — Academic and vendor benchmarks still own the category; CodeVetter is absent.
- **rolepatch / rolepatch-brand** → A. Top: https://rolepatch.com/, https://www.pulumi.com/registry/packages/kubernetes%403.x/api-docs/rbac/v1alpha1/rolepatch/ — rolepatch.com is now the top result with a product-specific snippet, resolving the prior indirect-only visibility.
- **rolepatch / rolepatch-category** → C. Top: https://hireflow.net/, https://applyarc.com/ats-resume-checker — The generic free-checker category remains crowded by dedicated ATS tools; RolePatch is absent.
- **high-signal / highsignal-brand** → A. Top: https://highsignal.app/signals, https://github.laiyagushi.com/High-Signal-App — highsignal.app now leads its exact-domain query through the Signals page, a material C→A improvement despite the name collision.
- **high-signal / highsignal-category** → B. Top: https://predictionbrief.io/, https://thedailycoins.io/2026/06/crypto-price-prediction-accuracy-study/ — The query remains noisy and prediction-market-heavy, but highsignal.app appeared lower on page 1; recorded as partial visibility rather than absence.
- **high-signal / highsignal-category-2** → A. Top: https://www.dailytechfinance.com/about/, https://highsignal.app/signals — The retargeted query is interpretable and highsignal.app reached #2 on its public accuracy-ledger differentiator.
- **pace / pace-brand** → C. Top: https://www.cms.gov/medicare/medicaid-coordination/pace, https://open.spotify.com/artist/4Bj69M42QdwROpUu4VHnLr — heypace.app remains absent; unrelated PACE and Heypace entities own the results.
- **pace / pace-brand-exact** → C. Top: https://play.google.com/store/apps/details?id=com.trainerize.grndapp, https://apps.apple.com/us/app/daypace/id6772209019 — Even the exact-domain text does not surface heypace.app, confirming non-indexation rather than a bare-name-only collision.
- **pace / pace-category** → C. Top: https://verba.run/, https://cyclop.one/ — The result shape improved from VoiceOver documentation to actual voice-agent competitors, but HeyPace is absent.
- **pace / pace-category-2** → C. Top: https://cyclop.one/, https://app.koe.live/ — A live field of macOS screen agents owns the retargeted category; HeyPace remains absent.
- **posttrainllm / posttrainllm-brand** → A. Top: https://posttrainllm.com/docs/learn/, https://posttrainllm.com/docs/session_retrospective/ — posttrainllm.com now occupies the leading results for its exact brand, a material C→A improvement.
- **posttrainllm / posttrainllm-category** → C. Top: https://epistates.com/blog/pmetal-llm-finetuning-apple-silicon, https://machinelearning.apple.com/research/exploring-llms-mlx-m5 — MLX and Apple-focused education still own the category; PostTrainLLM is absent.
- **significanthobbies / sighobbies-brand** → A. Top: https://www.significanthobbies.com/blog, https://www.notion.com/templates/hobbies — The Significant Hobbies origin now leads the brand-plus-planner query through its journal.
- **anime-list / anime-longtail-1** → C. Top: no results captured — The site-restricted query still returned no results, so the Anime List indexing problem persists.
- **anime-list / anime-category** → C. Top: https://chromewebstore.google.com/detail/path-to-anime/hmkdpjckcgcmhbdpiimkaddjhhfcgbpg, https://theanimewatchlist.com/ — Anime discovery and watchlist incumbents remain dominant; anime.significanthobbies.com is absent.
- **drank / drank-category** → C. Top: https://www.reddit.com/r/SideProject/comments/1u2sqne/i_made_a_fun_website_that_lets_you_check_your/, https://www.reddit.com/r/datasets/comments/1ozobsf/oc_100_million_domains_ranked_by_authority_free/ — Free checker and public-dataset discussions own the query; domains.sassmaker.com is absent.

