import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';

test('private product profiles retain canonical AI roles without inventing missing assessments', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'product-ai-')), 'registry.json');
  const aiProduct = { roles: ['agent-operable'], workflow: 'Read saved links via MCP.', runtimeQualification: 'not-checked' };
  writeFileSync(path, JSON.stringify({ projects: [
    { id: 'reader', family: 'reader', systems: { aiProduct } },
    { id: 'unreviewed', family: 'unreviewed' },
  ] }));
  const [reader, unreviewed] = loadDashboardProjects(path);
  assert.deepEqual(reader.aiProduct, aiProduct);
  assert.equal(unreviewed.aiProduct, null);
});
