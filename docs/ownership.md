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

App Store SEO remains on its existing Site Health origin and storage namespace.
Collectors record observation times, failures and missing evidence independently;
refreshing the interface does not create observations or improve a score.
