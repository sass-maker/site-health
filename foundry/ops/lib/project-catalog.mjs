import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { visibilityProjects } from './visibility-projects.mjs';

const ATTENTION = new Set(['my-work', 'toolbox', 'foundry', 'ignored']);
const LIFECYCLE = new Set(['maintained', 'local-only', 'past', 'non-product']);
const VISIBILITY = new Set(['public', 'private', 'unknown']);
const PUBLIC_LISTING = new Set(['maintained', 'past', 'hidden']);
const GEO_SOURCE_STATE = new Set(['public', 'internal']);
const GEO_DOCS_STATE = new Set(['public', 'repository-readme', 'landing-only']);
const GEO_PRIMARY_AVAILABILITY = new Set(['web', 'api', 'direct-download', 'internal-only']);
const GEO_APP_STORE_STATE = new Set(['not-applicable', 'listed']);
const GEO_PRICING_STATE = new Set(['free', 'published', 'not-declared', 'not-applicable']);
const RESERVED_OVERLAY_IDS = new Set(['wifi-watch']);
const STANDALONE_PRODUCT_REPOS = new Map([
  ['india-standards', 'india-standards'],
  ['setline', 'setline'],
]);

export function validateProjectCatalog(catalog, {
  fleetRoot,
  automationRegistry,
  marketingProgram,
  siteRegistry,
  toolboxRegistry,
  agentRegistry,
  reconcile = true,
} = {}) {
  const errors = [];
  const ids = new Set();
  const identities = new Map();
  const repositoryPaths = new Map();

  for (const project of catalog.projects ?? []) {
    if (!project.id) {
      errors.push('project missing id');
      continue;
    }
    if (ids.has(project.id)) errors.push(`${project.id}: duplicate catalog id`);
    ids.add(project.id);
    for (const identity of [project.id, ...(project.aliases ?? [])]) {
      const normalized = normalize(identity);
      if (identities.has(normalized)) {
        errors.push(`${project.id}: identity ${identity} also belongs to ${identities.get(normalized)}`);
      } else {
        identities.set(normalized, project.id);
      }
    }

    for (const [field, allowed] of [
      ['attention', ATTENTION],
      ['lifecycle', LIFECYCLE],
      ['repositoryVisibility', VISIBILITY],
    ]) {
      if (!allowed.has(project[field])) errors.push(`${project.id}: invalid ${field} ${project[field]}`);
    }
    if (!project.name) errors.push(`${project.id}: missing name`);
    const standaloneRepo = STANDALONE_PRODUCT_REPOS.get(project.id);
    if (standaloneRepo && normalizePath(project.repo) !== standaloneRepo) {
      errors.push(`${project.id}: independent product repository must be ${standaloneRepo}`);
    }
    if (!PUBLIC_LISTING.has(project.public?.listing)) {
      errors.push(`${project.id}: invalid public listing ${project.public?.listing}`);
    }
    if (project.public?.listing === 'past' && project.lifecycle !== 'past') {
      errors.push(`${project.id}: past public listing requires lifecycle past`);
    }
    if (project.public?.listing === 'past' && project.repositoryVisibility !== 'public') {
      errors.push(`${project.id}: past public listing requires a public repository`);
    }
    if (project.public?.repositoryUrl && project.repositoryVisibility !== 'public') {
      errors.push(`${project.id}: public repositoryUrl requires repositoryVisibility public`);
    }
    if (
      project.lifecycle === 'maintained'
      && project.public?.repositoryUrl?.startsWith('https://github.com/sarthakagrawal927/')
      && project.id !== 'sarthakagrawal-personal'
    ) {
      errors.push(`${project.id}: maintained repository must use an organization owner`);
    }
    if (project.public?.listing === 'past' && !project.public.repositoryUrl) {
      errors.push(`${project.id}: public past project requires repositoryUrl`);
    }
    for (const field of ['repo', 'sourcePath']) {
      if (!project[field]) continue;
      const normalized = normalizePath(project[field]);
      const existing = repositoryPaths.get(normalized);
      if (existing && existing !== project.id) {
        errors.push(`${project.id}: ${field} ${project[field]} also belongs to ${existing}`);
      } else {
        repositoryPaths.set(normalized, project.id);
      }
    }
  }

  validateOverlay('automation-registry', automationRegistry?.entries, (entry) => entry.id, identities, errors);
  validateOverlay('marketing-program', marketingProgram?.projects, (entry) => entry.slug, identities, errors);
  validateOverlay('project-sites', Object.keys(siteRegistry?.projects ?? {}), (entry) => entry, identities, errors);
  validateOverlay('significant-hobbies-toolbox', toolboxRegistry?.products, (entry) => entry.id, identities, errors);
  validateGeoIdentityContract(catalog, agentRegistry, errors);

  if (reconcile && fleetRoot) {
    const active = discoverGitDirectories(fleetRoot);
    const inactiveRoot = path.resolve(fleetRoot, '../fleet-inactive-projects');
    const inactive = existsSync(inactiveRoot) ? discoverGitDirectories(inactiveRoot) : [];
    const activePaths = new Set(
      catalog.projects
        .map((project) => project.repo)
        .filter((value) => value && !value.includes('/'))
        .map(normalizePath),
    );
    for (const [checkout, identity] of Object.entries(catalog._meta?.absorbedCheckouts ?? {})) {
      if (!identities.has(normalize(identity))) {
        errors.push(`absorbed checkout ${checkout}: unknown catalog identity ${identity}`);
        continue;
      }
      activePaths.add(normalizePath(checkout));
    }
    const inactivePaths = new Set(
      catalog.projects
        .map((project) => project.sourcePath)
        .filter(Boolean)
        .map((value) => normalizePath(path.relative(fleetRoot, path.resolve(fleetRoot, value)))),
    );

    for (const name of active) {
      if (!activePaths.has(normalizePath(name))) errors.push(`active checkout ${name}: missing from project catalog`);
    }
    for (const name of inactive) {
      const relative = normalizePath(path.relative(fleetRoot, path.join(inactiveRoot, name)));
      if (!inactivePaths.has(relative)) errors.push(`inactive checkout ${name}: missing from project catalog`);
    }
  }

  if (errors.length) {
    throw new Error(`Project catalog invalid:\n- ${errors.join('\n- ')}`);
  }
  return { projectCount: ids.size };
}

