const PUBLIC_FIELDS = new Set([
  'id',
  'name',
  'description',
  'url',
  'tier',
  'category',
  'priority',
  'spotlight',
  'maturity',
  'repositoryUrl',
  'changelogUrl',
  'roadmapUrl',
  'pillarId',
]);

const FORBIDDEN_KEYS = /(?:secret|token|password|credential|private|owner|cfProject|notes|dependencies|evidenceSources|contracts)/i;
const CREDENTIAL_VALUE = /(?:bearer\s+[a-z0-9._-]+|(?:api|access|secret)[_-]?key\s*[:=]|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i;

export function buildPublicProducts({ projects, marketingProgram, annotations }) {
  const projectById = new Map(projects.projects.map((project) => [project.id, project]));
  const marketingByIdentity = new Map();
  for (const project of marketingProgram.projects) {
    for (const identity of [project.slug, ...project.aliases]) {
      marketingByIdentity.set(normalize(identity), project);
    }
  }

  const products = annotations.products.map((annotation) => {
    const project = projectById.get(annotation.projectId);
    if (!project) throw new Error(`${annotation.id}: unknown Fleet project ${annotation.projectId}`);

    const marketing = marketingByIdentity.get(normalize(annotation.id));
    if (!marketing?.publicMarketing || !marketing.domain) {
      throw new Error(`${annotation.id}: public projection requires an allowlisted public marketing surface`);
    }

    const productHost = new URL(marketing.domain).hostname;
    if (!project.domains.includes(productHost)) {
      throw new Error(`${annotation.id}: ${productHost} is not a canonical domain for ${annotation.projectId}`);
    }

    const priority = priorityFor(projects._meta.priorities, annotation.projectId);
    const roadmapPath = annotation.roadmapPath ?? 'PROJECT_STATUS.md';
    const output = {
      id: annotation.id,
      name: annotation.name,
      description: annotation.description,
      url: marketing.domain,
      tier: project.tier === 'focus' ? 'core' : project.tier,
      category: annotation.category,
      priority,
      spotlight: annotation.spotlight,
      maturity: annotation.maturity,
      repositoryUrl: annotation.repositoryUrl,
      changelogUrl: `${annotation.repositoryUrl}/commits/main`,
      roadmapUrl: `${annotation.repositoryUrl}/blob/main/${roadmapPath}`,
      pillarId: annotation.pillarId,
    };
    assertPublicShape(output);
    return output;
  });

  const ids = products.map((product) => product.id);
  if (new Set(ids).size !== ids.length) throw new Error('public product ids must be unique');
  products.sort((left, right) => Number(right.spotlight) - Number(left.spotlight) || left.name.localeCompare(right.name));
  const projection = {
    schemaVersion: 1,
    generatedFrom: [
      'fleet-ops/config/projects.json',
      'fleet-ops/config/marketing-program.json',
      'fleet-ops/config/public-products.json',
    ],
    products,
  };
  assertNoPrivateData(projection);
  return projection;
}

export function assertNoPrivateData(value, trail = 'projection') {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoPrivateData(entry, `${trail}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.test(key)) throw new Error(`${trail}.${key}: forbidden private field`);
      assertNoPrivateData(entry, `${trail}.${key}`);
    }
    return;
  }
  if (typeof value === 'string' && CREDENTIAL_VALUE.test(value)) {
    throw new Error(`${trail}: credential-shaped value`);
  }
}

function assertPublicShape(product) {
  for (const key of Object.keys(product)) {
    if (!PUBLIC_FIELDS.has(key)) throw new Error(`${product.id}: unsupported public field ${key}`);
  }
  for (const key of ['id', 'name', 'description', 'url', 'repositoryUrl', 'changelogUrl', 'roadmapUrl']) {
    if (!product[key]) throw new Error(`${product.id}: missing ${key}`);
  }
}

function priorityFor(priorities, projectId) {
  for (const priority of ['P1', 'P2', 'P3']) {
    if (priorities?.[priority]?.includes(projectId)) return priority;
  }
  return 'P3';
}

function normalize(value) {
  return String(value).toLowerCase().replaceAll('_', '-');
}
