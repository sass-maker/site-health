## 1. Baseline

- [x] 1.1 Read PostTrainLLM AGENTS/status/docs and inventory public site,
  playground, training, eval, packaging/runtime, downloads, feeds/data refresh,
  artifacts and deploy/release paths.
- [x] 1.2 Record existing analytics, errors, provenance, benchmark/eval, schedule,
  storage/retention, build and live/deployed-revision evidence.
- [x] 1.3 Identify every private data/model boundary and assert it is excluded
  from Foundry evidence.

## 2. Critical gap closure

- [x] 2.1 Define/test acquisition, download/run intent and playground activation.
- [x] 2.2 Define a privacy-safe local workflow completion/eval receipt or record an
  accepted not-applicable decision.
- [x] 2.3 Add/fix provenance validation for automated benchmark/quality claims.
- [x] 2.4 Add/fix bounds, freshness, failure/retry and unresolved state for feeds,
  scheduled metadata/data jobs and artifact production.
- [x] 2.5 Record artifact ownership, retention, size/cost guard and rollback or
  reproducibility evidence.
- [x] 2.6 Emit sanitized Foundry health/release/eval receipts.

## 3. Verification and handoff

- [x] 3.1 Run targeted lint/typecheck/test/build and deterministic eval fixtures.
- [x] 3.2 Run public site/playground build, live and indexing checks.
- [x] 3.3 Add tests proving private datasets/prompts/checkpoints/outputs cannot
  enter fleet reports.
- [x] 3.4 Open a scoped PR with evidence matrix and leave model/release/public
  claim and production deployment pending approval.

Implementation evidence: PostTrainLLM PR
[#67](https://github.com/PostTrainLLM/posttrainllm/pull/67) merged the sanitized
Foundry evidence receipts, provenance checks, private-payload exclusion tests,
and explicit manual-publication boundary.
