## 1. Accreditation state model

- [x] 1.1 Define the `accreditation-state.json` schema (version, updated,
  ownerExclusions, stalenessDays, platforms array with id, name, source,
  artifactFit, submitUrl, home, currentState, verifiedAt, qualityGate,
  transitions)
- [x] 1.2 Add `foundry/ops/lib/accreditation-state.mjs` with read, write,
  validate, and transition functions; dependency-free Node.js consistent with
  the campaign-manifest library
- [x] 1.3 Seed the initial state file from `directories.json`,
  `research-probe.json`, and the article-syndication list in
  `channel-inventory.mjs`; every platform starts as `seed` with `source` and
  `artifactFit` populated
- [x] 1.4 Mark Hacker News, LinkedIn, and X as `qualityGate: protected` in the
  initial state and add them to `ownerExclusions`
- [x] 1.5 Add focused tests for schema validation, invalid transitions,
  stale-accredited detection, and transition history capping

## 2. State transition and verification

- [x] 2.1 Add `foundry/ops/scripts/accreditation/update-state.mjs` CLI that
  records a state transition for one platform with evidence fields (liveUrl,
  httpStatus, formDetected, captchaDetected, signinRequired, screenshotPath)
  and outcome (`confirmed` or `indeterminate`)
- [x] 2.2 Enforce monotonic forward transitions except `blocked` →
  `accredited` (enablement resolved) and `rejected` → `verified` (owner
  override); reject invalid transitions with a clear error
- [x] 2.3 Cap transition history to the most recent 10 entries per platform;
  archive older transitions to a separate `transitions-archive` array
- [x] 2.4 Add a staleness check: `accredited` platforms whose `verifiedAt` is
  older than `stalenessDays` (default 30) are flagged for re-verification
- [x] 2.5 Add tests for transition validation, evidence recording, staleness
  detection, and history capping

## 3. Accreditation queue generation

- [x] 3.1 Add `foundry/ops/scripts/accreditation/generate-queue.mjs` that
  reads `accreditation-state.json` and `config/projects.json` and emits
  `campaign-manifests/out/platform-accreditation-queue-<YYYY-MM-DD>.md`
- [x] 3.2 Group output by product priority (P1, P2, P4) and within each
  product by platform state (accredited, seed, blocked, rejected)
- [x] 3.3 Emit a protected-channels section listing Hacker News, LinkedIn, and
  X with a note that they are always individually planned
- [x] 3.4 Emit summary counts: total platforms by state across the full
  inventory
- [x] 3.5 Include the honest distinction between seed evidence (unverified)
  and accredited (verified with evidence) in the queue header
- [x] 3.6 Add tests for queue generation with fixture state and project files

## 4. Product-to-platform matching

- [x] 4.1 Add `foundry/ops/lib/platform-matching.mjs` with deterministic
  routing: articles → protected + article syndication; products/major-features
  → protected + curated directories + long-tail seeds
- [x] 4.2 Populate `artifactFit` on each platform in the state file
  (`["product", "major-feature"]` for directories and seeds;
  `["article"]` for article-syndication platforms; `["product", "article"]`
  for protected channels)
- [x] 4.3 Add a matching function that, given an artifact type and product id,
  returns the set of platforms whose `artifactFit` includes the artifact type
  and whose `currentState` is `accredited` or `seed`
- [x] 4.4 Add tests for article routing, product routing, and protected-
  channel inclusion

## 5. Launch-campaign skill integration

- [x] 5.1 Update `foundry/ops/skills/launch-campaign/SKILL.md` step 3 to load
  `accreditation-state.json` and include `accredited` platforms directly,
  surface `seed` and `blocked` platforms as a bounded verification queue, and
  exclude `rejected` platforms unless the owner overrides
- [x] 5.2 Update
  `foundry/ops/skills/launch-campaign/references/channel-inventory.md` to
  document the accreditation state file and the distinction between
  accredited (verified, reusable) and seed (unverified, needs probe)
- [x] 5.3 Update `channel-inventory.mjs` to read `accreditation-state.json`
  and annotate each platform with its `currentState` and `verifiedAt` in the
  JSON output
- [x] 5.4 Preserve the existing warning that seed inventory is discovery
  input, not permission to publish; accredited platforms still require
  per-campaign audience-fit confirmation
- [x] 5.5 Add tests for the updated channel-inventory output with fixture
  accreditation state

## 6. Evidence and receipt tracking

- [x] 6.1 Define the evidence record schema (liveUrl, httpStatus, formDetected,
  captchaDetected, signinRequired, paymentRequired, screenshotPath, outcome)
- [x] 6.2 Require `live`, `indexable`, and `detected` states to have a receipt
  with a verified live URL and HTTP status; reject transitions without
  evidence
- [x] 6.3 Keep accreditation evidence separate from campaign execution
  receipts (`fleet.campaign-item-receipt.v1`); accreditation uses its own
  `fleet.platform-accreditation-evidence.v1` record shape
- [x] 6.4 Add a read-only summary command that prints per-platform state,
  last evidence, and staleness status
- [x] 6.5 Add tests for evidence validation, missing-evidence rejection, and
  summary output

## 7. Validation and integration

- [x] 7.1 Run `openspec validate add-platform-accreditation-program` and fix
  any spec or proposal errors
- [x] 7.2 Run `npm run check:projects` to confirm no project registry drift
  from queue generation
- [x] 7.3 Run the existing campaign-manifest test suite to confirm no
  regression in the manifest library
- [x] 7.4 Generate a sample queue file from the initial seed state and verify
  it honestly distinguishes seed evidence from accredited platforms
