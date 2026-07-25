# Proposal: Spotlight products as the public front door

## Why

The public surfaces currently expose different slices of the fleet: the
personal README already presents four products plus SaaS Maker, while the
personal website and SaaS Maker registry still expose broader project lists.
That makes the public story feel like an inventory dump instead of a clear
product portfolio.

## What

Make these five public entry points canonical:

1. CodeVetter — `https://codevetter.com`
2. PostTrainLLM — `https://posttrainllm.com`
3. HeyPace — `https://heypace.app`
4. High Signal — `https://highsignal.app`
5. SaaS Maker — `https://sassmaker.com`

The personal site's landing/homepage will show those five prominently and
explain that the wider supporting projects are linked from SaaS Maker. The
personal `/projects` archive may continue to show the full fleet, but it will
make the SaaS Maker directory relationship explicit. SaaS Maker remains the
broader directory.

Synchronize the personal README, the five relevant GitHub organization profile
READMEs, the portfolio site, SaaS Maker's public site/registry, and the fleet
metadata. Keep supporting repositories discoverable through their organization
pages and SaaS Maker, rather than deleting or hiding repositories.

## What Changes

### In scope

- A small canonical spotlight-product data contract in fleet-ops.
- Validation that all synchronized surfaces use the same five IDs, names, URLs,
  and organization links.
- Personal site homepage and projects-page framing (focused landing, full
  archive retained).
- SaaS Maker public catalog framing and product registry tiering.
- Personal GitHub README and organization profile READMEs.
- Knowledgebase landing deployment remains part of this rollout and is tracked
  separately as its own Pages project with the source repository kept
  authoritative. Its Cloudflare Git connection remains an explicit operational
  status, not a claim made by the metadata synchronizer.

### Out of scope

- Deleting or renaming repositories or organizations.
- Removing the full fleet directory from SaaS Maker.
- Changing product domains, application behavior, or Cloudflare Workers.
- Changing resume/work case-study content unless a link or label becomes stale.

## Success criteria

- The personal website shows exactly four spotlight products plus SaaS Maker in
  its primary project story.
- `sassmaker.com` clearly functions as the directory for the broader fleet.
- All five GitHub profile surfaces use consistent product names, canonical URLs,
  and organization links.
- A validator reports no drift between the contract and synchronized files.
- Knowledgebase landing is live at `knowledgebase.sassmaker.com` and its source
  repository/deployment status is visible to the fleet checks.
