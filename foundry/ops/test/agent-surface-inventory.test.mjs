import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const projects = JSON.parse(
  await readFile(new URL('../config/projects.json', import.meta.url), 'utf8'),
).projects;
const agentProducts = JSON.parse(
  await readFile(
    new URL('../config/agent-surfaces-registry.json', import.meta.url),
    'utf8',
  ),
).products;

const sourceCompleteProjects = [
  'app-health',
  'chatgpt-memory-insights',
  'india-standards',
  'setline',
];

test('maintained project registry flags match canonical agent metadata', () => {
  const registryIds = new Set(agentProducts.map((product) => product.id));

  for (const project of projects.filter(
    (project) => project.lifecycle === 'maintained',
  )) {
    assert.equal(
      project.inRegistry,
      registryIds.has(project.id),
      `${project.id}: inRegistry`,
    );
  }
});

test('source-complete projects declare their canonical agent registry coverage', () => {
  const projectsById = new Map(projects.map((project) => [project.id, project]));
  const registryById = new Map(
    agentProducts.map((product) => [product.id, product]),
  );

  for (const id of sourceCompleteProjects) {
    assert.equal(projectsById.get(id)?.inRegistry, true, `${id}: registry flag`);
    assert.ok(registryById.has(id), `${id}: agent registry entry`);
  }
});

test('source-complete projects preserve their independently owned discovery files', () => {
  const registryById = new Map(
    agentProducts.map((product) => [product.id, product]),
  );
  const requiredFiles = [
    'api-ai.json',
    'index.md',
    'llms-full.txt',
    'llms.txt',
    'robots.txt',
    'sitemap.xml',
  ];

  for (const id of sourceCompleteProjects) {
    const preserved = new Set(registryById.get(id)?.preserveFiles ?? []);
    for (const file of requiredFiles) {
      assert.ok(preserved.has(file), `${id}: preserve ${file}`);
    }
  }
});

test('Knowledge Base remains measurable without targeting its private dashboard', () => {
  const knowledgeBase = agentProducts.find(
    (product) => product.id === 'knowledge-base',
  );

  assert.ok(knowledgeBase);
  assert.equal(knowledgeBase.sourceStatus, 'missing');
  assert.equal(Object.hasOwn(knowledgeBase, 'publicDir'), false);
  assert.equal(
    agentProducts.some(
      (product) =>
        product.id === 'knowledgebase-app' ||
        product.url === 'https://search.sassmaker.com',
    ),
    false,
  );
});
