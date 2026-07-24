import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { assertNoPrivateData, buildPublicProducts } from '../lib/public-products.mjs';

const [projects, marketingProgram, annotations] = await Promise.all([
  readJson(new URL('../config/projects.json', import.meta.url)),
  readJson(new URL('../config/marketing-program.json', import.meta.url)),
  readJson(new URL('../config/public-products.json', import.meta.url)),
]);

test('public projection contains only explicitly allowlisted public products', () => {
  const projection = buildPublicProducts({ projects, marketingProgram, annotations });
  assert.equal(projection.products.length, annotations.products.length);
  assert.deepEqual(
    projection.products.filter((product) => product.spotlight).map((product) => product.id).sort(),
    ['codevetter', 'high-signal', 'pace', 'posttrainllm'],
  );
  assert.equal(projection.products.some((product) => product.id === 'fleet-workspace'), false);
  assert.equal(projection.products.some((product) => product.id === 'mobile-dev-cockpit'), false);
  assert.equal(projection.products.some((product) => product.id === 'app-health'), false);
  assert.equal(
    Object.hasOwn(projection.products.find((product) => product.id === 'drank'), 'repositoryUrl'),
    false,
  );
  assert.equal(
    Object.hasOwn(projection.products.find((product) => product.id === 'chess'), 'roadmapUrl'),
    false,
  );
  assert.equal(
    projection.products.find((product) => product.id === 'reader').roadmapUrl,
    'https://github.com/Significant-Hobbies/reader/blob/main/PROJECT_STATUS.md',
  );
  assert.doesNotThrow(() => assertNoPrivateData(projection));
});

test('public projection rejects a private or noncanonical surface', () => {
  const changedMarketing = structuredClone(marketingProgram);
  changedMarketing.projects.find((project) => project.slug === 'codevetter').domain = 'https://internal.example.test';
  assert.throws(
    () => buildPublicProducts({ projects, marketingProgram: changedMarketing, annotations }),
    /not a canonical domain/
  );
});

test('privacy scanner rejects private fields and credential-shaped values', () => {
  assert.throws(() => assertNoPrivateData({ token: 'redacted' }), /forbidden private field/);
  assert.throws(() => assertNoPrivateData({ description: 'api_key=should-not-leak' }), /credential-shaped/);
});

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}