export function validateGeoIdentityContract(catalog, agentRegistry, inheritedErrors = null) {
  const errors = inheritedErrors ?? [];
  const maintained = visibilityProjects(catalog);
  const projectsById = new Map(maintained.map((project) => [project.id, project]));
  const identities = catalog.geoIdentities ?? [];
  const identitiesById = new Map();

  for (const identity of identities) {
    if (!identity?.id) {
      errors.push('geo identity missing id');
      continue;
    }
    if (identitiesById.has(identity.id)) {
      errors.push(`${identity.id}: duplicate geo identity`);
      continue;
    }
    identitiesById.set(identity.id, identity);
  }

  const missing = maintained
    .filter((project) => !identitiesById.has(project.id))
    .map((project) => project.id);
  const extra = [...identitiesById.keys()].filter((id) => !projectsById.has(id));
  if (missing.length) errors.push(`geo identities missing: ${missing.join(', ')}`);
  if (extra.length) errors.push(`geo identities extra: ${extra.join(', ')}`);

  const agentById = new Map((agentRegistry?.products ?? []).map((product) => [product.id, product]));
  for (const [id, identity] of identitiesById) {
    const project = projectsById.get(id);
    if (!project) continue;
    const expectedName = project.public?.name ?? project.name;
    const expectedOrigin = `https://${project.domains[0]}`;
    if (identity.name !== expectedName) {
      errors.push(`${id}: geo name ${identity.name ?? 'missing'} != ${expectedName}`);
    }
    if (normalizeUrl(identity.origin) !== normalizeUrl(expectedOrigin)) {
      errors.push(`${id}: geo origin ${identity.origin ?? 'missing'} != ${expectedOrigin}`);
    }
    validateAliases(id, identity, errors);
    validateGeoSource(id, identity.source, project, errors);
    validateGeoDocs(id, identity.docs, errors);
    validateHttpsList(id, 'officialProfiles', identity.officialProfiles, errors);

    if (!GEO_PRIMARY_AVAILABILITY.has(identity.availability?.primary)) {
      errors.push(`${id}: invalid primary availability ${identity.availability?.primary}`);
    }
    if (!GEO_APP_STORE_STATE.has(identity.availability?.appStore)) {
      errors.push(`${id}: invalid App Store state ${identity.availability?.appStore}`);
    }
    if (identity.availability?.appStore === 'listed' && !isHttpsUrl(identity.availability?.appStoreUrl)) {
      errors.push(`${id}: listed App Store availability requires appStoreUrl`);
    }
    if (!GEO_PRICING_STATE.has(identity.pricing?.state)) {
      errors.push(`${id}: invalid pricing state ${identity.pricing?.state}`);
    }
    if (['free', 'published'].includes(identity.pricing?.state) && !isHttpsUrl(identity.pricing?.url)) {
      errors.push(`${id}: ${identity.pricing?.state} pricing requires a public URL`);
    }

    const agent = agentById.get(id);
    if (!agentRegistry || !agent) continue;
    if (agent.name !== identity.name) {
      errors.push(`${id}: agent name ${agent.name ?? 'missing'} != canonical ${identity.name}`);
    }
    if (normalizeUrl(agent.url) !== normalizeUrl(identity.origin)) {
      errors.push(`${id}: agent URL ${agent.url ?? 'missing'} != canonical ${identity.origin}`);
    }
    if (!sameStringList(agent.sameAs ?? [], identity.officialProfiles ?? [])) {
      errors.push(`${id}: agent sameAs does not match canonical officialProfiles`);
    }
  }

  if (inheritedErrors == null && errors.length) {
    throw new Error(`GEO identity contract invalid:\n- ${errors.join('\n- ')}`);
  }
  return { projectCount: maintained.length };
}

