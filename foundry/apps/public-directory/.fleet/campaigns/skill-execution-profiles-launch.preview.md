# Provider-neutral skill execution profiles

- Campaign: `skill-execution-profiles-launch`
- Kind: `launch_campaign`
- Product: `fleet-workspace`
- Source revision: `working-tree-scope:813d4b597c098e0f5048c7319d7c25b40fffe3fece9d0f186fc2788449e70759`
- Manifest hash: `ef6fb4aa5249055eb98d3a5b64c8adf4807408e490dc378e2d4ac27b309b1c3b`
- Objective: Publish the SaaS Maker article as the canonical proof, then distribute the methodology through a small set of high-quality professional and technical channels plus relevant canonical syndication without irrelevant directory spam.

## Execution steps

### Ship and verify the canonical source

#### Prepare an isolated release branch from current main

- Item: `prepare-release-branch`
- Tier: `flagship`
- Destination: [fleet-github-repository](https://github.com/sass-maker/fleet-workspace)
- Account: `sass-maker`
- Cost: free
- Execution: `repository` — Create the isolated release worktree and branch, port the exact scoped file set, run checks, commit, push, open a focused PR, and merge only if the approved content is unchanged and CI passes.
- Authentication: required
- Policy checked: 2026-07-28T12:44:35.000Z
- Timing: unscheduled

```text
Resume the focused release in PR #17, preserve the approved provider-neutral execution-profile implementation and SaaS Maker article byte-for-byte, repair only the stale project-count assertions inherited from current main, run the exact Fleet CI contracts sequence, and merge only after every CI job passes.
```

Fields:

- currentBranch: wip/foundry-checkpoint-before-pr12-cleanup
- currentBranchDivergence: 16 commits behind and 7 commits ahead of origin/main at planning time
- releaseBranch: feat/provider-neutral-skill-execution-profiles
- releaseWorktree: /Users/sarthak/Desktop/fleet/foundry-release-skill-profiles
- commitMessage: feat(skills): add provider-neutral execution profiles
- pushTarget: origin feat/provider-neutral-skill-execution-profiles
- mergePolicy: Resume PR #17 against main; merge only after the complete Fleet CI suite passes and the diff contains no unrelated working-tree changes.
- ciRepair: Change marketing-program.test.mjs from 28 to 29 projects, project-catalog.test.mjs from 41 to 42 projects, and fleet-automation/registry.mjs from 39/27 to 40/28 total/in-scope entries, matching the Memory Map registration already present on main.

#### Deploy the canonical SaaS Maker article

- Item: `publish-canonical-article`
- Tier: `flagship`
- Destination: [saas-maker-learnings](https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names)
- Account: `none`
- Cost: free
- Execution: `repository` — After the focused release branch is merged to main, run the approved public-directory deploy command and record the Cloudflare Pages deployment URL and source revision.
- Authentication: required
- Policy checked: 2026-07-28T12:44:35.000Z
- Timing: unscheduled

```text
# Skills should declare capabilities, not model names

Agents choose models. Skills should say what they need.

A working method applied across 28 Fleet-owned skills.

Once a skill library grows past a handful of prompts, model selection becomes part of skill design whether you acknowledge it or not. Some skills mostly retrieve facts and format results. Others make product decisions, validate claims, or act in public.

I ran into this while building two marketing skills. One audits search coverage and publishes missing pages. The other plans a launch, writes the campaign, and can carry an approved plan into public channels. Giving every step the strongest model would waste money. Letting an underpowered model handle claims or submissions would be careless.

The obvious answer is to put a model name in each skill. It is also the wrong abstraction for a portable skill. The better method is small, practical, and not especially revolutionary: let the skill declare the capability it needs, then let the host decide how to provide it.

## Is a skill an agent?

No. This distinction matters more than it first appears.

An agent is the active runtime. It has a model, tools, permissions, context, and an execution loop. A skill is a package of instructions and resources that the runtime loads when a job calls for it.

The agent decides and acts. The skill changes how it approaches one class of work. If a skill hard-codes a model, it starts taking over a decision that usually belongs to the host.

## Has anyone already done this?

Yes, at least part of it.

Claude Code supports `model` and `effort` directly in skill frontmatter. That is the clearest version of the idea I found, and it is useful. The Claude Code documentation says the model override lasts for the current turn.

Agent frameworks make the same choice one layer higher. The OpenAI Agents SDK supports model selection per agent or run. LangChain's skills pattern loads specialized prompts into an agent whose model is configured separately.

So model-aware execution is not new. The portable part is still awkward.

## What is missing?

The open Agent Skills specification defines the portable package. Its standard fields cover identity, description, compatibility, metadata, and allowed tools. It does not define model or reasoning requirements.

A literal model field would not fully solve that problem. A model name can be absent on another host, blocked by company policy, too expensive for the current run, or replaced next month. Even reasoning controls use different names across providers.

The skill knows the quality of work it needs. The host knows which runtimes are available. The contract should connect those two facts without pretending they are the same fact.

## The methodology

Declare the need, set a floor, choose what degradation means, and leave model mapping to the host.

## What is the methodology?

A useful skill execution profile answers four questions:

1. **Need:** What quality would I choose when the work matters?
2. **Floor:** What is the lowest capability that can do the job responsibly?
3. **Degrade:** May the runtime degrade quietly, must it ask, or should it refuse?
4. **Map:** Why does this skill need that level?

The profile should not name the current favorite model. It should describe stable capabilities in a vocabulary the host can map to its own providers.

In Fleet, intelligence is `economy`, `balanced`, or `frontier`. Reasoning runs from `low` to `very_high`. Degradation is `allow`, `ask`, or `deny`. The vocabulary is intentionally plain.

I applied the method to every Fleet-owned skill. There are 28 today. Each has an `execution-profile.json` beside its instructions. The metadata catalog can read that profile before it loads the skill body.

```
fleet-capabilities execution \
  skill:launch-campaign \
  --runtime balanced:high

# compatible
# action: continue
```

The compatibility check returns recommended, compatible, degraded, approval required, or re-dispatch required. It never picks a provider or invokes a model. A host maps `frontier:high` to whatever meets its cost, availability, and policy rules.

## Where does it fall short?

The tiers are subjective. Hosts still need a mapping table, and two models labelled "frontier" may be good at very different things. A whole-skill profile also ignores mixed workloads. The research stage of a campaign and the final browser submission do not necessarily need the same runtime.

I considered stage-specific profiles and a larger capability vocabulary. I left both out. There is no evidence yet that the extra machinery would improve our work.

This is a working method in one skill library, not a proposed standard. The schema is small enough to change or delete when usage proves part of it wrong.

## What is the useful idea?

It is not the model switch. Claude Code already has one.

The useful idea is execution hygiene. A portable skill should be honest about the quality it requires without taking routing away from the host. A deployment guard and a directory listing should not silently receive the same treatment.

I do not know whether this belongs in the Agent Skills standard. I do think mature skill libraries need some version of the methodology. Our own skills are clearer now because they can say what they need, what they will tolerate, and when they should refuse to run.

The operating rule is simple: skills state their needs; hosts choose the machinery.
```

Fields:

- canonicalUrl: https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names
- slug: skills-should-declare-capabilities-not-model-names
- metaDescription: Why portable agent skills need provider-neutral intelligence and reasoning requirements, and how Fleet is testing the idea.
- author: Sarthak Agrawal
- publishedDate: 2026-07-28
- readiness: staged; the current public URL soft-falls back to the home page and must not be promoted until post-deploy verification passes

#### Verify the live article before distribution

- Item: `verify-live-readiness`
- Tier: `flagship`
- Destination: [saas-maker-live-gate](https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names)
- Account: `none`
- Cost: free
- Execution: `browser` — Run a visible post-deploy browser verification and record screenshots plus canonical, metadata, and discovery evidence before any distribution item.
- Authentication: not required
- Policy checked: 2026-07-28T12:44:35.000Z
- Timing: unscheduled

```text
Open the exact canonical URL and verify that it returns the article title, a self-referencing canonical link, Article JSON-LD, the published date, source links, the Learnings navigation state, the social preview asset, and no console errors. Confirm the root, sitemap, llms.txt, llms-full.txt, index.md, and /api/ai expose the article. Stop the campaign if any check fails.
```

Fields:

- expectedTitle: Skills should declare capabilities, not model names | SaaS Maker
- expectedCanonical: https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names
- requiredWidths: [390,768,1440]
- measurementState: Confirm Cloudflare referrer or equivalent site measurement before flagship posting; otherwise rely only on platform-native metrics and URL receipts.

### Relevant canonical syndication and community adaptations

#### Add the article to the GitHub profile README

- Item: `github-profile-writing`
- Tier: `secondary`
- Destination: [github-profile](https://github.com/sarthakagrawal927)
- Account: `sarthakagrawal927`
- Cost: free
- Execution: `connector` — Use the GitHub API to update only README.md, preserving the current content and inserting the exact approved Writing section before Stack. Stop and regenerate the manifest if the expected blob SHA changed.
- Authentication: required
- Policy checked: 2026-07-28T12:59:05.000Z
- Timing: unscheduled

```text
## Writing

- [Skills should declare capabilities, not model names](https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names) — A provider-neutral method for declaring the intelligence, reasoning floor, and degradation behavior a portable skill needs, tested across 28 Fleet-owned skills.
```

Fields:

- repository: sarthakagrawal927/sarthakagrawal927
- file: README.md
- expectedBlobSha: 3a0b8b35f24d90956073f08970c7b220866d101e
- insertion: Add the Writing section before the existing Stack section.
- commitMessage: docs(profile): add skill execution methodology article
- accountState: Exact GitHub account is mapped and the repository is readable through the connected GitHub CLI.
- timingWindow: T+0 after the canonical live gate

#### Import the canonical article into Medium

- Item: `medium-canonical-import`
- Tier: `secondary`
- Destination: [medium](https://medium.com/me/stories/public)
- Account: `none`
- Cost: free
- Execution: `blocked` — Import through Medium's official visible import flow only after the exact owner account is mapped and authenticated.
- Authentication: required
- Policy checked: 2026-07-28T12:59:05.000Z
- Timing: unscheduled
- Blocker: Connected Chrome is signed out of Medium; exact owner account remains unresolved.

```text
Import the complete approved canonical article from the SaaS Maker URL without rewriting it. Medium's import tool must retain the original publication date and automatically set the SaaS Maker URL as canonical. The imported body is exactly the full body in item `publish-canonical-article`; append no sales pitch, affiliate link, or duplicate call to action.
```

Fields:

- title: Skills should declare capabilities, not model names
- importUrl: https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names
- canonicalUrl: https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names
- tags: ["AI Agents","Developer Tools","Software Engineering","Artificial Intelligence","Programming"]
- accountState: No verified owner Medium account was found. Search results contain ambiguous people with the same name.

#### Create a canonical DEV cross-post

- Item: `dev-canonical-crosspost`
- Tier: `secondary`
- Destination: [dev-community](https://dev.to/new)
- Account: `none`
- Cost: free
- Execution: `blocked` — Create a DEV draft using the official API or visible editor after the exact owner account and API authorization are mapped; preview before changing `published` to true.
- Authentication: required
- Policy checked: 2026-07-28T12:59:05.000Z
- Timing: unscheduled
- Blocker: DEV redirected connected Chrome to one-time-code sign-in; exact owner account remains unresolved.

```text
Publish the complete approved canonical article body from item `publish-canonical-article` as a DEV draft first. Preserve the question-led headings and code block. Set the SaaS Maker article as `canonical_url`; use no DEV-specific claims and do not publish until the draft preview is checked.
```

Fields:

- title: Skills should declare capabilities, not model names
- description: A small provider-neutral method for stating what quality a portable agent skill needs while leaving model selection to the host.
- canonical_url: https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names
- published: false
- tags: ai, agents, programming, architecture
- accountState: No verified DEV username or API key is mapped.

#### Create a canonical Hashnode cross-post

- Item: `hashnode-canonical-crosspost`
- Tier: `secondary`
- Destination: [hashnode](https://hashnode.com/draft)
- Account: `none`
- Cost: free
- Execution: `blocked` — Create a visible Hashnode draft after the exact owner publication is mapped; verify the original URL before publishing.
- Authentication: required
- Policy checked: 2026-07-28T12:59:05.000Z
- Timing: unscheduled
- Blocker: Hashnode returned Vercel Security Checkpoint code 21 before login; do not bypass the challenge.

```text
Publish the complete approved canonical article body from item `publish-canonical-article`. In Draft Settings, mark it as republished and set the SaaS Maker URL as the original URL. Preserve the article's modest claim: this is a working method in one skill library, not a proposed standard.
```

Fields:

- title: Skills should declare capabilities, not model names
- subtitle: A provider-neutral execution profile for mature skill libraries
- originalUrl: https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names
- seoDescription: A small provider-neutral method for declaring the intelligence, reasoning floor, and degradation behavior an agent skill needs.
- tags: ["AI Agents","Software Architecture","Developer Tools","LLM"]
- accountState: No verified owner Hashnode publication is mapped.

#### Adapt the lesson for Indie Hackers

- Item: `indie-hackers-discussion`
- Tier: `manual`
- Destination: [indie-hackers](https://www.indiehackers.com/post)
- Account: `none`
- Cost: free
- Execution: `blocked` — Use an established owner account only if it can post and has genuine community history; publish the full useful discussion, not a bare link.
- Authentication: required
- Policy checked: 2026-07-28T12:59:05.000Z
- Timing: unscheduled
- Blocker: The connected browser could not load the Indie Hackers post route and no established owner account is mapped.

```text
I thought model selection inside agent skills would be a solved metadata problem. It partly is.

Claude Code can set model and effort at the skill level. Agent frameworks can choose a model per agent or run. The awkward part appears when a skill is meant to move across hosts.

Hard-coding today's preferred model makes the skill brittle. Giving every task the strongest model wastes money. Silently running consequential work on a weaker model is worse.

I ended up with four deliberately plain fields:

- Need: what quality would I choose when the work matters?
- Floor: what is the lowest capability that can do the job responsibly?
- Degrade: may the host continue, must it ask, or should it refuse?
- Map: why does the skill need that level while the host chooses the provider?

I have applied the method to 28 skills. It is not a proposed standard, and the tiers are subjective. A whole-skill profile also fails to describe mixed workloads well. But the operating boundary has already made the library clearer.

Full implementation and the limitations: https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names?utm_source=indiehackers&utm_medium=community&utm_campaign=skill-execution-profiles

For people building agent workflows: do you keep model choice entirely in the host, or have you found a portable way for skills to state a quality floor?
```

Fields:

- title: Should agent skills declare a quality floor?
- audience: Technical founders building agent workflows
- accountState: Unmapped. Indie Hackers may restrict posting for accounts without meaningful community history.
- timingWindow: T+1 or later; do not post as a launch announcement.

#### Hold one Reddit adaptation pending community fit

- Item: `reddit-community-candidate`
- Tier: `manual`
- Destination: [reddit](https://www.reddit.com/)
- Account: `none`
- Cost: free
- Execution: `blocked` — Choose one relevant community manually, verify its current rules and owner account history, then regenerate the manifest with the exact subreddit before any submission.
- Authentication: required
- Policy checked: 2026-07-28T12:44:35.000Z
- Timing: unscheduled
- Blocker: The exact subreddit, its rules, and the owner's contribution history are unresolved; mass cross-posting would violate the campaign policy.

```text
I have been testing a provider-neutral execution profile across 28 agent skills.

The problem is small but recurring: hard-coding a model name makes a portable skill brittle, while silently allowing a weak runtime to handle consequential work is risky.

The profile answers four questions: preferred quality, minimum responsible floor, whether degradation may continue or must ask/refuse, and why the level is needed. The host still maps those abstract requirements to a provider.

It is not a proposed standard. The tiers are subjective, and a whole-skill profile does not handle mixed workloads well. I wrote up the schema, the CLI behavior, and those limitations here:

https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names?utm_source=reddit&utm_medium=community&utm_campaign=skill-execution-profiles

If you maintain reusable agent skills, where do you think this boundary belongs: skill metadata, agent configuration, or the orchestration layer?
```

Fields:

- candidateCommunity: Select exactly one established, technically relevant subreddit after reading its current rules; do not cross-post duplicates.
- suggestedTitle: Where should a portable agent skill declare its quality floor?
- accountState: Unmapped; contribution history and self-promotion ratio are unknown.
- policyConstraint: Reddit prohibits repeated or unsolicited mass posting. Automation must not publish this until one community and its rules are verified.

#### Submit to Lobsters only from an eligible community account

- Item: `lobsters-submission`
- Tier: `manual`
- Destination: [lobsters](https://lobste.rs/stories/new)
- Account: `none`
- Cost: free
- Execution: `blocked` — Submit once only if the owner already has an eligible account with a compliant participation history; otherwise leave this item manual and unexecuted.
- Authentication: required
- Policy checked: 2026-07-28T12:59:05.000Z
- Timing: unscheduled
- Blocker: Lobsters redirected connected Chrome to login and no eligible established owner account is mapped.

```text
Skills should declare capabilities, not model names
```

Fields:

- title: Skills should declare capabilities, not model names
- url: https://sassmaker.com/learnings/skills-should-declare-capabilities-not-model-names
- tags: ["ai","programming","practices"]
- accountState: Unmapped. Lobsters is invitation-based and expects self-promotion to remain below roughly one quarter of participation.
- followup: Author participation must be personal and substantive.

### Record launch-day, seven-day, and thirty-day evidence

#### Record launch evidence and outcomes

- Item: `campaign-measurement`
- Tier: `secondary`
- Destination: [fleet-campaign-receipts](https://fleet.sassmaker.com/marketing)
- Account: `none`
- Cost: free
- Execution: `connector` — Persist sanitized campaign receipts and manually reconcile platform-native evidence at launch day, seven days, and thirty days.
- Authentication: required
- Policy checked: 2026-07-28T12:44:35.000Z
- Timing: unscheduled

```text
At launch, record the live canonical URL, deployment revision, every confirmed destination URL or provider identifier, and the accounts actually used. At seven and thirty days, record platform-native impressions, clicks when available, canonical-page referrals when available, substantive comments, and any skill-profile adoption or implementation feedback. Never infer traffic or publication from a successful form submission alone.
```

Fields:

- launchDay: ["canonical page live","indexing surfaces live","destination receipt URLs","platform-native initial views"]
- sevenDay: ["referrals by UTM source when available","platform impressions and reactions","substantive discussion count","account or moderation issues"]
- thirtyDay: ["search impressions when available","article referrals","citations or backlinks","external adoption or implementation references","changes needed in the methodology"]
- measurementLimit: No product conversion is claimed. The objective is public proof, useful discussion, and evidence of adoption.

## Repository and publish permissions

### Repository writes

- `foundry/apps/public-directory/src/components/Footer.astro`
- `foundry/apps/public-directory/src/components/Nav.astro`
- `foundry/apps/public-directory/src/data/learnings.ts`
- `foundry/apps/public-directory/src/layouts/Layout.astro`
- `foundry/apps/public-directory/src/pages/api/ai.ts`
- `foundry/apps/public-directory/src/pages/index.md.ts`
- `foundry/apps/public-directory/src/pages/learnings/index.astro`
- `foundry/apps/public-directory/src/pages/learnings/skills-should-declare-capabilities-not-model-names.astro`
- `foundry/apps/public-directory/src/pages/llms-full.txt.ts`
- `foundry/apps/public-directory/src/pages/llms.txt.ts`
- `foundry/apps/public-directory/src/pages/sitemap.xml.ts`
- `foundry/apps/public-directory/src/styles/globals.css`
- `foundry/apps/public-directory/.fleet/design-review.json`
- `foundry/openspec/changes/add-content-coverage-and-launch-campaign-skills`
- `foundry/openspec/changes/add-provider-neutral-skill-execution-profiles`
- `foundry/ops/README.md`
- `foundry/ops/docs/fleet-agent-standards.md`
- `foundry/ops/lib/fleet-automation/registry.mjs`
- `foundry/ops/lib/capability-catalog.mjs`
- `foundry/ops/lib/campaign-manifest.mjs`
- `foundry/ops/lib/content-coverage.mjs`
- `foundry/ops/lib/marketing-program.mjs`
- `foundry/ops/scripts/campaign-manifest.mjs`
- `foundry/ops/scripts/fleet-capabilities.mjs`
- `foundry/ops/scripts/site-health-scorecard.mjs`
- `foundry/ops/skills/agent-ready/execution-profile.json`
- `foundry/ops/skills/cloudflare-spend-guard/execution-profile.json`
- `foundry/ops/skills/code-cleanup/execution-profile.json`
- `foundry/ops/skills/content-coverage`
- `foundry/ops/skills/daily-learning/execution-profile.json`
- `foundry/ops/skills/design-workflow/execution-profile.json`
- `foundry/ops/skills/fleet-audit/execution-profile.json`
- `foundry/ops/skills/fleet-deploy-guard/execution-profile.json`
- `foundry/ops/skills/fleet-deploy-parity/execution-profile.json`
- `foundry/ops/skills/fleet-init/execution-profile.json`
- `foundry/ops/skills/fleet-ops/execution-profile.json`
- `foundry/ops/skills/fleet-workspace/execution-profile.json`
- `foundry/ops/skills/geo-observatory/execution-profile.json`
- `foundry/ops/skills/launch-campaign`
- `foundry/ops/skills/mobile-task-control/execution-profile.json`
- `foundry/ops/skills/name-domains/execution-profile.json`
- `foundry/ops/skills/public-product-smoke/execution-profile.json`
- `foundry/ops/skills/seo-audit/execution-profile.json`
- `foundry/ops/skills/site-health/SKILL.md`
- `foundry/ops/skills/site-health/execution-profile.json`
- `foundry/ops/skills/spec-driven/execution-profile.json`
- `foundry/ops/skills/token-budget/execution-profile.json`
- `foundry/ops/teammates/skills/call-claude-code/execution-profile.json`
- `foundry/ops/teammates/skills/call-codex/execution-profile.json`
- `foundry/ops/teammates/skills/call-cursor/execution-profile.json`
- `foundry/ops/teammates/skills/call-devin/execution-profile.json`
- `foundry/ops/teammates/skills/call-grok/execution-profile.json`
- `foundry/ops/teammates/skills/call-hermes/execution-profile.json`
- `foundry/ops/teammates/skills/call-teammate/execution-profile.json`
- `foundry/ops/test/capability-catalog.test.mjs`
- `foundry/ops/test/campaign-manifest.test.mjs`
- `foundry/ops/test/content-coverage.test.mjs`
- `foundry/ops/test/fixtures/campaigns`
- `foundry/ops/test/fixtures/content-coverage`
- `foundry/ops/test/launch-campaign.test.mjs`
- `foundry/ops/test/marketing-program.test.mjs`
- `foundry/ops/test/project-catalog.test.mjs`
- `foundry/ops/test/site-health-content-coverage.test.mjs`

### Commands

- `git fetch origin main`
- `git worktree add /Users/sarthak/Desktop/fleet/foundry-release-skill-profiles -b feat/provider-neutral-skill-execution-profiles origin/main`
- `npm --prefix foundry/apps/public-directory run check`
- `node --test foundry/ops/test/capability-catalog.test.mjs`
- `node foundry/ops/scripts/fleet-capabilities.mjs doctor --json`
- `rtk openspec validate add-provider-neutral-skill-execution-profiles --strict`
- `git diff --check`
- `npm run test:fleet`
- `npm run check:registry`
- `npm run check:public`
- `git add -- foundry/apps/public-directory/.fleet/design-review.json foundry/apps/public-directory/src/components/Footer.astro foundry/apps/public-directory/src/components/Nav.astro foundry/apps/public-directory/src/data/learnings.ts foundry/apps/public-directory/src/layouts/Layout.astro foundry/apps/public-directory/src/pages/api/ai.ts foundry/apps/public-directory/src/pages/index.md.ts foundry/apps/public-directory/src/pages/learnings foundry/apps/public-directory/src/pages/llms-full.txt.ts foundry/apps/public-directory/src/pages/llms.txt.ts foundry/apps/public-directory/src/pages/sitemap.xml.ts foundry/apps/public-directory/src/styles/globals.css foundry/openspec/changes/add-content-coverage-and-launch-campaign-skills foundry/openspec/changes/add-provider-neutral-skill-execution-profiles foundry/ops/README.md foundry/ops/docs/fleet-agent-standards.md foundry/ops/lib/capability-catalog.mjs foundry/ops/lib/campaign-manifest.mjs foundry/ops/lib/content-coverage.mjs foundry/ops/lib/marketing-program.mjs foundry/ops/scripts/campaign-manifest.mjs foundry/ops/scripts/fleet-capabilities.mjs foundry/ops/scripts/site-health-scorecard.mjs 'foundry/ops/skills/*/execution-profile.json' foundry/ops/skills/content-coverage foundry/ops/skills/launch-campaign foundry/ops/skills/site-health/SKILL.md 'foundry/ops/teammates/skills/*/execution-profile.json' foundry/ops/test/capability-catalog.test.mjs foundry/ops/test/campaign-manifest.test.mjs foundry/ops/test/content-coverage.test.mjs foundry/ops/test/fixtures/campaigns foundry/ops/test/fixtures/content-coverage foundry/ops/test/launch-campaign.test.mjs foundry/ops/test/marketing-program.test.mjs foundry/ops/test/site-health-content-coverage.test.mjs`
- `git commit -m "feat(skills): add provider-neutral execution profiles"`
- `git push -u origin feat/provider-neutral-skill-execution-profiles`
- `gh pr create --repo sass-maker/fleet-workspace --base main --head feat/provider-neutral-skill-execution-profiles --title "feat(skills): add provider-neutral execution profiles" --body "Adds provider-neutral execution profiles across Fleet-owned skills, the content-coverage and launch-campaign skills, and the reviewed SaaS Maker learning article. Production deployment remains a separate approved command."`
- `git add -- foundry/ops/test/marketing-program.test.mjs foundry/ops/test/project-catalog.test.mjs`
- `git commit -m "test(ops): align project counts with catalog"`
- `git push origin feat/provider-neutral-skill-execution-profiles`
- `git add -- foundry/ops/lib/fleet-automation/registry.mjs`
- `git commit -m "fix(ops): align automation registry counts"`
- `git push origin feat/provider-neutral-skill-execution-profiles`
- `gh pr merge feat/provider-neutral-skill-execution-profiles --repo sass-maker/fleet-workspace --squash --auto`

### Publish commands

- `npm --prefix foundry/apps/public-directory run deploy`
- `gh api --method PUT repos/sarthakagrawal927/sarthakagrawal927/contents/README.md with the approved content, expected blob SHA, and commit message from item github-profile-writing`

## Exclusions

- `product-hunt`: This launch is an article and internal execution methodology, not a standalone product people can try.
- `show-hn`: Show HN explicitly excludes blog posts and other reading material; the retained Hacker News item is a normal story.
- `generic-software-directories`: Directories such as G2, Capterra, SaaSHub, and launch catalogs list products, not specialist articles or internal skill methodologies.
- `ai-tool-directories`: The article is not an AI tool listing; submitting it would be irrelevant directory spam.
- `email-newsletter`: No mapped, consented SaaS Maker mailing list exists for this campaign.
- `linkedin-article`: Use one native founder post linking the canonical article; a full LinkedIn duplicate has no verified canonical control in the reviewed workflow.
- `reddit-mass-crosspost`: Reddit prohibits repeated or unsolicited mass posting. At most one verified community may be retained in a future manifest.
- `legacy-directory-spray`: The legacy spray code uses unsafe force-submit behavior and ambiguous success signals and is explicitly prohibited by the launch-campaign skill.
- `linkedin`: Owner explicitly excluded LinkedIn from this campaign.
- `x`: Owner explicitly excluded X from this campaign.
- `hacker-news`: Owner explicitly excluded Hacker News from this campaign.

## Measurement

- Attribution: utm_campaign=skill-execution-profiles with a unique utm_source per retained destination; canonical syndication uses canonical_url instead of competing attribution links
- Metrics: confirmed live URLs, platform-native impressions, canonical article referrals when available, substantive comments, backlinks and citations, external implementation or adoption references
- Checkpoints: launch-day, 7d, 30d

