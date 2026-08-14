import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  assertEvidenceLinks,
  assertNoPrivateData,
  buildPublicProducts,
} from '../lib/public-products.mjs';
import { visibilityProjects } from '../lib/visibility-projects.mjs';

const projects = await readJson(new URL('../config/projects.json', import.meta.url));

test('public projection contains only explicitly allowlisted public products', () => {
  const projection = buildPublicProducts(projects);
  assert.equal(projection.schemaVersion, 2);
  assert.equal(projection.products.length, 28);
  assert.equal(projection.pastProjects.length, 10);
  assert.deepEqual(
    projection.products.filter((product) => product.spotlight).map((product) => product.id).sort(),
    ['codevetter', 'high-signal', 'pace', 'posttrainllm'],
  );
  assert.equal(
    projection.products.find((product) => product.id === 'calorie').url,
    'https://calorie.significanthobbies.com',
  );
  assert.equal(
    projection.products.find((product) => product.id === 'what-it-takes-to-win').url,
    'https://paths.significanthobbies.com',
  );
  assert.equal(
    projection.products.find((product) => product.id === 'motion').url,
    'https://motion.significanthobbies.com',
  );
  assert.equal(
    projection.products.find((product) => product.id === 'sarthakagrawal-personal').url,
    'https://sarthakagrawal.dev',
  );
  assert.deepEqual(
    ['chatgpt-memory-insights', 'email-manager', 'knowledge-base', 'saas-maker', 'setline'].map((id) => ({
      id,
      url: projection.products.find((product) => product.id === id)?.url,
    })),
    [
      { id: 'chatgpt-memory-insights', url: 'https://chatgpt.significanthobbies.com' },
      { id: 'email-manager', url: 'https://mail.significanthobbies.com' },
      { id: 'knowledge-base', url: 'https://knowledgebase.sassmaker.com' },
      { id: 'saas-maker', url: 'https://sassmaker.com' },
      { id: 'setline', url: 'https://setline.significanthobbies.com' },
    ],
  );
  assert.equal(projection.pastProjects.some((project) => project.id === 'aliveville'), true);
  assert.equal(projection.pastProjects.some((project) => project.id === 'forecast-lab'), true);
  assert.equal(projection.pastProjects.some((project) => project.id === 'elves-hq'), false);
  assert.equal(projection.pastProjects.some((project) => project.id === 'saas-ideas'), false);
  assert.equal(projection.products.some((product) => product.id === 'mashup'), false);
  assert.equal(projection.products.some((product) => product.id === 'fleet-workspace'), false);
  assert.equal(projection.products.some((product) => product.id === 'mobile-dev-cockpit'), false);
  assert.equal(projection.products.some((product) => product.id === 'reel-pipeline'), false);
  assert.equal(
    projection.products.find((product) => product.id === 'app-health').url,
    'https://health.sassmaker.com',
  );
  for (const product of projection.products) {
    assert.equal(product.changelogUrl, `${product.url}/changelog`);
    assert.doesNotThrow(() => assertEvidenceLinks(product));
  }
  assert.equal(
    Object.hasOwn(projection.products.find((product) => product.id === 'drank'), 'repositoryUrl'),
    false,
  );
  assert.equal(
    projection.products.find((product) => product.id === 'chess').roadmapUrl,
    'https://github.com/Significant-Hobbies/chess/issues',
  );
  assert.equal(
    projection.products.find((product) => product.id === 'setline').repositoryUrl,
    'https://github.com/Significant-Hobbies/setline',
  );
  assert.equal(
    projection.products.find((product) => product.id === 'motion').repositoryUrl,
    'https://github.com/Significant-Hobbies/motion',
  );
  assert.equal(
    projection.products.find((product) => product.id === 'reader').roadmapUrl,
    'https://github.com/Significant-Hobbies/reader/issues',
  );
  assert.doesNotThrow(() => assertNoPrivateData(projection));
});

test('public evidence validation rejects off-site changelogs and noncanonical repository links', () => {
  assert.throws(
    () => assertEvidenceLinks({
      id: 'example',
      url: 'https://example.com',
      changelogUrl: 'https://github.com/example/product/commits/main',
    }),
    /canonical product origin/,
  );
  assert.throws(
    () => assertEvidenceLinks({
      id: 'example',
      url: 'https://example.com',
      changelogUrl: 'https://example.com/changelog',
      repositoryUrl: 'https://github.com/example/product/tree/main',
      roadmapUrl: 'https://github.com/example/product/issues',
    }),
    /canonical GitHub repository root/,
  );
  assert.throws(
    () => assertEvidenceLinks({
      id: 'example',
      url: 'https://example.com',
      changelogUrl: 'https://example.com/changelog',
      roadmapUrl: 'https://github.com/example/product/issues',
    }),
    /requires a public repositoryUrl/,
  );
});

