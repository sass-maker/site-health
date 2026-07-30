## Why

Fleet Workspace is private, so every standard GitHub-hosted runner minute is
charged to the `sass-maker` private-repository allowance even when an audit
uses only public inputs. A public reusable workflow alone does not solve this:
GitHub bills reusable workflows to the caller, so genuinely public-safe
automation needs to execute from a public repository that owns all code and
inputs required for the run.

## What Changes

- Create a public `sass-maker/workflows` repository for reusable workflow
  modules and standalone, non-secret Fleet audits.
- Add that repository to Fleet Workspace as a commit-pinned git submodule at
  `foundry/ops/workflows`.
- Move only automation that can run entirely from allowlisted public inputs to
  the public repository. Initial candidates are canonical-domain availability
  checks and bounded public performance sweeps.
- Keep product/package CI, Fleet registry validation, sync guards, private
  console checks, mobile builds, and any workflow requiring private source or
  credentials in `sass-maker/fleet-workspace`.
- Do not give a public workflow a PAT, installation token, or other credential
  capable of checking out Fleet Workspace.
- Treat the existing Fleet public product projection as the source for a
  minimal public site manifest, with a deterministic privacy and drift check
  before the public module is updated.
- After redacted history and issue/PR exposure checks, change
  `Significant-Hobbies/setline`,
  `Significant-Hobbies/protein-index-resilience`,
  `Significant-Hobbies/motion`,
  `Significant-Hobbies/india-standards`, `sass-maker/saas-ideas`, and
  `sarthakagrawal927/mashup` to public. Fleet Workspace remains private.
- Publication of `sass-maker/saas-ideas` is blocked pending an owner decision:
  its current git history can restore a deleted Starter Story scrape that the
  repository itself identifies as a licensing and terms-of-service risk. The
  other five repositories may proceed independently after their audits pass.
- Preserve production deployment as manual and out of scope.

## Capabilities

### New Capabilities

- `public-fleet-automation`: Defines the public automation repository,
  privacy boundary, standalone execution rules, submodule contract, and
  validation required before public workflows can run.

### Modified Capabilities

- `fleet-workspace-boundary`: Changes Fleet Workspace from the sole home of
  every shared schedule to the private control-plane authority with one
  explicitly bounded public automation dependency.
- `cloudflare-resilience`: Separates public domain/surface probes from private
  repository and provider-inventory checks.

## Impact

- New repository: `sass-maker/workflows` (public).
- Fleet Workspace: `.gitmodules`, `foundry/ops/workflows`, public-projection
  generation/validation, workflow policy, root documentation, and the two
  existing scheduled audit workflows.
- Repository settings and visibility documentation in six independent
  repositories.
- GitHub Actions: standalone public runs use standard public runners; private
  Fleet CI remains charged to the private caller. Larger runners remain out of
  scope.
- No production deployment, credential migration, database change, DNS
  change, or private-source checkout from public automation.
