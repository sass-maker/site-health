## Context

Project membership is currently repeated across `projects.json`,
`automation-registry.json`, `marketing-program.json`, public-product
annotations, family inventories, Markdown summaries, and UI-specific loaders.
Repository discovery is independent of those files, so a new checkout can pass
Git and CI checks without appearing in the project catalog. The public
directory also needs a safe way to distinguish maintained products from past
public repositories without exposing private repository names or operational
metadata.

## Goals / Non-Goals

**Goals:**

- Make `foundry/ops/config/projects.json` the only source that can create a
  project identity.
- Treat automation, marketing, family, and indexing configuration as policy
  overlays keyed to catalog ids; overlays cannot create projects.
- Generate human and public project surfaces through one deterministic command.
- Detect unregistered active and historical Git checkouts in validation.
- Show all known repositories privately and only explicitly public repositories
  externally.
- Register Calorie through the new path and prove downstream coverage.

**Non-Goals:**

- Publishing private repositories or private operational notes.
- Mirroring the comprehensive inventory onto the personal website or its
  README.
- Automatically deploying any generated surface.
- Inferring product attention, public visibility, or retirement posture without
  an explicit catalog value.
- Replacing specialized automation policies, activation definitions, or
  provider configuration with generic project metadata.

## Decisions

### Keep `projects.json` as the internal catalog

The existing deploy/domain inventory already has the broadest adoption and is
read by health, console, and public-projection code. It will gain explicit
display name, attention, repository visibility, lifecycle, and public-listing
metadata. Existing operational registries become overlays that must reference a
known catalog id.

Creating another catalog file was rejected because it would immediately create
another migration and another identity join.

### Generate views directly from the catalog

A dependency-free Node command will read the internal catalog, validate overlay
references and discovered repositories, and generate or check:

- the Fleet README portfolio inventory;
- the project-tier mirror;
- compatibility project lists consumed by automation and marketing;
- the privacy-checked public catalog consumed by SaaS Maker;
- private console project metadata.

The README is an output, not an intermediate data format. Generating the public
catalog by parsing Markdown was rejected because Markdown cannot express
visibility and privacy contracts safely.

### Separate catalog membership from specialized policy

One catalog entry establishes that a project exists and supplies shared
identity, repository, lifecycle, deployment, and public-listing fields.
Specialized policy files may add automation contracts, activation definitions,
prompt sets, or indexing file locations, but they MUST join to an existing
catalog id and MUST NOT introduce an independent project.

This keeps the single source of truth useful without turning one JSON object
into an unmaintainable dump of every subsystem's settings.

### Make public history explicit and minimal

Public output supports `maintained`, `past`, and `hidden` listing postures.
`past` emits only an allowlisted name, short description, and public GitHub
repository URL. Private repository visibility always forces `hidden`.
Operational notes, source paths, retirement reasons, deployment failures, and
machine state never enter public output.

### Reconcile bounded repository roots

Validation scans only immediate Git repositories under the Fleet root and
`../fleet-inactive-projects`. Every discovered checkout must resolve to one
catalog entry through `repo` or `sourcePath`. Missing entries fail `--check`;
missing optional local checkouts do not fail because fresh machines are allowed
to omit inactive history.

### Model local-only as a deployment posture, not a blocker

The private console will label a healthy `deployKind: none` project as
`Local-only`. A project is `Blocked` only when an explicit blocked condition is
present. Historical entries use a separate Past projects lane and resolve their
Git metadata through `sourcePath`.

## Risks / Trade-offs

- [The catalog becomes larger] → Keep subsystem-specific policy in validated
  overlays and centralize only shared identity and projection fields.
- [A public flag could expose a private repository] → Require both explicit
  public listing posture and verified `repositoryVisibility: public`; fail
  generation on contradictions.
- [Generated Markdown creates noisy diffs] → Replace only delimited generated
  sections and keep output ordering deterministic.
- [Inactive repositories are optional on fresh machines] → Fail only for
  discovered-but-unregistered history, not registered-but-absent checkouts.
- [Compatibility consumers may still read old files] → Generate those project
  lists during migration and add check-mode drift tests before retiring them.

## Migration Plan

1. Extend the catalog schema and seed Calorie plus all discovered inactive
   repositories.
2. Add generation/reconciliation with check mode and focused tests.
3. Regenerate internal Markdown and sanitized public data.
4. Update the console and public directory to consume generated projections.
5. Run catalog checks, Fleet tests, both affected app builds, strict OpenSpec
   validation, and diff checks.
6. Do not deploy; existing output remains the rollback surface until an
   explicit deployment request.

## Open Questions

None. The personal website remains curated and links to SaaS Maker rather than
duplicating the complete catalog.
