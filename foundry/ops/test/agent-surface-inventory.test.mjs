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

const auditedPublicProducts = new Map([
  ['anime-list', 'https://anime.significanthobbies.com'],
  ['app-health', 'https://health.sassmaker.com'],
  ['calorie', 'https://calorie.significanthobbies.com'],
  ['india-standards', 'https://india-numbers.significanthobbies.com'],
  ['karte', 'https://karte.cc'],
  ['email-manager', 'https://mail.significanthobbies.com'],
  ['chatgpt-memory-insights', 'https://chatgpt.significanthobbies.com'],
  ['setline', 'https://setline.significanthobbies.com'],
]);

test('canonical agent inventory covers the audited public product identities', () => {
  const registryById = new Map(
    agentProducts.map((product) => [product.id, product]),
  );
  const projectsById = new Map(projects.map((project) => [project.id, project]));

  for (const [id, url] of auditedPublicProducts) {
    const project = projectsById.get(id);
    const agentProduct = registryById.get(id);
    assert.ok(project, `${id} should exist in projects.json`);
    assert.equal(project.inRegistry, true, `${id} should declare registry coverage`);
    assert.ok(agentProduct, `${id} should exist in the agent registry`);
    assert.equal(agentProduct.url, url, `${id} should use its canonical public origin`);
  }
});

test('private Knowledge Base dashboard is not a public crawl target', () => {
  const knowledgeBase = projects.find((project) => project.id === 'knowledge-base');
  assert.ok(knowledgeBase);
  assert.equal(knowledgeBase.inRegistry, false);
  assert.equal(
    agentProducts.some(
      (product) =>
        product.id === 'knowledgebase-app' ||
        product.url === 'https://search.sassmaker.com',
    ),
    false,
  );
});

test('new source-complete products preserve their owned agent files', () => {
  const registryById = new Map(
    agentProducts.map((product) => [product.id, product]),
  );
  for (const id of [
    'app-health',
    'india-standards',
    'chatgpt-memory-insights',
    'setline',
  ]) {
    assert.equal(registryById.get(id)?.skipLlmsOverwrite, true);
  }
});
