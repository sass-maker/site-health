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
  assert.equal(projection.products.length, 31);
  assert.equal(projection.pastProjects.length, 11);
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
  const informationalOnly = new Set(['agent-office', 'indulge', 'local-ai-video-studio']);
  for (const product of projection.products) {
    if (informationalOnly.has(product.id)) {
      assert.equal(Object.hasOwn(product, 'changelogUrl'), false);
    } else {
      assert.equal(product.changelogUrl, `${product.url}/changelog`);
    }
    assert.doesNotThrow(() => assertEvidenceLinks(product));
  }
  assert.equal(
    projection.products.find((product) => product.id === 'drank').repositoryUrl,
    'https://github.com/sass-maker/drank',
  );
  assert.deepEqual(
    projection.pastProjects.find((project) => project.id === 'chess'),
    {
      id: 'chess',
      name: 'Chess Coach',
      description: 'Browser chess against Stockfish with optional AI move coaching.',
      lifecycle: 'past',
      repositoryUrl: 'https://github.com/Significant-Hobbies/chess',
    },
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
