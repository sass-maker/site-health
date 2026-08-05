# Agent teammate scorecard

Shared outcome log for delegated agent work (`call-codex`, `call-grok`,
`call-claude-code`, `call-devin`). Routing notes: [ROSTER.md](ROSTER.md).
The parent agent appends **one line per delegation** and skims relevant rows
before delegating a similar task — past rejects are the routing signal.

Format (one table row per delegation):

- **date** — YYYY-MM-DD
- **teammate** — codex | grok | claude-code | devin
- **task type** — implement | refactor | test-fix | review | other
- **repo/scope** — repo name or short scope tag
- **verdict** — accepted | accepted-with-fixes | rejected | failed | blocked
- **note** — one short clause: why the verdict, or the lesson

| date | teammate | task type | repo/scope | verdict | note |
| --- | --- | --- | --- | --- | --- |
| 2026-07-03 | codex | test-fix | scratch e2e validation | accepted | minimal in-scope diff, honest schema result, independent test passed; ~80k input tok (76% cached) for a 3-turn task |
| 2026-07-03 | grok | test-fix | scratch e2e validation | accepted | correct minimal diff + honest JSON, but took 3 config attempts: acceptEdits runs end silently Cancelled (exit 0) → needs --always-approve; headless -w mutated main checkout |
| 2026-07-04 | grok | test-fix | scratch (--allow experiment) | failed | Claude-Code-style --allow rules + acceptEdits still Cancelled before first edit; --always-approve remains the only working headless recipe |
| 2026-07-04 | devin | test-fix | scratch e2e validation | accepted | first live run: minimal diff, honest fenced JSON, --export transcript worked; gotcha: --sandbox ignores --permission-mode (forces autonomous) |
| 2026-07-04 | cursor | test-fix | scratch e2e validation | accepted | ~11 s, minimal diff, JSON envelope w/ usage tokens; -w worktree isolation verified real (branch + registered worktree, main untouched) |
| 2026-07-04 | grok | code-review | pace PR #58 second opinion (~3.5k-line Swift payload) | accepted | EndTurn, clean JSON; independently confirmed all 3 Claude highs (dedup reset-order double-exec, unwired prefetch, transcript-dropping consume branch) + added 5 real mediums (unstable same-priority sort, budget turn leaks, unbounded batches, headless amber-indicator bypass, silent 60s timeout); read-only worktree recipe with --always-approve worked |
| 2026-07-04 | grok | implement | tinygpt bake-lora DoRA magnitude baking (Swift/MLX repo) | accepted-with-fix | EndTurn, correct math (verified vs DoraLinear line-by-line, eps placement exact), scoped diff, found beta Xcode path itself; flaw: wrote a circular test (bake vs its own doraEffectiveWeight) — de-circularized in review |
| 2026-07-04 | devin | implement | tinygpt routed-SQL perf harness + offline smoke (Python, --sandbox) | accepted | clean stdlib-only harness, correct wait4/rusage + macOS-bytes handling, exact scope (2 new files), smoke re-verified independently; small ACU spend, honest fenced JSON |
| 2026-07-10 | codex | implement | games monorepo — apps/hub arcade site + assemble-site.mjs (8 new files, worktree) | accepted-with-fixes | exact scope, zero deviations, clean DOM/a11y code, matched sibling palette as briefed; only fix was biome formatting drift (auto-fixed); typecheck/build verified by parent |
| 2026-07-17 | codex | review | protein-index serving-size parser | rejected | missed replay-proven false ghee and cashew candidates; parallel evidence audit found the blocker |
| 2026-07-19 | codex | review | SaaS Maker Foundry consolidation | accepted-with-fixes | found exposed Reel internal routes, missing Mobile native CI, clean-install drift, and absent imported static lanes; parent fixed and revalidated all four |
| 2026-07-19 | codex | review | saas-maker Foundry consolidation | accepted | independently verified event-contract drift, duplicate UI systems, public-by-default internal docs, and archived-docs residue |
| 2026-07-19 | codex | review | fleet-ops Foundry migration | accepted | independently verified competing registries, hard-coded machine paths, and inconsistent link/unlink root resolution |
| 2026-07-19 | codex | review | HeyPace automation readiness | accepted-with-fixes | found blocked-as-pass, stale provenance, zero-test, free-form telemetry, and live artifact gaps; parent fixed and verified focused tests |
| 2026-07-19 | codex | review | data-research shared checkout | failed | concurrent branch switch invalidated the Starboard review scope; rerun from isolated worktrees |
| 2026-07-19 | codex | review | Starboard and Research Papers automation | accepted-with-fixes | independently verified false freshness, weak health probes, unsafe test state, and exact-count analytics leakage |
| 2026-07-19 | codex | implement | Starboard refresh evidence | accepted | scoped fail-closed evidence, search health, and privacy fixes; 13 focused tests plus typecheck and docs passed |
| 2026-07-19 | codex | implement | Research Papers refresh evidence | accepted-with-fixes | scoped refresh and health fixes; parent sanitized public asset errors; 28 Python and 3 Pages tests passed |
| 2026-07-20 | codex | implement | saas-maker performance evidence API | accepted-with-fixes | useful ingestion and query foundation; parent fixed auth middleware interception, bounds, and project scoping |
| 2026-07-20 | codex | implement | saas-maker synthetic performance runners | accepted | bounded safe-method runner and deterministic tests were directly integrated; 8 runner and adapter tests passed |
| 2026-07-20 | codex | implement | saas-maker Cockpit Speed workspace | accepted-with-fixes | useful dense workspace structure; parent removed populated demo fallback and wired authenticated evidence reads |
| 2026-07-20 | codex | review | 12 maintained cleanup PRs | accepted-with-fixes | correctly cleared 10 PRs and caught Starboard rate-limit plus Email Manager triage regressions; parent had already fixed Starboard |
| 2026-07-20 | codex | implement | saas-maker Postiz contracts and adapter | accepted-with-fixes | strong provider-neutral contracts and fake harness; parent made create calls non-retriable after ambiguous HTTP failures and rejected credential-bearing base URLs |
| 2026-07-20 | codex | implement | saas-maker inert Postiz host contract | accepted-with-fixes | pinned source-only topology, host doctor, and rehearsal tests were sound; parent isolated dependencies and granted outbound HTTPS only to Postiz |
| 2026-07-20 | codex | implement | saas-maker Postiz delivery persistence | accepted | guarded idempotency, reconciliation, cursor, and normalized evidence storage passed 17 focused tests and API typecheck |
| 2026-07-20 | codex | refactor | saas-maker Content Factory separation | accepted-with-fixes | generation boundary and manifests were sound; parent bounded remote artifact reads and included primary video artifacts |
| 2026-07-20 | codex | implement | saas-maker Cockpit distribution outcomes | accepted-with-fixes | useful operator states and safe evidence projection; parent wired persisted D1 evidence instead of permanent unmeasured fallback |
| 2026-07-20 | codex | review | CodeVetter stash recovery | accepted-with-fixes | retained synthetic QA timing and RSS evidence across JavaScript, TypeScript, and Rust while discarding obsolete stash work |
| 2026-07-20 | devin | implement | app-health V0 foundation | accepted-with-fixes | useful workspace and contracts; parent tightened strict validation, windows, histogram boundaries, fixtures, and CI |
| 2026-07-20 | devin | implement | app-health ingest backend | accepted-with-fixes | strong local API foundation; parent removed raw-key retention and scoped dedupe plus rollback behavior |
| 2026-07-20 | devin | implement | app-health Node SDK | accepted-with-fixes | complete middleware lane; parent bounded configuration, rejected credential URLs, separated delivery drops, and fixed live auto-flush |
| 2026-07-20 | devin | implement | app-health Go SDK | accepted-with-fixes | complete stdlib lane; parent fixed synchronous flush, repeat-close errors, route collisions, and Go 1.22 pattern compatibility |
| 2026-07-20 | devin | implement | app-health endpoint dashboard | blocked | repeated CLI startup pruned isolated worktrees before edits; parent implemented and browser-reviewed the UI |
| 2026-07-20 | codex | review | app-health Go SDK hardening | accepted | isolated review fixed flush handshake, close races, oversized routes, and build-tagged pattern access; 44 race-tested cases passed |
| 2026-07-25 | codex | review | swe-interview-prep learning-loop consolidation | accepted-with-fixes | found deployment-key disclosure, unreachable deployment AI fallback, retry-filter drift, late evidence loss, and unenforced source-tier rules; parent fixed all five and revalidated |
| 2026-07-25 | codex | review | remaining Fleet OpenSpec blockers | accepted-with-fixes | separated npm, host, canary, approval, and elapsed-time gates from local work and found missing notification delivery; High Signal findings were stale against the pre-migration snapshot |
| 2026-07-25 | codex | implement | posttrainllm factory-run lifecycle | accepted-with-fixes | complete durable lifecycle and focused smokes; parent fixed terminal config overwrite ordering and added lock coverage |
| 2026-07-25 | codex | implement | posttrainllm autocorrect foundation | accepted | bounded no-model artifacts and 12 focused tests merged cleanly; parent added frontier calibration and model gate |
| 2026-07-25 | codex | other | posttrainllm autocorrect model research | accepted | pinned three primary-source candidates with exact revisions, resource estimates, commands, and honest MLX limitations |
| 2026-08-04 | devin | other | posttrainllm everyday benchmark synthetic data | blocked | temporary worktree was outside Devin trusted workspace; retried in an isolated Fleet sibling checkout |
| 2026-08-04 | devin | other | posttrainllm everyday benchmark synthetic data | accepted-with-fixes | produced 56 balanced GLM-5.2 candidates; parent retained 28 clear boundaries and excluded self-flagged ambiguous cases |
| 2026-08-04 | devin | other | posttrainllm sealed Pace candidate generation | accepted-with-fixes | produced 140 balanced GLM-5.2 candidates; first draft failed its own difficulty gate, constrained revision passed, and parent froze 63 human-adjudicated cases after corpus and tracked-repo overlap scans |
| 2026-08-04 | devin | other | posttrainllm v9 GLM corpus revision | blocked | accept-edits mode stopped at a confirmation before making changes; clean worktree preserved |
| 2026-08-04 | devin | other | posttrainllm v9 GLM corpus revision | failed | Devin sandbox autonomous mode is restricted by organization policy; no changes made |
| 2026-08-04 | devin | implement | posttrainllm v9 GLM corpus revision | accepted-with-fixes | honestly stopped at a 105-row GLM pilot and resumable protocol; parent fixed provenance claims, legacy extraction, critic fail-open behavior, manifest completeness, and train schema |
| 2026-08-04 | devin | implement | posttrainllm capability-gradient candidate lab | accepted-with-fixes | delivered eight-candidate scorecard, two stdlib environments, OpenSpec, fixtures, CI smoke, and 45 tests; parent rejected false baseline claims, calibrated calendar, fixed fail-open model actions and trace attribution, and added measured-baseline drift gates |
| 2026-08-04 | devin | review | posttrainllm capability-gradient adversarial audit | accepted | recomputed 2,000-seed baselines, exposed Connect-4 saturation and calendar density, found missing specialist-vs-larger-LLM criterion, and supplied concrete calibration parameters and correctness fixes |
| 2026-08-05 | devin | other | ten-root search issue reconciliation | accepted-with-fixes | found eight source-merged child issues and the genuine Aliveville gap; parent corrected prompt TLD assumptions against the canonical Fleet contract and will verify before closure |
