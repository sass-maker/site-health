import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRootBrandContract } from '../root-brand-contract.mjs';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const defaultRegistryPath = process.env.SITE_HEALTH_OWNER_REPOSITORY
  ? join(process.env.SITE_HEALTH_OWNER_REPOSITORY, 'apps/backend/config/projects.json')
  : join(moduleDirectory, '..', '..', 'config', 'projects.json');
const siteHealthRepository = 'https://github.com/sass-maker/site-health';
const canonicalNames = {
  'app-health': 'App Health',
  codevetter: 'CodeVetter',
  'site-health': 'Site Health',
  'free-ai': 'Free AI',
  'high-signal': 'High Signal',
  pace: 'HeyPace',
  posttrainllm: 'Post-train LLM',
  'psi-swarm': 'PSI Swarm',
};

function displayName(project) {
  if (project.name) return project.name;
  if (canonicalNames[project.id]) return canonicalNames[project.id];
  return project.id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function loadProjectCollections(registryPath = defaultRegistryPath) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const policy = registry.systems?.rootBrands;
  if (!policy) return [];
  const brands = validateRootBrandContract(policy, loadDashboardProjects(registryPath));
  return [...brands.values()].filter(brand => brand.collection).map(brand => ({
    ...brand.collection,
    name: brand.canonicalName,
    rootDomain: brand.rootDomain,
    priority: brand.priority ?? null,
    growthFocus: policy.growthPriority?.level === 'high'
      ? { level: 'high', domains: [brand.rootDomain] } : null,
  }));
}

export function loadDashboardProjects(registryPath = defaultRegistryPath) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const rootPolicy = registry.systems?.rootBrands;
  const focusRoots = new Set(rootPolicy?.growthPriority?.level === 'high'
    ? (rootPolicy.brands ?? []).map(brand => brand.rootDomain) : []);
  const familyNames = new Map(
    registry.projects.map((project) => [project.id, displayName(project)]),
  );
  const standaloneRepositories = (registry.repositoryReview?.repositories ?? [])
    .filter((row) => !row.projectId)
    .map((row) => ({
      id: `repo:${row.currentRepository}`,
      name: row.currentRepository.split('/').at(-1),
      identityKind: 'repository',
      description: row.reason ?? 'Retained repository identity; not a catalog project.',
      family: null,
      familyName: null,
      lifecycle: {
        status: 'inactive',
        shareable: row.lifecycle?.shareable ?? false,
        resumeCondition: null,
      },
      priority: null,
      status: 'inactive',
      repositoryUrl: row.githubVerification?.url ?? `https://github.com/${row.currentRepository}`,
      domains: [],
      websiteUrl: null,
      changelogUrl: null,
      repository: row.currentRepository,
      futureForm: row.futureForm ?? null,
      checkoutState: row.localCheckout?.state ?? null,
    }));
  return registry.projects
    .filter((project) => project.status !== 'orphan')
    .map((project) => {
      const domain = project.domains?.[0] ?? null;
      const historicalRepositoryUrl =
        project.repositoryUrl ?? project.public?.repositoryUrl ?? null;
      const repositoryUrl = project.id === 'site-health'
        ? siteHealthRepository
        : historicalRepositoryUrl;
      const priorityDecision = project.portfolio?.scopeDecision?.priorityDecision;
      const directory = registry.publicDirectory?.projects?.[project.id];
      const websiteUrl = directory && Object.hasOwn(directory, 'publicDestinationUrl')
        ? directory.publicDestinationUrl : domain ? `https://${domain}` : null;
      const focusDomains = (project.domains ?? []).filter(host => focusRoots.has(host));
      const growthFocus = focusDomains.length ? { level: 'high', domains: focusDomains } : null;
      return {
        id: project.id,
        name: displayName(project),
        description: directory?.description ?? project.public?.description ?? null,
        form: directory?.form ?? null,
        platforms: directory?.platforms ?? [],
        category: project.category ?? null,
        audience: project.audience ?? 'unknown',
        purposeCategories: project.portfolio?.purposeCategories ?? [],
        family: project.family,
        familyName: familyNames.get(project.family) ?? displayName({ id: project.family }),
        attention: project.attention ?? project.tier,
        tier: project.tier ?? null,
        portfolioStatus: project.portfolio?.status ?? null,
        lifecycle: project.lifecycle ?? { status: 'inactive', shareable: false, resumeCondition: null },
        sharingReadiness: project.portfolio?.sharingReadiness ?? null,
        publicListing: project.public?.listing ?? null,
        metricEligibility: {
          publicSite: project.metrics?.publicSite === true,
          domainCoverage: project.metrics?.domainCoverage === true,
        },
        priority: priorityDecision?.applicable === false ? null : project.portfolio?.priority ?? null,
        priorityApplicable: priorityDecision?.applicable ?? null,
        priorityReason: priorityDecision?.reason ?? null,
        growthFocus,
        domainLabel: websiteUrl === null && (project.domains?.length ?? 0) > 1
          ? `${project.domains.length} configured endpoint hosts` : domain,
        status: project.status,
        repo: project.repo,
        sourcePath: project.sourcePath ?? null,
        repositoryVisibility: project.repositoryVisibility ?? 'unknown',
        repositoryUrl,
        domains: project.domains ?? [],
        websiteUrl,
        changelogUrl: websiteUrl && domain ? `https://${domain}/changelog` : null,
        deployKind: project.deployKind,
      };
    })
    .concat(standaloneRepositories);
}