function validateAliases(id, identity, errors) {
  if (!Array.isArray(identity.aliases)) {
    errors.push(`${id}: geo aliases must be an array`);
    return;
  }
  const normalized = identity.aliases.map(normalize);
  if (normalized.some((alias) => !alias)) errors.push(`${id}: geo aliases cannot be empty`);
  if (new Set(normalized).size !== normalized.length) errors.push(`${id}: duplicate geo alias`);
  if (normalized.includes(normalize(identity.name))) errors.push(`${id}: canonical name repeated as alias`);
}

function validateGeoSource(id, source, project, errors) {
  if (!GEO_SOURCE_STATE.has(source?.state)) {
    errors.push(`${id}: invalid geo source state ${source?.state}`);
    return;
  }
  if (source.state === 'public') {
    if (!isCanonicalGithubRepository(source.url)) {
      errors.push(`${id}: public geo source requires a canonical GitHub repository URL`);
    }
    if (project.repositoryVisibility !== 'public') {
      errors.push(`${id}: public geo source requires repositoryVisibility public`);
    }
    if (source.url !== project.public?.repositoryUrl) {
      errors.push(`${id}: geo source ${source.url ?? 'missing'} != public repository ${project.public?.repositoryUrl ?? 'missing'}`);
    }
    if (source.path) errors.push(`${id}: public geo source must not expose an internal path`);
    return;
  }
  if (!source.path || normalizePath(source.path) !== normalizePath(project.repo)) {
    errors.push(`${id}: internal geo source path ${source.path ?? 'missing'} != ${project.repo ?? 'missing'}`);
  }
  if (source.url) errors.push(`${id}: internal geo source must not declare a public URL`);
}

function validateGeoDocs(id, docs, errors) {
  if (!GEO_DOCS_STATE.has(docs?.state)) {
    errors.push(`${id}: invalid geo docs state ${docs?.state}`);
    return;
  }
  if (!isHttpsUrl(docs.url)) errors.push(`${id}: geo docs require a public HTTPS URL`);
}

