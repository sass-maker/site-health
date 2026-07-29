## Why

Setline and India Standards are independent Significant Hobbies products with
their own domains and release lifecycles, but duplicate product source is
currently embedded under `foundry/apps/`. That contradicts Fleet's repository
boundary and creates two possible authorities for India Standards.

## What Changes

- **BREAKING** Remove the embedded Setline and India Standards product trees
  from Fleet Workspace.
- Create a private `Significant-Hobbies/setline` repository from the embedded
  Setline history and use an immediate Fleet checkout as its canonical local
  source.
- Keep the existing private `Significant-Hobbies/india-standards` repository as
  India Standards' sole authority; the newer standalone checkout supersedes
  the stale embedded copy.
- Preserve each product's existing Cloudflare project and domain records.
- Retain only catalog, public-projection, automation, and monitoring references
  in Fleet.
- Move Setline product status and future GitHub issue ownership to its
  standalone repository; preserve relevant OpenSpec history with the product.
- Do not deploy, change DNS, or modify production data.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `fleet-workspace-boundary`: Independent products, including Setline and India
  Standards, own product source and planning in standalone repositories while
  Fleet retains shared integration references only.
- `fleet-project-coverage`: Immediate standalone product checkouts, rather than
  embedded `foundry/apps` paths, satisfy active repository coverage.

## Impact

- Fleet removes `foundry/apps/setline` and
  `foundry/apps/india-standards`.
- Fleet project, automation, documentation, and generated public catalog
  references are updated to standalone repository paths and URLs.
- A new private GitHub repository is created for Setline without changing its
  deployed Worker or domain.
- The existing India Standards repository remains authoritative and is not
  overwritten by the stale embedded copy.
