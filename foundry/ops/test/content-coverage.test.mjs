import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  buildCoverageAudit,
  classifyArchetype,
  inventoryRegistryProduct,
} from '../lib/content-coverage.mjs';

const fixturePath = resolve(
  import.meta.dirname,
  'fixtures/content-coverage/codevetter-v1.json',
);

test('classifies common durable search page archetypes', () => {
  assert.equal(classifyArchetype('/codevetter-vs-reviewbench'), 'comparison');
  assert.equal(classifyArchetype('/local-code-review-alternatives'), 'alternatives');
  assert.equal(classifyArchetype('/guides/how-to-review-code'), 'how-to');
});

test('fixture audit finds evidence-backed gaps and blocks unsupported comparisons', () => {
  const input = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const audit = buildCoverageAudit(input);
  assert.equal(audit.inventory.pageCount, 2);
  assert.equal(audit.coverage.find((entry) => entry.archetype === 'product').action, 'keep');
  assert.equal(audit.coverage.find((entry) => entry.archetype === 'alternatives').action, 'create');
  assert.equal(audit.coverage.find((entry) => entry.archetype === 'comparison').action, 'blocked');
  assert.equal(audit.drafts[0].body.includes('unsupported competitor behavior'), true);
  assert.equal(audit.inventory.unavailableEvidence[0].source, 'search-console');
});

test('registry inventory resolves CodeVetter context without live network access', () => {
  const inventory = inventoryRegistryProduct('codevetter');
  assert.equal(inventory.product.id, 'codevetter');
  assert.match(inventory.product.repoRoot, /\/codevetter$/u);
  assert.ok(inventory.pages.some((page) => page.source === 'registry-product-link'));
  assert.ok(inventory.unavailableEvidence.some((entry) => entry.source === 'live-sitemap'));
});

test('registry inventory falls back to canonical repo metadata when publicDir is absent', () => {
  const inventory = inventoryRegistryProduct('what-it-takes-to-win');
  assert.equal(inventory.product.id, 'what-it-takes-to-win');
  assert.equal(inventory.product.publicDir, null);
  assert.match(inventory.product.repoRoot, /\/what-it-takes-to-win$/u);
  assert.ok(
    inventory.unavailableEvidence.some(
      (entry) => entry.source === 'public-directory',
    ),
  );
});

test('inventory CLI can persist a compact latest verdict for site health', () => {
  const artifact = resolve(mkdtempSync(resolve(tmpdir(), 'fleet-coverage-artifact-')), 'latest.json');
  const cli = resolve(
    import.meta.dirname,
    '../skills/content-coverage/scripts/content-inventory.mjs',
  );
  const result = spawnSync(process.execPath, [
    cli,
    '--input',
    fixturePath,
    '--artifact',
    artifact,
    '--json',
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const latest = JSON.parse(readFileSync(artifact, 'utf8'));
  assert.equal(latest.codevetter.verdict, 'blocked');
  assert.equal(latest.codevetter.create, 1);
  assert.equal(latest.codevetter.blocked, 1);
});
