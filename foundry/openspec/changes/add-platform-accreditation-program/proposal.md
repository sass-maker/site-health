## Why

Fleet has 113 unique long-tail directory seeds plus 23 curated directories and
15 article-syndication platforms — over 150 external distribution destinations
in total — but no persistent accreditation layer. Today the `launch-campaign`
skill treats the entire directory registry as "seed evidence only" and
reverifies audience fit, cost, policy, authentication, CAPTCHA, account state,
and submission fields on every single campaign. There is no durable record of
which platforms have already been verified, which were rejected, which are
live and indexable, or which are blocked behind sign-in or anti-bot controls.
Each campaign starts from scratch, repeats the same probes, and cannot resume
across campaigns or product launches.

The result is wasted verification effort, no resumable state, and no way to
answer "which of the 100+ platforms are actually accredited and ready for the
next P1 launch?" The issue (#371) asks Fleet to accredit and execute across
100+ external distribution platforms with persistent state, product-priority
ordering, owner exclusions, and honest evidence tracking.

## What Changes

- Add a **platform accreditation state model** that persists per-platform
  state across campaigns: `seed`, `verified`, `accredited`, `rejected`,
  `queued`, `live`, `indexable`, `detected`, `blocked`. State is stored in a
  single JSON file under `foundry/ops/config/directory-submissions/` and
  survives campaign boundaries.
- Add an **accreditation queue generator** script that reads the state file and
  produces the markdown queue file referenced in the issue
  (`campaign-manifests/out/platform-accreditation-queue-<date>.md`). The queue
  groups platforms by state, lists owner exclusions, and orders work by Fleet
  product priority (P1 → P2 → P4).
- Add **product-to-platform matching** rules: articles route to editorial and
  community destinations (article syndication + protected channels); products
  route to listing and launch surfaces (curated directories + long-tail seeds
  + protected channels). Matching is deterministic and auditable.
- Integrate with the **launch-campaign skill** so it consumes accredited
  platforms from the state file instead of reverifying every seed per
  campaign. Platforms still requiring live verification are surfaced as a
  bounded queue; accredited platforms enter the manifest directly.
- Add **evidence and receipt tracking** for accreditation: each state
  transition records when it was observed, what evidence supports it (live URL,
  form probe, HTTP status, screenshot path), and whether the outcome was
  confirmed or indeterminate. Receipts remain separate from campaign
  execution receipts.
- Preserve **owner exclusions**: Hacker News and LinkedIn are protected
  channels that never enter broad accreditation and always require individual
  planning. X is likewise protected.
- Execute in **Fleet product priority order**: P1 products (codevetter, pace,
  posttrainllm, agent-office) are accredited and launched first, then P2, then
  P4 (archived). The queue generator emits this ordering.
- Use **exact hash-approved manifests** for every external write, reusing the
  existing `fleet.approved-campaign-manifest.v1` schema. No external
  submission occurs without an approved immutable manifest.

## Capabilities

### New Capabilities

- `platform-accreditation-state`: Persistent per-platform accreditation state
  model with lifecycle transitions, owner exclusions, and evidence-backed
  records stored across campaigns.
- `accreditation-queue-generation`: Script that reads accreditation state and
  emits a dated markdown queue file grouped by state and ordered by Fleet
  product priority.
- `product-platform-matching`: Deterministic rules for routing articles versus
  products to the correct external destination classes.
- `launch-campaign-accreditation-integration`: Modified launch-campaign skill
  behavior that consumes accredited platforms and surfaces only unverified
  seeds as a bounded queue.
- `accreditation-evidence-tracking`: Per-transition evidence and receipt
  recording for accreditation outcomes, separate from campaign execution
  receipts.

### Modified Capabilities

- `launch-campaign-execution`: The skill's channel-eligibility step changes
  from "treat the directory registry as seed evidence only; recheck every
  campaign" to "load accredited platforms from the state file; reverify only
  seeds whose state is not `accredited` or whose `verifiedAt` is stale." The
  requirement "Channel eligibility uses accreditation state" replaces the
  prior per-campaign re-verification behavior.

## Impact

- **Config**: New `foundry/ops/config/directory-submissions/accreditation-state.json`
  tracks per-platform state. Existing `directories.json`, `research-probe.json`,
  and `products.json` are read-only inputs.
- **Scripts**: New `foundry/ops/scripts/accreditation/generate-queue.mjs`
  produces the markdown queue. New
  `foundry/ops/scripts/accreditation/update-state.mjs` records state
  transitions.
- **Skill**: `foundry/ops/skills/launch-campaign/SKILL.md` and
  `foundry/ops/skills/launch-campaign/references/channel-inventory.md` are
  updated to reference the accreditation state file and consume accredited
  platforms.
- **Output**: `campaign-manifests/out/platform-accreditation-queue-<date>.md`
  is generated by the queue script and consumed by the owner and launch skill.
- **No new external dependencies.** All tooling is dependency-free Node.js,
  consistent with the existing campaign-manifest library.
- **No fake identities, reviews, votes, or artificial engagement.** The
  accreditation system records honest state only; it never manufactures
  submissions or bypasses CAPTCHA, anti-bot, or authentication controls.
