## Context

Fleet currently contains two product trees that belong to Significant Hobbies:
`foundry/apps/setline` is Setline's authoritative source, while
`foundry/apps/india-standards` is an obsolete copy of the newer standalone
`Significant-Hobbies/india-standards` repository. Both products already have
independent Cloudflare identities and domains.

Fleet's project catalog is designed to link immediate child repositories and
generate sanitized operational/public views. It does not need product source in
order to monitor or list an independent product.

## Goals / Non-Goals

**Goals:**

- Establish exactly one authoritative repository for each product.
- Preserve Setline's commit history, product documentation, and relevant
  OpenSpec history.
- Preserve India Standards' newer standalone implementation unchanged.
- Move Setline's open work to GitHub Issues in its product repository.
- Keep Fleet catalog, monitoring, and public-projection links functional.
- Leave production Workers, databases, DNS, and domains unchanged.

**Non-Goals:**

- Deploying either product.
- Changing product behavior, dependencies, design, data, or authentication.
- Rewriting or force-pushing existing repository history.
- Making either private repository public.

## Decisions

### Extract Setline with history

Use Git's subtree history split for `foundry/apps/setline`, clone the resulting
history into an immediate `setline/` checkout, and publish it as the private
`Significant-Hobbies/setline` repository. This preserves the product's authored
commit lineage without carrying unrelated Fleet files.

Creating a new repository from a fresh snapshot was rejected because it would
erase useful product history and attribution.

### Treat standalone India Standards as authoritative

The existing `india-standards/` checkout and
`Significant-Hobbies/india-standards` remote contain the hosted aggregate
runtime and newer product/data documentation absent from the embedded copy.
The embedded tree is therefore removed rather than merged over the standalone
repository.

Merging the embedded copy was rejected because it would reintroduce stale code
and create false conflicts with the newer implementation.

### Keep integrations, not source, in Fleet

Fleet catalog entries use `setline` and `india-standards` immediate-child repo
paths and retain their existing deployment IDs and domains. Automation and
public-product projections continue to derive from the catalog.

### Keep product work with the product

Setline's product status, relevant OpenSpec history, and open GitHub issues move
to the new repository. Fleet may retain archived cross-project migration
evidence, but it no longer owns Setline's feature queue.

## Risks / Trade-offs

- [Subtree split omits cross-project commits with no Setline path changes] →
  Product history intentionally contains only commits that changed Setline;
  cross-project migration evidence remains in Fleet.
- [Generated Fleet files drift after repo-path changes] → Run the canonical
  project generator and its check mode.
- [Issue recreation loses original discussion metadata] → Preserve the
  original issue link in each new issue and close the Fleet issue only after
  the new issue exists.
- [Deleting the stale India tree removes files not in the standalone repo] →
  Compare both trees first and retain the demonstrably newer standalone source;
  no standalone files are overwritten.

## Migration Plan

1. Validate both working trees are clean and confirm remotes/domains.
2. Split Setline history and create the private standalone repository on
   `main`.
3. Add standalone repository instructions/status and migrate Setline-specific
   OpenSpec history and open issues.
4. Update Fleet catalog and generated references to the standalone path.
5. Remove both embedded trees from Fleet.
6. Run product-native and Fleet catalog/component checks.
7. Commit and push the product repository and Fleet `main`; do not deploy.

Rollback is source-control based: the pre-removal Fleet commits retain both
embedded trees, and the standalone repositories add independent recoverable
copies. No production rollback is required because runtime state is unchanged.

## Open Questions

None. The owner has explicitly confirmed that both products are separate and
must be moved out if embedded.
