## Context

SaaS Maker currently owns four Cloudflare targets: a static public directory,
a static Blume documentation site, a Next.js inbox Worker, and an API Worker.
Fleet already owns the internal registry, public projection generation,
spotlight synchronization, and shared operational tooling. The feedback package
is the only published package, and both active consumers still rely on the
hosted API and private inbox.

The source repos are clean. Fleet Workspace is private and uses independently
checked nested components under `fleet-ops/`; SaaS Maker is public and uses a
pnpm/Turbo monorepo. Production D1, R2, Workers, domains, OAuth, and npm release
state must remain stable until the migrated source is proven.

## Goals / Non-Goals

**Goals:**

- Remove SaaS Maker as a standalone product, public directory, hosted docs
  site, spotlight, and marketing target.
- Preserve the useful feedback package, existing API, and private inbox as one
  minimal Fleet-owned component.
- Preserve active consumer compatibility and existing production data.
- Reduce the retained component to one pnpm workspace without the showcase,
  Blume, Cockpit marketing overlay, or separate private UI package.
- Make the npm package README the complete public documentation surface.
- Make eventual Pages deletion and repository archival safe, explicit, and
  independently reversible until finalization.

**Non-Goals:**

- Creating or renaming Workers, domains, D1 databases, R2 buckets, project keys,
  npm scopes, or authentication credentials.
- Publishing npm, deploying Workers, changing DNS, deleting Cloudflare
  resources, dropping historical D1 tables, or archiving repositories during
  the source-migration phase.
- Redesigning the feedback package around a callback-only API.
- Preserving SaaS Maker as a public brand or portfolio directory.

## Decisions

### Use one nested Fleet component

The retained source will live at `fleet-ops/services/feedback/` with its own
pnpm lockfile and workspace. This matches Fleet's component-native model and
avoids forcing the Fleet root's npm lifecycle onto the package and Workers.

Alternative considered: keep the standalone repository but remove its public
sites. Rejected because the repository would still exist only to host shared
Fleet infrastructure.

### Preserve the two existing Workers during consolidation

`saasmaker-dashboard` and `saasmaker-api` remain the deployed identities, with
`app.sassmaker.com` and `api.sassmaker.com` unchanged. Moving source does not
require a new Worker or a production migration.

Alternative considered: merge the inbox and API into one Worker. Rejected for
this cleanup because it combines two runtimes, auth boundaries, bindings, and
deployment paths while providing little immediate benefit.

### Remove both static public surfaces

The showcase and Blume applications will not move to Fleet. Package guidance
will be consolidated into `@saas-maker/feedback`'s README so npm becomes the
public documentation surface. The two Pages projects become deletion
candidates only after references and redirect requirements are audited.

Alternative considered: host Blume at `sassmaker.com/docs`. Rejected because a
single package does not justify another built and deployed documentation
surface.

### Remove avoidable retained packages

The Cockpit's only import from `@saas-maker/ui` will be replaced with its local
UI primitives, allowing the private UI package and Storybook surface to be
discarded. The Astro login/marketing overlay will be removed; the private
Worker will serve its functional login/inbox routes directly.

### Keep compatibility identities

The npm name `@saas-maker/feedback` and existing API/app domains remain. They
are compatibility identifiers, not proof that SaaS Maker remains a product.
Renaming them would impose consumer, OAuth, CORS, and release churn unrelated
to the cleanup goal.

### Treat public projection cleanup as Fleet work

Fleet will remove the SaaS Maker directory/docs entries, spotlight membership,
marketing target, directory consumer synchronization, and generated artifacts
that exist only for `sassmaker.com`. Shared uses of the `sassmaker.com` zone by
other products remain untouched.

### Separate migration from irreversible retirement

Source migration and validation land first. Deployment parity is then proven
using the existing Workers and smoke checks. Pages deletion, DNS changes, data
deletion, npm actions, and repository archival occur only as explicit
finalization steps with a rollback point.

## Risks / Trade-offs

- **Private Fleet source reduces public package transparency** → Keep the public
  SaaS Maker repository available as a read-only source snapshot until an
  explicit archival decision; ensure the npm tarball includes a complete README
  and license.
- **Fleet configs have many SaaS Maker references** → Classify each reference as
  product identity, feedback compatibility, or shared `sassmaker.com` zone use;
  remove only the first category.
- **Moving deploy configs can break relative paths** → Preserve package names,
  validate all workspace commands, and run dry deploy guards without deploying.
- **Removing static sites creates broken links** → Inventory package metadata,
  READMEs, AI surfaces, profile links, and directory submissions before Pages
  deletion; use a temporary redirect only if a meaningful inbound path remains.
- **Historical D1 migrations contain retired systems** → Keep migration history
  during this pass; dropping tables or synthesizing a new baseline is a separate
  data migration.
- **The existing spotlight spec requires SaaS Maker** → Revise that contract and
  its synchronized consumers before claiming retirement complete.

## Migration Plan

1. Create the Fleet feedback component from only the widget, inbox, API,
   contracts, tests, required scripts, and workspace configuration.
2. Remove the private UI workspace dependency and the Cockpit Astro overlay.
3. Consolidate package documentation into the npm README and correct package
   metadata away from the hosted docs site.
4. Add the component to Fleet-native structural and validation checks.
5. Update Fleet registry, spotlight, marketing, public projection, generated
   outputs, tests, README, and `PROJECT_STATUS.md` to represent Feedback as
   private infrastructure rather than SaaS Maker as a product.
6. Validate the migrated component locally: API tests, typecheck, widget build,
   inbox build, package packing, Fleet registry checks, and retained production
   smoke checks.
7. Remove obsolete source and workflows from the standalone repository, leaving
   a concise retirement README/status until archival.
8. With separate explicit production approval, deploy the existing Workers from
   Fleet and verify parity. Roll back by redeploying the last known-good SaaS
   Maker commit if needed.
9. After link audit and parity proof, explicitly delete the two Pages projects,
   adjust DNS if required, and archive the standalone repository. Data resources
   remain unless separately approved for deletion.

## Open Questions

- Whether `sassmaker.com` should redirect to the npm package, the Fleet GitHub
  organization, or return a retirement page before the Pages project is
  deleted.
- Whether the archived public repository should remain the package's source URL
  or package metadata should point to the private Fleet repository.
- Whether historical feedback data has a retention requirement before any
  future D1/R2 cleanup.
