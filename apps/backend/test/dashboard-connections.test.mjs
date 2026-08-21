import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import { buildDashboardProjection } from '../lib/dashboard-projection.mjs';

test('Dashboard projection contains only project and five-area outcome data', () => {
  const result = buildDashboardProjection({
    repositoryRoot: process.cwd(),
    workspaceRoot: resolve(process.cwd(), '..'),
    home: mkdtempSync(`${tmpdir()}/dashboard-connections-`),
    now: '2026-08-21T00:00:00.000Z',
  });

  assert.equal(result.schemaVersion, 'dashboard.projection.v1');
  assert.deepEqual(Object.keys(result).sort(), ['generatedAt', 'outcomes', 'schemaVersion']);
  assert.deepEqual(
    Object.keys(result.outcomes).sort(),
    ['aiAwareness', 'aiCoverage', 'domains', 'performance', 'search'],
  );
  assert.equal('skills' in result, false);
  assert.equal('workflows' in result, false);
  assert.equal('marketing' in result, false);
});
