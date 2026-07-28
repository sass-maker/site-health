## Why

Fleet skills can explain what work to perform but cannot machine-readably state
the intelligence and reasoning quality they need. Model selection therefore
happens without the skill's quality context, especially when the same skill is
executed across providers or local runtimes.

## What Changes

- Add a provider-neutral execution-profile sidecar to every Fleet-owned skill.
- Extend the Fleet capability catalog to expose and validate the profiles.
- Add a deterministic compatibility command that compares a selected skill
  with an abstract runtime capability descriptor.
- Document how hosts map capability tiers to their own models while preserving
  owner and administrator overrides.
- Add a public SaaS Maker learning article explaining the agent-versus-skill
  distinction, the missing standard, and Fleet's implementation.
- Prepare the article for a separate immutable `launch-campaign` preview; no
  deployment or public posting is authorized by this implementation change.

## Capabilities

### New Capabilities

- `skill-execution-profile`: Provider-neutral skill quality metadata, catalog
  discovery, validation, and runtime compatibility decisions.
- `public-builder-learnings`: Durable first-party articles that document
  original Fleet product and agent-tooling learnings with indexable canonical
  URLs.

### Modified Capabilities

None.

## Impact

- Updates `foundry/ops/lib/capability-catalog.mjs`, its CLI, tests,
  documentation, and all Fleet-owned skill packages.
- Adds a static Learnings index and article to
  `foundry/apps/public-directory/`.
- Adds no production dependency, provider binding, credential access, model
  invocation, deployment, or external publication.
