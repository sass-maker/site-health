## Context

See `proposal.md` for motivation. Fleet already derives the Domains view from
the canonical project catalog, while public names are repeated independently in
the project catalog, agent-surface registry, page source, and GEO query config.
Two root domains are intentionally outside the maintained agent-surface registry:
the personal portfolio and Aliveville.

## Goals / Non-Goals

**Goals:**

- Make root domain the stable join key for the ten-brand search contract.
- Preserve deliberate human-facing aliases without generating spelling variants.
- Validate registry coverage and make JSON-LD generation consume the contract.
- Correct project-owned metadata only where source evidence conflicts.

**Non-Goals:**

- Rename repository directories, package names, internal project IDs, or cloud resources.
- Treat a metadata correction as proof of improved search rank.
- Add keywords solely to create more aliases.

## Decisions

### Use a dedicated root-domain contract

Add a small JSON configuration keyed by registrable root domain. The root domain
is already the unit shown by the Domains view and avoids optional project-ID
branches for the personal site and Aliveville. Reusing `projects.json` was
considered, but it cannot represent the personal site without turning that site
into a Fleet product. Reusing the agent registry was rejected because it
intentionally excludes some root domains.

### Keep aliases explicit and bounded

Each record contains `canonicalName` and `alternateNames`. Validation rejects
empty values, duplicate roots, excessive aliases, and alias duplication after
case/spacing normalization. This avoids a keyword generator and keeps every
public spelling reviewable.

### Generate where Fleet owns generation; audit elsewhere

The agent-surface generator joins by root domain and emits `name` plus optional
`alternateName`. Project-owned page metadata remains in its repository and is
corrected through its native layout. A Fleet audit verifies the final source
contract without rewriting product copy automatically.

## Risks / Trade-offs

- **[Alias overreach]** An overly broad alias can create ambiguity. → Keep the
  list short and limited to existing brand/domain variants.
- **[Source layouts differ]** A single rewriter would be brittle across Astro
  and Next.js. → Generate only owned blocks and use explicit per-project edits.
- **[Rankings move slowly]** Correct metadata may not change search results by
  itself. → Record this as a prerequisite change and measure later.

## Migration Plan

1. Land and validate the Fleet brand contract and JSON-LD support.
2. Align each conflicting project layout in isolated repository branches.
3. Merge checks without deploying automatically.
4. After explicit deploy approval, publish and request re-inspection; rollback
   is a normal revert of the metadata commit.
