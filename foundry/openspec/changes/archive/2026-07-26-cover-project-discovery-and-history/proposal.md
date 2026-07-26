## Why

Fleet can discover a new Git checkout for health checks while silently omitting
it from the private console, public directory, generated documentation, and
deployment audits because project identity is authored across several files.
Calorie currently demonstrates this gap, while historical repositories already
gathered under `../fleet-inactive-projects/` are not resolved consistently.

## What Changes

- Make the private internal project catalog the only authored source of project
  identity, lifecycle, repository location, deployment, and public-listing
  posture.
- Generate compatibility registries, the Fleet workspace README inventory,
  private-console project data, and the sanitized public SaaS Maker catalog
  from that internal source.
- Register Calorie once in the internal catalog as a maintained Significant
  Hobbies Toolbox product and derive all downstream coverage.
- Add a read-only repository reconciliation check covering active workspace
  checkouts and the inactive-history root, with explicit exceptions rather than
  silent omissions.
- Make catalog validation fail when a discovered active or historical
  repository is missing from the internal catalog.
- Make the private Fleet Console resolve `sourcePath`, distinguish healthy
  local-only projects from blocked work, and show inactive Git repositories in
  a separate archive lane.
- Add a Past projects section to the public SaaS Maker directory containing
  only explicitly allowlisted public repositories and sanitized metadata.
- Keep the personal website and its README curated; they link to SaaS Maker and
  do not mirror the comprehensive catalog.

## Capabilities

### New Capabilities

- `fleet-project-coverage`: Single-source project generation, repository
  reconciliation, explicit active/inactive coverage, local-only state
  semantics, and historical-repository presentation.

### Modified Capabilities

- `fleet-workspace-boundary`: Require one internal catalog to account for
  discovered repositories and generate internal and sanitized external
  projections.
- `significant-hobbies-toolbox-automation`: Add Calorie as an independently
  mapped family product with privacy-safe evidence.
- `saasmaker-public-boundary`: Include Calorie as maintained and explicitly
  public historical repositories in a separate archive projection while
  excluding private data and repositories.

## Impact

Affected surfaces are Fleet project metadata, generated compatibility
registries and inventory documentation, validation and tests, the Significant
Hobbies family inventory, the privacy-checked public product projection, the
SaaS Maker directory, and Fleet Console project loading and grouping. The
personal website is intentionally unaffected. No production dependency,
credential, migration, deployment, or automatic publication is introduced.
