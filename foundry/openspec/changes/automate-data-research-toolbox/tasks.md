## 1. Baseline

- [x] 1.1 Read Research Papers and Starboard AGENTS/status/data/operations docs.
- [x] 1.2 Inventory public/API/search surfaces, authoritative sources, storage,
  indexes/caches, refresh jobs, deployments, indexing and private user state.
- [x] 1.3 Classify every data store and record backup/export/reconstruction owner,
  expected duration/cost and last verification.
- [x] 1.4 Record current build/live/search activation, job freshness, errors,
  output quality/count and deployed revision evidence.

## 2. Critical gap closure

- [x] 2.1 Research Papers: add/fix source watermark, bounded refresh,
  idempotency, retries, output quality/freshness, search activation and
  reconstruction evidence.
- [x] 2.2 Starboard: add/fix GitHub/source refresh lifecycle, deduplication,
  search/organize activation, private-repo redaction and reconstruction evidence.
- [x] 2.3 Add/fix separate landing/API/search health so landing success cannot
  conceal broken search.
- [x] 2.4 Emit sanitized Foundry snapshots with no private query or repository
  identity.
- [x] 2.5 Validate bounded attributed quiet experiment metadata; launch nothing
  and do not alter corpus/ranking scope.

## 3. Verification and handoff

- [x] 3.1 Run focused lint/typecheck/test/build and deterministic refresh/rebuild
  fixtures in each touched repository.
- [x] 3.2 Run live/API/indexing checks without production mutation.
- [x] 3.3 Open separate scoped PRs and return data/job/evidence tables plus
  accepted exceptions and blockers.
- [x] 3.4 Leave corpus expansion, paid data, migrations and deploys pending.
