---
name: launch-campaign
description: Plan and execute a one-off launch for a new product or major feature. Use when the owner wants every launch step, full flagship posts, broad relevant directory and content-platform submissions, one exact-plan approval, and automatic execution through repositories, Postiz, connectors, or a visible connected browser.
---

# Launch Campaign

Create a complete campaign once, show every action and full content body, then
execute only the unchanged owner-approved manifest.

The machine-readable runtime recommendation lives in
[`execution-profile.json`](execution-profile.json). Hosts map its capability
tiers to their own available providers and models.

## Workflow

1. Confirm this is a new-product or major-feature launch, not daily posting.
   Read product status, live surface, positioning, claims, launch date, assets,
   account mappings, analytics, and existing content.
2. Check readiness: the feature is shipped or explicitly staged, canonical URL
   works, CTA works, claims are evidenced, support/privacy/pricing are current,
   and measurement is available. Block false readiness.
3. Research current channel eligibility. Treat the directory registry as seed
   evidence only; recheck audience fit, cost, policy, authentication, CAPTCHA,
   account state, and submission fields.
4. Build three lanes using [plan-contract.md](references/plan-contract.md):
   `flagship`, `secondary`, and `manual_or_blocked`. Write every flagship asset
   in full and destination-specific secondary copy/fields.
5. Preview the complete immutable manifest:

   ```bash
   node foundry/ops/scripts/campaign-manifest.mjs preview --manifest <path>
   ```

6. Stop for one owner approval of the exact hash. Any changed copy,
   destination, account, cost, timing, repository action, command, or deploy
   action requires a new preview and approval.
7. Execute each authorized item using [execution.md](references/execution.md).
   Gate before action, capture evidence, and record a receipt.
8. Resume safely: skip confirmed identities, reconcile indeterminate creates
   before retry, and report queued/manual/blocked/failed/published honestly.
9. Report launch-day status plus 7-day and 30-day outcomes against the approved
   attribution and metrics.

## Quality and safety

Use [channel-quality.md](references/channel-quality.md). Flagship channels get
fewer, excellent posts. Secondary distribution may be broad and lightweight,
but it must remain relevant, accurate, destination-specific, and compliant.

Never create fake accounts or reviews, fake community engagement, bypass
CAPTCHA/anti-bot controls, hide automation, buy an unexpected placement, or
run `ops/scripts/directory-submit/spray.py` or other force-submit/evasion code.