test('public projection rejects private repositories and missing canonical surfaces', () => {
  const privateCatalog = structuredClone(projects);
  privateCatalog.projects.find((project) => project.id === 'calorie').repositoryVisibility = 'private';
  assert.throws(
    () => buildPublicProducts(privateCatalog),
    /repositoryVisibility public/,
  );

  const missingDomain = structuredClone(projects);
  missingDomain.projects.find((project) => project.id === 'calorie').domains = [];
  assert.throws(
    () => buildPublicProducts(missingDomain),
    /canonical domain/,
  );
});

test('privacy scanner rejects private fields and credential-shaped values', () => {
  assert.throws(() => assertNoPrivateData({ token: 'redacted' }), /forbidden private field/);
  assert.throws(() => assertNoPrivateData({ description: 'api_key=should-not-leak' }), /credential-shaped/);
});

test('SaaS Maker does not expose its private Fleet repository', async () => {
  const [links, agentRegistry, registrySource, projectsSource, routesSource, navSource, redirects] = await Promise.all([
    readFile(new URL('../../apps/public/public-directory/src/data/links.ts', import.meta.url), 'utf8'),
    readJson(new URL('../config/agent-surfaces-registry.json', import.meta.url)),
    readFile(new URL('../../apps/public/public-directory/src/data/registry.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../apps/public/public-directory/src/data/projects.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../apps/public/public-directory/src/data/publicRoutes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../apps/public/public-directory/src/components/Nav.astro', import.meta.url), 'utf8'),
    readFile(new URL('../../apps/public/public-directory/public/_redirects', import.meta.url), 'utf8'),
  ]);
  const saasMaker = agentRegistry.products.find((product) => product.id === 'fleet-workspace');
  const publicSaasMaker = buildPublicProducts(projects).products.find(
    (product) => product.id === 'saas-maker',
  );

  assert.match(links, /https:\/\/github\.com\/sarthakagrawal927['"]/);
  assert.match(links, /https:\/\/github\.com\/sass-maker['"]/);
  assert.equal(Object.hasOwn(publicSaasMaker, 'repositoryUrl'), false);
  assert.equal(Object.hasOwn(publicSaasMaker, 'roadmapUrl'), false);
  assert.deepEqual(saasMaker.sameAs, ['https://github.com/sass-maker']);
  assert.match(registrySource, /PAGED_PRODUCTS = REGISTRY_PRODUCTS\.filter\(\(product\) => product\.id !== 'saas-maker'\)/);
  assert.match(projectsSource, /\['personal-website', 'saas-maker'\]\.includes\(product\.id\)/);
  assert.match(routesSource, /filter\(\(product\) => product\.id !== 'saas-maker'\)/);
  assert.match(navSource, /GITHUB_ORG_URL/);
  assert.match(navSource, /Public source index/);
  assert.match(redirects, /^\/p\/saas-maker \/ 301$/m);
  assert.match(redirects, /^\/p\/saas-maker\.md \/index\.md 301$/m);
});

test('SaaS Maker exposes the complete learning article to agents', async () => {
  const [routesSource, articleMarkdown] = await Promise.all([
    readFile(
      new URL('../../apps/public/public-directory/src/data/publicRoutes.ts', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL(
        '../../apps/public/public-directory/src/data/articles/skills-should-declare-capabilities-not-model-names.md',
        import.meta.url,
      ),
      'utf8',
    ),
  ]);

  assert.match(routesSource, /markdown: learning\.markdown/);
  assert.match(articleMarkdown, /## What is the methodology\?/);
  assert.match(articleMarkdown, /## Where does it fall short\?/);
  assert.match(articleMarkdown, /## Sources and implementation/);
  assert.ok(articleMarkdown.split(/\s+/u).length > 700);
  assert.doesNotMatch(articleMarkdown, /full article is available at/i);
});

test('agent surface metadata covers the visibility project inventory exactly', async () => {
  const agentRegistry = await readJson(
    new URL('../config/agent-surfaces-registry.json', import.meta.url),
  );
  const maintainedIds = visibilityProjects(projects)
    .map((project) => project.id)
    .sort();
  const agentIds = agentRegistry.products.map((product) => product.id).sort();

  assert.deepEqual(agentIds, maintainedIds);
  const metadataById = new Map(
    agentRegistry.products.map((product) => [product.id, product]),
  );
  for (const project of visibilityProjects(projects)) {
    const repositoryUrl =
      project.repositoryUrl ?? project.public?.repositoryUrl ?? null;
    if (project.repositoryVisibility !== 'public' || !repositoryUrl) continue;
    assert.ok(
      metadataById.get(project.id)?.sameAs?.includes(repositoryUrl),
      `${project.id}: agent metadata must use the canonical public repository URL`,
    );
  }
});

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}
