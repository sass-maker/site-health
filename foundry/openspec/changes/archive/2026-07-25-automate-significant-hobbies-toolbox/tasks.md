## 1. Family baseline

- [x] 1.1 Read AGENTS/status docs for Significant Hobbies, Reader, Anime List,
  SWE Interview Prep, LoopTV and Chess.
- [x] 1.2 Build the canonical family map of repositories, domains, runtimes,
  deploys, storage, imports/jobs, indexing and privacy-sensitive state.
- [x] 1.3 Define meaningful activation and not-applicable conversion semantics
  independently for all six products.
- [x] 1.4 Record current CI/build/live/indexing/errors/job freshness and deployed
  revision evidence.

## 2. Critical gap closure by project

- [x] 2.1 Significant Hobbies: close only missing build/live/indexing/error,
  activation or background-freshness evidence.
- [x] 2.2 Reader: close only missing library/search/sync activation, privacy,
  bounds/freshness and failure evidence.
- [x] 2.3 Anime List: close only missing discovery/list activation, catalog sync
  freshness, bounds and failure evidence.
- [x] 2.4 SWE Interview Prep: close only missing learning/drill activation,
  source-sync freshness, privacy and failure evidence.
- [x] 2.5 LoopTV: close only missing playback activation, catalog/content
  freshness and failure evidence.
- [x] 2.6 Chess: close only missing game/coaching activation, build/live and
  privacy-safe error evidence.
- [x] 2.7 Connect separate child statuses to one family-level Foundry snapshot
  without allowing one child failure to mark all children failed.

## 3. Quiet discoverability and verification

- [x] 3.1 Validate canonical cross-links, sitemap/indexing and bounded experiment
  metadata for each public child; launch nothing.
- [x] 3.2 Add privacy tests excluding libraries, notes, answers, lists, journals,
  saved games and credentials from fleet evidence.
- [x] 3.3 Run smallest relevant checks in every touched repo and schedule/job
  fixtures where applicable.
- [x] 3.4 Open separate PRs per touched repository and return one family evidence
  table with PRs, checks, exceptions and blockers.

## Implementation notes

The family contract is implemented centrally in `fleet-ops/` — no child
repository required changes to close the baseline evidence, activation,
privacy, freshness, independent-failure, and quiet-experiment contracts.
Child repos remain independently testable and deployable; the family layer
only reads declared state and emits sanitized evidence.

Artifacts:

- `fleet-ops/config/significant-hobbies-toolbox.json` — family registry
  mapping the six products to canonical domains, repos, runtimes, deploy
  kinds, evidence sources, activation definitions, background jobs (with
  cadence + declared freshness windows), privacy exclusions, and experiment
  mode.
- `fleet-ops/lib/toolbox-automation/registry.mjs` — registry validation
  (unique domains/owners/repos, required evidence sources per runtime,
  privacy categories, experiment policy, digest policy).
- `fleet-ops/lib/toolbox-automation/evidence.mjs` — sanitized evidence
  envelope builder, freshness evaluation by declared cadence, independent
  failure + digest policy, private-payload redaction and leak detection.
- `fleet-ops/lib/toolbox-automation/experiments.mjs` — quiet experiment
  validation (approval gate, auto-expiry, attribution, stop rule, no
  automatic replacement/promotion, inconclusive handling).
- `fleet-ops/scripts/toolbox-family-evidence.mjs` — CLI that emits a
  family evidence snapshot (JSON + Markdown) from the registry. Offline
  and declarative by default; `--check` exits non-zero on incomplete
  evidence.
- `fleet-ops/test/toolbox-automation.test.mjs` — 21 tests covering all
  six spec requirements and every spec scenario.
- `fleet-ops/docs/toolbox-family-evidence-latest.md` — generated report.

No child repository needed changes for the baseline contract, so no artificial
child PRs were opened. Fleet Workspace PR
[#6](https://github.com/sass-maker/fleet-workspace/pull/6) merged the family
registry, sanitized evidence envelope, bounded experiment validation, generated
evidence table, and 21 scenario tests. Live-provider adapters remain separate
operational follow-up rather than part of this completed contract.
