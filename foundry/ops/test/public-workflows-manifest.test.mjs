import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildPublicWorkflowsManifest } from '../lib/public-workflows-manifest.mjs';

const projection = JSON.parse(
  await readFile(new URL('../public/products.json', import.meta.url), 'utf8'),
);

test('public workflows manifest contains only stable public probe fields', () => {
  const manifest = buildPublicWorkflowsManifest(projection);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.sites.length, 28);
  for (const site of manifest.sites) {
    assert.deepEqual(Object.keys(site), ['id', 'url', 'probePath']);
    assert.match(site.url, /^https:\/\//);
    assert.equal(site.probePath, '/');
  }
});

test('public workflows manifest rejects private projection data', () => {
  assert.throws(
    () => buildPublicWorkflowsManifest({
      ...projection,
      token: 'must-not-enter-public-automation',
    }),
    /forbidden private field/,
  );
});
