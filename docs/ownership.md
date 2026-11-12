# Product ownership

Site Health is the owner-private portfolio workspace. It owns the local catalog
at `catalog/projects.json`, generated operational data, evidence, product readiness
scores, effort and result assessments, usage, improvement history and the detailed
product checklist at `/readiness` (canonical guidance: [product readiness checklist](product-readiness-checklist.md)). These private datasets are not public assets.

SaaS Maker owns the public product directory and reusable Fleet tooling. Its public
projection contains only explicitly approved public fields. Shared generators may
read Site Health's local catalog; they must not publish owner notes or assessments.
`apps/backend/config/projects.json` is a read-only symlink to
`catalog/generated/operations.json`. Edit the catalog, then run the shared
`pnpm --dir ../saas-maker catalog:sync` generator.

Readiness imports the existing schema-1 workspace without changing scoring,
progress, assessment, usage or history semantics. Its IndexedDB store is local to
the Site Health browser origin. Export a full backup from the old workspace, import
it at `/readiness`, reload, and compare a fresh export before retiring the old copy.
No review dataset is bundled in the application or uploaded by this workflow.

## App Store research is a Site Health feature

App Store research/SEO was integrated into Site Health on 2026-10-25. It is part
of the existing SEO area at `/search/app-store`, alongside Web SEO, with the
existing Site Health origin and storage namespace. It is not a separate product.

- UI source: `apps/web/src/features/app-store`.
- Shared backend routes: `apps/backend/lib/app-store`, used by both the local
  dashboard service and the Cloudflare worker/`APP_STORE` durable-object adapter
  in `apps/backend/cloudflare`. Verify hosted deployment separately from source.
- Current integration and capability record: [PROJECT_STATUS.md](../PROJECT_STATUS.md).

A retained standalone prototype is historical evidence, not the current source
owner. Apple Ads popularity and App Store Connect publishing remain unconnected;
do not infer those capabilities from the feature's name. Collectors record
observation times, failures and missing evidence independently; refreshing the
interface does not create observations or improve a score.

## Product identity and repository identity

Use active project records in the owner-local catalog for active product scope.
The catalog's `repositoryReview.repositories` records explain historical and
shared repositories; they are not an active-project list. Project counts, unique
owning repository counts, and physical checkout counts measure different things.
Do not infer ownership or activity from a repository name alone.

Memory Map's active catalog project keeps the stable ID
`chatgpt-memory-insights` and origin `https://chatgpt.significanthobbies.com`.
On 2026-11-12 the owner restored it to the independent
`sarthakagrawal927/chatgpt-memory-insights` repository, with the browser app at
the repository root and `memory-pack` under `packer/`. The existing repository
was renamed back from `daddyrad-mcp`, preserving history, releases and evidence.
The production origin and visitors' browser-local saved indexes are unchanged.

DaddyRad's local, read-only stdio MCP adapter belongs to SaaS Maker's shared
MCP Connections at `apps/mcp/local/daddyrad`. It serves PerformanceDaddy,
ContextDaddy, StorageDaddy and BrowserDaddy using their pinned native cores.
It remains local-only, with startup-selected filesystem scopes and no hosted
route or access to the GUI apps' live state. It is not part of Memory Map and
has no separate product repository.