function validateHttpsList(id, field, values, errors) {
  if (!Array.isArray(values) || values.length === 0) {
    errors.push(`${id}: ${field} must contain at least one URL`);
    return;
  }
  if (values.some((value) => !isHttpsUrl(value))) errors.push(`${id}: ${field} must contain only HTTPS URLs`);
  if (new Set(values).size !== values.length) errors.push(`${id}: ${field} contains duplicates`);
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isCanonicalGithubRepository(value) {
  return /^https:\/\/github\.com\/[^/]+\/[^/#]+$/.test(String(value ?? ''));
}

function normalizeUrl(value) {
  return String(value ?? '').replace(/\/+$/, '');
}

function sameStringList(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function buildAutomationProjection(catalog, registry) {
  const resolver = createResolver(catalog);
  const existingByProject = new Map();
  for (const entry of registry.entries) {
    const id = resolver(entry.id);
    if (id) existingByProject.set(id, entry);
  }

  const entries = catalog.projects.flatMap((project) => {
    if (project.tier === 'non-product') return [];
    const existing = existingByProject.get(project.id);
    const repository = project.repo ?? (
      project.attention === 'ignored' && project.sourcePath
        ? path.basename(project.sourcePath)
        : project.sourcePath ?? null
    );
    const base = existing ?? defaultAutomationEntry(project, repository);
    return [{
      ...base,
      id: existing?.id ?? project.id,
      name: project.name,
      attention: project.attention,
      family: project.family,
      owner: existing?.owner ?? (project.attention === 'foundry' ? 'foundry' : project.attention === 'ignored' ? 'none' : 'sarthak'),
      repository,
    }];
  });
  const attentionCounts = Object.fromEntries(
    ['my-work', 'toolbox', 'foundry', 'ignored'].map((attention) => [
      attention,
      entries.filter((entry) => entry.attention === attention).length,
    ]),
  );
  return {
    ...registry,
    updatedAt: catalog._meta.updated,
    attentionCounts,
    entries,
  };
}

export function buildMarketingProjection(catalog, program) {
  const resolver = createResolver(catalog);
  const existingByProject = new Map();
  const reserved = [];
  for (const entry of program.projects) {
    const id = resolver(entry.slug);
    if (id) existingByProject.set(id, entry);
    else reserved.push(entry);
  }
  const projects = catalog.projects
    .filter((project) => project.attention !== 'ignored' && project.tier !== 'non-product')
    .map((project) => {
      const existing = existingByProject.get(project.id);
      const isPublic = project.public?.listing === 'maintained';
      return {
        ...(existing ?? defaultMarketingEntry(project, isPublic)),
        slug: existing?.slug ?? project.id,
        name: project.public?.name ?? project.name,
        domain: isPublic ? `https://${project.domains[0]}` : (existing?.domain ?? null),
        publicMarketing: isPublic,
      };
    });
  return { ...program, projects: [...projects, ...reserved] };
}

export function renderInternalCatalog(catalog) {
  const groups = [
    ['my-work', 'My Work'],
    ['toolbox', 'Toolbox'],
    ['foundry', 'Foundry + Helpers'],
    ['ignored', 'Past / inactive'],
  ];
  const lines = [
    '# Fleet project catalog',
    '',
    '> Generated from `foundry/ops/config/projects.json`. Edit the catalog, then run `npm run generate:projects`.',
    '',
    `Generated from ${catalog.projects.length} internal project identities.`,
    '',
  ];
  for (const [attention, title] of groups) {
    const projects = catalog.projects.filter(
      (project) => project.attention === attention && !(attention === 'ignored' && project.tier === 'non-product'),
    );
    lines.push(`## ${title} — ${projects.length}`, '');
    lines.push('| Project | Lifecycle | Repository | Public listing | Live surface |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const project of projects) {
      const repository = project.sourcePath ?? project.repo ?? '—';
      const domain = project.domains?.[0] ? `https://${project.domains[0]}` : '—';
      lines.push(`| ${project.name} | ${project.lifecycle} | \`${repository}\` | ${project.public.listing} | ${domain} |`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

export function renderReadmePortfolio(catalog) {
  const group = (attention) => catalog.projects.filter(
    (project) => project.attention === attention && !(attention === 'ignored' && project.tier === 'non-product'),
  );
  const names = (attention) => group(attention).map((project) => project.name).join(', ');
  return [
    '<!-- project-catalog:start -->',
    '## Portfolio attention',
    '',
    'This is a generated summary of the private Fleet project catalog. The complete',
    'machine-readable source is `foundry/ops/config/projects.json`; the generated',
    'human view is [`foundry/ops/docs/project-catalog.md`](foundry/ops/docs/project-catalog.md).',
    '',
    `### My Work — ${group('my-work').length}`,
    '',
    names('my-work'),
    '',
    `### Toolbox — ${group('toolbox').length}`,
    '',
    names('toolbox'),
    '',
    `### Foundry — ${group('foundry').length}`,
    '',
    names('foundry'),
    '',
    `### Past / inactive — ${group('ignored').length}`,
    '',
    names('ignored'),
    '',
    'Past projects are preserved without becoming maintenance obligations. Public',
    'repositories may appear in the separate Past projects section on SaaS Maker;',
    'private repositories never enter external output.',
    '<!-- project-catalog:end -->',
  ].join('\n');
}

export function replaceGeneratedSection(markdown, rendered) {
  const pattern = /<!-- project-catalog:start -->[\s\S]*?<!-- project-catalog:end -->/;
  if (!pattern.test(markdown)) throw new Error('README is missing project-catalog generated markers');
  return markdown.replace(pattern, rendered);
}

function validateOverlay(name, values, identityFor, identities, errors) {
  for (const value of values ?? []) {
    const identity = identityFor(value);
    if (RESERVED_OVERLAY_IDS.has(identity)) continue;
    if (!identities.has(normalize(identity))) errors.push(`${name}: unknown project ${identity}`);
  }
}

function discoverGitDirectories(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(path.join(root, entry.name, '.git')))
    .map((entry) => entry.name)
    .sort();
}

function createResolver(catalog) {
  const identities = new Map();
  for (const project of catalog.projects) {
    for (const identity of [project.id, ...(project.aliases ?? [])]) {
      identities.set(normalize(identity), project.id);
    }
  }
  return (identity) => identities.get(normalize(identity));
}

function defaultAutomationEntry(project, repository) {
  const live = project.status === 'live' && project.deployKind !== 'none';
  return {
    id: project.id,
    name: project.name,
    attention: project.attention,
    family: project.family,
    owner: project.attention === 'foundry' ? 'foundry' : project.attention === 'ignored' ? 'none' : 'sarthak',
    repository,
    runtimes: project.deployKind === 'none' ? ['local-tool'] : ['public-web'],
    surfaces: live ? project.domains.map((domain) => `https://${domain}`) : [],
    dependencies: live ? ['GitHub Actions', project.deployKind.includes('worker') ? 'Cloudflare Workers' : 'Cloudflare Pages'] : ['local toolchain'],
    evidenceSources: live ? ['github-actions', 'fleet-deploy', 'live-smoke', 'indexing', 'errors'] : ['github-actions', 'local-checks'],
    contracts: live ? ['build', 'live', 'indexing', 'errors'] : ['build', 'errors'],
    actionPolicy: project.attention === 'ignored' ? 'excluded' : 'quiet-maintenance',
    alertPolicy: project.attention === 'ignored' ? 'none' : 'digest validation findings',
    exceptions: project.attention === 'ignored'
      ? [{ contract: 'all', reason: 'Inactive; explicit reactivation required' }]
      : [],
  };
}

function defaultMarketingEntry(project, isPublic) {
  return {
    slug: project.id,
    name: project.name,
    aliases: project.aliases ?? [],
    mode: project.attention === 'my-work' ? 'focus' : isPublic ? 'evergreen' : 'private',
    domain: isPublic ? `https://${project.domains[0]}` : null,
    domainPosture: isPublic ? 'product-subdomain' : 'local-only',
    publicMarketing: isPublic,
    cta: isPublic ? 'Open the product' : 'Use the project privately',
    cadence: isPublic ? 'quarterly' : 'none',
    contentBase: null,
    channels: [],
  };
}

function normalize(value) {
  return String(value).toLowerCase().replaceAll('_', '-');
}

function normalizePath(value) {
  return value.split(path.sep).join('/').replace(/^\.\//, '');
}
