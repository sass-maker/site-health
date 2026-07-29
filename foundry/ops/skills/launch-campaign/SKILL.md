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
4. Load the current channel seed inventory only when needed:

   ```bash
   node foundry/ops/skills/launch-campaign/scripts/channel-inventory.mjs \
     --artifact <article|product|major-feature>
   ```

   Use [channel-inventory.md](references/channel-inventory.md) to revalidate and
   select destinations. The helper is discovery evidence, never permission to
   publish.
5. Build five lanes using [plan-contract.md](references/plan-contract.md):
   `protected`, `canonical`, `article_syndication`, `broad_backlink`, and
   `manual_or_blocked`. Write protected assets in full, include the complete
   approved article for full-canonical syndication, and provide exact
   destination-specific fields everywhere else.
6. Preview the complete immutable manifest:

   ```bash
   node foundry/ops/scripts/campaign-manifest.mjs preview --manifest <path>
   ```

7. Stop for one owner approval of the exact hash. Any changed copy,
   destination, account, cost, timing, repository action, command, or deploy
   action requires a new preview and approval.
8. Execute each authorized item using [execution.md](references/execution.md).
   Gate before action, capture evidence, and record a receipt.
9. Isolate blockers: a signed-out, CAPTCHA, paid, or account-setup destination
   enters one consolidated enablement queue while every independent authorized
   item continues. Resume safely, skip confirmed identities, and reconcile
   indeterminate creates before retry.
10. Report queued/manual/blocked/failed/published outcomes honestly, followed
    by 7-day and 30-day results. Count verified live links and unique referring
    domains; retain follow state, indexability, permanence, and topical fit as
    evidence rather than equating raw backlink count with success.

## Quality and safety

Use [channel-quality.md](references/channel-quality.md). Hacker News, LinkedIn,
and X are protected: plan them individually and never substitute generic
distribution copy. Other distribution may be broad and lightweight, but it
must remain relevant, accurate, destination-specific, and compliant.

Never create fake accounts or reviews, fake community engagement, bypass
CAPTCHA/anti-bot controls, hide automation, buy an unexpected placement, or
run `ops/scripts/directory-submit/spray.py` or other force-submit/evasion code.
